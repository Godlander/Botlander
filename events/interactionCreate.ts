import { Events, Interaction } from 'discord.js';
import { Commands } from '../bot'

export const event = {
    name: Events.InteractionCreate
}

export async function run(interaction : Interaction) {
    if (interaction.isChatInputCommand()) {
        const command = Commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.run(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    }
    else if (interaction.isAutocomplete()) {
        const command = Commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
    }
}