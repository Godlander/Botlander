const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    //missing argument
    if (args.length < 1) {message.react('❓'); return;}
    let link;
    if (args[1].startsWith("https")) { //if link
        link = args[1].split(/\//g);
        while (!link[0].match(/^\d/)) { //remove until first 3 elements are server/channel/message id
            link.splice(0,1);
        }
    } else if (args[1].match(/^\d/)) {link = [message.guild.id, message.channel.id, args[1]];} //if only id provided look in the same channel
    client.channels.fetch(link[1])
        .then(ch => ch.messages.fetch(link[2])
        .then(msg => {
            var txt = msg.content;
            var att;
            if (msg.attachments.size > 0) {att = msg.attachments.first().url}
            var embed = new MessageEmbed()
                .setColor(msg.member.displayHexColor)
                .setAuthor(msg.member.displayName, msg.author.avatarURL(), 'https://discord.com/channels/'+link[0]+'/'+link[1]+'/'+link[2])
                .setDescription(txt)
                .setFooter("#"+msg.channel.name)
                .setTimestamp(msg.createdTimestamp)
                .setImage(att);
            message.channel.send({embeds:[embed]});
        //message found but no content. does this ever happen?
        }).catch(err => {message.react('⚠️'); console.err(err);})
    //message not found
    ).catch(err => {message.react('⚠️'); console.err(err);});
};

exports.data = {
    help: 0,
    name: "quote",
    text: "[>quote <message link|message id>][generates a quote of the linked message]"
};