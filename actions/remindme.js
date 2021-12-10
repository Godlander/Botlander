const chrono = require('chrono-node');
const fetch = require('node-fetch');
const fs = require("fs");
const reminders = require('../reminders.json');

exports.run = async (client, message, input) => {
    //match regex for action call
    if (input.match(/remind ?me|(set|give|me).*(reminder|alarm)/i)) {
        var now = new Date();
        //try to parse out time
        var timetest = chrono.parse(input, now, {forwardDate: true});
        if (timetest.length > 0) { //success
            var time = timetest[0].start.date();
            if (time.getTime() >= now.getTime()-1000) { //if time is not in past
                //create reminder
                var rem = {"channel": message.channel.id, "message": message.id, "time": time};
                reminders.push(rem);
                message.channel.send("Ok, " + message.member.displayName + ", I'll remind you <t:" + Math.floor(time.getTime() / 1000) + ":R>");
                fs.writeFile("./reminders.json", JSON.stringify(reminders), (err) => {if (err) console.error(err)});
                exports.remind(client, rem);
            }
            else {console.log("time is in the past."); return false;}
        }
        else {console.log("no time found in message."); return false;}
    }
    else {console.log("not a remindme action."); return false;}
    return true;
};

exports.remind = async (client, rem) => {
    var now = new Date();
    client.channels.fetch(rem.channel)
        .then(ch => ch.messages.fetch(rem.message)
            .then(msg => {
                console.log("Reminder for " + msg.author.tag + " at " + rem.time);
                setTimeout(() => {
                    var j = reminders.indexOf(rem);
                    reminders.splice(j,1);
                    fs.writeFile("./reminders.json", JSON.stringify(reminders), (err) => {if (err) console.error(err)});
                    msg.reply("<@" + msg.author + ">, here's your reminder.");
                }, Date.parse(rem.time) - now.getTime())
            }).catch(console.error)
        ).catch(console.error)
}

exports.reset = async (client) => {
    for (var i = 0; i < reminders.length; i++) {
        exports.remind(client, reminders[i]);
    }
}