exports.run = async (client, message, args) => {
    var link = "<https://www.google.com/"
    if (args.length > 1) {
        link += "?q=" + args.slice(1).join("%20");
        message.channel.send(link + ">");
    }
    else {
        message.react('❓');
    }
};

exports.data = {
    help: 0,
    name: "lmgtfy",
    text: "[>lmgtfy][lets Botlander google it for you]"
};