import { Events, Message } from 'discord.js';
import { clientid } from '../config.json';

module.exports = {
    name: Events.MessageDelete,
    async execute(message : Message) {
        //ignore bot messages
        if (message.author.bot) return;

        //ignore non botlander calls
        const regx = new RegExp(`(botlander|<@!?${clientid}>)`, 'i');
        if (!regx.test(message.content)) return;

        //look for reminder
        require('../actions/reminder').cancel(message);
    }
};