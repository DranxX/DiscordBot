const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require("discord.js");
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
            return interaction.reply({ content: "❌ Kamu tidak punya izin pakai command ini", flags: MessageFlags.Ephemeral });
        }

        const target = interaction.options.getUser("target");
        const duration = interaction.options.getInteger("durasi");
        const reason = interaction.options.getString("alasan") || "Tidak ada alasan";

        if (!target) {
            return interaction.reply({ content: "❌ User tidak ditemukan", flags: MessageFlags.Ephemeral });
        }

        if (target.id === interaction.user.id) {
            return interaction.reply({ content: "❌ Kamu tidak bisa timeout diri sendiri", flags: MessageFlags.Ephemeral });
        }

        if (target.id === process.env.IMMUNE_ADMIN) {
            return interaction.reply({ content: "❌ User tersebut tidak bisa di-timeout", flags: MessageFlags.Ephemeral });
        }

        try {
            const member = await interaction.guild.members.fetch(target.id);
            const timeoutDuration = duration * 60 * 1000; // convert to ms
            await member.timeout(timeoutDuration, reason);
            await interaction.reply({ content: `✅ Berhasil timeout ${target.tag} selama ${duration} menit dengan alasan: ${reason}`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            await interaction.reply({ content: "❌ Gagal timeout user", flags: MessageFlags.Ephemeral });
        }
    }
}