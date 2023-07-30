const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('juice')
        .setDescription('🧃'),
    async execute(interaction) {
        interaction.reply({content:'https://imgur.com/a/o41g3LN', fetchReply: true})
        .then(message => message.react('🧃'));
    }
};