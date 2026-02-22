const { SlashCommandBuilder, PermissionsBitField } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban seorang user dari server")
        .addUserOption(option =>
            option.setName("target")
                  .setDescription("User yang akan di-unban")
                  .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("alasan")
                  .setDescription("Alasan unban (opsional)")
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

        try {
            await interaction.guild.bans.remove(target, reason);
            await interaction.reply({ content: `✅ Berhasil unban ${target.tag} dengan alasan: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Gagal unban user", ephemeral: true });
        }
    }
}