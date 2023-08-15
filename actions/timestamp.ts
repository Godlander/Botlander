import { Message } from 'discord.js';
import { gettimestamp } from '../commands/time'

module.exports = {
    async run(message : Message) {
        //check for remind in message
        const input = message.content;
        if (!input.includes("timestamp")) return false;
        //check for time in message
        const timestamp = gettimestamp(input, true);
        if (!timestamp) return false;
        message.reply({
            content: `<t:${timestamp}:R>`,
            allowedMentions: {repliedUser:false}
        });
        return true;
    }
}