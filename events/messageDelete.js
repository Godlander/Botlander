const {Events} = require('discord.js');
const {clientid} = require('../config.json');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        //ignore bot messages
        channel = message.channel;
        if (message.author.bot) return;

        //ignore non botlander calls
        const regx = new RegExp(`(botlander|<@!?${clientid}>)`, 'i');
        if (!regx.test(message.content)) return;

        //look for reminder
        require('../actions/reminder').cancel(message);
    }
};