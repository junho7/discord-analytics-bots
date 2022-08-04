const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Replies with server info!')
    .setDefaultPermission(false),
	async execute(interaction) {
		
    await interaction.deferReply({ephemeral: true, defaultPermission: false }).catch((err) => {
        console.log('server error', err) 
        });
		await interaction.editReply({content: `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`});
	},
};