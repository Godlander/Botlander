import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import path from 'path';
import fs from 'fs/promises';
import { IGOOD } from '../go/good';

var data : Record<string, IGOOD> = {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('go')
        .setDescription('shows optimizer data')
        .addSubcommand(subcommand => subcommand
            .setName('team')
            .setDescription('show team info')
            .addStringOption(option => option
                .setName('char')
                .setDescription('the character to show with team')
                .setRequired(true))
            .addUserOption(option => option
                .setName('user')
                .setDescription('user')))
        .addSubcommand(subcommand => subcommand
            .setName('char')
            .setDescription('show char info')
            .addStringOption(option => option
                .setName('char')
                .setDescription('the character to show')
                .setRequired(true))
            .addUserOption(option => option
                .setName('user')
                .setDescription('user')))
        .addSubcommand(subcommand => subcommand
            .setName('artifact')
            .setDescription('show artifact info')
            .addStringOption(option => option
                .setName('filters')
                .setDescription('filters'))
            .addUserOption(option => option
                .setName('user')
                .setDescription('user'))),

    async execute(interaction : ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user', false) || interaction.user;
        const charname = interaction.options.getString('char', true);
        data['test'] = require('../data/go/test.json');
        const char = data['test'].characters?.find(e => e.key === charname);
        if (!char) {
            interaction.reply('Char not found');
            return;
        }
        const artifacts = data['test'].artifacts?.filter(e => e.location === charname);
        const weapon = data['test'].weapons?.find(e => e.location === charname);
        const target = data['test'].buildSettings?.find(e => e.id === charname);
        interaction.reply('```json\n'+JSON.stringify(char)+'```');
        interaction.channel?.send('```json\n'+JSON.stringify(weapon)+'```');
        interaction.channel?.send('```json\n'+JSON.stringify(artifacts)+'```');
        interaction.channel?.send('```json\n'+JSON.stringify(target)+'```');
    }
};