const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('juice')
        .setDescription('🧃'),
    async execute(interaction) {
        interaction.reply({content:'https://tenor.com/view/idiot-kid-drinking-orange-juice-gif-13293458', fetchReply: true})
        .then(message => message.react('🧃'));
    }
};