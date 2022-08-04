const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const fs = require("node:fs");
const fetch = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { clientId , guildId, bearerToken } = require('../config.js');

const applicationId = clientId;

// const commandId = "969976629742948413" // server command. 

// requires the user that the bearer token belongs to have used applications.commands.permissions.update scope and have manage guild/roles permission
// console.log('url: ', url);

// since Apr 27, 2022, bot can't set permission for application permissions
// how to get bearer token https://stackoverflow.com/questions/72048570/403-error-when-setting-application-command-permissions-on-discord
const token = bearerToken; // replace {token} with what you copied from access_token



const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"))
	.map((item)=>item.replace('.js', ''));

// console.log('commandFiles: ', commandFiles)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('permission')
		.setDescription('Grant permission to role')
    .setDefaultPermission(false)
		.addRoleOption(option => option.setName('role').setRequired(true).setDescription('to show the targeted role\'s tag'))
		.addStringOption(option => {
			option.setName('command')
						.setDescription('Select slash command')
						.setRequired(true)

						commandFiles.forEach((e)=>{option.addChoices({name: e, value: e})})
						return option
						
					})
		.addBooleanOption(option=>option.setName('action').setRequired(true).setDescription('add or remove the permission'))
		,
	async execute(interaction) {

		const client = interaction.client;
		const roleId = interaction.options.getRole('role').id;
		const userInputCommand = interaction.options.get('command');
		const action = interaction.options.get('action').value;
		// const roleId = interaction.options.getRole('role').id;
		console.log('action; ', action)

		const commands = interaction.client.commands;
		const commandsResult = interaction.client.commandsResult;
		// console.log('commands: ', commands)
		// console.log('commandsResult: ', commandsResult)
		const commandId = commandsResult.filter(i=>i.name == userInputCommand.value).map(i=>i.id);
		// console.log('commandId: ', commandId)
		// commandsResult.forEach()

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('role')
					.setLabel('Role')
					.setStyle('PRIMARY'),
			)
			.addComponents(
				new MessageButton()
					.setCustomId('user')
					.setLabel('User')
					.setStyle('PRIMARY'),
			)
			;


		await interaction.deferReply({ ephemeral: true, defaultPermission: false }).catch((err) => {
			console.log('server error', err) 
		});
		
		
		const payload = {
			permissions: [
				{
					id: roleId,
					// id: "969044195232866385", // role/user/channel ID. Test Role 1
					type: 1, // 1 for role, 2 for user, and 3 for channel
					permission: action // whether or not that role/user can use the command or you can use the command in the channel
				}
			] 
		};

		const url = `https://discord.com/api/v9/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions`;
				const res = await fetch(url, {
					method: "PUT",
					body: JSON.stringify(payload),
					headers: {
						Authorization: `${token}`,
						Accept: 'application/json',
					 'Content-Type': 'application/json'
					},
				});
			// console.log('result: ', res);  

		await interaction.editReply({content: `Permission granted`, components: [row], ephemeral: true, defaultPermission: false });

		client.on('interactionCreate', async interaction => {
			if (!interaction.isButton()) return;
			console.log('button: ', interaction);
			await interaction.deferReply();
			await interaction.editReply({content: `Pong! to ${interaction.customId}`, ephemeral: true, defaultPermission: false});
		});
	},
};