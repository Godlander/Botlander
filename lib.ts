import { Interaction, Message } from "discord.js";

export function isstring(s: unknown): Boolean {
  return typeof s === "string";
}

//fetches a message from string channel and message ids
export async function getmessage(
  interaction: Interaction,
  channelid: string,
  messageid: string
): Promise<Message> {
  const channel = await interaction.client.channels.fetch(channelid);
  if (channel === null || !("messages" in channel)) throw "Not a valid channel";
  const message = await channel.messages.fetch(messageid);
  return message;
}

export function getmessagelink(message: Message): string {
  return (
    "https://discord.com/channels/" +
    (message.guild?.id || "@me") +
    "/" +
    message.channel.id +
    "/" +
    message.id
  );
}

export async function errorreply(
  interaction: Interaction,
  e: any,
  ephemeral: boolean = true
) {
  if (!interaction.isCommand()) return;
  if (!isstring(e)) {
    if ("rawError" in e) e = e.rawError;
    e = "```json\n" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + "```";
  }
  interaction.reply({ content: e.slice(0, 2000), ephemeral: ephemeral });
}
