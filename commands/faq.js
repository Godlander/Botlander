const {SlashCommandBuilder} = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('faq')
        .setDescription('Shows a faq.')
        .addStringOption(option =>
            option.setName('query')
            .setDescription('query'))
        .setDMPermission(false),
    async execute(interaction) {
        let id = interaction.guildId;
        const filepath = path.join(__dirname, '../', 'data', id);
        let data;
        try {
            data = JSON.parse(fs.readFileSync(filepath));
        }
        catch {data = {faqs:{}}}
        let query = interaction.options.getString('query', false) ?? "";
        query = query.match(/([^\s]+)\s*([\s\S]*)/);
        if (!query || query[1] == 'all' || query[1] == 'list') {
            if (Object.keys(data.faqs).length === 0) return interaction.reply({content: `No faqs found.`, ephemeral: true});
            else {
                str = Object.keys(data.faqs).join('` `');
                return interaction.reply(`Available faqs: \`${str}\``);
            }
        }
        else if (query[1] == 'add') {
            query = query[2].match(/([^\s]+)\s*([\s\S]*)/);
            if (!query[2]) return interaction.reply({content: `No content for faq.`, ephemeral: true});
            let content = query[2].replaceAll('\\n','\n');
            if (query[1] in data.faqs) interaction.reply({content: `Edited faq \`${query[1]}\` with: ${content}`});
            else interaction.reply({content: `Added faq \`${query[1]}\` with: ${content}`});
            data.faqs[query[1]] = content;
        }
        else if (query[1] == 'remove') {
            if (query[2] in data.faqs) {
                delete data.faqs[query[2]];
                interaction.reply({content: `Removed faq ${query[2]}`});
            }
            else return interaction.reply({content: `No faq \`${query[2]}\``, ephemeral: true});
        }
        else if (query[1] in data.faqs) {
            return interaction.reply(data.faqs[query[1]]);
        }
        else {
            return interaction.reply({content: `No faq \`${query[1]}\``, ephemeral: true});
        }
        fs.writeFileSync(filepath, JSON.stringify(data));
    }
};