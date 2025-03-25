import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  Client,
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

const serverid = "226104173987364866";
const benefactor = "988953717179052043";
const contributor = "835404784529571880";
const connoisseur = "1060325532136382585";
const tasty = "486384160790020098";
const weights = {
  [benefactor]: 0.2,
  [contributor]: 0.1,
  [connoisseur]: 0.1,
  [tasty]: 0.1,
};

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

    //apply roles in godland server
    const server = interaction.client.guilds.cache.get(serverid);
    const member = server?.members.cache.get(interaction.user.id);
    if (member) {
      for (const role in weights) {
        if (member.roles.cache.has(role)) {
          chance += weights[role as keyof typeof weights];
        }
      }
      //max 50% chance (or base if higher)
      chance = Math.min(chance, juicerate.max);
    }

    if (rand < chance) reply.react("🍹");
    else reply.react("🧃");
  }
}
