import { Message } from "discord.js";
import { clientid, openaikey } from '../config.json';
import whitelist from '../data/chat/whitelist.json';

const regx = new RegExp(`(botlander|<@!?${clientid}>)`, 'i');

export default async function (message : Message) {
    if (!(whitelist.guilds.includes(message.guildId ?? '0') || whitelist.users.includes(message.author.id))) return;
    const input = message.content.replace(regx, " ").replace(/'|"/gi, "\$&").replace(/ +/gi, " ")
                                .normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim();
    console.log("\nInput: " + input);
    await fetch('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        headers: {'Content-Type':'application/json','Authorization':'Bearer '+openaikey},
        body: JSON.stringify({
                model:"gpt-3.5-turbo",
                max_tokens: 500,
                messages:[{role: "user", content: input}]
            })
    })
    .then(response => response.json())
    .then(data => {
        let reply = data.choices[0]?.message?.content || '<@225455864876761088> plz help';
        reply = reply.slice(0, 2000);
        console.log(reply);
        message.reply({
            content: reply,
            allowedMentions:{repliedUser:false}
        }).catch(()=>{return;});
    }).catch(e=>{
        console.log(e);
        message.channel.send('<@225455864876761088> plz help');
    });
}