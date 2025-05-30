import {
  Channel,
  Events,
  Message,
  PermissionFlagsBits,
  GuildChannel,
} from "discord.js";
import { CreateActions } from "../bot";
import perms from "../permissions";
import chatbot from "../actions/chatbot";

export const name = Events.MessageCreate;

async function sendtyping(channel: Channel) {
  if ("sendTyping" in channel)
    try {
      channel.sendTyping();
    } catch {
      console.log("hihixd");
    }
}

export async function run(message: Message) {
  //ignore bot messages and non botlander calls
  //quit if no permission
  if (
    !message ||
    perms.bot(message) ||
    !perms.botlander(message) ||
    !perms.self(message.channel as Channel, [PermissionFlagsBits.SendMessages])
  ) {
    return;
  }

  sendtyping(message.channel);
  const typing = setInterval(() => {
    sendtyping(message.channel);
  }, 5000);

  //look for actions
  for (const action of CreateActions) {
    if (await action(message)) {
      clearInterval(typing);
      return;
    }
  }
  //chatbot response
  try {
    await chatbot(message);
  } catch {}
  clearInterval(typing);
}
