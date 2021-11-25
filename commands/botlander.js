const config = require("../config.json");

exports.run = async (client, message, args) => {
    const { container } = client;
    const regx = new RegExp(`>?(botlander|<@!?${client.user.id}>)`);
    input = message.content.replace(regx, " ");
    input = input.replace(args[1], "");
    input = input.replace(/'|"/gi, "\$&");
    input = input.replace(/ +/gi, " ");
    input = input.normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim();
    if (message.guild && !message.member) await message.guild.members.fetch(message.author); //grab member if not already cached
    //try action
    const action = container.actions.get(args[1]);
    console.log("\ninvoking " + args[1] + ": " + input);
    if (action) {
        try {
            const success = await action.run(client, message, input);
            if (success) {return;}
        }
        catch (e) {console.error(e);}
    } else {message.react('❓');}
};

exports.data = {
    help: -1,
    name: "botlander",
    text: "[>botlander <action> <message>][invokes a Botlander action on message]"
};