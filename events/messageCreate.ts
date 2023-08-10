import { Events, Message } from 'discord.js';
import { clientid } from '../config.json';

module.exports = {
    name: Events.MessageCreate,
    async execute(message : Message) {
        //ignore bot messages
        if (message.author.bot) return;

        //ignore non botlander calls
        const regx : RegExp = new RegExp(`(botlander|<@!?${clientid}>)`, 'i');
        if (!regx.test(message.content)) return;

        //look for reminder
        if (await require('../actions/reminder').execute(message)) return;
        //chatbot response
        require('../actions/chatbot').execute(message);
    }
};