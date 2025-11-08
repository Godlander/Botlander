import { Message } from "discord.js";

export async function oncreate(message: Message) {
  //check for friday in message
  const input = message.content;
  if (!input.toLowerCase().includes("friday")) return false;

  //check if friday
  let date = new Date();
  let reply =
    date.getDay() == 5
      ? "https://tenor.com/view/today-is-friday-in-california-gif-9719829655771550798"
      : "https://tenor.com/view/friday-california-reverse-gif-8000625330525004257";

  message.reply({
    content: reply,
    allowedMentions: { repliedUser: false },
  });
  return true;
}
