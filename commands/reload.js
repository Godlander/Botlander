const from = require('../permissions.js');
const config = require('../config.json');
const fs = require("fs");

exports.run = async (client, message, args) => {
    if (!from.owner(message)) {message.react('💩'); return;}
    console.log("");
    //reloading one command
    if (args.length == 2) {
        if (args[1] == "actions") {exports.actions(client, message, args);}
        else if (args[1] == "events") {exports.events(client, message, args);}
        else {
            const name = args[1];
            try {delete require.cache[require.resolve(`./${name}.js`)];}
            catch {
                message.react('⚠');
                console.log("no command named " + name);
                client.container.commands.delete(name);
                return;
            }
            console.log("reloading " + name);
            client.container.commands.delete(name);
            const props = require(`./${name}.js`);
            client.container.commands.set(name, props);
        }
    }
    else {
        exports.commands(client, message, args);
        exports.actions(client, message, args);
    }
    message.react('🔄');
};

exports.commands = async (client, message, args) => {
    const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
    for (const file of commands) {
        const name = file.split(".")[0];
        try {delete require.cache[require.resolve(`./${name}.js`)];}
        catch {
            message.react('⚠');
            console.log("failed reloading " + name);
            return;
        }
        console.log("reloading " + name);
        client.container.commands.delete(name);
        const props = require(`./${name}.js`);
        client.container.commands.set(name, props);
    }
}

exports.actions = async (client, message, args) => {
    var rewrite = false;
    //load botlander actions
    const actions = fs.readdirSync("./actions/").filter(file => file.endsWith(".js"));
    for (const file of actions) {
        const name = file.split(".")[0];
        try {delete require.cache[require.resolve(`../actions/${name}.js`)];}
        catch {
            message.react('⚠');
            console.log("failed reloading " + name);
            return;
        }
        console.log("reloading " + name);
        client.container.actions.delete(name);
        const props = require(`../actions/${name}.js`);
        client.container.actions.set(name, props);
        //new action found
        if (!config.actions.includes(name)) {
            console.log("add new action: " + name);
            config.actions.push(name);
            rewrite = true;
        }
    }
    //clean deleted actions
    for (const i in config.actions) {
        const act = client.container.actions.get(config.actions[i]);
        if (!act) {
            rewrite = true;
            config.actions.splice(i);
            console.log("removed action: " + config.actions[i]);
        }
    }
    if (rewrite) fs.writeFile("../config.json", JSON.stringify(config, null, 4), (err) => {if (err) console.error(err)});
}

exports.data = {
    help: 9999,
    name: "reload",
    text: "[>reload][reloads Botlander's commands]"
};