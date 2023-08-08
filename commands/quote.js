const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('quotes a message')
        .addStringOption(option =>
            option.setName('message')
            .setDescription('Link to the message to quote.')
            .setRequired(true)),
    async execute(interaction) {
        let input = interaction.options.getString('message', true).toLowerCase();
        if (input.startsWith('https://discord.com/channels/')) {
            let id = input.split('/').splice(4,3);
            let dm, guild, channel, message;
            dm = id[0] === "@me";
            try {
                guild = dm || await interaction.client.guilds.fetch(id[0]);
                channel = await interaction.client.channels.fetch(id[1]);
                message = await channel.messages.fetch(id[2]);
            }
            catch (e) {
                interaction.reply({content: `Invalid message link`, ephemeral: true});
                console.log(e);
                return;
            }
            let member = dm? channel.recipient : await guild.members.fetch(message.author);
            embed = {
                color: member?.displayColor || 3553599,
                author: {
                    name: message.author.displayName || message.author.username || "Unknown",
                    url: input,
                    icon_url: message.author.avatarURL(),
                },
                description: message.content ?? ' ',
                footer: {
                    text: dm? member.username : '#'+channel.name,
                    icon_url: dm? null : guild.iconURL()
                },
                timestamp: message.createdAt.toISOString()
            };
            if (message.attachments.size > 0) {
                let img = message.attachments.find(a => a.contentType.startsWith("image"));
                if (img != null) embed.image = {url:img.url};
            }
            interaction.reply({embeds:[embed],allowedMentions: {repliedUser:false}});
        }
        else interaction.reply({content: `Invalid message link`, ephemeral: true});

    }
}