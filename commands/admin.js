const {SlashCommandBuilder} = require('discord.js');
const path = require('path');
const fs = require('fs');
const perms = require('../permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('controls')
        .addStringOption(option =>
            option.setName('command')
            .setDescription('command')
            .setRequired(true)),
    async execute(interaction) {
        if (!perms.owner(interaction)) return;
        let command = interaction.options.getString('command', true).toLowerCase().split(' ');
        console.log(command);
        try {
            if (command[0].match("shutdown|stop|quit")) {
                await interaction.reply({content: `shutting down`, ephemeral: true});
                process.exit();
            }
            if (command[0].match("reload")) {
                command = interaction.client.commands.get(command[1]);
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
                return;
            }
            if (command[0].match("whitelist")) {
                let whitelist = require("../data/chat/whitelist.json");
                let guild = await interaction.client.guilds.fetch(command[1]);
                whitelist.guilds.push(command[1]);
                fs.writeFileSync(__dirname + "/../data/chat/whitelist.json", JSON.stringify(whitelist));
                await interaction.reply({content: `added ${guild.name}`, ephemeral: true});
                return;
            }
        }
        catch {e => {
            console.log(e);
            interaction.reply({content: `something went wrong`, ephemeral: true});
        }}
    }
}