exports.run = async (client, message, args) => {
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
};

exports.data = {
    help: 0,
    name: "roll",
    text: "[>roll <max> (min)][generates a random number between max and min (inclusive)]"
};