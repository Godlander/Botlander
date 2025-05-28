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
  try {
    interaction.reply({
      content: "```fix\n" + input + "\n= " + evaluate(input) + "```",
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
