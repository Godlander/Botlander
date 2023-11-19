import { APIEmbed, ApplicationCommandType, ChatInputCommandInteraction, ContextMenuCommandBuilder, Guild, GuildMember, Message, MessageContextMenuCommandInteraction, SlashCommandBuilder, TextChannel } from 'discord.js';
import { getmessage } from '../lib';

export const slashcommand = new SlashCommandBuilder()
.setName('quote')
.setDescription('Quotes a message')
.addStringOption(option =>
    option.setName('message')
    .setDescription('Link to the message to quote')
    .setRequired(true))
.addUserOption(option => option
    .setName('mention')
    .setDescription('Mentions a user in the quote'))
.addBooleanOption(option => option
    .setName('raw')
    .setDescription('Sends the quote embed as raw string'))

export const contextmenucommand = new ContextMenuCommandBuilder()
.setName('quote')
.setType(ApplicationCommandType.Message)

export async function quote(message : Message, filter : ((a : string) => string) | null = null) : Promise<APIEmbed> {
    //try to get the author of the message
    let member;
    try {
        if (message.channel.isDMBased()) member = message.channel.recipient;
        else member = await message.guild?.members.fetch(message.author);
    }
    catch {member = null;}

    let text = message.content ?? ' ';
    //run filter function on text if provided
    if (filter != null) text = filter(text);

    //generate embed
    const embed : APIEmbed = {
        color: member? (member as GuildMember).displayColor || 3553599 : 3553599,
        author: {
            name: message.author.username ?? "Unknown",
            icon_url: message.author.avatarURL() ?? undefined,
        },
        description: text,
        footer: {
            text: message.channel.isDMBased()? '@'+message.author.username : '#'+(message.channel as TextChannel).name,
            icon_url: message.channel.isDMBased()? undefined : (message.guild as Guild).iconURL() ?? undefined
        },
        timestamp: message.createdAt.toISOString()
    };
    //add image attachment if exists
    if (message.attachments.size > 0) {
        let img = message.attachments.find(a => a?.contentType?.startsWith("image"));
        if (img != null) embed.image = {url:img.url};
    }
    return embed;
}

export async function contextmenu(interaction : MessageContextMenuCommandInteraction) {
    const message = interaction.targetMessage;
    const guildid = message.guild? message.guild.id : '@me';
    const channelid = message.channel.id;
    const messageid = message.id;
    const link = 'https://discord.com/channels/' + guildid + '/' + channelid + '/' + messageid;
    try {
        const embed = await quote(message);
        interaction.reply({content: link, embeds:[embed]});
    }
    catch (e) {
        interaction.reply({content: `Invalid message link`, ephemeral: true});
        console.log(e);
        return;
    }
}

export async function command(interaction : ChatInputCommandInteraction) {
    const input = interaction.options.getString('message', true).toLowerCase();
    const user = interaction.options.getUser('mention', false);
    const mention = user? `${user}` : '';
    const raw = interaction.options.getBoolean('raw', false);
    //check that link is a discord message
    if (!input.startsWith('https://discord.com/channels/')) {
        interaction.reply({content: `Invalid message link`, ephemeral: true});
        return;
    }
    const ids = input.split('/').splice(4,3);
    try {
        const message = await getmessage(interaction, ids[0], ids[1], ids[2]);
        const embed = await quote(message);

        if (raw) interaction.reply('`'+JSON.stringify(embed)+'`');
        else interaction.reply({content: mention + ' ' + input, embeds:[embed]});
    }
    catch (e) {
        interaction.reply({content: `Invalid message link`, ephemeral: true});
        console.log(e);
        return;
    }
}
