exports.run = async (client, message, args) => {
    var link = "<https://www.google.com/"
    if (args.length > 2) {
        link += "?q=" + args.slice(1).join("%20");
    }
    else {
        message.react('❓');
    }
    message.channel.send(link + ">");
};

exports.data = {
    help: 0,
    name: "lmgtfy",
    text: "[>lmgtfy][lets Botlander google it for you]"
};