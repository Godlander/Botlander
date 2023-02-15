const fetch = require('node-fetch');

exports.run = async (client, message, input) => {
    var arr = ["No comment.", "💩", "lol.", "...", "hmm.", "Hmmm.", "mhm.", "Mhm.", "yes.", "no.", "You're probably right.", "Yes?", "Sorry, I'm busy right now.", "Hold on. Let me Google it.", "Uh huh.", "Yeah sure.", "Okay.", "ok", "Sure.", "Hi."];
    var generic = arr[Math.floor(Math.random()*arr.length)];
    if (input.length < 1 || input.length > 2000) {
        message.channel.send(generic);
        return false;
    }

    //broken

    return true;
};