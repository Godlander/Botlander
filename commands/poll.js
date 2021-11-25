exports.run = async (client, message, args) => {
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
};

exports.data = {
    help: 0,
    name: "poll",
    text: "[>poll <message>][reacts with all the emojis in the message]"
};