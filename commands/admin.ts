import {
  ChatInputCommandInteraction,
  Guild,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { Commands } from "../bot";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import perms from "../permissions";
import * as lib from "../lib";
import { modes } from "../actions/chatbot";

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
  const command = interaction.options.getString("command", true).split(" ");

  // publicly visible or ephemeral
  const flags = command[0].startsWith("pub")
    ? undefined
    : MessageFlags.Ephemeral;
  console.log(command);

  try {
    // shutdown bot
    if (command[0].match("shutdown|stop|quit")) {
      await interaction.reply({
        content: `Shutting down.`,
        flags: flags,
      });
      process.exit();
    }

    // list files
    // ls|dir|list path
    if (command[0].match("ls|dir|list")) {
      let dir = directory(command[1]);
      const stat = await fs.lstat(dir);
      if (stat.isDirectory()) {
        const files = await fs.readdir(dir);
        const out = `\`\`\`\n${files.join("\n")}\n\`\`\``;
        await interaction.reply({ content: out, flags: flags });
      } else if (stat.isFile()) {
        const ext = path.extname(dir).substring(1);
        const file = await fs.readFile(dir);
        let txt = file.toString();
        //cut to selected lines
        if (command[2]) {
          const lines = command[2].split("-").map(Number);
          txt = txt
            .split("\n")
            .slice(lines[0] - 1, lines[1] ?? lines[0])
            .join("\n");
        }
        const msg = `\`\`\`${ext}\n${txt}\n\`\`\``;
        if (msg.length < 2000) {
          await interaction.reply({ content: msg, flags: flags });
        } else {
          await interaction.reply({ files: [dir], flags: flags });
        }
      } else throw command[1] + " not found";
      return;
    }

    // whitelist server or user for chatbot
    // whitelist add|remove user|guild| id
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
        flags: flags,
      });
      return;
    }

    // chatbot modes
    // mode set|get|list|new|remove name content
    if (command[0].match("mode")) {
      const action = command[1];
      if (action.match("set")) {
        if (modes.set(command[2]))
          await interaction.reply({
            content: `mode set to ${modes.selected}`,
            flags: flags,
          });
        else
          await interaction.reply({
            content: `no mode ${command[2]}`,
            flags: flags,
          });
        return;
      }
      if (action.match("get")) {
        let m = "";
        if (command[2]) m = command[2];
        else m = modes.selected;
        await interaction.reply({
          content: `${m}:\n${modes.get(m)}`,
          flags: flags,
        });
        return;
      }
      if (action.match("list")) {
        let text = "";
        for (const mode in modes.list) {
          text += `${mode}: ${modes.list[mode].icon}, `;
        }
        await interaction.reply({
          content: `modes: \n${text}`,
          flags: flags,
        });
        return;
      }
      if (action.match("new") || action.match("add")) {
        let icon = command[3];
        if (icon == "none") icon = "";
        const content = command.slice(4).join(" ");
        modes.add(command[2], content, icon);
        await interaction.reply({
          content: `mode ${command[2]} created with: \n${content}`,
          flags: flags,
        });
        return;
      }
      if (action.match("remove") || action.match("delete")) {
        modes.remove(command[2]);
        await interaction.reply({
          content: `mode ${command[2]} removed`,
          flags: flags,
        });
        return;
      }
    }

    // eval code
    if (command[0].match("eval")) {
      command.shift();
      let s = command.join(" ");
      if (!s.includes("return")) s = "return " + s;
      const out = await eval(
        `async (i) => {try{` + s + `}catch(e){return e;}}`
      )(interaction);
      await interaction.reply({
        content: `\`\`\`\n${out}\n\`\`\``.slice(0, 2000),
        flags: flags,
      });
      return;
    }
  } catch (e) {
    console.log(e);
    lib.errorreply(interaction, e, flags);
  }
}
