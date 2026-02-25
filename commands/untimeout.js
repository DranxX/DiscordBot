const { SlashCommandBuilder, MessageFlags } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("untimeout")
        .setDescription("Hapus timeout seorang user")
        .addUserOption(option =>
            option.setName("target")
                .setDescription("User yang timeout-nya akan dihapus")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(0)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(process.env.MODERATOR_ROLE_ID)) {
            return interaction.reply({ content: "❌ Kamu tidak punya izin pakai command ini", flags: MessageFlags.Ephemeral });
        }

        const target = interaction.options.getUser("target");

        if (!target) {
            return interaction.reply({ content: "❌ User tidak ditemukan", flags: MessageFlags.Ephemeral });
        }

        try {
            const member = await interaction.guild.members.fetch(target.id);
            await member.timeout(null);
            await interaction.reply({ content: `✅ Berhasil hapus timeout ${target.tag}`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            await interaction.reply({ content: "❌ Gagal hapus timeout user", flags: MessageFlags.Ephemeral });
        }
    }
}