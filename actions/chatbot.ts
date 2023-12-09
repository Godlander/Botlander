import { Message } from "discord.js";
import { clientid, openaikey } from '../config.json';
import whitelist from '../data/chat/whitelist.json';

const regx = new RegExp(`(botlander|<@!?${clientid}>)`, 'i');
var defaults = ["No comment.", "💩", "lol.", "...", "hmm.", "Hmmm.", "mhm.", "Mhm.", "yes.", "no.", "You're probably right.", "Yes?", "Sorry, I'm busy right now.", "Don't you have something better to do?", "Uh huh.", "Yeah sure.", "Okay.", "ok", "Sure.", "Hi.", "Go bother someone else.", "Glad to hear that.\nor sorry that happened."];

export default async function (message : Message) {
    if (!(whitelist.guilds.includes(message.guildId ?? '0') || whitelist.users.includes(message.author.id))) return;
    const four = message.content.includes('👀');
    const text = message.content.replace(regx, " ").replace(/'|"/gi, "\$&").replace(/ +/gi, " ")
                                .normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim();
    let content : any = [{type: "text", text: text}];
    let vision = false;
    if (four && message.attachments.size > 0) {
        const img = message.attachments.find(a => a?.contentType?.startsWith("image"));
        if (img != null && (img.height || 0) < 1024 && (img.width || 0) < 1024) {
            content.push({type: "image_url", image_url: img.url});
            vision = true;
        }
    }
    if (four) console.log("\nInput: " + text + "\nFour: " + four + ", Vision: " + vision);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        headers: {'Content-Type':'application/json','Authorization':'Bearer '+openaikey},
        body: JSON.stringify({
                model: four? (vision? "gpt-4-vision-preview":"gpt-4-1106-preview"):"gpt-3.5-turbo",
                max_tokens: 500,
                messages:[{role: "user", content: content}]
            })
    });
    const data = await res.json();
        let reply;
        try {
            reply = data.choices[0].message.content.slice(0, 2000);
            if (reply.trim().length < 1) reply = defaults[Math.floor(Math.random()*defaults.length)];
            message.reply({
                content: reply,
                allowedMentions:{repliedUser:false}
            });
            console.log(reply);
        }
        catch (e) {
            console.log(e);
            message.channel.send('<@225455864876761088> plz help');
        }
}