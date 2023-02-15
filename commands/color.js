const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

function int2hex(i) {
    var hex = i.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function hex2rgb(hex) {
    var result = /#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}
function rgb2hex(c) {
    return int2hex(c.r) + int2hex(c.g) + int2hex(c.b);
}
function rgb2vec3(c) {
    return {
        r: c.r/255.,
        g: c.g/255.,
        b: c.b/255.
    };
}
function vec32rgb(c) {
    return {
        r: Math.round(c.r*255),
        g: Math.round(c.g*255),
        b: Math.round(c.b*255)
    }
}

exports.run = async (client, message, args) => {
    //missing argument
    if (args.length < 2) {message.react('❓'); return;}

    let hex, rgb, vec3, int, bin;

    let input = message.content.slice(7);
    let m = input.match(/#([0-9a-f]{6})/i);
    if (m) {
        hex = m[1];
        rgb = hex2rgb(hex);
    }
    else if (args[1] == 'int') {
        int = parseInt(args[2]);
        hex = int.toString(16).padStart(6, '0');
        rgb = hex2rgb(hex);
    }
    else if (args[1] == 'bin') {
        bin = message.content.slice(11).replace(/\s/g,'');
        int = parseInt(bin, 2);
        hex = int.toString(16).padStart(6, '0');
        rgb = hex2rgb(hex);
    }
    else {
        let m = input.match(/(\w+)\(([\d.]+), *([\d.]+), *([\d.]+)\)/i);
        if (m.length != 5) {message.react('❓'); return;}
        switch (m[1]) {
            case 'rgb':
                rgb = {
                    r: parseInt(m[2]),
                    g: parseInt(m[3]),
                    b: parseInt(m[4])
                };
                break;
            case 'vec3':
                vec3 = {
                    r: parseFloat(m[2]),
                    g: parseFloat(m[3]),
                    b: parseFloat(m[4])
                };
                rgb = vec32rgb(vec3);
                break;
        }
    }

    hex ??= rgb2hex(rgb);
    vec3 ??= rgb2vec3(rgb);
    int ??= parseInt(hex, 16);
    bin ??= parseInt(hex, 16).toString(2).padStart(24, '0');
    bin = bin.match(/.{4}/g).join(' ');

    let embed = new MessageEmbed()
    .setColor(hex)
    .setDescription('`#'+hex+'`\n'+
                    '`rgb('+rgb.r+', '+rgb.g+', '+rgb.b+')`\n'+
                    '`vec3('+vec3.r+', '+vec3.g+', '+vec3.b+')`\n'+
                    '`int '+int+'`\n'+
                    '`bin '+bin+'`'
                    );
    message.channel.send({embeds:[embed]});
};

exports.data = {
    help: 0,
    name: "color",
    text: "[>color <hex|rgb|vec3|int|bin>][converts between color formats]"
};