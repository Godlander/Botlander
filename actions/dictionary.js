const fetch = require('node-fetch');

exports.run = async (client, message, input) => {
    //test for dictionary
    var dicmatch = input.match(/(?:dictionary(?: for)?) (\w+)|(?:(?:define|definition of|meaning of) )(\w+)|(?:what(?:\w| )* does(?:\w| )* )(\w+) mean/i);
    var dictest = "";
    if (dicmatch) {dicmatch.forEach(e => {if (e) {dictest = e;}});}
    if (dictest.length > 1) { //if word exists look for it in dictionary
        console.log("Looking up \'" + dictest + "\'");
        fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + dictest)
        .then(response => response.json())
        .then(out => {
            if('title' in out){console.log("Couldn't find definition, falling back to chatbot."); return false;} //definition not found
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
        })
    } else {console.log("not a dictionary action."); return false;} //message did not match regex
    return true;
};