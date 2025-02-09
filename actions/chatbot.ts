import { Message } from "discord.js";
import { openaikey } from "../config.json";
import whitelist from "../data/chat/whitelist.json";
import fs from "fs";

export const modes = {
  list: {} as any,
  mode: "default",
  get: function () {
    return this.list[this.mode];
  },
  set: function (mode: string) {
    if (mode in this.list) {
      this.mode = mode;
      this.list.selected = mode;
      console.log("Chatbot mode: " + this.mode);
      this.save();
      return true;
    }
    return false;
  },
  reload: function () {
    this.list = require(__dirname + "/../data/chat/modes.json");
    this.mode = this.list.selected;
  },
  add: function (name: string, content: string) {
    this.list[name] = content;
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
      JSON.stringify(this.list)
    );
  }
};
modes.reload();
console.log("Chatbot mode: " + modes.mode);

export async function chat(input: string, vision = false): Promise<string> {
  let reply;
  const model = "gpt-4o-mini";
  let body: any = {
    model: model,
    max_tokens: 400,
    messages: [],
  };
  //select mode
  const modetext = modes.get();
  if (modetext) body.messages.push({ role: "system", content: modetext });
  //get response
  body.messages.push({ role: "user", content: input });
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

export default async function (message: Message) {
  if (
    !(
      (message.guildId ?? "" in whitelist.guilds) ||
      message.author.id in whitelist.users
    )
  )
    return;
  const text = message.content
    .replace(/botlander/gi, " ")
    .replace(/'|"/gi, "$&")
    .replace(/ +/gi, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  let content: any = [{ type: "text", text: text }];
  const vision = message.attachments.size > 0;
  if (vision) {
    const img = message.attachments.find((a) =>
      a?.contentType?.startsWith("image")
    );
    if (img != null) {
      content.push({
        type: "image_url",
        image_url: { url: img.url + "width=512&height=512" },
      });
    }
  }
  let origin = message.author.username + " In: ";
  const dm = message.channel.isDMBased();
  if (dm) origin += "dm";
  else origin += message.guild?.name + " " + message.guild?.id;
  console.log("\nFrom: " + origin + "\nInput: " + message.content + ", Vision: " + vision);

  try {
    let reply = await chat(content, vision);
    if (reply.trim().length < 1) throw "empty message";
    reply = reply.substring(0, 1999);
    message.reply({
      content: reply,
      allowedMentions: { repliedUser: false },
    });
    console.log("Output: " + reply);
  } catch (e) {
    console.log(e);
    //reply = defaults[Math.floor(Math.random()*defaults.length)]
    message.reply({
      content: "<@225455864876761088> plz help",
      allowedMentions: { repliedUser: false },
    });
  }
}
