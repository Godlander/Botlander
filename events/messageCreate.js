const {Events} = require('discord.js');
const {clientid, openaikey} = require('../config.json');
const perm = require('../permissions');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        channel = message.channel;
        if (message.author.bot) return;

        const regx = new RegExp(`(botlander|<@!?${clientid}>)`, 'i');
        if (regx.test(message.content)) {
            //look for reminder
            if (await require('../actions/reminder').execute(message)) return;
            //chatbot response
            require('../actions/chatbot').execute(message);
        }
    }
};