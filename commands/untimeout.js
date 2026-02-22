const { SlashCommandBuilder, PermissionsBitField } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("untimeout")
        .setDescription("Hapus timeout seorang user")
        .addUserOption(option =>
            option.setName("target")
                  .setDescription("User yang timeout-nya akan dihapus")
                  .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(process.env.MODERATOR_ROLE_ID)) {
            return interaction.reply({ content: "❌ Kamu tidak punya izin pakai command ini", ephemeral: true });
        }

        const target = interaction.options.getUser("target");

        if (!target) {
            return interaction.reply({ content: "❌ User tidak ditemukan", ephemeral: true });
        }

        try {
            const member = await interaction.guild.members.fetch(target.id);
            await member.timeout(null);
            await interaction.reply({ content: `✅ Berhasil hapus timeout ${target.tag}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Gagal hapus timeout user", ephemeral: true });
        }
    }
}