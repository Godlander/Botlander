const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('juice')
		.setDescription('🧃'),
	async execute(interaction) {
		await interaction.reply('https://giant.gfycat.com/ShoddyGenerousLangur.mp4');
	}
};