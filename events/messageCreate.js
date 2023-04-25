const {Events} = require('discord.js');
const {clientid, openaikey} = require('../config.json');
const whitelist = require('../data/chat/whitelist.json');

var context = [];

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        channel = message.channel;
        if (message.author.bot || !(
            whitelist.guilds.includes(message.guildId) ||
            whitelist.users.includes(message.member.id)
        )) return;
        //look for botlander action call
        const regx = new RegExp(`>?(botlander|<@!?${clientid}>)`, 'i');
        if (regx.test(message.content)) {
            input = message.content.replace(regx, " ");
            input = input.replace(/'|"/gi, "\$&");
            input = input.replace(/ +/gi, " ");
            input = input.normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim();
            channel.sendTyping();
            context.push({role: "user", content: input});
            if (context.length > 10) context.splice(2,1);
            console.log("\nInput: " + JSON.stringify(context));
            fetch('https://api.openai.com/v1/chat/completions', {
                method: "POST",
                headers: {'Content-Type':'application/json','Authorization':'Bearer '+openaikey},
                body: JSON.stringify({model:"gpt-3.5-turbo",messages:context})
            })
            .then(response => response.json())
            .then(data => {
                let reply = data.choices[0].message;
                context.push(reply);
                console.log(reply.content);
                message.reply({
                    content: reply.content,
                    allowedMentions: {repliedUser:false}
                }).catch(e=>{channel.send(reply.content)});
            }).catch(e=>{});
        }
    }
};