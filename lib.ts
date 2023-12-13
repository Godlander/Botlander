import { BaseInteraction, ChatInputCommandInteraction, Interaction } from "discord.js";

export function isstring(s : unknown) : Boolean {
    return typeof s === 'string';
}

//fetches a message from string guild, channel, and message ids
export async function getmessage(interaction : BaseInteraction, guildid : string, channelid : string, messageid : string) {
    const guild = (guildid == '@me')? null : await interaction.client.guilds.fetch(guildid);
    const channel = guild? await guild.channels.fetch(channelid) : await interaction.client.channels.fetch(channelid);
    if (channel === null || !("messages" in channel)) throw "Not a valid channel";
    const message = await channel.messages.fetch(messageid);
    return message;
}

export async function errorreply(interaction : Interaction, e : any, ephemeral : boolean = true) {
    if (!interaction.isCommand()) return;
    if (!isstring(e)) {
        if ('rawError' in e) e = e.rawError;
        e = '```json\n' + JSON.stringify(e, Object.getOwnPropertyNames(e)) + '```';
    }
    interaction.reply({content: e.slice(0,2000), ephemeral: ephemeral});
}