const {ownerid} = require('./config.json')

function has(interaction, arr) {
    if (interaction.member.permissions.has(arr)) return true;
    interaction.reply({content: `You do not have permission to use this command.`, ephemeral: true});
    return false;
}
function owner(interaction) {
    if (interaction.user.id == ownerid) return true;
    interaction.reply({content: `You do not have permission to use this command.`, ephemeral: true});
    return false;
}

module.exports = {has, owner};