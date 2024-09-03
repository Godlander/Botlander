import {
  APIEmbed,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  Guild,
  GuildMember,
  Message,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { getmessage } from "../lib";

export const slashcommand = new SlashCommandBuilder()
  .setContexts([0, 1, 2])
  .setName("quote")
  .setDescription("Quotes a message")
  .addStringOption((option) =>
    option
      .setName("message")
      .setDescription("Link to the message to quote")
      .setRequired(true)
  )
  .addUserOption((option) =>
    option.setName("mention").setDescription("Mentions a user in the quote")
  )
  .addBooleanOption((option) =>
    option.setName("raw").setDescription("Sends the quote embed as raw string")
  );

export const contextmenucommand = new ContextMenuCommandBuilder()
  .setName("quote")
  .setType(ApplicationCommandType.Message);

export async function quote(
  message: Message,
  filter: ((a: string) => string) | null = null
): Promise<APIEmbed> {
  //try to get the author of the message
  let author = message.author;
  let member;
  try {
    member = await message.guild?.members.fetch(author);
  } catch {
    member = null;
  }

  let text = message.content ?? " ";
  //run filter function on text if provided
  if (filter != null) text = filter(text);

  //generate embed
  const embed: APIEmbed = {
    color: member ? (member as GuildMember).displayColor || 3553599 : 3553599,
    author: {
      name: author.username ?? "Unknown",
      icon_url: author.avatarURL() ?? undefined,
    },
    description: text,
    footer: {
      text: message.channel.isDMBased()
        ? "@" + author.username
        : "#" + (message.channel as TextChannel).name,
      icon_url: message.channel.isDMBased()
        ? undefined
        : (message.guild as Guild).iconURL() ?? undefined,
    },
    timestamp: message.createdAt.toISOString(),
  };
  //add image attachment if exists
  if (message.attachments.size > 0) {
    let img = message.attachments.find((a) =>
      a?.contentType?.startsWith("image")
    );
    if (img != null) embed.image = { url: img.url };
  }
  return embed;
}

export async function contextmenu(
  interaction: MessageContextMenuCommandInteraction
) {
  const message = interaction.targetMessage;
  const guildid = message.guild ? message.guild.id : "@me";
  const channelid = message.channel.id;
  const messageid = message.id;
  const link =
    "https://discord.com/channels/" +
    guildid +
    "/" +
    channelid +
    "/" +
    messageid;
  const embed = await quote(message);
  interaction.reply({ content: link, embeds: [embed] });
}

export async function command(interaction: ChatInputCommandInteraction) {
  const input = interaction.options.getString("message", true).toLowerCase();
  const user = interaction.options.getUser("mention", false);
  const mention = user ? `${user}` : "";
  const raw = interaction.options.getBoolean("raw", false);
  //check that link is a discord message
  if (!input.startsWith("https://discord.com/channels/"))
    throw "Invalid message link";
  const ids = input.split("/").splice(4, 3);
  if (ids.length < 3) throw "Invalid message link";
  const message = await getmessage(interaction, ids[1], ids[2]);
  const embed = await quote(message);

  if (raw) interaction.reply("`" + JSON.stringify(embed) + "`");
  else interaction.reply({ content: mention + " " + input, embeds: [embed] });
}
