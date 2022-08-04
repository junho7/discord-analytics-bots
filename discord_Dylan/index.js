const fs = require("node:fs");
const { Client, Collection, Intents, GuildMember, MessageEmbed } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token, bot2_id, communityManagerId } = require("./config.js");

const wait = require('node:timers/promises').setTimeout;
const waitTime = 2000;
const ephmeralSet = true;

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

client.commands = new Collection();
let commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
const rest = new REST({ version: "9" }).setToken(token);

const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));


client.login(token).then((res) => {
  console.log('login')
  // client.guild.me.setNickname("Dylan", "reason");
  client.on("interactionCreate", async (interaction) => {
    console.log('interaction')
    console.log('customId', interaction.customId)
    // interaction.guild.me.setNickname("Dylan", "reason");
    if (!interaction.isButton()) return;
    // await interaction.deferReply();
    const q = ["q1", "q2", "DylanButton"];
    if (q.indexOf(interaction.customId) > -1) {
      switch (interaction.customId) {
        case "DylanButton":
          console.log("DylanButton");
          await interaction.deferReply().catch((err) => {
            console.log("server error", err);
          });
          await wait(waitTime);
          await interaction.editReply({
            content: `Hey there! Welcome to engineering guild, let me get you set up so you are ready to be a part-time contributor for engineering related bounties.`,
            ephemeral: ephmeralSet,
            defaultPermission: false,
          });
          break;
        default:
          break;
      }
    }
  });

const notionLink = {
  url: 'https://www.notion.so/Weekly-Checkpoints-0039397c97e94d43944965dcdef0054d',
  title: 'Notion link',
  description: 'Notion for Co-op Index',
  color: '#0099ff'
}

  client.on("messageCreate", async (message) => {
    if (!message.mentions.users.has(bot2_id) || !message.author.id==communityManagerId) {
      return
    }

    const sendMessageEmbeded = async function(msg, link) {
  
      await message.channel.sendTyping(waitTime);
      await wait(waitTime);
      await message.channel.send({
        content: msg,
        ephemeral: true,
        defaultPermission: false,
        embeds: [link]
      });
  }
    const sendMessage = async function(msg) {
  
      await message.channel.sendTyping(waitTime);
      await wait(waitTime);
      await message.channel.send({
        content: msg,
        ephemeral: true,
        defaultPermission: false,
      });
    // await wait(waitTime);
    // message.channel.send('yo sup');
  }

    const msg1 = 'Hey there! Welcome to engineering guild, let me get you set up so you are ready to be a part-time contributor for engineering related bounties.';
    const msg2 = 'First, join our notion here: ';
    const msg3 = 'You can find engineering type of work on our Notion engineering workspace, and you can apply to take on the tasks to earn $INDEX!';

    sendMessage(msg1);
    sendMessageEmbeded(msg2, notionLink);
    sendMessage(msg3);

  //   if (message.mentions.users.has(bot2_id) && message.author.id==communityManagerId) {
  //       await message.channel.sendTyping(waitTime);
  //       await wait(waitTime);
  //       await message.channel.send({
  //         content: messageContent,
  //         ephemeral: true,
  //         defaultPermission: false
  //       });
  //     await wait(waitTime);
  //     message.channel.send('yo sup');
  // }

  });

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
