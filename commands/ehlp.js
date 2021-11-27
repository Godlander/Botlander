const from = require('../permissions.js');

exports.run = async (client, message, args) => {
    if (!from.owner(message)) {message.react('💩'); return;}
    const { container } = client;
    //grab list of commands of help value 9999
    const commands = container.commands.filter(cmd => cmd.data.help == 9999);
    var msg = "```Botlander's Owner Commands:``````md\n";
    commands.forEach(command => {msg += command.data.text + "\n";});
    message.channel.send(msg + "``````()=optional, <>=required```");
};

exports.data = {
    help: 9999,
    name: "ehlp",
    text: "[>ehlp][displays this message]"
};