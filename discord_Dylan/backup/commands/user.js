const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Replies with user info!'),
	async execute(interaction) {
		
    await interaction.deferReply({ephemeral: true, defaultPermission: false }).catch((err) => {
        console.log('server error', err) 
        });
		await interaction.editReply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	},
};