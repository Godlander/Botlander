import { Message } from 'discord.js';
import { clientid } from '../config.json';
import { DeleteActions } from '../bot';

export async function run(message : Message) {
    //ignore bot messages
    if (message.author?.bot) return;

    //ignore non botlander calls
    const regx = new RegExp(`(botlander|<@!?${clientid}>)`, 'i');
    if (!regx.test(message.content)) return;

    //look for actions
    for (const action of DeleteActions) {
        if (await action(message)) return;
    }
}