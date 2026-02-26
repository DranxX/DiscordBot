const fs = require("fs");
require('dotenv').config();
const { Client, Collection, GatewayIntentBits, REST, Routes, ActivityType } = require("discord.js");
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
const commands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
    } catch (error) { }
})();

const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.updatePresence = (guild) => {
    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(m => m.presence?.status === "online" || m.presence?.status === "dnd" || m.presence?.status === "idle").size;

    client.user.setPresence({
        activities: [{ name: `Monitoring`, type: ActivityType.Watching, state: `『 ${onlineMembers}/${totalMembers} 』Members Online` }],
        status: "online"
    });
};

let presenceUpdateTimeout = null;

client.on("presenceUpdate", () => {
    if (presenceUpdateTimeout) return;
    presenceUpdateTimeout = setTimeout(() => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) client.updatePresence(guild);
        presenceUpdateTimeout = null;
    }, 10000);
});

client.on("guildMemberAdd", () => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) client.updatePresence(guild);
});

client.on("guildMemberRemove", () => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) client.updatePresence(guild);
});

client.on("error", () => { });

// just for replit uptime

const os = require("os");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Bot is alive!");
});

app.listen(port, () => {
    const networkInterfaces = os.networkInterfaces();
    console.log(`Web server is running on port ${port}`);
    for (const iface of Object.values(networkInterfaces)) {
        for (const alias of iface) {
            if (alias.family === "IPv4" && !alias.internal) {
                console.log(`Local IP: http://${alias.address}:${port}`);
            }
        }
    }
    console.log(`Hostname: ${os.hostname()}`);
});

client.login(token);
