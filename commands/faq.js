const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const path = require('path');
const fs = require('fs');
const perms = require('../permissions');

function send(interaction, message, faq) {
    if (typeof faq === 'string' || faq instanceof String) {
        return interaction.reply({content:`${message}\n${faq}`});
    }
    else {
        return interaction.reply({content:`${message}`, embeds:[faq]});
    }
}

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
        const serverpath = path.join(__dirname, '../', 'data', 'faq', id);
        const globalpath = path.join(__dirname, '../', 'data', 'faq', 'global');
        let data = {};
        if (interaction.options.getSubcommand() === 'query') {
            try {
                data = Object.keys({
                    ...JSON.parse(fs.readFileSync(serverpath)),
                    ...JSON.parse(fs.readFileSync(globalpath))
                })
            } catch {o_O}
        }
        else if (interaction.options.getSubcommand() === 'remove') {
            try {
                data = Object.keys({
                    ...JSON.parse(fs.readFileSync(serverpath))
                })
            } catch {o_O}
        }
        let filtered = data.filter(e => e.startsWith(interaction.options.getFocused()));
        await interaction.respond(filtered.map(e => ({name:e, value:e})));
    },
    async execute(interaction) {
        let id = interaction.guildId;
        const serverpath = path.join(__dirname, '../', 'data', 'faq', id);
        const globalpath = path.join(__dirname, '../', 'data', 'faq', 'global');
        let data = {}
        let global = {};
        try {
            data = JSON.parse(fs.readFileSync(serverpath));
        } catch {o_O}
        try {
            global = JSON.parse(fs.readFileSync(globalpath));
        } catch {o_O}

        let faq = interaction.options.getString('faq', true);
        if (interaction.options.getSubcommand() === 'query') {
            let user = interaction.options.getUser('mention', false) ?? '';
            if (user) user = '<@'+user+'>:\n';
            if (faq in data) return send(interaction, user, data[faq]);
            else if (faq in global) return send(interaction, user, global[faq]);
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
            if (faq in data) send(interaction, `Edited faq \`${faq}\` with:`, content);
            else send(interaction, `Added faq \`${faq}\` with: ${content.text}`, content);
            data[faq] = content;
        }
        else if (interaction.options.getSubcommand() === 'remove') {
            if (!perms.has(interaction, [PermissionFlagsBits.ManageMessages])) return;
            if (faq in data) {
                delete data[faq];
                interaction.reply({content: `Removed faq ${faq}`});
            }
            else return interaction.reply({content: `No faq \`${faq}\``, ephemeral: true});
        }
        else {
            return interaction.reply({content: `No faq \`${faq}\``, ephemeral: true});
        }
        fs.writeFileSync(serverpath, JSON.stringify(data));
    }
};