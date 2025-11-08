import { Message } from "discord.js";
import { gettimestamp } from "../commands/time";

export async function oncreate(message: Message) {
  //check for remind in message
  const input = message.content;
  if (!input.toLowerCase().includes("timestamp")) return false;

  //check for time in message
  const timestamp = gettimestamp(input, true);
  if (!timestamp) return false;

  message.reply({
    content: `<t:${timestamp}:R> \`<t:${timestamp}:R>\``,
    allowedMentions: { repliedUser: false },
  });
  return true;
}
