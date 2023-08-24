import { Events, Message } from 'discord.js';
import { CreateActions } from '../bot';
import perms from '../permissions';
import chatbot from '../actions/chatbot';

export const name = Events.MessageCreate;

export async function run (message : Message) {
    //ignore bot messages and non botlander calls
    if (perms.bot(message) || !perms.botlander(message)) return;

    message.channel.sendTyping();
    const typing = setInterval(()=>{message.channel.sendTyping()}, 5000);

    //look for actions
    for (const action of CreateActions) {
        if (await action(message)) return;
    }
    //chatbot response
    await chatbot(message);

    clearInterval(typing);
}