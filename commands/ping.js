const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Cek bot respons"),
    async execute(interaction) {
        await interaction.reply("Pong!");
    }
}
