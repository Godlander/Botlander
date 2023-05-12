const {Events} = require('discord.js');
const {clientid, openaikey} = require('../config.json');
const perm = require('../permissions');
const whitelist = require('../data/chat/whitelist.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        channel = message.channel;
        if (message.author.bot || !(
            whitelist.guilds.includes(message.guildId) ||
            whitelist.users.includes(message.author.id)
        )) return;
        //look for botlander action call
        const regx = new RegExp(`>?(botlander|<@!?${clientid}>)`, 'i');
        if (regx.test(message.content)) {
            input = message.content.replace(regx, " ");
            input = input.replace(/'|"/gi, "\$&");
            input = input.replace(/ +/gi, " ");
            input = input.normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim();
            channel.sendTyping();
            console.log("\nInput: " + input);
            fetch('https://api.openai.com/v1/chat/completions', {
                method: "POST",
                headers: {'Content-Type':'application/json','Authorization':'Bearer '+openaikey},
                body: JSON.stringify({model:"gpt-3.5-turbo",max_tokens:2000,messages:[{role: "user", content: input}]})
            })
            .then(response => response.json())
            .then(data => {
                let reply = data.choices[0].message;
                console.log(reply.content);
                message.reply({
                    content: reply.content,
                    allowedMentions: {repliedUser:false}
                }).catch(()=>{channel.send(reply.content)});
            }).catch(e=>{
                console.log(e);
                channel.send('<@225455864876761088> plz help');
            });
        }
    }
};