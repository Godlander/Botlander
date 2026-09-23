import { EmbedBuilder, Message } from "discord.js";
import { propercase } from "../lib/message";

export async function oncreate(message: Message) {
  //check for dictionary query in message
  const input = message.content;
  const word = input
    .match(/(?:dictionary(?: for)?) (\w+)|(?:(?:define|definition of|meaning of) )(\w+)|(?:what(?:\w| )* does(?:\w| )* )(\w+) mean/i)
    ?.slice(1)
    ?.find((x) => x !== undefined);
  if (!word) return false;

  //look up word
  console.log("Looking up \'" + word + "\'");
  const result = await fetch("https://freedictionaryapi.com/api/v1/entries/en/" + word);
  const data = await result.json();

  //word not found, cancel action
  if (!data || !data.entries || data.entries.length === 0) {
    console.log("Word not found.");
    return false;
  }

  //build response
  let text = `> **${propercase(data.word)}**\n`;
  for (const entry of data.entries) {
    text += `> *${propercase(entry.partOfSpeech)}*\n`;
    const sense = entry.senses[0];
    if (sense) {
      text += `> \\- ${sense.definition}\n`;
      if (sense.examples && sense.examples.length > 0) text += `>    *${sense.examples[0]}*\n`;
    }
  }

  message.reply({
    content: text,
    allowedMentions: { repliedUser: false },
  });
  return true;
}
