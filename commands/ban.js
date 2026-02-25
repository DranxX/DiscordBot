const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
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
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!interaction.member.roles.cache.has(process.env.MODERATOR_ROLE_ID)) {
            return interaction.editReply({ content: "❌ Kamu tidak punya izin pakai command ini" });
        }
        const target = interaction.options.getUser("target");
        const reason = interaction.options.getString("alasan") || "Tidak ada alasan";
        if (!target) {
            return interaction.editReply({ content: "❌ User tidak ditemukan" });
        }
        if (target.id === interaction.user.id) {
            return interaction.editReply({ content: "❌ Kamu tidak bisa ban diri sendiri" });
        }
        try {
            const banEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("🔨 Kamu telah di-ban")
                .addFields(
                    { name: "Server", value: interaction.guild.name },
                    { name: "Alasan", value: reason },
                    { name: "Moderator", value: interaction.user.tag }
                )
                .setTimestamp();

            await target.send({ embeds: [banEmbed] }).catch(() => null);
            await interaction.guild.members.ban(target, { reason });
            await interaction.editReply({ content: `✅ Berhasil ban ${target.tag} dengan alasan: ${reason}` });
        } catch (error) {
            await interaction.editReply({ content: "❌ Gagal ban user" });
        }
    }
}