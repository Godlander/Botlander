import { Events, Message } from 'discord.js';
import { clientid } from '../config.json';

export const event = {
    name: Events.MessageDelete
}

export async function run(message : Message) {
    //ignore bot messages
    if (message.author.bot) return;

    //ignore non botlander calls
    const regx = new RegExp(`(botlander|<@!?${clientid}>)`, 'i');
    if (!regx.test(message.content)) return;

    //look for reminder
    require('../actions/reminder').cancel(message);
}