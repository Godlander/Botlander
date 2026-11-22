import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  PermissionFlagsBits,
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

//base chance 5%
export const juicerate = {
  base: 0.05,
  max: 0.5,
  set(value: number) {
    this.base = value;
    if (this.base > this.max) this.max = this.base;
  },
  setmax(value: number) {
    this.max = value;
  },
  reset() {
    this.base = 0.05;
    this.max = 0.5;
  },
};

export async function command(interaction: ChatInputCommandInteraction) {
  await interaction.reply({ content: "https://imgur.com/a/o41g3LN" });
  if (
    interaction.inCachedGuild() &&
    interaction.appPermissions.has(PermissionFlagsBits.AddReactions)
  ) {
    const reply = await interaction.fetchReply();
    const rand = Math.random();
    let chance = juicerate.base;

    if (rand < chance) reply.react("🍹");
    else reply.react("🧃");
  }
}
