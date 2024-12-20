import {
  ChatInputCommandInteraction,
  Guild,
  SlashCommandBuilder,
} from "discord.js";
import { Commands } from "../bot";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import perms from "../permissions";
import * as lib from "../lib";

export const slashcommand = new SlashCommandBuilder()
  .setName("admin")
  .setDescription("controls")
  .addStringOption((option) =>
    option.setName("command").setDescription("command").setRequired(true)
  );

function directory(path: null | string): string {
  path = path || "./";
  if (!path.startsWith("./")) path = "./" + path;
  if (!existsSync(path)) throw path + " not found";
  return path;
}

export async function command(interaction: ChatInputCommandInteraction) {
  if (!perms.owner(interaction)) return;
  const command = interaction.options
    .getString("command", true)
    .toLowerCase()
    .split(" ");
  const ephemeral = command[0].startsWith("pub") ? false : true;
  console.log(command);
  try {
    if (command[0].match("shutdown|stop|quit")) {
      await interaction.reply({
        content: `Shutting down.`,
        ephemeral: ephemeral,
      });
      process.exit();
    }
    if (command[0].match("reload")) {
      const cmd = Commands.get(command[1]);
      console.log(cmd);
      if (!cmd) throw command[1] + " not found";
      delete require.cache[require.resolve(`./${cmd.slashcommand.name}.ts`)];
      try {
        Commands.delete(cmd.slashcommand.name);
        const newCommand = require(`./${cmd.slashcommand.name}.ts`);
        Commands.set(newCommand.slashcommand.name, newCommand);
        await interaction.reply({
          content: `\`${newCommand.slashcommand.name}\` reloaded`,
          ephemeral: ephemeral,
        });
      } catch (e) {
        console.error(e);
        await interaction.reply({
          content: `\`/${cmd.slashcommand.name}\` couldn't load:\`\`\`\n${e}\n\`\`\``,
          ephemeral: ephemeral,
        });
      }
      return;
    }
    if (command[0].match("whitelist")) {
      let whitelist = JSON.parse(
        await fs.readFile("data/chat/whitelist.json", "utf-8")
      );
      let name = "";
      if (command[1].match("guild|server")) {
        let guild: Guild | null;
        if (command.length > 2)
          guild = await interaction.client.guilds.fetch(command[2]);
        else guild = interaction.guild;
        if (!guild) throw command[1] + " not found";
        name = guild.name;
        whitelist.guilds[guild.id] = name;
      } else if (command[1].match("user")) {
        const user = await interaction.client.users.fetch(command[2]);
        name = user.username;
        if (!name) throw command[1] + " not found";
        whitelist.users[command[2]] = name;
      }
      await fs.writeFile("data/chat/whitelist.json", JSON.stringify(whitelist));
      await interaction.reply({
        content: `added ${name}`,
        ephemeral: ephemeral,
      });
      return;
    }
    if (command[0].match("ls|dir|list")) {
      let dir = directory(command[1]);
      const stat = await fs.lstat(dir);
      if (stat.isDirectory()) {
        const files = await fs.readdir(dir);
        const out = "```\n" + files.join("\n") + "\n```";
        await interaction.reply({ content: out, ephemeral: ephemeral });
      } else if (stat.isFile()) {
        const ext = path.extname(dir).substring(1);
        const txt = await fs.readFile(dir);
        const msg = "```" + ext + "\n" + txt + "\n```";
        if (msg.length < 2000) {
          await interaction.reply({ content: msg, ephemeral: ephemeral });
        } else {
          await interaction.reply({ files: [dir], ephemeral: ephemeral });
        }
      } else throw command[1] + " not found";
      return;
    }
    if (command[0].match("eval")) {
      command.shift();
      const s = command.join(" ");
      const out = await eval(
        `async (i) => {try{` + s + `}catch(e){return e;}}`
      )(interaction);
      await interaction.reply({
        content: `\`\`\`\n${out}\n\`\`\``.slice(0, 2000),
        ephemeral: ephemeral,
      });
      return;
    }
  } catch (e) {
    console.log(e);
    lib.errorreply(interaction, e, ephemeral);
  }
}
