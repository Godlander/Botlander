const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    //missing argument
    if (args.length < 2) {message.react('❓'); return;}
    let name = args[1];
    //username
    if (name.length <= 16) {
        let r = await fetch('https://api.mojang.com/users/profiles/minecraft/'+name).then(r => r.json()).catch(_ => {});
        if (!r) {message.react('❓'); return};
        r = await fetch('https://sessionserver.mojang.com/session/minecraft/profile/'+r.id).then(r => r.json()).catch(_ => {});
        if (!r) {message.react('❓'); return};
        name = r.properties[0].value;
    }
    //base64
    name = Buffer.from(name, 'base64').toString().replace(/'/g, '"');
    let skin = JSON.parse(name);

    let embed = new MessageEmbed()
    .setColor('#36393f')
    .setImage(skin.textures.SKIN.url);
    message.channel.send({embeds:[embed]});
};

exports.data = {
    help: 0,
    name: "skin",
    text: "[>skin <username|base64 url>][grabs a skin image from mojang skin servers]"
};