import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Commands } from '../bot';
import path from 'path';
import fs from 'fs/promises';
import perms from '../permissions';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('controls')
        .addStringOption(option =>
            option.setName('command')
            .setDescription('command')
            .setRequired(true)),
    async execute(interaction : ChatInputCommandInteraction) {
        if (!perms.owner(interaction)) return;
        const command = interaction.options.getString('command', true).toLowerCase().split(' ');
        const ephemeral = command[0].startsWith("pub")? false : true;
        console.log(command);
        try {
            if (command[0].match("shutdown|stop|quit")) {
                await interaction.reply({content: `shutting down`, ephemeral: ephemeral});
                process.exit();
            }
            if (command[0].match("reload")) {
                const cmd = Commands.get(command[1]);
                delete require.cache[require.resolve(`./${cmd.data.name}.js`)];
                try {
                    Commands.delete(cmd.data.name);
                    const newCommand = require(`./${cmd.data.name}.js`);
                    Commands.set(newCommand.data.name, newCommand);
                    await interaction.reply({content: `\`${newCommand.data.name}\` reloaded`, ephemeral: ephemeral});
                } catch (e) {
                    console.error(e);
                    await interaction.reply({content: `\`/${cmd.data.name}\` couldn't load:\`\`\`\n${e}\n\`\`\``, ephemeral: ephemeral});
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
                    const files = await fs.readdir(dir);
                    const out = '```\n' + files.join('\n') + '\n```';
                    await interaction.reply({content: out, ephemeral: ephemeral});
                }
                else if (stat.isFile()) {
                    const ext = path.extname(dir).substring(1);
                    const txt = await fs.readFile(dir);
                    const msg = '```' + ext + '\n' + txt + '\n```';
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
        catch {(e : any) => {
            console.log(e);
            interaction.reply({content: `something went wrong`, ephemeral: ephemeral});
        }}
    }
}