const { SlashCommandBuilder, PermissionsBitField } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick seorang user dari server")
        .addUserOption(option =>
            option.setName("target")
                  .setDescription("User yang akan di-kick")
                  .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("alasan")
                  .setDescription("Alasan kick (opsional)")
                  .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
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
            return interaction.reply({ content: "❌ Kamu tidak bisa kick diri sendiri", ephemeral: true });
        }

        try {
            const member = await interaction.guild.members.fetch(target.id);
            await member.kick(reason);
            await interaction.reply({ content: `✅ Berhasil kick ${target.tag} dengan alasan: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Gagal kick user", ephemeral: true });
        }
    }
}