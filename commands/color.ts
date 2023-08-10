import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

type Color = {
    r : number,
    g : number,
    b : number
}
type stringColor = {
    r : string,
    g : string,
    b : string
}

function int2hex(i : number) {
    let hex = i.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}
function hex2rgb(hex : string) : Color {
    let reg = /#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
    if (!reg) throw 0;
    return {
      r: parseInt(reg[1], 16),
      g: parseInt(reg[2], 16),
      b: parseInt(reg[3], 16)
    };
}
function rgb2hex(c : Color) : string {
    return int2hex(c.r) + int2hex(c.g) + int2hex(c.b);
}
function rgb2vec3(c : Color) {
    let r = c.r/255.;
    let g = c.g/255.;
    let b = c.b/255.;
    return {
        r: ''+r+(Number.isInteger(r)?'.0':''),
        g: ''+g+(Number.isInteger(g)?'.0':''),
        b: ''+b+(Number.isInteger(b)?'.0':'')
    };
}
function vec32rgb(c : Color) : Color {
    return {
        r: Math.round(c.r*255),
        g: Math.round(c.g*255),
        b: Math.round(c.b*255)
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Converts colors.')
        .addStringOption(option =>
            option.setName('color')
            .setDescription('color')
            .setRequired(true)),
    async execute(interaction : ChatInputCommandInteraction) {
        let hex : string,
            rgb : Color | null = null,
            vec3 : stringColor,
            int : number,
            bin : string;
        let input = interaction.options.getString('color', true).toLowerCase();
        let args = input.split(' ');
        //look for hex
        let m = input.match(/#([0-9a-f]{6})/i);
        if (m) {
            hex = m[1];
            rgb = hex2rgb(hex);
        }
        //look for int
        else if (args[0] === 'int') {
            int = parseInt(args[2]);
            hex = int.toString(16).padStart(6, '0');
            rgb = hex2rgb(hex);
        }
        //look for bin
        else if (args[0] === 'bin') {
            bin = input.slice(4).replace(/\s/g,'');
            int = parseInt(bin, 2);
            hex = int.toString(16).padStart(6, '0');
            rgb = hex2rgb(hex);
        }
        //look for rgb or vec3
        else {
            let m = input.match(/(\w+)\(([\d.]+), *([\d.]+), *([\d.]+)\)/i);
            if (!m || m.length != 5) return interaction.reply({content: `Invalid color`, ephemeral: true});
            switch (m[1]) {
                case 'rgb':
                    rgb = {
                        r: parseInt(m[2]),
                        g: parseInt(m[3]),
                        b: parseInt(m[4])
                    };
                    break;
                case 'vec3':
                    rgb = vec32rgb({
                        r: parseFloat(m[2]),
                        g: parseFloat(m[3]),
                        b: parseFloat(m[4])
                    });
                    break;
            }
        }
        if (rgb === null) return interaction.reply({content: `Invalid color`, ephemeral: true});
        hex ??= rgb2hex(rgb);
        vec3 ??= rgb2vec3(rgb);
        int ??= parseInt(hex, 16);
        bin ??= parseInt(hex, 16).toString(2).padStart(24, '0');
        bin = bin.match(/.{4}/g)?.join(' ') ?? '';
        interaction.reply({embeds:[{
            color: int,
            description:'`#'+hex+'`\n'+
                        '`rgb('+rgb.r+', '+rgb.g+', '+rgb.b+')`\n'+
                        '`vec3('+vec3.r+', '+vec3.g+', '+vec3.b+')`\n'+
                        '`int '+int+'`\n'+
                        '`bin '+bin+'`'
        }]});
    }
}