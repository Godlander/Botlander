const fetch = require('node-fetch');

exports.run = async (client, message, input) => {
    var arr = ["No comment.", "💩", "lol.", "...", "hmm.", "Hmmm.", "mhm.", "Mhm.", "yes.", "no.", "You're probably right.", "Yes?", "Sorry, I'm busy right now.", "Hold on. Let me Google it.", "Uh huh.", "Yeah sure.", "Okay.", "ok", "Sure.", "Hi."];
    fetch('https://api.affiliateplus.xyz/api/chatbot?message=' + input + '&botname=Botlander&ownername=Godlander')
        .catch(err => {console.log(err); message.channel.send(arr[Math.floor(Math.random()*arr.length)])})
        .then(response => response.json())
        .then(out => {
            if (out == undefined) {console.error("chatbot fail!"); return false;}
            out = out.message.replace(/ERROR! No message supplied./gi, arr[Math.floor(Math.random()*arr.length)])
            console.log("Chatbot: "+out);
            message.channel.send(out);
            return true;
        }).catch(e => {
            console.error("chatbot fail!");
            return false;
            message.channel.send(arr[Math.floor(Math.random()*arr.length)])
        })
};