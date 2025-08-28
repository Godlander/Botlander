import { openaikey } from "../config.json";
import fs from "fs";

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
  const model = "gpt-5-nano";
  let body: any = {
    model: model,
    messages: [],
  };

  //select mode
  let instructions = ""
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
