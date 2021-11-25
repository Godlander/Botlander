const { Client, Collection } = require("discord.js");
const fs = require("fs");
const config = require("./config.json");
const intents = config.intents;
const client = new Client({intents});
const commands = new Collection();
const actions = new Collection();
client.container = {
    commands,
    actions
};

const init = async () => {
    //load commands
    const commands = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
    for (const file of commands) {
        const command = require(`./commands/${file}`);
        console.log("command: " + command.data.name);
        client.container.commands.set(command.data.name, command);
    }
    console.log("");
    var rewrite = false;
    //load botlander actions
    const actions = fs.readdirSync("./actions/").filter(file => file.endsWith(".js"));
    for (const file of actions) {
        const name = file.split(".")[0];
        const action = require(`./actions/${file}`);
        console.log("action: " + name);
        client.container.actions.set(name, action);
        if (!config.actions.includes(name)) {
            console.log("add new action: " + name);
            config.actions.push(name);
            rewrite = true;
        }
    }
    //clean deleted actions
    for (const name in config.actions) {
        const act = client.container.actions.get(config.actions[name]);
        if (!act) {
            rewrite = true;
            config.actions.splice(name);
            console.log("removed action: " + config.actions[name]);
        }
    }
    if (rewrite) fs.writeFile("./config.json", JSON.stringify(config, null, 4),(err) => {if (err) console.error(err)});
    console.log("");
    //load events
    const eventFiles = fs.readdirSync("./events/").filter(file => file.endsWith(".js"));
    for (const file of eventFiles) {
        const name = file.split(".")[0];
        console.log("event: " + name);
        const event = require(`./events/${file}`);
        client.on(name, event.bind(null, client));
    }

    client.login(config.token);
};
init();