import { Events, Message } from 'discord.js';
import { DeleteActions } from '../bot';
import perms from '../permissions';

export const name = Events.MessageDelete;

export async function run (message : Message) {
    //ignore bot messages and non botlander calls
    if (perms.bot(message) || !perms.botlander(message)) return;

    //look for actions
    for (const action of DeleteActions) {
        if (await action(message)) return;
    }
}