const Discord = require("discord.js");
const fetch = require('node-fetch');
const fs = require("fs");
const chrono = require('chrono-node');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"] });
const config = require("./config.json");

let data;
try {data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));} //load data
catch(e) {data={"faq":[],"invite":[],"remind":[],"event":"No events at this time."};} //if empty

client.on("ready", () => {
    console.log(`\n\n\nHello World!`); 
    resetreminders();
});

var commands = {
    "_botlander": _botlander,
    "hihixd": _hihixd,
    "ok": _ok,
    "juice": _juice,
    "befriend": _befriend,
    "lmgtfy": _lmgtfy,
    "inspiro": _inspiro,
    "roll": _roll,
    "vote": _poll,
    "poll": _poll,
    "quote": _quote,
    "quowote": _quote,
    "faq": _faq,
    "invite": _faq,
    "event": _event,
    "join": _join,
    "clear": _clear,
    "do": _do,
    "help": _help,
    "hlep": _help,
    "hepl": _help,
    "stop": _stop,
    "nap": _stop,
    "inviteall": _inviteall
};

function _botlander (message, input) {
    input = input.replace(/(botlander)|(<@!?544296504630706214>)/gi, " ");
    input = input.replace(/'|"/gi, "\$&");
    input = input.replace(/"/gi, "\"");
    input = input.replace(/ +/gi, " ");
    input = input.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    console.log("\nInput: " + input);

    message.channel.sendTyping();
    remindme(message, input);
}
function remindme(message, input) {
    if (input.match(/remind ?me|(set|give|me).*(reminder|alarm)/i)) {
        var now = new Date();
        var timetest = chrono.parse(input, now, {forwardDate: true});
        if (timetest.length > 0) {
            console.log("Detected time: " + timetest[0].text);
            var time = timetest[0].start.date();
            if (time.getTime() >= now.getTime()-1000) {
                var rem = {"channel": message.channel.id, "message": message.id, "time": time};
                data['remind'].push(rem);
                message.channel.send("Ok, " + message.member.displayName + ", I'll remind you <t:" + Math.floor(time.getTime() / 1000) + ":R>");
                console.log("Reminder set for " + message.author.tag + " at " + time.toString());
                fs.writeFile("./data.json", JSON.stringify(data), (err) => {
                    if (err) console.error(err)});
                remind(rem);
            } else {dictionary(message, input); console.log('time in the past');}
        } else {dictionary(message, input);} //no time found
    } else {dictionary(message, input);} //message did not match regex
}
function dictionary(message, input) {
    //test for dictionary
    var dicmatch = input.match(/(?:dictionary(?: for)?) (\w+)|(?:(?:define|definition of|meaning of) )(\w+)|(?:what(?:\w| )* does(?:\w| )* )(\w+) mean/i);
    var dictest = "";
    if (dicmatch) {dicmatch.forEach(e => {if (e) {dictest = e;}});}
    if (dictest.length > 1) { //if word exists look for it in dictionary
        console.log("Looking up " + dictest);
        fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + dictest)
        .then(response => response.json())
        .then(out => {
            if('title' in out){console.log("Couldn't find definition, falling back to chatbot."); throw new Error;}
            var out = out[0]
            var word = out.word.charAt(0).toUpperCase() + out.word.slice(1);
            var meanings = [];
            out.meanings.forEach(e => {
                var speech = e.partOfSpeech.charAt(0).toUpperCase() + e.partOfSpeech.slice(1);
                var definitions = [];
                e.definitions.forEach(e => {
                    var definition = e.definition.charAt(0).toUpperCase() + e.definition.slice(1);
                    definitions.push("-" + definition);
                    if ('example' in e) {
                        var example = e.example.charAt(0).toUpperCase() + e.example.slice(1);
                        definitions.push("   *" + example + ".*")
                    }
                })
                meanings.push("*" + speech + "*\n> " + definitions.splice(0,5).join('\n> '));
            })
            message.channel.send("> **" + word + "**\n> " + meanings.splice(0,5).join('\n> '));
        }).catch(O_o=>{chatbot(message, input);}); //catch error from no definition
    } else {chatbot(message, input);} //message did not match regex
}
function chatbot (message, input) {
    var arr = ["No comment.", "💩", "lol.", "...", "hmm.", "Hmmm.", "mhm.", "Mhm.", "yes.", "no.", "You're probably right.", "Yes?", "Sorry, I'm busy right now.", "Hold on. Let me Google it.", "Uh huh.", "Yeah sure.", "Okay.", "ok", "Sure.", "Hi."];
    fetch('https://api.affiliateplus.xyz/api/chatbot?message=' + input + '&botname=Botlander&ownername=Godlander')
        .catch(err => {console.log(err); message.channel.send(arr[Math.floor(Math.random()*arr.length)])})
        .then(response => response.json())
        .then(out => {
            if (out == undefined) {throw new Error;}
            out = out.message.replace(/ERROR! No message supplied./gi, arr[Math.floor(Math.random()*arr.length)])
            console.log("Chatbot: "+out);
            message.channel.send(out);
        }).catch(err => {console.log(err); message.channel.send(arr[Math.floor(Math.random()*arr.length)])})
}
function resetreminders () {
    for (var i = 0; i < data['remind'].length; i++) {
        remind(data['remind'][i]);
    }
}
function remind (rem) {
    var now = new Date();
    client.channels.fetch(rem.channel)
        .then(ch => ch.messages.fetch(rem.message)
            .then(msg => {
                setTimeout(() => {
                    var j = data['remind'].indexOf(rem);
                    data['remind'].splice(j,1);
                    fs.writeFile("./data.json", JSON.stringify(data), (err) => {
                        if (err) console.error(err)});
                    msg.reply("<@" + msg.author + ">, here's your reminder.").catch(err => console.log('remind message not found'));
                }, Date.parse(rem.time) - now.getTime())
            }).catch(console.error)
        ).catch(console.error)
}
function _hihixd (message, args) {
  message.react('👀')
    .then((msg) => {
        setTimeout(function(){
            message.delete().catch(O_o=>{});
        }, 1000)
    });
}
function _juice (message, args) {
    message.react('🧃');
    message.channel.send('https://giant.gfycat.com/ShoddyGenerousLangur.mp4');
}
function _ok (message, args) {
    message.react('🆗');
}
function _befriend (message, args) {
var member = message.mentions.members.first();
    if (!member) {
        message.react('👤'); return;
    }
    let embed = new Discord.MessageEmbed()
    .setColor('#ff55aa')
    .setAuthor('Hey, ' + member.displayName + ':', member.user.avatarURL())
    .setThumbnail('https://www.befrienders.org/content/themes/befrienders/images/logo.png')
    .setDescription('We have been notified of messages you have sent that are of a very sensitive nature and have indicated a need for help. As our users are very important to us, we want to ensure that they are safe and are receiving the assistance that they need. Because your safety is of great importance to us, we have temporarily blocked your account and urge you to seek immediate assistance through the support of a suicide prevention hotline: View a list of suicide prevention hotlines per country by visiting http://www.befrienders.org/ and choosing from the drop-down menu at the top of the page. We sincerely hope that you find our advice beneficial and take the necessary steps to mend this situation. Please confirm that you are not planning to hurt yourself. Please keep in mind that we will have to inform the local authorities if we do not get that confirmation from you in 24 hours. After getting your confirmation that you are safe we will look into your case, but your personal safety is our main concern at this point. We are hoping to hearing from you as soon as possible.')
    message.channel.send({embeds:[embed]});
}
function _lmgtfy (message, args) {
    var link = "<https://www.google.com/"
    if (args.length > 1) {
        link += "?q=" + args.slice(1).join("%20");
    }
    message.channel.send(link + ">");
}
function _inspiro (message, args) {
    fetch('https://inspirobot.me/api?generate=true')
        .then(response => response.text())
            .then(url =>{
                var embed = new Discord.MessageEmbed()
                    .setColor('#00aa00')
                    .setFooter("inspirobot.me","https://b.thumbs.redditmedia.com/hFWeHO7aQvwoE8EUR-ErkS4toSeCX7J3kInLTkTvfcQ.png")
                    .setImage(url);
                    message.channel.send({embeds:[embed]});
    })
}
function _roll (message, args) {
    let out;
    //one input, rand between 1 and input
    if (args.length == 2) {
        let m = parseInt(args[1], 10);
        out = Math.floor(Math.random()*m)+1;
    }
    //two inputs, rand between them
    else if (args.length == 3) {
        let m = parseInt(args[1], 10);
        let n = parseInt(args[2], 10);
        out = Math.floor((Math.random()*(m-n))+0.5) + n;
    }
    //none or too many inputs
    else {message.react('❓'); return;}
    message.channel.send('You rolled ' + out + '!');
}
function _poll (message, args) { //vote and poll
    if (args[0] === "vote") {message.react('👍').then(message.react('👎'));}
    else {
        //grab all emojis
        var emojis = args.slice(1).join(' ').match(/<a?:.+?:\d+>|\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/g)
        //if there are no emojis
        if (args.length < 2 || emojis.length < 1) {message.react('❓'); return;}
        //else react with all of them
        (async function() {
            for await (let emoji of emojis) {
                message.react(emoji).catch(O_o=>{});
            }
        })();
    }
}
function _quote (message, args) { //quote and quowote
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
                if (args[0] === "quowote") { //string processing for quowote
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

                    //add a random uwu postfix
                    var arr = [" uwu"," owo"," >w<"," nyaa~"," UwU"," OwO","~~"," uwu~"," owo~"," UwU~"," OwO~"," *nuzzles~"," rawr x3"," o3o"," *rubb~"," mmmm~"," daddy~"," ;)"," ˶◕‿◕˶",">////<","","","","","","","","",""];
                    txt = txt+""+arr[Math.floor(Math.random()*arr.length)];
                }
                if (msg.attachments.size > 0) {att = msg.attachments.first().url}
                var embed = new Discord.MessageEmbed()
                    .setColor(msg.member.displayHexColor)
                    .setAuthor(msg.member.displayName, msg.author.avatarURL(), 'https://discord.com/channels/'+link[0]+'/'+link[1]+'/'+link[2])
                    .setDescription(txt)
                    .setFooter("#"+msg.channel.name)
                    .setTimestamp(msg.createdTimestamp)
                    .setImage(att);
                message.channel.send({embeds:[embed]});
            //message found but no content. does this ever happen?
            }).catch(err => {message.react('⚠️'); console.log(err);})
        //message not found
        ).catch(err => {message.react('⚠️'); console.log(err);});
}
function _faq (message, args) { //invite and faq
    if (args.length < 2 || args[1] === "list") { //output list
        let msg;
        if(data[args[0]].length > 0) {
            msg = "List of " + args[0] + "s: "
            data[args[0]].forEach(x => {
                if (x.alias == 0) {msg += (", `" + x.id + "`");}
                else {msg += ("|`" + x.id + "`");}
            });
            msg = msg.replace(', ', ''); //remove first comma
        } else {msg = "There are no " + args[0] + "s.";}
        message.channel.send(msg);
    }
    else if (args[1] === "add") {
        if (args.length < 4) {message.react('❓'); return;} //if missing argument
        let x = {};
        x['id'] = args[2];
        x['data'] = message.content.replace(/^>\w+ \w+ \w+ /gi,"");
        x['alias'] = 0;
        var i;
        //if one already exists remove it first
        var found = data[args[0]].some(function(item, index) {i = index; return item.id == args[2];});
        if (found) {
            data[args[0]].splice(i,1);
            message.react('📝');
        }
        else {message.react('📥');}
        data[args[0]].push(x); //add to bottom of list
    }
    else if (args[1] === "alias") {
        if (!args[2] || !args[3]) {message.react('❓'); return;} //if missing argument
        let x = {};
        x['id'] = args[2];
        x['data'] = args[3];
        x['alias'] = 1;
        var n,m;
        var found;

        //if the thing you're trying to alias doesnt exist
        found = data[args[0]].some(function(item, index) {n = index; return item.id == args[3];});
        if (!found) {message.react('⚠️'); return;}
        
        //if it's already an alias grab the parent
        found = data[args[0]].some(function(item, index) {m = index; return (item.id == args[3] && item.alias == 1);});
        if (found) {
            x['data'] = data[args[0]][m].data;
        }

        //if one already exists remove it first
        found = data[args[0]].some(function(item, index) {m = index; return item.id == args[2];});
        if (found) {
            data[args[0]].splice(m,1);
            message.react('📝');
        }
        else {message.react('📥');}

        data[args[0]].splice(n+1,0,x);
    } else if (args[1] === "remove" || args[1] === "delete") {
        if (!args[2]) {message.react('❓'); return;} //if missing argument
        //find the thing
        var i;
        var found = data[args[0]].some(function(item, index) {i = index; return item.id == args[2];});
        if (!found) {message.react('⚠️'); return;}
        if (i < data[args[0]].length-1) { //last item in list cannot have an alias so ignore it
            if (!data[args[0]][i].alias && data[args[0]][i+1].alias) { //if it has an alias move the content to the next alias
                data[args[0]][i+1].data = data[args[0]][i].data;
                data[args[0]][i+1].alias = 0;
            }
        }
        message.react('📤');
        data[args[0]].splice(i,1);
    } else { //get
        var i;
        var found = data[args[0]].some(function(item, index) {i = index; return item.id == args[1];});
        if (!found) {message.react('⚠️'); return;}
        if (data[args[0]][i].alias == 1) { //if its an alias
            var x = data[args[0]][i].data;
            var found = data[args[0]].some(function(item, index) {i = index; return item.id == x;});
        }
        message.channel.send(data[args[0]][i].data);
    }
    //store data
    fs.writeFile("./data.json", JSON.stringify(data), (err) => {
        if (err) console.error(err)})
}
function _event (message, args) {
    if (args.length < 2 && message.attachments.size == 0) {
        message.channel.send(data['event']);
    }
    else {
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {message.react('💩'); return;}
        if (args[1] === "clear") {
            data['event'] = "No events at this time.";
            message.react('📤');
        }
        else {
            //if attachment, add attachment url to message
            if (message.attachments.size > 0) {data['event'] = args.slice(1).join(' ') + message.attachments.first().url;}
            //no attachment, just message
            else {data['event'] = args.slice(1).join(' ');}
            message.react('📝');
        }
    }
//store data
fs.writeFile("./data.json", JSON.stringify(data), (err) => {
    if (err) console.error(err)})
}
function _join (message, args) {
    if (!(message.guild.id === '667073039422193686')) {return;}
    var guildie = message.guild.roles.cache.get("667873546961158157");
    var guestie = message.guild.roles.cache.get("668959157797257256");
    var mem = message.mentions.members.first();
    if (!mem) {mem = message.member;}
    var nick = mem.displayName.split(' ')[0];
    var user = mem.user.username.split(' ')[0];
    fetch('https://darkmattr.uc.r.appspot.com/?player=' + nick).then(response => response.json()
        .then(player => {
            console.log(nick + ": " + player.guild);
            if (player.guild === "Adamant") {
                message.react('<:gang:670797208869666866>');
                mem.roles.remove(guestie);
                mem.roles.add(guildie);
                return;
            }
            else if (nick != user) {
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
    
}
function _clear (message, args) { //deletes up to 100 messages
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {message.react('💩'); return;}
    let n = parseInt(args[1], 10);
    if (!n || n < 1 || n > 99) {message.react('⚠️'); return;} //if invalid number
    message.channel.bulkDelete(n+1).catch(O_o=>{});
}
function _do (message, args) { //set custom status
    if (!fromowner(message)) {message.react('💩'); return;}
    if (args.length < 2 || args[1] === "nothing") {
        message.react('💭');
        client.user.setActivity('');
    } else if (args[1] === "playing" || args[1] === "play") {
        message.react('🎮');
        client.user.setActivity(args.slice(2).join(' '), {type:'PLAYING'});
    } else if (args[1] === "watching" || args[1] === "watch") {
        message.react('📺');
        client.user.setActivity(args.slice(2).join(' '), {type:'WATCHING'});
    } else if (args[1] === "listening" || args[1] === "listen") {
        if (args[2] === "to") {args.splice(2,1);}
        message.react('🎧');
        client.user.setActivity(args.slice(2).join(' '), {type:'LISTENING'});
    } else if (args[1] === "streaming" || args[1] === "stream") {
        message.react('📹');
        client.user.setActivity(args.slice(2).join(' '), {type:"STREAMING",url: "https://www.twitch.tv/godlander"});
    } else if (args[1] === "competing" || args[1] === "compete") {
        if (args[2] === "in") {args.splice(2,1);}
        message.react('💪');
        client.user.setActivity(args.slice(2).join(' '), {type:"COMPETING"});
    }
}
function _help (message, args) { //help, hlep, and hepl
    if (args[0] === "help") {
        message.channel.send("```Botlander's Commands:``````md\n[>join][assigns the correct role based on your realmeye guild (only for Adamant discord server)]\n[>vote][reacts with :thumbsup: and :thumbsdown:]\n[>quote <message link>][generates a quote of the linked message]\n[>quowote <message link>][genewates a q-quowote of da l-l-linked messagew uwu~]\n[>poll <emojis>][reacts with up to 10 given default emojis (doesn't work with custom emotes)]\n[>roll <max> (min)][generates a random number between max and min]\n[>inspiro][generates a random 'inspirational' image]\n[>lmgtfy <query>][lets botlander google it for them]\n[>invite (name)][shows an invite link]\n[>faq (name)][shows a faq]\n[>event][shows the current event]\n[>hlep][shows help for admin level commands]\n[>help][displays this message]``````()=optional, <>=required```");
    } else if (args[0] === "hlep") {
        message.channel.send("```Botlander's Admin Commands:``````md\n[>clear <#>][deletes # number of messages from current channel (requires \"manage messages\")]\n[>join @user][assigns the correct role for the user according to their realmeye guild]\n[>invite <add|delete|alias> <name> <content>][adds/overwrites or deletes an invite (requires \"manage messages\")]\n[>event <content>][changes the current event (requires \"manage messages\")]\n[>do <playing|watching|listening|streaming|competing> (status)][sets bot's current activity status (requires \"owner\")]\n[>stop][shuts down the bot (requires \"owner\")]\n[>hlep][displays this message]\n[>help][shows help for normal commands]``````()=optional, <>=required```");
    } else if (args[0] === "hepl") {
        message.channel.send("```Botlander's Secret Commands:``````md\n[>hihixd][:eyes:]\n[>hihixd][:ok:]\n[>juice][:beverage_box:]\n[>befriend <user>][lets a person in need know there are people to talk to]\n[>hepl][displays this message]\n[>help][shows help for normal commands]``````()=optional, <>=required```");
    }
}
function _stop (message, args) {
    if (!fromowner(message)) {message.react('💩'); return;}
    message.channel.send("*Going to sleep...*")
    .then(msg=>{
        client.destroy();
        process.exit(1);
    })
}
function _inviteall (message, args) {
    if (!fromowner(message)) {message.react('💩'); return;}
    client.guilds.cache.forEach(guild => {
        let channel = guild.channels.cache.last();
        createLink(channel,guild,message);
    });
    async function createLink(chan,guild,message) {
       let invite = await chan.createInvite().catch(console.error);
       try{
           message.channel.send(guild.name + '|' + invite.url);
       } catch (e) {
           message.channel.send(guild.name + '|' + 'no link available');
       }
    }
}

function fromowner(message) {return (message.member.id == '225455864876761088');}

client.on("messageCreate", async message => {
    if (message.author.bot) {return;} //ignore other bots
    if (message.content.indexOf(config.prefix) == 0) { //look for prefix
        var args = message.content.slice(1).trim().split(/ +/g); //look for arguments
        args[0] = args[0].toLowerCase();
        if (args[0] in commands) {commands[args[0]](message,args);}
    }
    //look for botlander mention
    if (/(botlander)|(<@!544296504630706214>)|(<@544296504630706214>)/gi.test(message.content)) {commands['_botlander'](message, message.content);}
});
client.login(config.token);