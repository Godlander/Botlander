import { Message } from "discord.js";
import { openaikey } from "../config.json";
import whitelist from "../data/chat/whitelist.json";

var defaults = [
  "<@225455864876761088> plz help",
  "No comment.",
  "💩",
  "lol.",
  "...",
  "hmm.",
  "Hmmm.",
  "mhm.",
  "Mhm.",
  "yes.",
  "no.",
  "You're probably right.",
  "Yes?",
  "Sorry, I'm busy right now.",
  "Don't you have something better to do?",
  "Uh huh.",
  "Yeah sure.",
  "Okay.",
  "ok",
  "Sure.",
  "Hi.",
  "Go bother someone else.",
  "Glad to hear that.\nor sorry that happened.",
];

const modes: Record<string, string> = {
  annoyed:
    "botlander is annoyed and replies with playful insults and witty remarks full of sarcasm",
  cute: "botlander is cute (´・ω・`) and uses a lot of unicode text faces (☉д⊙)",
};
let mode = "default";

export async function chat(input: string, vision = false): Promise<string> {
  let reply;
  const model = "gpt-4o-mini";
  let body: any = {
    model: model,
    max_tokens: 400,
    messages: [],
  };
  if (mode in modes)
    body.messages.push({ role: "system", content: modes[mode] });
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
  const four = message.content.includes("👀");
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
  if (message.channel.isDMBased()) origin += "dm";
  else origin += message.guild?.name + " " + message.guild?.id;
  console.log("\nFrom: " + origin + "\nInput: " + ", Vision: " + vision);

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
