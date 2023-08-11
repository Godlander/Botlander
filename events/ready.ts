import { Client, Events } from "discord.js";

const reminders = require("../actions/reminder");

export const event = {
    name: Events.ClientReady,
    once: true
}

export async function run(client : Client) {
    console.log(`ready`);

    //check reminders
    reminders.reset(client);
    setInterval(() => {
        reminders.reset(client);
    }, 86400000);
}