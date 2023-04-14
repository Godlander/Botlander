const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('juice')
        .setDescription('🧃'),
    async execute(interaction) {
        interaction.reply({content:'https://giant.gfycat.com/ShoddyGenerousLangur.mp4', fetchReply: true})
        .then(message => message.react('🧃'));
    }
};