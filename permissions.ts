import {
  ChatInputCommandInteraction,
  Message,
  PermissionsBitField,
  GuildChannel,
} from "discord.js";
import { ownerid, clientid } from "./config.json";

export const isbotlander = new RegExp(
  `((^|[^\\w/\\\\><()[\\];])botlander($|[^\\w/\\\\><()[\\];]))|<@!?${clientid}>`,
  "gi"
);

export default {
  //true if bot has permission
  self(channel: GuildChannel, arr: bigint[]) {
    return channel.guild.members.me?.permissions.has(arr);
  },

  //true if interaction author has permissions
  has(interaction: ChatInputCommandInteraction, arr: bigint[]) {
    if ((interaction.member?.permissions as PermissionsBitField).has(arr))
      return true;
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
    return isbotlander.test(message.content);
  },
};
