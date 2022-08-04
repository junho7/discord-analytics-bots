const fs = require("node:fs");
const { Client, Collection, Intents, GuildMember } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token } = require("./config.js");

// const site = require('./config.js');

// const token = process.env.token
// const token = site.token;

// Create a new client instance
// const client = new Client({ intents: [Intents.FLAGS] });
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
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
    client.on(event.name, (...args) => event.execute(client, ...args));
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
  // console.log('client index1: ', client);

  // const test_member = {"guildId":"967613856480362547","joinedTimestamp":1651618173736,"premiumSinceTimestamp":null,"nickname":null,"pending":true,"communicationDisabledUntilTimestamp":null,"userId":"968257565295259748","avatar":null,"displayName":"9D04","roles":["967613856480362547"],"avatarURL":null,"displayAvatarURL":"https://cdn.discordapp.com/embed/avatars/0.png"}
  // let test_member = new GuildMember()
  // test_member.guild = {id: '967613856480362547'}
  // test_member.user =  {
  //   id: '968257565295259748',
  //   bot: false,
  //   system: false,
  //   // flags: UserFlags { bitfield: 0 },
  //   username: '9D04',
  //   discriminator: '5915',
  //   avatar: null,
  //   banner: undefined,
  //   accentColor: undefined
  // },
  // console.log('test: ', test_member)


  
  // client.on('guildMemberAdd', function(member){
  //   console.log('guildMemberAdd triggered')
  //   // member.guild.channels.get("put-channel-id-here").send("Hello there!")
  // });
  // setTimeout(()=>
  //   client.emit('guildMemberAdd', test_member)
  //   , "1000"
  // )
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
