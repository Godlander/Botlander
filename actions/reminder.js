const chrono = require('chrono-node');
const fs = require('fs').promises;

var reminders = require('../data/reminders.json');
var sent = {};

var blocked = false;

module.exports = {
    async save() {
        if (!blocked) {
            blocked = true;
            await fs.writeFile(__dirname + "/../data/reminders.json", JSON.stringify(reminders), (err) => {if (err) console.log(err)});
            blocked = false;
        }
    },
    async reset(client) {
        for (var i = 0; i < reminders.length; i++) {
            if (!sent[i]) this.remind(client, reminders[i]);
        }
        console.log(reminders.length, "reminders set");
    },
    async remind(client, rem) {
        let now = new Date();
        let timeout = Math.max(rem.time - now.getTime(), 0);
        if (timeout < 86400000) {
            sent[reminders.indexOf(rem)] = true;
            setTimeout(async () => {
                let channel, message, index;
                index = reminders.indexOf(rem)
                reminders.splice(index,1);
                delete sent[index];
                this.save();
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
                this.remind(message.client, rem);
                message.reply({
                    content: "Ok, " + message.member.displayName + ", I'll remind you <t:" + Math.floor(time.getTime() / 1000) + ":R>",
                    allowedMentions: {repliedUser:false}
                }).catch(()=>{return;});
                this.save();
                return true;
            }
        }
        return false;
    }
}