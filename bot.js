const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, GatewayIntentBits, Partials, REST, Routes} = require('discord.js');
const {clientid, token} = require('./config.json');

const client = new Client({
intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
],
partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
]
});

//collect commands
const commands = [];
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`/${file} loaded`)
    } else {
        console.log(`/${file} couldn't load`);
    }
}
//collect events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        console.log(event.name);
        client.once(event.name,(...args) => event.execute(...args));
    } else {
        client.on(event.name,(...args) => event.execute(...args));
    }
}

const rest = new REST().setToken(token);

(async () => {
    rest.put(Routes.applicationCommands(clientid), {body:commands})
    .then(data => console.log(`Reloaded ${data.length} commands`))
    .catch(e => console.log(e))
})();

client.login(token);