const {SlashCommandBuilder} = require('discord.js');
const path = require('path');
const fs = require('fs').promises;
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
            let ephemeral = command[0].startsWith("pub")? false : true;
            if (command[0].match("shutdown|stop|quit")) {
                await interaction.reply({content: `shutting down`, ephemeral: ephemeral});
                process.exit();
            }
            if (command[0].match("reload")) {
                command = interaction.client.commands.get(command[1]);
                delete require.cache[require.resolve(`./${command.data.name}.js`)];
                try {
                    interaction.client.commands.delete(command.data.name);
                    const newCommand = require(`./${command.data.name}.js`);
                    interaction.client.commands.set(newCommand.data.name, newCommand);
                    await interaction.reply({content: `\`${newCommand.data.name}\` reloaded`, ephemeral: ephemeral});
                } catch (error) {
                    console.error(error);
                    await interaction.reply({content: `\`/${command.data.name}\` couldn't load:\`\`\`${error.message}\`\`\``, ephemeral: ephemeral});
                }
                return;
            }
            if (command[0].match("whitelist")) {
                let whitelist = require("../data/chat/whitelist.json");
                let guild = await interaction.client.guilds.fetch(command[1]);
                whitelist.guilds.push(command[1]);
                await fs.writeFile(__dirname + "/../data/chat/whitelist.json", JSON.stringify(whitelist));
                await interaction.reply({content: `added ${guild.name}`, ephemeral: ephemeral});
                return;
            }
            if (command[0].match("ls|dir|list")) {
                let dir = command[1] || "./";
                if (!dir.startsWith("./")) dir = "./" + dir;
                const stat = await fs.lstat(dir);
                if (stat.isDirectory()) {
                    let files = await fs.readdir(dir);
                    files = '```\n' + files.join('\n') + '\n```';
                    await interaction.reply({content: files, ephemeral: ephemeral});
                }
                else if (stat.isFile()) {
                    let ext = path.extname(dir).substring(1);
                    let txt = await fs.readFile(dir);
                    msg = '```' + ext + '\n' + txt + '\n```';
                    if (msg.length < 2000) {
                        await interaction.reply({content: msg, ephemeral: ephemeral});
                    }
                    else {
                        await interaction.reply({files: [dir], ephemeral: ephemeral});
                    }
                }
                return;
            }
            if (command[0].match("eval")) {
                command.shift();
                let s = command.join(' ');
                let out;
                try {out = eval(s);}
                catch (e) {out = e;}
                await interaction.reply({content: `${out}`, ephemeral: ephemeral});
                return;
            }
        }
        catch {e => {
            console.log(e);
            interaction.reply({content: `something went wrong`, ephemeral: ephemeral});
        }}
    }
}