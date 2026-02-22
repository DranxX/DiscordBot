const { SlashCommandBuilder, PermissionsBitField } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Timeout seorang user")
        .addUserOption(option =>
            option.setName("target")
                  .setDescription("User yang akan di-timeout")
                  .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("durasi")
                  .setDescription("Durasi timeout dalam menit (1-40320)")
                  .setRequired(true)
                  .setMinValue(1)
                  .setMaxValue(40320)
        )
        .addStringOption(option =>
            option.setName("alasan")
                  .setDescription("Alasan timeout (opsional)")
                  .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(process.env.MODERATOR_ROLE_ID)) {
            return interaction.reply({ content: "❌ Kamu tidak punya izin pakai command ini", ephemeral: true });
        }

        const target = interaction.options.getUser("target");
        const duration = interaction.options.getInteger("durasi");
        const reason = interaction.options.getString("alasan") || "Tidak ada alasan";

        if (!target) {
            return interaction.reply({ content: "❌ User tidak ditemukan", ephemeral: true });
        }

        if (target.id === interaction.user.id) {
            return interaction.reply({ content: "❌ Kamu tidak bisa timeout diri sendiri", ephemeral: true });
        }

        try {
            const member = await interaction.guild.members.fetch(target.id);
            const timeoutDuration = duration * 60 * 1000; // convert to ms
            await member.timeout(timeoutDuration, reason);
            await interaction.reply({ content: `✅ Berhasil timeout ${target.tag} selama ${duration} menit dengan alasan: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Gagal timeout user", ephemeral: true });
        }
    }
}