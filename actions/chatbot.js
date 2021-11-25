const fetch = require('node-fetch');

exports.run = async (client, message, input) => {
    var arr = ["No comment.", "💩", "lol.", "...", "hmm.", "Hmmm.", "mhm.", "Mhm.", "yes.", "no.", "You're probably right.", "Yes?", "Sorry, I'm busy right now.", "Hold on. Let me Google it.", "Uh huh.", "Yeah sure.", "Okay.", "ok", "Sure.", "Hi."];
    var generic = arr[Math.floor(Math.random()*arr.length)];

    fetch('https://api.affiliateplus.xyz/api/chatbot?message=' + input + '&botname=Botlander&ownername=Godlander')
        .catch(err => {console.log(err); message.channel.send(generic)})
        .then(response => response.json())
        .then(out => {
            if (out == undefined) {throw new Error;}
            out = out.message.replace(/ERROR! No message supplied./gi, generic);
            console.log("Chatbot: "+ out);
            message.channel.send(out);
        }).catch(e => {
            console.error("chatbot fail!");
            message.channel.send(generic);
            return false;
        })
    return true;
};