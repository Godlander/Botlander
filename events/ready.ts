import { Client, Events } from "discord.js";
import { reset } from "../actions/remind";

export const name = Events.ClientReady;
export const once = true;

export async function run(client: Client) {
  console.log(`ready`);

  //check reminders
  reset(client);
  setInterval(() => {
    reset(client);
  }, 86400000);
}
