const config = require('./config.json');

exports.owner = (message) => {return (message.member.id == config.owner);}
exports.mod = (message) => {return (message.member.permissions.has('MANAGE_MESSAGES'));}
exports.adamant = (message) => {return (message.guild.id === '667073039422193686');}