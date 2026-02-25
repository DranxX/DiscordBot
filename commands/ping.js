const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const os = require("os");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Cek bot respons"),
    async execute(interaction) {
        const before = Date.now();
        const { resource } = await interaction.reply({ content: "Pinging...", withResponse: true });
        const sent = resource.message;
        const after = Date.now();

        const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = after - before;

        const cpuModel = os.cpus()[0].model;
        const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedRam = (totalRam - freeRam).toFixed(2);
        const platform = os.platform();
        const uptime = process.uptime();
        const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

        const getStatus = (ms) => {
            if (ms < 100) return "🟢 Excellent";
            if (ms < 200) return "🟡 Good";
            if (ms < 400) return "🟠 Moderate";
            return "🔴 Poor";
        };

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("🏓 Pong!")
            .addFields(
                { name: "Bot Latency", value: `\`${botLatency}ms\` ${getStatus(botLatency)}`, inline: true },
                { name: "API Latency", value: `\`${apiLatency}ms\` ${getStatus(apiLatency)}`, inline: true },
                { name: "CPU", value: `\`${cpuModel}\``, inline: false },
                { name: "RAM", value: `\`${usedRam}GB / ${totalRam}GB\``, inline: true },
                { name: "Platform", value: `\`${platform}\``, inline: true },
                { name: "Uptime", value: `\`${uptimeFormatted}\``, inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    }
}