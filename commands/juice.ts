import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";

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
  .setName("juice")
  .setDescription("🧃");

export async function command(interaction: ChatInputCommandInteraction) {
  await interaction.reply({ content: "https://imgur.com/a/o41g3LN" });
  const userInstalled = Boolean(interaction.authorizingIntegrationOwners["1"]);
  if (!userInstalled) {
    const reply = await interaction.fetchReply();
    reply.react("🧃");
  }
}
