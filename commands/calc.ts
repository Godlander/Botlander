import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { evaluate } from "mathjs";

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
  .setName("calc")
  .setDescription("Calculates an expression")
  .addStringOption((option) =>
    option
      .setName("expression")
      .setDescription("The expression to calculate")
      .setRequired(true)
  );

export async function command(interaction: ChatInputCommandInteraction) {
  const input = interaction.options.getString("expression", true);
  const output = evaluate(input);
  let msg = `\`\`\`fix\n${input}\n= ${output}\`\`\``;

  switch (output) {
    case 67: msg = "https://tenor.com/view/scp-067-67-6-7-six-seven-sixty-seven-gif-13940852437921483111"; break;
    case 69: msg = `\`\`\`fix\n${input}\n= 69, Nice.\`\`\``; break;
  }

  try {
    interaction.reply({
      content: msg,
      allowedMentions: { repliedUser: false },
    });
  } catch (e: any) {
    interaction.reply({
      content: "`" + e.stack.split("\n", 1)[0] + "`",
      flags: MessageFlags.Ephemeral,
      allowedMentions: { repliedUser: false },
    });
  }
}
