exports.run = async (client, message, args) => {
    const { container } = client;
    //grab list of commands of help value -1
    const commands = container.commands.filter(cmd => cmd.data.help == -1);
    var msg = "```Botlander's Secret Commands:``````md\n";
    commands.forEach(command => {msg += command.data.text + "\n";});
    message.channel.send(msg + "``````()=optional, <>=required```");
};

exports.data = {
    help: -1,
    name: "hepl",
    text: "[>hepl][displays this message]"
};