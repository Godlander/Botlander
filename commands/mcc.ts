import {
  ApplicationIntegrationType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import * as lib from "../lib";

export const slashcommand = new SlashCommandBuilder()
  .setContexts([
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel,
  ])
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ])
  .setName("mcc")
  .setDescription("Verify a minecraft command")
  .addStringOption((option) =>
    option
      .setName("command")
      .setDescription("Command")
      .setAutocomplete(true)
      .setRequired(true)
  );

let brigadier: any;

export function getcommand(input: string): string[] | null {
  const args = input.replaceAll("<", "").replaceAll(">", "").split(" ");
  const last = args[args.length - 1];
  args.pop();
  let cmd = brigadier;
  for (const arg of args) {
    if (arg in cmd) cmd = cmd[arg].children;
    else return null;
  }
  let out: string[] = [];
  const prefix = input.split(" ").slice(0, -1).join(" ");
  for (const s in cmd) {
    if (s.startsWith(last)) {
      if (cmd[s]["type"] === "literal") {
        out.push(prefix + " " + s);
      } else if (cmd[s]["type"] === "argument") {
        out.push(prefix + " <" + s + ">");
      }
    }
  }
  return out;
}

fetch(
  "https://raw.githubusercontent.com/Ersatz77/mcdata/refs/heads/main/generated/reports/commands.json"
)
  .then((res) => res.arrayBuffer())
  .then((buffer) => {
    const decoder = new TextDecoder("utf-8");
    const data = decoder.decode(buffer);
    brigadier = JSON.parse(data)["children"];
  })
  .catch((err) => console.log("Error: " + err.message));

export async function autocomplete(interaction: AutocompleteInteraction) {
  const input = interaction.options.getString("command", true);
  //get command
  const commands = getcommand(input);
  //no command found
  if (!commands) {
    interaction.respond([]);
    return;
  }
  interaction.respond(
    commands.slice(0, 25).map((e) => ({ name: e, value: e + " " }))
  );
}

export async function command(interaction: ChatInputCommandInteraction) {
  const input = interaction.options.getString("command", true);
  const command = getcommand(input);
  if (!command) {
    lib.errorreply(interaction, "Invalid command.");
    return;
  }
  interaction.reply(`\`\`\`${command}\`\`\``);
}
