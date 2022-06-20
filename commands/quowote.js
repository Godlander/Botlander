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

            //stylize text
            txt=txt.replace(/u(?!w)/g,"uw");
            txt=txt.replace(/(?<!w|\b)(l|r)(?!w|\b)/g,"w");
            txt=txt.replace(/n(?=a|e|i|o|u)/gi,"ny");
            txt=txt.replace(/\bthe\b/gi,"da");
            txt=txt.replace(/\bthat\b/gi,"dat");
            txt=txt.replace(/\bthis\b/gi,"dis");
            txt=txt.replace(/\bis\b/gi,"iz");
            txt=txt.replace(/\bim\b|\bi'm\b|\bi am\b|bi’m\b/gi,"watashi");
            txt=txt.replace(/\bhi\b|\bhello\b|\bsup\b/gi,"moshi moshi");

            //stuttering function
            String.prototype.re = function() {
              return this.replace(/\b[a-zA-Z]/g, function(str) { //happens at first letter of each word
              if (Math.floor(Math.random() * 4) == 0) { //1/4 chance to stutter
                var stutter = str;
                for (var i = 0; i < Math.floor(Math.random()*3); i++) { //stutters 0-2 times
                    stutter = stutter + "-" + str;
                }
                return stutter;
              }
              //original string if didnt stutter
              else return str;
              });
            };
            txt = txt.re();

            //add a random owo postfix
            var arr = ["uwu","owo",">w<","nyaa~","UwU","OwO","~~","uwu~","owo~","UwU~","OwO~","*nuzzles~","rawr x3","o3o","*rubb~","mmmm~","daddy~",";)","˶◕‿◕˶",">////<"];
            txt = txt+"  "+arr[Math.floor(Math.random()*arr.length)];

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
    name: "quowote",
    text: "[>quowote <message link|message id>][genewates a q-quowote of da l-l-linked messagew uwu~]"
};