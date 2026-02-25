const { MessageFlags } = require("discord.js");
module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: "Ada error waktu ngejalanin command!", flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: "Ada error waktu ngejalanin command!", flags: MessageFlags.Ephemeral });
            }
        }
    }
}
