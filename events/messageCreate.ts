import { Events, Message } from 'discord.js';
import { clientid } from '../config.json';

export const event = {
    name: Events.MessageCreate,
}

export const Actions = ['reminder', 'timestamp'];

export async function run(message : Message) {
    //ignore bot messages
    if (message.author.bot) return;

    //ignore non botlander calls
    const regx : RegExp = new RegExp(`(botlander|<@!?${clientid}>)`, 'i');
    if (!regx.test(message.content)) return;

    //look for actions
    for (const action of Actions) {
        if (await require('../actions/'+action).run(message)) return;
    }
    //chatbot response
    require('../actions/chatbot').run(message);
}