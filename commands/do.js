const from = require('../permissions.js');

exports.run = async (client, message, args) => {
    if (!from.owner(message)) {message.react('💩'); return;}
    if (args.length < 2 || args[1] === "nothing") {
        message.react('💭');
        client.user.setActivity('');
    } else if (args[1] === "playing" || args[1] === "play") {
        message.react('🎮');
        client.user.setActivity(args.slice(2).join(' '), {type:'PLAYING'});
    } else if (args[1] === "watching" || args[1] === "watch") {
        message.react('📺');
        client.user.setActivity(args.slice(2).join(' '), {type:'WATCHING'});
    } else if (args[1] === "listening" || args[1] === "listen") {
        if (args[2] === "to") {args.splice(2,1);}
        message.react('🎧');
        client.user.setActivity(args.slice(2).join(' '), {type:'LISTENING'});
    } else if (args[1] === "streaming" || args[1] === "stream") {
        message.react('📹');
        client.user.setActivity(args.slice(2).join(' '), {type:"STREAMING",url: "https://www.twitch.tv/godlander"});
    } else if (args[1] === "competing" || args[1] === "compete") {
        if (args[2] === "in") {args.splice(2,1);}
        message.react('💪');
        client.user.setActivity(args.slice(2).join(' '), {type:"COMPETING"});
    }
};

exports.data = {
    help: 9000,
    name: "do",
    text: "[>do <playing|watching|listening|streaming|competing> (status)][sets Botlander's current activity status]"
};