const from = require('../permissions.js');

exports.run = async (client, message, args) => {
    if (!from.owner(message)) {message.react('💩'); return;}
    await message.channel.send("*Going to sleep...*");
    client.destroy();
    process.exit(0);
};

exports.data = {
    help: 9999,
    name: "stop",
    text: "[>stop][stops Botlander]"
};