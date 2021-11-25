const invites = require('../invites.json');
const from = require('../permissions.js');
const fs = require("fs");

function add(message, args) {
    if (args.length < 4) {message.react('❓'); return;} //if missing argument
    let invite = {
        "id": args[2],
        "data": message.content.replace(/^>\w+ \w+ \w+ /gi,""),
        "alias": 0
    };
    var i;
    //if one already exists remove it first
    var found = invites.some(function(item, index) {i = index; return item.id == invite.id;});
    if (found) {
        invites.splice(i,1);
        message.react('📝');
    }
    else {message.react('📥');}
    invites.push(invite); //add to bottom of list
}

function alias(message, args) {
    if (!args[2] || !args[3]) {message.react('❓'); return;} //if missing argument
    let invite = {
        "id": args[2],
        "data": args[3],
        "alias": 1
    };
    var n,i;
    var found;
    //if the thing you're trying to alias doesnt exist
    found = invites.some(function(item, index) {n = index; return item.id == invite.data;});
    if (!found) {message.react('⚠️'); return;}
    //if it's already an alias grab the parent
    found = invites.some(function(item, index) {i = index; return (item.id == invite.data && item.alias == 1);});
    if (found) {invite.data = invites[i].data;}
    //if one already exists remove it first
    found = invites.some(function(item, index) {i = index; return item.id == invite.id;});
    if (found) {
        invites.splice(i, 1);
        message.react('📝');
    }
    else {message.react('📥');}
    invites.splice(n+1, 0, invite);
}

function remove(message, args) {
    if (!args[2]) {message.react('❓'); return;} //if missing argument
    //find the thing
    var i;
    var found = invites.some(function(item, index) {i = index; return item.id == args[2];});
    if (!found) {message.react('⚠️'); return;}
    if (i < invites.length-1) { //last item in list cannot have an alias so ignore it
        if (!invites[i].alias && invites[i+1].alias) { //if it has an alias move the content to the next alias
            invites[i+1].data = invites[i].data;
            invites[i+1].alias = 0;
        }
    }
    message.react('📤');
    invites.splice(i,1);
}

var subcommands = {
    "add": add,
    "alias": alias,
    "remove": remove,
    "delete": remove
}

exports.run = async (client, message, args) => {
    if (args.length < 2 || args[1] === "list") { //output list
        let msg;
        if(invites.length > 0) { //if there are any
            msg = "List of " + args[0] + "s: "
            invites.forEach(x => {
                if (x.alias == 0) {msg += (", `" + x.id + "`");}
                else {msg += ("|`" + x.id + "`");}
            });
            msg = msg.replace(', ', ''); //remove first comma
        } else {msg = "There are no invites.";}
        message.channel.send(msg);
    } else if (args[1] in subcommands) {
        if (!from.owner(message)) {message.react('💩'); return;}
        subcommands[args[1]](message, args);
        fs.writeFile("./invites.json", JSON.stringify(invites), (err) => {if (err) console.error(err)});
    } else { //get
        var i;
        var found = invites.some(function(item, index) {i = index; return item.id == args[1];});
        if (!found) {message.react('⚠️'); return;}
        if (invites[i].alias == 1) { //if its an alias
            var name = invites[i].data;
            var found = invites.some(function(item, index) {i = index; return item.id == name;});
        }
        message.channel.send(invites[i].data);
    }
};

exports.data = {
    help: 0,
    name: "invite",
    text: "[>invite (name)][shows an invite]"
};