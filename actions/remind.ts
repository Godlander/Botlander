import * as chrono from 'chrono-node';
import { Client, Message } from 'discord.js';
import fs from 'fs/promises';

type Reminder = {
    channel: string,
    reply: string,
    time: number
}
var reminders : Record<string, Reminder> = {};
var sent : Record<string, NodeJS.Timeout> = {};

var blocked : boolean = false;

async function save() {
    //save to file
    if (!blocked) {
        blocked = true;
        await fs.writeFile(__dirname + "/../data/reminders.json", JSON.stringify(reminders)).catch(console.log);
        blocked = false;
    }
}

async function remind(client : Client, id : string) {
    //calculate time
    const now = new Date();
    const timeout = Math.max(reminders[id].time - now.getTime(), 0);
    //dont set timeout if more than 2 days away
    if (timeout > 86400000) return;
    //mark as sent
    sent[id] = setTimeout(async () => {try {
        const rem = reminders[id];
        //delete entry from save
        delete reminders[id];
        delete sent[id];
        save();

        //fetch channel and message
        const channel = await client.channels.fetch(rem.channel);
        if (channel === null || !("messages" in channel)) throw 0;
        const message = await channel.messages.fetch(id);
        //send reminder if message still exists
        if (message) message.reply("<@" + message.author + ">, here's your reminder.");
    } catch {}}, timeout);
}

export async function reset(client : Client) {
    //update sent reminders
    reminders = require('../data/reminders.json');
    let set = 0;
    for (const id in reminders) {
        if (!sent[id]) remind(client, id);
        set++;
    }
    console.log(set, "reminders set");
}

export async function ondelete(message : Message) {
    //check deleted message is a reminder
    const id = message.id;
    if (!(id in reminders)) return false;
    try {
        //delete the reminder
        const rem = reminders[id];
        clearTimeout(sent[id]);
        delete reminders[id];
        delete sent[id];
        save();

        //edit message
        const channel = await message.client.channels.fetch(rem.channel);
        if (channel === null || !("messages" in channel)) return false;
        const reply = await channel.messages.fetch(rem.reply);
        await reply.edit("Reminder canceled");
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export async function oncreate(message : Message) {
    //check for remind in message
    const input = message.content;
    if (!input.includes("remind")) return false;
    //check for time in message
    const now = new Date();
    const gettime = chrono.parse(input, now, {forwardDate:true});
    if (gettime.length === 0) return false;
    //make sure time is not in the past
    const time = gettime[0].start.date();
    console.log(time);
    if (time.getTime() < now.getTime()) { //time in the past
        message.reply({content: 'Cannot remind you of the past.', allowedMentions: {repliedUser:false}});
        return true;
    }
    //set reminder
    const reply = await message.reply({
        content: "Ok, " + message.member?.displayName + ", I'll remind you <t:" + Math.floor(time.getTime() / 1000) + ":R>",
        allowedMentions: {repliedUser:false}
    });
    reminders[message.id] = {"channel": message.channel.id, "reply": reply.id, "time": time.getTime()};
    remind(message.client, message.id);
    save();
    return true;
}