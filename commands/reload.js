const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const {owner} = require('../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to reload.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (interaction.user.id != owner) {return interaction.reply({content: `You do not have permission to use this command.`, ephemeral: true});}

        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);
        if (!command) {return interaction.reply({content: `\`/${commandName}\` is not a command`, ephemeral: true});}

        delete require.cache[require.resolve(`./${command.data.name}.js`)];
        try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(`./${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply({content: `\`${newCommand.data.name}\` reloaded`, ephemeral: true});
        } catch (error) {
            console.error(error);
            await interaction.reply({content: `\`/${command.data.name}\` couldn't load:\`\`\`${error.message}\`\`\``, ephemeral: true});
        }
    },
};