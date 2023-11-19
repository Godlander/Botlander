import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Commands } from '../bot';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import perms from '../permissions';

export const slashcommand = new SlashCommandBuilder()
.setName('admin')
.setDescription('controls')
.addStringOption(option =>
    option.setName('command')
    .setDescription('command')
    .setRequired(true))

function directory(path : null | string) : string {
    path = path || "./";
    if (!path.startsWith("./")) path = "./" + path;
    if (!existsSync(path)) throw "Path does not exist.";
    return path;
}

export async function command(interaction : ChatInputCommandInteraction) {
    if (!perms.owner(interaction)) return;
    const command = interaction.options.getString('command', true).toLowerCase().split(' ');
    const ephemeral = command[0].startsWith("pub")? false : true;
    console.log(command);
    try {
        if (command[0].match("shutdown|stop|quit")) {
            await interaction.reply({content: `Shutting down.`, ephemeral: ephemeral});
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
            let dir = directory(command[1]);
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
            else throw "Path not found.";
            return;
        }
        if (command[0].match("eval")) {
            command.shift();
            const s = command.join(' ');
            let out;
            try {out = eval(s);}
            catch (e) {out = e;}
            await interaction.reply({content: `${out}`.slice(0, 2000), ephemeral: ephemeral});
            return;
        }
    }
    catch {(e : any) => {
        interaction.reply({content: JSON.stringify(e).slice(0,2000), ephemeral: ephemeral});
    }}
}