import fs from 'fs';
import path from 'path';
import { Client, Collection, GatewayIntentBits, Partials, REST, Routes } from 'discord.js';
import { clientid, token } from './config.json';

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

//collect actions
export const CreateActions: any[] = [];
export const DeleteActions: any[] = [];
const actionPath = path.join(__dirname, 'actions');
const actionFiles = fs.readdirSync(actionPath).filter(file => file.endsWith('.ts'));
for (const file of actionFiles) {
    const filePath = path.join(actionPath, file);
    const { oncreate, ondelete } = require(filePath);
    if (oncreate) {
        CreateActions.push(oncreate);
        console.log(`oncreate ${file} loaded`);
    }
    if (ondelete) {
        DeleteActions.push(ondelete);
        console.log(`ondelete ${file} loaded`);
    }
}

//collect events
const eventPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.ts'));
for (const file of eventFiles) {
    const filePath = path.join(eventPath, file);
    const event = require(filePath);
    if ('run' in event) {
        if (event.once) {
            client.once(file, (...args) => event.run(...args));
        } else {
            client.on(file, (...args) => event.run(...args));
        }
        console.log(`event ${file} loaded`)
    } else {
        console.log(`event ${file} couldn't load`);
    }
}

//collect commands
export const Commands: Collection<string, any> = new Collection();
const setcommands: any[] = [];
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