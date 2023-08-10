import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js'
import { ownerid } from './config.json';

function has(interaction : ChatInputCommandInteraction, arr : PermissionsBitField) {
    if ((interaction.member?.permissions as PermissionsBitField).has(arr)) return true;
    interaction.reply({content: `You do not have permission to use this command.`, ephemeral: true});
    return false;
}
function owner(interaction : ChatInputCommandInteraction) {
    if (interaction.user.id === ownerid) return true;
    interaction.reply({content: `You do not have permission to use this command.`, ephemeral: true});
    return false;
}

export default {has, owner};