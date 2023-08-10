import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('juice')
        .setDescription('🧃'),
    async execute(interaction : CommandInteraction) {
        interaction.reply({content:'https://imgur.com/a/o41g3LN', fetchReply: true})
        .then(message => message.react('🧃'));
    }
};