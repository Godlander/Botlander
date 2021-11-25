const from = require('../permissions.js');
const fetch = require('node-fetch');

exports.run = async (client, message, args) => {
    //has to be from adamant server
    if (!from.adamant(message)) {message.react('💩'); return;}
    //grab the roles
    var guildie = message.guild.roles.cache.get("667873546961158157");
    var guestie = message.guild.roles.cache.get("668959157797257256");
    //mentioned member, or sender
    var mem = message.mentions.members.first();
    if (!mem) {mem = message.member;}
    //first word of name
    var nick = mem.displayName.split(' ')[0];
    var user = mem.user.username.split(' ')[0];
    //first look for nickname
    fetch('https://darkmattr.uc.r.appspot.com/?player=' + nick).then(response => response.json()
        .then(player => {
            console.log(nick + ": " + player.guild);
            if (player.guild === "Adamant") {
                message.react('<:gang:670797208869666866>');
                mem.roles.remove(guestie);
                mem.roles.add(guildie);
                return;
            }
            else if (nick != user) { //if not found for nickname, and nick is different from username
                fetch('https://darkmattr.uc.r.appspot.com/?player=' + user).then(response2 => response2.json()
                    .then(player2 => {
                        console.log(user + ": " + player2.guild);
                        if (player2.guild === "Adamant") {
                            message.react('<:gang:670797208869666866>');
                            mem.roles.remove(guestie);
                            mem.roles.add(guildie);
                        } else {
                            message.react('👤');
                            mem.roles.add(guestie);
                            mem.roles.remove(guildie);
                        }
                    })
                )
            } else {
                message.react('👤');
                mem.roles.add(guestie);
                mem.roles.remove(guildie);
            }
        })
    );
};

exports.data = {
    help: 0,
    name: "join",
    text: "[>join][assigns the correct role based on your realmeye guild]"
};