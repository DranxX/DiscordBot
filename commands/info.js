const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Menampilkan informasi dalam embed")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(process.env.MODERATOR_ROLE_ID)) {
            return interaction.reply({ content: "❌ Kamu tidak punya izin pakai command ini", ephemeral: true });
        }

        await interaction.deferReply();

        const embed = new EmbedBuilder()
            .setTitle("Informasi Penting")
            .setDescription("Ini adalah contoh embed dengan berbagai fitur")
            .setColor(0x1ABC9C)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail("https://i.imgur.com/AfFp7pu.png")
            .setImage("https://i.imgur.com/wSTFkRM.png")
            .addFields(
                { name: "Field 1", value: "Ini field pertama", inline: true },
                { name: "Field 2", value: "Ini field kedua", inline: true },
                { name: "Field 3", value: "Ini field ketiga", inline: false }
            )
            .setFooter({ text: "Footer text", iconURL: "https://i.imgur.com/AfFp7pu.png" })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], ephemeral: false });
    }
}
