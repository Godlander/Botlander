import { APIEmbed, ChatInputCommandInteraction, DMChannel, Guild, GuildMember, SlashCommandBuilder, TextChannel } from 'discord.js';

export const slashcommand = new SlashCommandBuilder()
.setName('quowote')
.setDescription('Quowotes a mwessage uwu')
.addStringOption(option =>
    option.setName('mwessage')
    .setDescription('Link to the message to quowote')
    .setRequired(true))
.addUserOption(option => option
    .setName('mwention')
    .setDescription('Mwentions a uwuser in da quowote'))
.addBooleanOption(option => option
    .setName('raww')
    .setDescription('Sends teh quowote embwed as raww stwing'))

const owopost = ["",
    "uwu","owo",">w<","nyaa~","UwU","OwO","~~","uwu~","owo~","UwU~","OwO~",
    "*nuzzles~","rawr x3","*rubb~","mmmm~","daddy~",
    "o3o",";)","˶◕‿◕˶","≧◡≦","・ω・","^ω^",">////<",
];

export function owofy(text : string) {
    return text
    //stylize text
    .replace(/u(?!w)/g,"uw")
    .replace(/(?<!w|\b)(l|r)(?!w|\b)/g,"w")
    .replace(/n(?=a|e|i|o|u)/gi,"ny")
    .replace(/\bthe\b/gi,"da")
    .replace(/\bthat\b/gi,"dat")
    .replace(/\bthis\b/gi,"dis")
    .replace(/\bis\b/gi,"iz")
    .replace(/\bim\b|\bi'm\b|\bi am\b|bi’m\b/gi,"watashi")
    .replace(/\bhi\b|\bhello\b|\bsup\b/gi,"moshi moshi")
    //stuttering function
    .replace(/\b[a-zA-Z]/g, (s) => { //happens at first letter of each word
        if (Math.floor(Math.random() * 4) > 0) return s; //1/4 chance to stutter
        let stutter = s;
        for (let i = 0; i < Math.floor(Math.random()*3); i++) { //stutters 0-2 times
            stutter = stutter + "-" + s;
        }
        return stutter;
    })
    //add random uwu postfixes
    .replace(/\n+/g, (s) => {
        if (Math.floor(Math.random() * 2) > 0) return s; //1/2 chance to append postfix
        return "  " + owopost[Math.floor(Math.random()*owopost.length)] + s;
    })
    + "  " + owopost[Math.floor(Math.random()*owopost.length)]; //postfix at the end
}

export async function run(interaction : ChatInputCommandInteraction) {
    const input = interaction.options.getString('mwessage', true).toLowerCase();
    const user = interaction.options.getUser('mwention', false);
    const mention = user? `${user}` : '';
    const raw = interaction.options.getBoolean('raww', false);
    //check that link is a discord message
    if (!input.startsWith('https://discord.com/channels/')) {
        interaction.reply({content: `Invalid message link`, ephemeral: true});
        return;
    }
    const id = input.split('/').splice(4,3);
    try {
        const dm = id[0] === "@me";
        const guild = dm? null : await interaction.client.guilds.fetch(id[0]);
        const channel = guild? await guild.channels.fetch(id[1]) : await interaction.client.channels.fetch(id[1]);
        if (channel === null || !("messages" in channel)) throw 0;
        const message = await channel.messages.fetch(id[2]);

        let member;
        try {dm? (channel as DMChannel).recipient : await (guild as Guild).members.fetch(message.author);}
        catch {member = null;}
        const embed : APIEmbed = {
            color: member? (member as GuildMember).displayColor || 3553599 : 3553599,
            author: {
                name: message.author.username || "Unknown",
                icon_url: message.author.avatarURL() ?? undefined,
            },
            description: message.content? owofy(message.content) : ' ',
            footer: {
                text: dm? '@'+message.author.username : '#'+(channel as TextChannel).name,
                icon_url: dm? undefined : (guild as Guild).iconURL() ?? undefined
            },
            timestamp: message.createdAt.toISOString()
        };
        if (message.attachments.size > 0) {
            let img = message.attachments.find(a => a?.contentType?.startsWith("image"));
            if (img != null) embed.image = {url:img.url};
        }
        if (raw) interaction.reply('`'+JSON.stringify(embed)+'`');
        else interaction.reply({content: mention + ' ' + input, embeds:[embed]});
    }
    catch (e) {
        interaction.reply({content: `Invalid message link`, ephemeral: true});
        console.log(e);
        return;
    }
}
