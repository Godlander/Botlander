const chrono = require('chrono-node');
const fs = require('fs').promises;

var reminders = {};
var sent = {};

var blocked = false;

module.exports = {
    async save() {
        //save to file
        if (!blocked) {
            blocked = true;
            await fs.writeFile(__dirname + "/../data/reminders.json", JSON.stringify(reminders)).catch(console.log);
            blocked = false;
        }
    },
    async reset(client) {
        //update sent reminders
        reminders = require('../data/reminders.json');
        let set = 0;
        for (const id in reminders) {
            if (!sent[id]) this.remind(client, id);
            set++;
        }
        console.log(set, "reminders set");
    },
    async remind(client, id) {
        //calculate time
        let now = new Date();
        let timeout = Math.max(reminders[id].time - now.getTime(), 0);
        //dont set timeout if more than 2 days away
        if (timeout > 86400000) return;
        //mark as sent
        sent[id] = setTimeout(async () => {
            //fetch channel and message
            let channel, message;
            try {
                channel = await client.channels.fetch(reminders[id].channel);
                message = await channel.messages.fetch(id);
            } catch {}
            //delete entry from save
            delete reminders[id];
            delete sent[id];
            this.save();
            //send reminder if message still exists
            if (message) message.reply("<@" + message.author + ">, here's your reminder.");
        }, timeout);
    },
    async cancel(message) {
        //check deleted message is a reminder
        const id = message.id;
        if (!(id in reminders)) return false;
        //delete the reminder
        clearTimeout(sent[id]);
        let channel, reply;
        try {
            channel = await message.client.channels.fetch(reminders[id].channel);
            reply = await channel.messages.fetch(reminders[id].reply);
        } catch {}
        if (reply) await reply.edit("Reminder canceled");
        delete reminders[id];
        delete sent[id];
        this.save();
        return true;
    },
    async execute(message) {
        //check for remind in message
        let input = message.content;
        if (!input.includes("remind")) return false;
        //check for time in message
        let now = new Date();
        let time = chrono.parse(input, now, {forwardDate:true, timezone:"PST"});
        if (time.length === 0) return false;
        //make sure time is not in the past
        time = time[0].start.date();
        console.log(time);
        if (time.getTime() < now.getTime()) { //time in the past
            message.reply({content: 'Cannot remind you of the past.', allowedMentions: {repliedUser:false}});
            return true;
        }
        //set reminder
        let reply = await message.reply({
            content: "Ok, " + message.member.displayName + ", I'll remind you <t:" + Math.floor(time.getTime() / 1000) + ":R>",
            allowedMentions: {repliedUser:false}
        });
        reminders[message.id] = {"channel": message.channel.id, "reply": reply.id, "time": Date.parse(time)};
        this.remind(message.client, message.id);
        this.save();
        return true;
    }
}