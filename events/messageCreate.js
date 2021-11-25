const config = require("../config.json");

module.exports = async (client, message) => {
    if (message.author.bot) return;
    const { container } = client;

    //look for actual command with prefix
    if (message.content.indexOf(config.prefix) == 0) {
        //look for arguments
        var args = message.content.slice(config.prefix[0].length).trim().split(/ +/g);
        args[0] = args[0].toLowerCase();
        //get command
        const command = container.commands.get(args[0]);
        if (!command) {return;} //command not found
        if (message.guild && !message.member) await message.guild.members.fetch(message.author); //grab member if not already cached
        //run the command
        try {await command.run(client, message, args);}
        catch (e) {console.error(e);}
    }
    else {
        //look for botlander action call
        const regx = new RegExp(`>?(botlander|<@!?${client.user.id}>)`);
        if (regx.test(message.content)) {
            message.channel.sendTyping();
            input = message.content.replace(regx, " ");
            input = input.replace(/'|"/gi, "\$&");
            input = input.replace(/ +/gi, " ");
            input = input.normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim();
            console.log("\nInput: " + input);
            if (message.guild && !message.member) await message.guild.members.fetch(message.author); //grab member if not already cached
            //start typing
            //try actions in order defined in config
            for (const name of config.actions) {
                const action = container.actions.get(name);
                try {
                    const success = await action.run(client, message, input);
                    if (success) {return;}
                }
                catch (e) {console.error(e);}
            };
        }
    }
};