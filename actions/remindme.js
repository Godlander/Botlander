const chrono = require('chrono-node');
const fetch = require('node-fetch');
const fs = require("fs");
const data = require('../data.json');

exports.run = async (client, message, input) => {
    if (input.match(/remind ?me|(set|give|me).*(reminder|alarm)/i)) {
        var now = new Date();
        var timetest = chrono.parse(input, now, {forwardDate: true});
        if (timetest.length > 0) {
            console.log("Detected time: " + timetest[0].text);
            var time = timetest[0].start.date();
            if (time.getTime() >= now.getTime()-1000) {
                var rem = {"channel": message.channel.id, "message": message.id, "time": time};
                data['remind'].push(rem);
                message.channel.send("Ok, " + message.member.displayName + ", I'll remind you <t:" + Math.floor(time.getTime() / 1000) + ":R>");
                console.log("Reminder set for " + message.author.tag + " at " + time.toString());
                fs.writeFile("./data.json", JSON.stringify(data), (err) => {if (err) console.error(err)});
                exports.remind(client, rem);
                return true;
            } else {console.log("time is in the past."); return false;}
        } else {console.log("no time found in message."); return false;}
    } else {console.log("not a remindme action."); return false;}
};

exports.remind = async (client, rem) => {
    var now = new Date();
    client.channels.fetch(rem.channel)
        .then(ch => ch.messages.fetch(rem.message)
            .then(msg => {
                setTimeout(() => {
                    var j = data.remind.indexOf(rem);
                    data.remind.splice(j,1);
                    fs.writeFile("./data.json", JSON.stringify(data), (err) => {if (err) console.error(err)});
                    msg.reply("<@" + msg.author + ">, here's your reminder.");
                }, Date.parse(rem.time) - now.getTime())
            }).catch(console.error)
        ).catch(console.error)
}

exports.reset = async (client) => {
    for (var i = 0; i < data.remind.length; i++) {
        exports.remind(client, data.remind[i]);
    }
}