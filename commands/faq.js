const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const path = require('path');
const fs = require('fs');
const perms = require('../permissions');

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
                .setRequired(true)))
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
                .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages))
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Remove an faq')
            .addStringOption(option => option
                .setName('faq')
                .setDescription('faq')
                .setAutocomplete(true)
                .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages))
        .setDMPermission(false),
    async autocomplete(interaction) {
        let id = interaction.guildId;
        const serverpath = path.join(__dirname, '../', 'data', 'faq', id);
        const globalpath = path.join(__dirname, '../', 'data', 'faq', 'global');
        let data;
        if (interaction.options.getSubcommand() === 'query') {
            try {
                data = Object.keys({
                    ...JSON.parse(fs.readFileSync(serverpath)),
                    ...JSON.parse(fs.readFileSync(globalpath))
                })
            } catch {await interaction.respond([]); return;}
        }
        else if (interaction.options.getSubcommand() === 'remove') {
            try {
                data = Object.keys({
                    ...JSON.parse(fs.readFileSync(serverpath))
                })
            } catch {await interaction.respond([]); return;}
        }
        let filtered = data.filter(e => e.startsWith(interaction.options.getFocused()));
        await interaction.respond(filtered.map(e => ({name:e, value:e})));
    },
    async execute(interaction) {
        let id = interaction.guildId;
        const serverpath = path.join(__dirname, '../', 'data', 'faq', id);
        const globalpath = path.join(__dirname, '../', 'data', 'faq', 'global');
        let data, global;
        try {
            data = JSON.parse(fs.readFileSync(serverpath));
        } catch {data = {}}
        try {
            global = JSON.parse(fs.readFileSync(globalpath));
        } catch {global = {}}

        let faq = interaction.options.getString('faq', true);
        if (interaction.options.getSubcommand() === 'add') {
            if (!perms.has(interaction, [PermissionFlagsBits.ManageMessages])) return;
            let content = interaction.options.getString('content', true);
            if (faq in data) interaction.reply({content: `Edited faq \`${faq}\` with: ${content}`});
            else interaction.reply({content: `Added faq \`${faq}\` with: ${content}`});
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
        else if (interaction.options.getSubcommand() === 'query') {
            if (faq in data) return interaction.reply(data[faq]);
            else if (faq in global) return interaction.reply(global[faq]);
        }
        else {
            return interaction.reply({content: `No faq \`${faq}\``, ephemeral: true});
        }
        fs.writeFileSync(serverpath, JSON.stringify(data));
    }
};