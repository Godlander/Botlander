import { APIEmbed, ChatInputCommandInteraction, DMChannel, Embed, Guild, GuildMember, SlashCommandBuilder, TextChannel, User } from 'discord.js';

export const slashcommand = new SlashCommandBuilder()
.setName('quote')
.setDescription('quotes a message')
.addStringOption(option =>
    option.setName('message')
    .setDescription('Link to the message to quote.')
    .setRequired(true))

export async function run(interaction : ChatInputCommandInteraction) {
    const input : string = interaction.options.getString('message', true).toLowerCase();
    if (input.startsWith('https://discord.com/channels/')) {
        const id = input.split('/').splice(4,3);
        try {
            const dm = id[0] === "@me";
            const guild = dm ? null : await interaction.client.guilds.fetch(id[0]);
            const channel = await interaction.client.channels.fetch(id[1]);
            if (channel === null || !("messages" in channel)) throw 0;
            const message = await channel.messages.fetch(id[2]);
            const member = dm ? (channel as DMChannel).recipient : await (guild as Guild).members.fetch(message.author);
            const embed : APIEmbed = {
                color: (member as GuildMember).displayColor || 3553599,
                author: {
                    name: message.author.username || "Unknown",
                    url: input,
                    icon_url: message.author.avatarURL() ?? undefined,
                },
                description: message.content ?? ' ',
                footer: {
                    text: dm ? (member as User).username : '#'+(channel as TextChannel).name,
                    icon_url: dm ? undefined : (guild as Guild).iconURL() ?? undefined
                },
                timestamp: message.createdAt.toISOString()
            };
            if (message.attachments.size > 0) {
                let img = message.attachments.find(a => a?.contentType?.startsWith("image"));
                if (img != null) embed.image = {url:img.url};
            }
            interaction.reply({embeds:[embed],allowedMentions: {repliedUser:false}});
        }
        catch (e) {
            interaction.reply({content: `Invalid message link`, ephemeral: true});
            return;
        }
    }
    else interaction.reply({content: `Invalid message link`, ephemeral: true});
}
