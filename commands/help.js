exports.run = async (client, message, args) => {
    const { container } = client;
    const commands = container.commands.filter(cmd => cmd.data.help == 0);
    var msg = "```Botlander's Commands``````md\n";
    commands.forEach(command => {
        if (command.data.help == 0) {
            msg += command.data.text + "\n";
        }
    })
    message.channel.send(msg + "``````()=optional, <>=required```");
};

exports.data = {
    help: 0,
    name: "help",
    text: "[>help][displays this message]"
};