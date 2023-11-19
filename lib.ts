import { BaseInteraction, Channel, Guild } from "discord.js";

export async function getmessage(interaction : BaseInteraction, guildid : string, channelid : string, messageid : string) {
    const guild = (guildid == '@me')? null : await interaction.client.guilds.fetch(guildid);
    const channel = guild? await guild.channels.fetch(channelid) : await interaction.client.channels.fetch(channelid);
    if (channel === null || !("messages" in channel)) throw "Not a valid channel";
    const message = await channel.messages.fetch(messageid);
    return message;
}