import { Events, Interaction } from 'discord.js';
import { Commands } from '../bot'
import { errorreply } from '../lib';

export const name = Events.InteractionCreate;

export async function run (interaction : Interaction) {
    try {
        if (interaction.isChatInputCommand()) {
            const command = Commands.get(interaction.commandName);
            if (!command) throw `No slash command ${interaction.commandName} was found.`;
            await command.command(interaction);
        }
        else if (interaction.isAutocomplete()) {
            const command = Commands.get(interaction.commandName);
            if (!command) throw `No autocomplete ${interaction.commandName} was found.`;
            await command.autocomplete(interaction);
        }
        else if (interaction.isContextMenuCommand()) {
            const command = Commands.get(interaction.commandName);
            if (!command) throw `No context menu ${interaction.commandName} was found.`;
            await command.contextmenu(interaction);
        }
    }
    catch (e) {
        console.log(e);
        await errorreply(interaction, e);
    }
}