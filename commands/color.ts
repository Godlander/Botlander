import {
  APIEmbed,
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export const slashcommand = new SlashCommandBuilder()
  .setContexts([
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel,
  ])
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ])
  .setName("color")
  .setDescription("Converts color formats")
  .addStringOption((option) =>
    option
      .setName("color")
      .setDescription(
        "Input can be in hex, decimal, binary, rgb(R, G, B), or vec3(R, G, B)"
      )
      .setRequired(true)
  );

type Color = {
  r: number;
  g: number;
  b: number;
};

function int2hex(i: number) {
  let hex = i.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}
function hex2rgb(hex: string): Color {
  let reg = /([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
  if (!reg) throw 0;
  return {
    r: parseInt(reg[1], 16),
    g: parseInt(reg[2], 16),
    b: parseInt(reg[3], 16),
  };
}
function rgb2hex(c: Color): string {
  return int2hex(c.r) + int2hex(c.g) + int2hex(c.b);
}
function rgb2vec3(c: Color) {
  return {
    r: c.r / 255,
    g: c.g / 255,
    b: c.b / 255,
  };
}
function vec32rgb(c: Color): Color {
  return {
    r: Math.round(c.r * 255),
    g: Math.round(c.g * 255),
    b: Math.round(c.b * 255),
  };
}
export function parse(input: string): APIEmbed {
  let hex: string,
    rgb: Color | undefined,
    vec3: Color,
    int: number,
    bin: string;
  const args = input.split(" ");
  //look for hex
  let m = input.match(/(?:#|0x)([0-9a-f]{6})/i);
  if (m) {
    hex = m[1];
    rgb = hex2rgb(hex);
  }
  //look for int
  else if (args[0] === "int" || args[0] === "i") {
    int = parseInt(args[1]);
    hex = int.toString(16).padStart(6, "0");
    rgb = hex2rgb(hex);
  }
  //look for bin
  else if (args[0] === "bin" || args[0] === "b") {
    bin = input.slice(4).replace(/\s/g, "");
    int = parseInt(bin, 2);
    hex = int.toString(16).padStart(6, "0");
    rgb = hex2rgb(hex);
  }
  //look for rgb or vec3
  else {
    let m = input.match(/(\w+)[( ]*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/i);
    if (!m || m.length != 5) throw 0;
    if (m[1] === "rgb")
      rgb = {
        r: parseInt(m[2]),
        g: parseInt(m[3]),
        b: parseInt(m[4]),
      };
    else if (m[1].startsWith("v"))
      rgb = vec32rgb({
        r: parseFloat(m[2]),
        g: parseFloat(m[3]),
        b: parseFloat(m[4]),
      });
  }
  if (rgb === undefined) throw 0;
  hex ??= rgb2hex(rgb);
  vec3 ??= rgb2vec3(rgb);
  int ??= parseInt(hex, 16);
  bin ??= parseInt(hex, 16).toString(2).padStart(24, "0");
  bin = bin.match(/.{4}/g)?.join(" ") ?? "";
  return {
    color: int,
    description:
      "`#" +
      hex +
      "`\n" +
      "`rgb(" +
      rgb.r +
      ", " +
      rgb.g +
      ", " +
      rgb.b +
      ")`\n" +
      "`vec3(" +
      vec3.r +
      (Number.isInteger(vec3.r) ? ".0" : "") +
      ", " +
      vec3.g +
      (Number.isInteger(vec3.g) ? ".0" : "") +
      ", " +
      vec3.b +
      (Number.isInteger(vec3.b) ? ".0" : "") +
      ")`\n" +
      "`int " +
      int +
      "`\n" +
      "`bin " +
      bin +
      "`",
  };
}

export async function command(interaction: ChatInputCommandInteraction) {
  const input = interaction.options.getString("color", true).toLowerCase();
  let out;
  try {
    out = parse(input);
  } catch {
    interaction.reply({ content: `Invalid color`, flags: MessageFlags.Ephemeral, });
    return;
  }
  interaction.reply({ embeds: [out] });
}
