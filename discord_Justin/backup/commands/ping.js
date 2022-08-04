const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .addUserOption(option => option.setName('target').setDescription('to show the targeted user\'s tag'))
    // .addRoleOption(option => option.setName('role').setDescription('to show the targeted role\'s tag'))
    ,
  async execute(interaction) {
    const user = interaction.options.getUser('target');
    // const role = interaction.options.getRole('role');
    // console.log('interaction: ', interaction)
    // console.log('user: ', role)
    await interaction.deferReply({ephemeral: true, defaultPermission: false });
    await interaction.editReply({content: `Pong! to ${user}` });
    await interaction.followUp({ content: 'Pong again![Google](https://google.com)', ephemeral: true, defaultPermission: false });
  },
};
