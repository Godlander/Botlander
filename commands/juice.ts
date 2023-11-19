import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const slashcommand = new SlashCommandBuilder()
.setName('juice')
.setDescription('🧃')

export async function command(interaction : ChatInputCommandInteraction) {
    interaction.reply({content:'https://imgur.com/a/o41g3LN', fetchReply: true})
    .then(message => message.react('🧃'));
}