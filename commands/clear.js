const from = require('../permissions.js');

exports.run = async (client, message, args) => {
    if (!from.mod(message)) {message.react('💩'); return;}
    let n = parseInt(args[1], 10);
    if (!n || n < 1 || n > 99) {message.react('⚠️'); return;} //if invalid number
    message.channel.bulkDelete(n+1).catch(O_o=>{});
};

exports.data = {
    help: 1,
    name: "clear",
    text: "[>clear <#>][deletes # number of messages from current channel]"
};