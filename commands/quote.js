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
        'https://discord.com/channels/785153694478893126/1106297119570153522/1106663763282759833'
        if (input.startsWith('https://discord.com/channels/')) {
            let id = input.split('/').splice(4,3);
            let guild, channel, message;
            try {
                guild = await interaction.client.guilds.fetch(id[0]);
                channel = await guild.channels.fetch(id[1]);
                message = await channel.messages.fetch(id[2]);
            }
            catch (e) {
                interaction.reply({content: `Invalid message link`, ephemeral: true});
                console.log(e);
                return;
            }
            let member = await guild.members.fetch(message.author);
            embed = {
                color: member?.displayColor || 3553599,
                author: {
                    name: member?.displayName || "Unknown",
                    url: input,
                    icon_url: message.author.avatarURL(),
                },
                description: message.content ?? ' ',
                footer: {
                    text: '#'+channel.name,
                    icon_url: guild.iconURL()
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