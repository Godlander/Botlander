const fetch = require('node-fetch');3

function rand (list) {
    return list[Math.floor((Math.random()*list.length))];
}
exports.run = async (client, message, input) => {
    //match regex for dice roll
    var match = input.match(/\broll.+d(\d+)\b/i);
    if (match) {
        var dice = parseInt(match[1])-1;
        var a = ["You", "The dice", "It"];
        var b = ["rolled a", "landed on"];
        message.channel.send(rand(a)+" "+rand(b)+" "+ Math.round(Math.random()*dice + 1) +".");
    }
    //coin flip
    else if (input.match(/\bflip.+coin\b/i)) {
        var a = ["You", "The coin", "It"];
        var b = ["landed on", "flipped"];
        var outcome = ["heads", "tails"];
        message.channel.send(rand(a)+" "+rand(b)+" "+ outcome[Math.round(Math.random())] +".");
    }
    else return false;
    return true;
};