const { SlashCommandBuilder, PermissionsBitField } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban seorang user dari server")
        .addUserOption(option =>
            option.setName("target")
                  .setDescription("User yang akan di-ban")
                  .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("alasan")
                  .setDescription("Alasan ban (opsional)")
                  .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(process.env.MODERATOR_ROLE_ID)) {
            return interaction.reply({ content: "❌ Kamu tidak punya izin pakai command ini", ephemeral: true });
        }

        const target = interaction.options.getUser("target");
        const reason = interaction.options.getString("alasan") || "Tidak ada alasan";

        if (!target) {
            return interaction.reply({ content: "❌ User tidak ditemukan", ephemeral: true });
        }

        if (target.id === interaction.user.id) {
            return interaction.reply({ content: "❌ Kamu tidak bisa ban diri sendiri", ephemeral: true });
        }

        try {
            await interaction.guild.members.ban(target, { reason });
            await interaction.reply({ content: `✅ Berhasil ban ${target.tag} dengan alasan: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Gagal ban user", ephemeral: true });
        }
    }
}