const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const perms = require('../permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Shuts down')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!perms.owner(interaction)) return;
        interaction.reply({content: `Shutting Down`, ephemeral: true})
        .then(interaction.client.destroy())
    }
};