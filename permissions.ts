import { ChatInputCommandInteraction, Message } from "discord.js";
import { ownerid, clientid } from "./config.json";

export default {
  //true if bot has permission
  self(interaction: ChatInputCommandInteraction, arr: bigint[]) {
    return interaction.appPermissions.has(arr);
  },

  //true if interaction author has permissions
  has(interaction: ChatInputCommandInteraction, arr: bigint[]) {
    if (interaction.memberPermissions?.has(arr)) return true;
    interaction.reply({
      content: `You do not have permission to use this command.`,
      ephemeral: true,
    });
    return false;
  },

  //true if interaction author is owner
  owner(interaction: ChatInputCommandInteraction) {
    if (interaction.user.id === ownerid) return true;
    interaction.reply({
      content: `You do not have permission to use this command.`,
      ephemeral: true,
    });
    return false;
  },

  //true if message author is bot
  bot(message: Message) {
    return message.author?.bot;
  },

  //true if message contains botlander call
  botlander(message: Message) {
    const text = message.content;
    return (
      text &&
      (text.includes(`<@${clientid}>`) ||
        text.includes("Botlander") ||
        text.includes("botlander"))
    );
  },
};
