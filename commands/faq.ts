import { SlashCommandBuilder, PermissionFlagsBits, AutocompleteInteraction, ChatInputCommandInteraction, APIEmbed, PermissionsBitField } from 'discord.js';
import path from 'path';
import fs from 'fs';
import perms from '../permissions';

export const slashcommand = new SlashCommandBuilder()
.setName('faq')
.setDescription('Shows a faq.')
.addSubcommand(subcommand => subcommand
    .setName('query')
    .setDescription('Show an faq')
    .addStringOption(option => option
        .setName('faq')
        .setDescription('Faq to show')
        .setAutocomplete(true)
        .setRequired(true))
    .addUserOption(option => option
        .setName('mention')
        .setDescription('Mentions a user in the response'))
    .addBooleanOption(option => option
        .setName('raw')
        .setDescription('Sends the raw json if faq is an embed')))
.addSubcommand(subcommand => subcommand
    .setName('add')
    .setDescription('Add or edit a faq')
    .addStringOption(option => option
        .setName('faq')
        .setDescription('Faq to add or edit')
        .setRequired(true))
    .addStringOption(option => option
        .setName('content')
        .setDescription('New content for the faq')
        .setRequired(true)))
.addSubcommand(subcommand => subcommand
    .setName('remove')
    .setDescription('Remove an faq')
    .addStringOption(option => option
        .setName('faq')
        .setDescription('Faq to remove')
        .setAutocomplete(true)
        .setRequired(true)))
.setDMPermission(false)

type Faq = string | APIEmbed;
type FaqList = Record<string, Faq>; // Index is the faq key
type FaqCache = Record<string, FaqList>; // Index is the server ID

export class FAQS {
    global : FaqList = require('../data/faq/global.json');
    local : FaqCache = {};
    //return data from cache or cache from file
    cache(id: string, global : boolean = false) : FaqList {
        //if global search include global faqs
        let data : FaqList = global? this.global : {};
        //cache local faq
        if (!(id in this.local)) {
            try {this.local[id] = require(`../data/faq/${id}.json`);}
            catch {this.local[id] = {};}
        }
        //return data
        return {...data, ...this.local[id]};
    }
    //search for faqs for autocomplete
    search(id : string, name : string, global : boolean = false) : string[] {
        const data = this.cache(id, global);
        //filter and return results
        return Object.keys(data).filter(e => e.includes(name));
    }
    //get one faq
    get(id : string, name : string) : Faq | undefined {
        const data = this.cache(id, true);
        //if faq doesn't exist
        if (!(name in data)) return;
        //return if exists
        return data[name];
    }
    //add faq
    add(id : string, name : string, content : Faq) : boolean {
        const data = this.cache(id);
        const edit = name in data;
        this.local[id][name] = content;
        return edit;
    }
    //remove faq
    remove(id : string, name : string) : boolean {
        const data = this.cache(id);
        if (!(name in data)) return false;
        delete this.local[id][name];
        return true;
    }
}
const FAQ = new FAQS();

async function send(interaction : ChatInputCommandInteraction, message : string, faq : Faq) {
    try {
        if (typeof faq === 'string') { //try sending embed if not string
            await interaction.reply({content:`${message}\n${faq}`});
        }
        else {
            const raw = interaction.options.getBoolean('raw', false);
            if (raw) await interaction.reply({content:`${message}\n\`${JSON.stringify(faq)}\``});
            else await interaction.reply({content:`${message}`, embeds:[faq]});
        }
    }
    //catch sending errors
    catch (error : any) {
        if ('rawError' in error) error = error.rawError;
        interaction.reply({content:JSON.stringify(error).substring(0,1999), ephemeral:true});
    }
}

export async function autocomplete(interaction : AutocompleteInteraction) {
    const input = interaction.options.getString('faq', true);
    const subcommand = interaction.options.getSubcommand()
    const id = interaction.guildId ?? undefined;
    if (!id) return;
    let list : string[] = [];
    switch (subcommand) {
        case 'query':  list = FAQ.search(id, input, true ); break;
        case 'remove': list = FAQ.search(id, input, false); break;
    }
    await interaction.respond(list.map(e => ({name:e, value:e})));
}

export async function run(interaction : ChatInputCommandInteraction) {
    const id = interaction.guildId ?? undefined;
    if (!id) return;
    const tag = interaction.options.getString('faq', true);
    if (interaction.options.getSubcommand() === 'query') {
        const user = interaction.options.getUser('mention', false);
        const mention = user? `${user}:` : '';
        const faq = FAQ.get(id, tag);
        if (!faq) return;
        send(interaction, mention, faq);
    }
    else if (interaction.options.getSubcommand() === 'add') {
        if (!perms.has(interaction, new PermissionsBitField([PermissionFlagsBits.ManageMessages]))) return;
        const input = interaction.options.getString('content', true)

        let content : Faq;
        try {content = JSON.parse(input);}
        catch {content = input.replaceAll('\\n','\n');}

        if (FAQ.add(id, tag, content)) send(interaction, `Edited faq \`${tag}\` with:`, content);
        else send(interaction, `Added faq \`${tag}\` with:`, content);
        fs.writeFileSync(path.join(__dirname,'../','data','faq',id+'.json'), JSON.stringify(FAQ.local[id]));
    }
    else if (interaction.options.getSubcommand() === 'remove') {
        if (!perms.has(interaction, new PermissionsBitField([PermissionFlagsBits.ManageMessages]))) return;
        if (FAQ.remove(id, tag)) interaction.reply({content: `Removed faq \`${tag}\``});
        else interaction.reply({content: `No faq \`${tag}\``, ephemeral: true});
        fs.writeFileSync(path.join(__dirname,'../','data','faq',id+'.json'), JSON.stringify(FAQ.local[id]));
    }
}