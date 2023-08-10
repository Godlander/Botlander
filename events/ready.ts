import { Client, Events } from "discord.js";

const reminders = require("../actions/reminder");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client : Client) {
        console.log(`ready`);

        //check reminders
        reminders.reset(client);
        setInterval(() => {
            reminders.reset(client);
        }, 86400000);
    }
};