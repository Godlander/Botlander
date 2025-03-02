import { Message } from "discord.js";
import { clientid } from "../config.json";
import { chat, modes } from "../lib/chat";
import whitelist from "../data/chat/whitelist.json";
import defaults from "../data/chat/defaults.json";

async function gethistory(message: Message, replies: any = [], limit = 4000) {
  //clean up text
  let text = message.content
    .replaceAll(`<@${clientid}>`, " ")
    .replace(/botlander/gi, " ")
    .replace(/ +/gi, " ")
    .trim();
  if (message.content.includes(`<@${clientid}>`)) {
    for (const key in modes.list) {
      if (modes.list[key].icon && text.includes(modes.list[key].icon)) {
        text = text.replace(key, "");
      }
    }
  }

  const content = [];
  //msg text
  content.push({ type: "text", text: text });
  //image attachment
  if (message.attachments.size > 0) {
    const img = message.attachments.find((a) =>
      a?.contentType?.startsWith("image")
    );
    if (img != null) {
      content.push({
        type: "image_url",
        image_url: { url: img.url },
      });
    }
  }

  //add to reply
  replies.push({
    role: message.author.id === clientid ? "assistant" : "user",
    content: content,
  });

  //input length limit
  limit -= message.content.length;
  if (limit < 0) return replies;

  //try read next reply
  try {
    const next = await message.fetchReference();
    return await gethistory(next, replies, limit);
  } catch {
    return replies;
  }
}

export default async function (message: Message) {
  if (
    !(
      (message.guildId ?? "" in whitelist.guilds) ||
      message.author.id in whitelist.users
    )
  )
    return;

  //get modes
  let modelist = [];
  if (message.content.includes(`<@${clientid}>`)) {
    for (const key in modes.list) {
      if (
        modes.list[key].icon &&
        message.content.includes(modes.list[key].icon)
      ) {
        modelist.push(key);
      }
    }
    if (modelist.length < 1) modelist.push("default");
  }
  if (modelist.length < 1) modelist.push(modes.selected);

  //get messages
  let history: any[] = await gethistory(message);
  history = history.reverse();

  //log
  let origin = message.author.username + " In: ";
  const dm = message.channel.isDMBased();
  if (dm) origin += "dm";
  else origin += message.guild?.name + " " + message.guild?.id;
  console.log(
    `\nFrom: ${origin}\nInput: ${message.content}\nContext: ${history.length} messages`
  );

  // try reply
  try {
    let reply = await chat(history, modelist);
    if (reply.trim().length < 1) throw "empty message";
    reply = reply.substring(0, 1999);
    message.reply({
      content: reply,
      allowedMentions: { repliedUser: false },
    });
    console.log("Output: " + reply);
  } catch (e) {
    console.log(e);
    message.reply({
      content: defaults[Math.floor(Math.random() * defaults.length)],
      allowedMentions: { repliedUser: false },
    });
  }
}
