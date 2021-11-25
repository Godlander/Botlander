const from = require('../permissions.js');
const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    var member = message.mentions.members.first();
        if (!member) {
            message.react('👤'); return;
        }
        let embed = new MessageEmbed()
        .setColor('#ff55aa')
        .setAuthor('Hey, ' + member.displayName + ':', member.user.avatarURL())
        .setThumbnail('https://www.befrienders.org/content/themes/befrienders/images/logo.png')
        .setDescription('We have been notified of messages you have sent that are of a very sensitive nature and have indicated a need for help. As our users are very important to us, we want to ensure that they are safe and are receiving the assistance that they need. Because your safety is of great importance to us, we have temporarily blocked your account and urge you to seek immediate assistance through the support of a suicide prevention hotline: View a list of suicide prevention hotlines per country by visiting http://www.befrienders.org/ and choosing from the drop-down menu at the top of the page. We sincerely hope that you find our advice beneficial and take the necessary steps to mend this situation. Please confirm that you are not planning to hurt yourself. Please keep in mind that we will have to inform the local authorities if we do not get that confirmation from you in 24 hours. After getting your confirmation that you are safe we will look into your case, but your personal safety is our main concern at this point. We are hoping to hearing from you as soon as possible.')
        message.channel.send({embeds:[embed]});
};

exports.data = {
    help: 0,
    name: "befriend",
    text: "[>befriend <user>][lets a person in need know there are people to talk to]"
};