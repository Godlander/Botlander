import { Message } from "discord.js";
import { openaikey, clientid } from "../config.json";
import whitelist from "../data/chat/whitelist.json";
import fs from "fs";

import defaults from "../data/chat/defaults.json";
import { mode } from "mathjs";

export const modes = {
  list: {} as any,
  selected: "default",
  get: function (mode = "") {
    if (mode) return this.list[mode].text;
    return this.list[this.selected].text;
  },
  set: function (mode: string) {
    if (mode in this.list) {
      this.selected = mode;
      this.save();
      console.log("Chatbot mode: " + this.selected);
      console.log(this.get());
      return true;
    }
    return false;
  },
  reload: function () {
    let file = require(__dirname + "/../data/chat/modes.json");
    this.selected = file.selected;
    this.list = file.list;
    console.log("Chatbot mode: " + this.selected);
    console.log(this.get());
  },
  add: function (name: string, content: string, icon: string) {
    this.list[name] = { text: content, icon: icon };
    this.save();
    this.reload();
  },
  remove: function (name: string) {
    if (name in this.list) {
      delete this.list[name];
      this.save();
      this.reload();
    }
  },
  save: function () {
    fs.writeFileSync(
      __dirname + "/../data/chat/modes.json",
      JSON.stringify({ selected: this.selected, list: this.list }, null, 2)
    );
  },
};
modes.reload();

export async function chat(
  input: any[] | string,
  modelist: string[] = [modes.selected]
): Promise<string> {
  let reply;
  const model = "gpt-4o-mini";
  let body: any = {
    model: model,
    max_tokens: 400,
    messages: [],
  };

  console.log(modelist);

  //select mode
  for (const mode of modelist)
    body.messages.push({ role: "developer", content: modes.get(mode) });

  //input
  if (typeof input === "string")
    body.messages.push({ role: "user", content: input });
  else {
    body.messages = body.messages.concat(input);
  }

  //get response
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + openaikey,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  reply = data.choices;
  if (reply) return reply[0].message.content;
  else throw data;
}

async function gethistory(message: Message, replies: any = [], limit = 5000) {
  //clean up text
  let text = message.content
    .replace(/botlander/gi, " ")
    .replace(`<@${clientid}>`, " ")
    .replace(/'|"/gi, "$&")
    .replace(/ +/gi, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
