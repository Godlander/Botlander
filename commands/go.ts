import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import path from 'path';
import fs from 'fs/promises';
import { IArtifact, ICharacter, IGOOD, IWeapon } from '../go/good';

export const slashcommand = new SlashCommandBuilder()
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
        .setDescription('user')))

type IChar = {
    char : ICharacter | undefined,
    weapon : IWeapon | undefined,
    artifacts : IArtifact[] | undefined,
    target : any
}

var data : Record<string, IGOOD> = {};

export function getchardata(user : string, charname : string) : IChar {
    let out : any;
    data['test'] = require('../data/go/test.json');
    out.char = data['test'].characters?.find(e => e.key === charname);
    if (out.char === undefined) throw 0;
    out.weapon = data['test'].weapons?.find(e => e.location === charname);
    out.artifacts = data['test'].artifacts?.filter(e => e.location === charname);
    out.target = data['test'].buildSettings?.find(e => e.id === charname);
    return out;
}

export async function run(interaction : ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user', false) || interaction.user;
    const charname = interaction.options.getString('char', true);
    let chardata;
    try {
        chardata = getchardata(user.id, charname);
    }
    catch {
        interaction.reply('Char not found');
        return;
    }
    interaction.reply('```json\n'+JSON.stringify(chardata.char)+'```');
    interaction.channel?.send('```json\n'+JSON.stringify(chardata.weapon)+'```');
    interaction.channel?.send('```json\n'+JSON.stringify(chardata.artifacts)+'```');
    interaction.channel?.send('```json\n'+JSON.stringify(chardata.target)+'```');
}