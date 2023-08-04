const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const path = require('path');
const fs = require('fs').promises;
const perms = require('../permissions');

var global = require("../data/faq/global.json");
var local = {};

function send(interaction, message, faq) {
    if (typeof faq === 'string' || faq instanceof String) {
        faq = faq.substring(0, 1999);
        return interaction.reply({content:`${message}\n${faq}`});
    }
    else {
        return interaction.reply({content:`${message}`, embeds:[faq]});
    }
}

var blocked = false;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('faq')
        .setDescription('Shows a faq.')
        .addSubcommand(subcommand => subcommand
            .setName('query')
            .setDescription('show an faq')
            .addStringOption(option => option
                .setName('faq')
                .setDescription('faq')
                .setAutocomplete(true)
                .setRequired(true))
            .addUserOption(option => option
                .setName('mention')
                .setDescription('Mentions a user in the response')))
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Add or edit a faq')
            .addStringOption(option => option
                .setName('faq')
                .setDescription('faq')
                .setRequired(true))
            .addStringOption(option => option
                .setName('content')
                .setDescription('content')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Remove an faq')
            .addStringOption(option => option
                .setName('faq')
                .setDescription('faq')
                .setAutocomplete(true)
                .setRequired(true)))
        .setDMPermission(false),

    async autocomplete(interaction) {
        let id = interaction.guildId;
        let data = {};
        if (!local[id]) {
            try {local[id] = require("../data/faq/" + id + ".json");}
            catch {local[id] = {};}
        }
        if (interaction.options.getSubcommand() === 'query') {
            data = {...global, ...local[id]};
        }
        else if (interaction.options.getSubcommand() === 'remove') {
            data = local[id];
        }
        let filtered = Object.keys(data).filter(e => e.startsWith(interaction.options.getFocused()));
        await interaction.respond(filtered.map(e => ({name:e, value:e})));
    },

    async execute(interaction) {
        let id = interaction.guildId;
        if (!local[id]) {
            try {local[id] = require("../data/faq/" + id + ".json");}
            catch {local[id] = {};}
        }

        let faq = interaction.options.getString('faq', true);
        if (interaction.options.getSubcommand() === 'query') {
            let user = interaction.options.getUser('mention', false) ?? '';
            if (user) user = '<@'+user+'>:\n';
            if (faq in local[id]) return send(interaction, user, local[id][faq]).catch(e=>interaction.reply({content:JSON.stringify(e), ephemeral:true}));
            else if (faq in global) return send(interaction, user, global[faq]).catch(e=>interaction.reply({content:JSON.stringify(e), ephemeral:true}));
        }
        if (interaction.options.getSubcommand() === 'add') {
            if (!perms.has(interaction, [PermissionFlagsBits.ManageMessages])) return;
            let content = interaction.options.getString('content', true)
            if (content.startsWith('{')) {
                try {
                    content = JSON.parse(content);
                    if (!(typeof content.description === 'string' || content.description instanceof String)) throw(0);
                } catch {return interaction.reply({content:"Invalid embed.", ephemeral:true});}
            }
            else {
                content = content.replaceAll('\\n', '\n');
            }
            if (faq in local[id]) send(interaction, `Edited faq \`${faq}\` with:`, content);
            else send(interaction, `Added faq \`${faq}\` with:`, content);
            local[id][faq] = content;
        }
        else if (interaction.options.getSubcommand() === 'remove') {
            if (!perms.has(interaction, [PermissionFlagsBits.ManageMessages])) return;
            if (faq in local[id]) {
                delete local[id][faq];
                interaction.reply({content: `Removed faq \`${faq}\``});
            }
            else return interaction.reply({content: `No faq \`${faq}\``, ephemeral: true});
        }
        else {
            return interaction.reply({content: `No faq \`${faq}\``, ephemeral: true});
        }
        if (!blocked) {
            blocked = true;
            await fs.writeFile(path.join(__dirname,'../','data','faq',id+'.json'), JSON.stringify(local[id]));
            blocked = false;
        }
    }
};