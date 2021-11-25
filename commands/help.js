exports.run = async (client, message, args) => {
    const { container } = client;
    //grab list of commands of help value 0
    const commands = container.commands.filter(cmd => cmd.data.help == 0);
    var msg = "```Botlander's Commands:``````md\n";
    commands.forEach(command => {msg += command.data.text + "\n";});
    message.channel.send(msg + "``````()=optional, <>=required```");
};

exports.data = {
    help: 0,
    name: "help",
    text: "[>help][displays this message]"
};