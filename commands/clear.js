const { SlashCommandBuilder, PermissionsBitField } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Hapus sejumlah pesan")
        .addIntegerOption(option =>
            option.setName("jumlah")
                  .setDescription("Jumlah pesan (1-100)")
                  .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(process.env.MODERATOR_ROLE_ID)) {
            return interaction.reply({ content: "❌ Kamu tidak punya izin pakai command ini", ephemeral: true });
        }

        const amount = interaction.options.getInteger("jumlah");
        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: "Jumlah harus antara 1 sampai 100", ephemeral: true });
        }

        const messages = await interaction.channel.messages.fetch({ limit: amount });
        await interaction.channel.bulkDelete(messages, true);
        await interaction.reply({ content: `✅ Berhasil menghapus ${messages.size} pesan`, ephemeral: true });
    }
}
