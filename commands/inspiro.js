const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    fetch('https://inspirobot.me/api?generate=true')
        .then(response => response.text())
            .then(url =>{
                var embed = new MessageEmbed()
                    .setColor('#00aa00')
                    .setFooter("inspirobot.me","https://b.thumbs.redditmedia.com/hFWeHO7aQvwoE8EUR-ErkS4toSeCX7J3kInLTkTvfcQ.png")
                    .setImage(url);
                    message.channel.send({embeds:[embed]});
    })
};

exports.data = {
    help: 0,
    name: "inspiro",
    text: "[>inspiro][generates a random \'inspirational\' image]"
};