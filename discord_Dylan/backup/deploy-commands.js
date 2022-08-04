const fs = require('node:fs');
// const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.js');

// const token = process.env.token
// const clientId = process.env.clientId
// const guildId = process.env.guildId

const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	console.log('command: ', command.data.options)
	commands.push(command.data.toJSON());
}
// const commands = [
// 	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
// 	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
// 	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
// ]
// 	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
// 	.then(() => console.log('Successfully registered application commands.'))
// 	.catch(console.error);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		const result = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.', result);
	} catch (error) {
		console.error(error);
	}
})();