import * as chrono from 'chrono-node';
import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const slashcommand = new SlashCommandBuilder()
.setName('time')
.setDescription('Converts time to discord timestamp format')
.addStringOption(option =>
    option.setName('time')
    .setDescription('Time in natural language')
    .setAutocomplete(true)
    .setRequired(true))
.addStringOption(option =>
    option.setName('format')
    .setDescription('Display format')
    .setRequired(false)
    .addChoices(
        {name: 'Relative (default)', value: 'R'},
        {name: 'Time Only', value: 'T'},
        {name: 'Date Only', value: 'D'},
        {name: 'Full', value: 'F'},
        {name: 'None', value: 'N'}
    ));

export function gettime(input : string, forward : boolean = true) {
    const gettime = chrono.parse(input, new Date(), {forwardDate:forward});
    if (gettime.length === 0) return;
    return gettime[0].start.date().getTime();
}

export function gettimestamp(input : string | number, forward : boolean = true) {
    let time : number | undefined;
    if (typeof input === 'string') time = gettime(input, forward);
    else time = input;
    if (!time) return;
    return Math.floor(time / 1000);
}

export async function autocomplete(interaction : AutocompleteInteraction) {
    const input = interaction.options.getString('time', true);
    const format = interaction.options.getString('format', false) ?? 'R';
    //get timestamp
    const timestamp = gettimestamp(input);
    //no time found
    if (!timestamp) {
        interaction.respond([]);
        return;
    }
    interaction.respond([{name:`<t:${timestamp}:${format}>`,value:`<t:${timestamp}:${format}>`}])
}

export async function command(interaction : ChatInputCommandInteraction) {
    const input = interaction.options.getString('time', true);
    const format = interaction.options.getString('format', false) ?? 'R';
    //if already timestamp just spit it back
    const reg = input.match(/<t:\d+:[TDFR]>/gi);
    if (reg) {
        interaction.reply(`${reg[0]} \`${reg[0]}\``);
        return;
    }
    //get timestamp
    const timestamp = gettimestamp(input);
    let out = `<t:${timestamp}:${format}> \`<t:${timestamp}:${format}>\``;
    //if no formatting just get the number
    if (format === 'N') out = ''+timestamp;
    interaction.reply(out);
}