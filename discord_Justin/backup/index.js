const fs = require("node:fs");
const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token } = require("./config.js");

// const site = require('./config.js');

// const token = process.env.token
// const token = site.token;

// Create a new client instance
// const client = new Client({ intents: [Intents.FLAGS] });
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.commands = new Collection();
let commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
const rest = new REST({ version: "9" }).setToken(token);

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  // console.log('command.data: ', command.data)
  // client.commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    const result = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    client.commandsResult = result;
    // commands.push(command.data.toJSON());
    // client.commands = result;

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    console.log('event.name: ', event.name)
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// When the client is ready, run this code (only once)
// client.once('ready', () => {
// 	console.log('Ready!');
// });

// client.on('interactionCreate', async interaction => {

//     // console.log('interactionCreate: ', interaction)
//     console.log('interactionCreate: ', interaction.isCommand())
//     if (!interaction.isCommand()) return;

//     	const command = client.commands.get(interaction.commandName);

// 	if (!command) return;

// 	try {
// 		await command.execute(interaction);
// 	} catch (error) {
// 		console.error(error);
// 		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
// 	}

//     const { commandName } = interaction;

//     if (commandName === 'ping') {
//       console.log('ping')
//       await interaction.reply('Pong!').catch((err) => {
//            console.log('pong error', err)
//         });
// //       await interaction.deferReply();

// // 		  await interaction.editReply('Pong!');
//     }
//     else if (commandName === 'server') {
//       console.log('server')
//       await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`).catch((err) => {
//         console.log('server error', err)
//         });
//     }
//     else if (commandName === 'user') {
//       console.log('user')
//       await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`).catch((err) => {
//            console.log('user error', err)
//         });
//     }
//   } catch (error) {
//     console.log(error)
//   }
// });

// Login to Discord with your client's token

client.login(token).then((res) => {
  // console.log('client index1: ', client.application);
});

// const token = process.env.token
// const clientId = process.env.clientId
// const guildId = process.env.guildId

// const commands = [
// 	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
// 	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
// 	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
// ]
// 	.map(command => command.toJSON());

// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
// 	.then(() => console.log('Successfully registered application commands.'))
// 	.catch(console.error);
