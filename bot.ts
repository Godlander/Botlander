import fs from 'fs';
import path from 'path';
import { Client, Collection, GatewayIntentBits, Partials, REST, Routes } from 'discord.js';
import { clientid, token } from './config.json';

export const Commands: Collection<string, any> = new Collection();

const client = new Client({
    intents: [
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

//collect events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if ('event' in event && 'run' in event) {
        if (event.event.once) {
            client.once(event.event.name, (...args) => event.run(...args));
        } else {
            client.on(event.event.name, (...args) => event.run(...args));
        }
        console.log(`event ${file} loaded`)
    } else {
        console.log(`event ${file} couldn't load`);
    }
}

//collect commands
const setcommands: NodeRequire[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('slashcommand' in command && 'run' in command) {
        Commands.set(command.slashcommand.name, command);
        setcommands.push(command.slashcommand.toJSON());
        console.log(`/${file} loaded`)
    } else {
        console.log(`/${file} couldn't load`);
    }
}

//register commands
const rest = new REST().setToken(token);
rest.put(Routes.applicationCommands(clientid), { body: setcommands })
    .then(data => console.log(`Reloaded ${(data as any).length} commands`))
    .catch(e => console.log(e))

client.login(token);