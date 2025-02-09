import fs from "fs";
import path from "path";
import {
  Client,
  Collection,
  GatewayIntentBits,
  Message,
  Partials,
  REST,
  Routes,
} from "discord.js";
import { clientid, token } from "./config.json";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

//collect actions
export const CreateActions: { (message: Message): Promise<boolean> }[] = [];
export const DeleteActions: { (message: Message): Promise<boolean> }[] = [];
const actionPath = path.join(__dirname, "actions");
const actionFiles = fs
  .readdirSync(actionPath)
  .filter((file) => file.endsWith(".ts"));
for (const file of actionFiles) {
  const { oncreate, ondelete } = require(path.join(actionPath, file));
  if (oncreate) {
    CreateActions.push(oncreate);
    console.log(`oncreate ${file} loaded`);
  }
  if (ondelete) {
    DeleteActions.push(ondelete);
    console.log(`ondelete ${file} loaded`);
  }
}

//collect events
const eventPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventPath)
  .filter((file) => file.endsWith(".ts"));
for (const file of eventFiles) {
  const { name, once, run } = require(path.join(eventPath, file));
  if (name && run) {
    if (once) {
      client.once(name, (...args) => run(...args));
    } else {
      client.on(name, (...args) => run(...args));
    }
    console.log(`event ${file} loaded`);
  } else {
    console.log(`event ${file} couldn't load`);
  }
}

//collect commands
export const Commands: Collection<string, any> = new Collection();
const setcommands: any[] = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts"));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  let load = false;
  if ("slashcommand" in command && "command" in command) {
    Commands.set(command.slashcommand.name, command);
    setcommands.push(command.slashcommand.toJSON());
    console.log(`/${file} loaded`);
    load = true;
  }
  if ("contextmenucommand" in command && "contextmenu" in command) {
    Commands.set(command.slashcommand.name, command);
    setcommands.push(command.contextmenucommand.toJSON());
    console.log(`>${file} loaded`);
    load = true;
  }
  if (!load) {
    console.log(`${file} couldn't load`);
  }
}

//register commands
const rest = new REST().setToken(token);
rest
  .put(Routes.applicationCommands(clientid), { body: setcommands })
  .then((data) => console.log("Reloaded", (data as any).length, "commands"))
  .catch((e) => console.log(e));

client.login(token);
