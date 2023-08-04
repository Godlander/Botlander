const chrono = require('chrono-node');
const fs = require('fs');

var reminders = require('../data/reminders.json');
var sent = {};

module.exports = {
    async reset(client) {
        for (var i = 0; i < reminders.length; i++) {
            if (!sent[i]) this.remind(client, i);
        }
        console.log(reminders.length, "reminders set");
    },
    async remind(client, index) {
        let rem = reminders[index];
        sent[index] = true;
        let now = new Date();
        let timeout = Math.max(rem.time - now.getTime(), 0);
        if (timeout < 86400000) {
            setTimeout(async () => {
                let channel, message;
                reminders.splice(index, 1);
                delete sent[i];
                fs.writeFileSync(__dirname + "/../data/reminders.json", JSON.stringify(reminders), (err) => {if (err) console.log(err)});
                try {
                    channel = await client.channels.fetch(rem.channel)
                    message = await channel.messages.fetch(rem.message)
                }
                catch {return;}
                message.reply("<@" + message.author + ">, here's your reminder.");
            }, timeout)
        }
    },
    async execute(message) {
        let input = message.content;
        if (input.includes("remind")) {
            let now = new Date();
            let time = chrono.parse(input, now, {forwardDate:true, timezone:"PST"});
            if (time.length > 0) {
                time = time[0].start.date();
                console.log(time);
                if (time.getTime() < now.getTime()) { //time in the past
                    channel.send('Cannot remind you of the past.');
                    return true;
                }
                let rem = {"channel": message.channel.id, "message": message.id, "time": Date.parse(time)};
                reminders.push(rem);
                this.remind(message.client, reminders.length - 1);
                channel.send("Ok, " + message.member.displayName + ", I'll remind you <t:" + Math.floor(time.getTime() / 1000) + ":R>");
                fs.writeFileSync(__dirname + "/../data/reminders.json", JSON.stringify(reminders), (err) => {if (err) console.error(err)});
                return true;
            }
        }
        return false;
    }
}