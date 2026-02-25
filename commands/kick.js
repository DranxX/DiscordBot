const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
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
            return interaction.editReply({ content: "❌ Kamu tidak bisa kick diri sendiri" });
        }

        try {
            const kickEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle("👢 Kamu telah di-kick")
                .addFields(
                    { name: "Server", value: interaction.guild.name },
                    { name: "Alasan", value: reason },
                    { name: "Moderator", value: interaction.user.tag }
                )
                .setTimestamp();

            const member = await interaction.guild.members.fetch(target.id);
            await target.send({ embeds: [kickEmbed] }).catch(() => null);
            await member.kick(reason);
            await interaction.editReply({ content: `✅ Berhasil kick ${target.tag} dengan alasan: ${reason}` });
        } catch (error) {
            await interaction.editReply({ content: "❌ Gagal kick user" });
        }
    }
}