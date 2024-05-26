import { Message } from "discord.js";
import { openaikey } from '../config.json';
import { isbotlander } from "../permissions";
import whitelist from '../data/chat/whitelist.json';

var defaults = ["<@225455864876761088> plz help", "No comment.", "💩", "lol.", "...", "hmm.", "Hmmm.", "mhm.", "Mhm.", "yes.", "no.", "You're probably right.", "Yes?", "Sorry, I'm busy right now.", "Don't you have something better to do?", "Uh huh.", "Yeah sure.", "Okay.", "ok", "Sure.", "Hi.", "Go bother someone else.", "Glad to hear that.\nor sorry that happened."];

export async function chat(input : string, vision = false) : Promise<string> {
    let reply;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        headers: {'Content-Type':'application/json','Authorization':'Bearer '+openaikey},
        body: JSON.stringify({
                model: "gpt-4o",
                max_tokens: 400,
                messages:[{role: "user", content: input}]
            })
    });
    const data = await res.json();
    reply = data.choices;
    if (reply) return reply[0].message.content;
    else throw data;
}

export default async function (message : Message) {
    if (!(whitelist.guilds.includes(message.guildId ?? '0') || whitelist.users.includes(message.author.id))) return;
    const text = message.content.replace(isbotlander, " ").replace(/'|"/gi, "\$&").replace(/ +/gi, " ")
                                .normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim();
    let content : any = [{type: "text", text: text}];
    const vision = message.content.includes('👀');
    if (vision) {
        message.content.replace('👀','');
        if (message.attachments.size > 0) { //if image attachment
            const img = message.attachments.find(a => a?.contentType?.startsWith("image"));
            if (img != null) {
                content.push({type: "image_url", image_url: {url: img.url+'width=512&height=512'}});
            }
        }
    }
    let origin = message.author.username + " In: ";
    if (message.channel.isDMBased()) origin += "dm";
    else origin += message.guild?.name + " " + message.guild?.id;
    console.log("\nFrom: " + origin + "\nInput: " + ", Vision: " + vision);

    let reply;
    try {
        let reply = await chat(content, vision);
        if (reply.trim().length < 1) throw "empty message";
        reply = reply.substring(0, 1999);
        message.reply({
            content: reply,
            allowedMentions:{repliedUser:false}
        });
        console.log("Output: " + reply);
    }
    catch (e) {
        console.log(e);
        //reply = defaults[Math.floor(Math.random()*defaults.length)]
        message.channel.send('<@225455864876761088> plz help');
    }
}