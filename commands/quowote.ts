import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getmessage } from "../lib/message";
import { quote } from "./quote";

export const slashcommand = new SlashCommandBuilder()
  .setContexts([0, 1, 2])
  .setName("quowote")
  .setDescription("Quowotes a mwessage uwu")
  .addStringOption((option) =>
    option
      .setName("mwessage")
      .setDescription("Link to the message to quowote")
      .setRequired(true)
  )
  .addUserOption((option) =>
    option
      .setName("mwention")
      .setDescription("Mwentions a uwuser in da quowote")
  )
  .addBooleanOption((option) =>
    option
      .setName("raww")
      .setDescription("Sends teh quowote embwed as raww stwing")
  );

const owopost = [
  "",
  "~",
  "uwu",
  "owo",
  "nyaa~",
  "UwU",
  "OwO",
  "uwu~",
  "owo~",
  "UwU~",
  "OwO~",
  "*nuzzles~",
  "rawr x3",
  "*rubb~",
  "mmmm~",
  "daddy~",
  ">w<",
  "o3o",
  ";)",
  "˶◕‿◕˶",
  "≧◡≦",
  "・ω・",
  "^ω^",
  ">////<",
];

export function owofy(text: string): string {
  return (
    text
      //stylize text
      .replace(/u(?!w)/g, "uw")
      .replace(/(?<!w|\b)(l|r)(?!w|\b)/g, "w")
      .replace(/n(?=a|e|i|o|u)/gi, "ny")
      .replace(/\bthe\b/gi, "da")
      .replace(/\bthat\b/gi, "dat")
      .replace(/\bthis\b/gi, "dis")
      .replace(/\bis\b/gi, "iz")
      .replace(/\bim\b|\bi'm\b|\bi am\b|bi’m\b/gi, "watashi")
      .replace(/\bhi\b|\bhello\b|\bsup\b/gi, "moshi moshi")
      //stuttering function
      .replace(/\b[a-zA-Z]/g, (s) => {
        //happens at first letter of each word
        if (Math.floor(Math.random() * 4) > 0) return s; //1/4 chance to stutter
        let stutter = s;
        for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
          //stutters 0-2 times
          stutter = stutter + "-" + s;
        }
        return stutter;
      })
      //add random uwu postfixes
      .replace(/\n+/g, (s) => {
        if (Math.floor(Math.random() * 2) > 0) return s; //1/2 chance to append postfix
        return "  " + owopost[Math.floor(Math.random() * owopost.length)] + s;
      }) +
    "  " +
    owopost[Math.floor(Math.random() * owopost.length)]
  ); //postfix at the end
}

export async function command(interaction: ChatInputCommandInteraction) {
  const input = interaction.options.getString("mwessage", true).toLowerCase();
  const user = interaction.options.getUser("mwention", false);
  const mention = user ? `${user}` : "";
  const raw = interaction.options.getBoolean("raww", false);
  //check that link is a discord message
  if (!input.startsWith("https://discord.com/channels/")) {
    interaction.reply({ content: `Invalid message link`, flags: MessageFlags.Ephemeral });
    return;
  }
  const ids = input.split("/").splice(4, 3);
  try {
    const message = await getmessage(interaction, ids[1], ids[2]);
    const embed = await quote(message, owofy);

    if (raw) interaction.reply("`" + JSON.stringify(embed) + "`");
    else interaction.reply({ content: mention + " " + input, embeds: [embed] });
  } catch (e) {
    interaction.reply({ content: `Invalid message link`, flags: MessageFlags.Ephemeral });
    console.log(e);
    return;
  }
}
