const faqs = require('../faqs.json');
const from = require('../permissions.js');
const fs = require("fs");

function add(message, args) {
    if (args.length < 4) {message.react('❓'); return;} //if missing argument
    let faq = {
        "id": args[2],
        "data": message.content.replace(/^>\w+ \w+ \w+ /gi,""),
        "alias": 0
    };
    var i;
    //if one already exists remove it first
    var found = faqs.some(function(item, index) {i = index; return item.id == faq.id;});
    if (found) {
        faqs.splice(i,1);
        message.react('📝');
    }
    else {message.react('📥');}
    faqs.push(faq); //add to bottom of list
}

function alias(message, args) {
    if (!args[2] || !args[3]) {message.react('❓'); return;} //if missing argument
    let faq = {
        "id": args[2],
        "data": args[3],
        "alias": 1
    };
    var n,i;
    var found;
    //if the thing you're trying to alias doesnt exist
    found = faqs.some(function(item, index) {n = index; return item.id == faq.data;});
    if (!found) {message.react('⚠️'); return;}
    //if it's already an alias grab the parent
    found = faqs.some(function(item, index) {i = index; return (item.id == faq.data && item.alias == 1);});
    if (found) {faq.data = faqs[i].data;}
    //if one already exists remove it first
    found = faqs.some(function(item, index) {i = index; return item.id == faq.id;});
    if (found) {
        faqs.splice(i, 1);
        message.react('📝');
    }
    else {message.react('📥');}
    faqs.splice(n+1, 0, faq);
}

function remove(message, args) {
    if (!args[2]) {message.react('❓'); return;} //if missing argument
    //find the thing
    var i;
    var found = faqs.some(function(item, index) {i = index; return item.id == args[2];});
    if (!found) {message.react('⚠️'); return;}
    if (i < faqs.length-1) { //last item in list cannot have an alias so ignore it
        if (!faqs[i].alias && faqs[i+1].alias) { //if it has an alias move the content to the next alias
            faqs[i+1].data = faqs[i].data;
            faqs[i+1].alias = 0;
        }
    }
    message.react('📤');
    faqs.splice(i,1);
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
        if(faqs.length > 0) { //if there are any
            msg = "List of " + args[0] + "s: "
            faqs.forEach(x => {
                if (x.alias == 0) {msg += (", `" + x.id + "`");}
                else {msg += ("|`" + x.id + "`");}
            });
            msg = msg.replace(', ', ''); //remove first comma
        } else {msg = "There are no faqs.";}
        message.channel.send(msg);
    } else if (args[1] in subcommands) {
        if (!from.owner(message)) {message.react('💩'); return;}
        subcommands[args[1]](message, args);
        fs.writeFile("./faqs.json", JSON.stringify(faqs), (err) => {if (err) console.error(err)});
    } else { //get
        var i;
        var found = faqs.some(function(item, index) {i = index; return item.id == args[1];});
        if (!found) {message.react('⚠️'); return;}
        if (faqs[i].alias == 1) { //if its an alias
            var name = faqs[i].data;
            var found = faqs.some(function(item, index) {i = index; return item.id == name;});
        }
        message.channel.send(faqs[i].data);
    }
};

exports.data = {
    help: 0,
    name: "faq",
    text: "[>faq (name)][shows a faq]"
};