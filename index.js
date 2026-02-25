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
    await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
    );
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

const updatePresence = (guild) => {
    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(m => m.presence?.status === "online" || m.presence?.status === "dnd" || m.presence?.status === "idle").size;

    client.user.setPresence({
        activities: [{ name: `『 ${onlineMembers}/${totalMembers} 』Members Online`, type: ActivityType.Watching }],
        status: "online"
    });
};

client.once("clientReady", async () => {
    const guild = await client.guilds.fetch(guildId);
    await guild.members.fetch();
    updatePresence(guild);
});

client.on("presenceUpdate", async (oldPresence, newPresence) => {
    const guild = await client.guilds.fetch(guildId);
    updatePresence(guild);
});

client.on("guildMemberAdd", async (member) => {
    const guild = await client.guilds.fetch(guildId);
    updatePresence(guild);
});

client.on("guildMemberRemove", async (member) => {
    const guild = await client.guilds.fetch(guildId);
    updatePresence(guild);
});

client.login(token);