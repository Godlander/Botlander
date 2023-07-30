const {clientid, openaikey} = require('../config.json');
const whitelist = require('../data/chat/whitelist.json');

module.exports = {
    async execute(message) {
        if (!(whitelist.guilds.includes(message.guildId) || whitelist.users.includes(message.author.id))) return;
        let input = message.content;
        const regx = new RegExp(`(botlander|<@!?${clientid}>)`, 'i');
        input = input.replace(regx, " ");
        input = input.replace(/'|"/gi, "\$&");
        input = input.replace(/ +/gi, " ");
        input = input.normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim();
        channel.sendTyping();
        console.log("\nInput: " + input);
        fetch('https://api.openai.com/v1/chat/completions', {
            method: "POST",
            headers: {'Content-Type':'application/json','Authorization':'Bearer '+openaikey},
            body: JSON.stringify({model:"gpt-3.5-turbo",messages:[{role: "user", content: input}]})
        })
        .then(response => response.json())
        .then(data => {
            let reply = data.choices[0].message.content ?? '<@225455864876761088> plz help';
            reply = reply.slice(0, 2000);
            console.log(reply);
            message.reply({
                content: reply,
                allowedMentions: {repliedUser:false}
            }).catch(()=>{channel.send(reply)});
        }).catch(e=>{
            console.log(e);
            channel.send('<@225455864876761088> plz help');
        });
    }
}