const fs = require("node:fs");
const { Client, Collection, Intents } = require("discord.js");

// const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

module.exports = {
  name: "interactionCreate",
  async execute(client, interaction) {
    // console.log('interaction in interactionCreate: ', interaction)
    // console.log(
    //   `${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`
    // );

    // const client = interaction.client;

//     client.commands = new Collection();
//     const commandFiles = fs
//       .readdirSync("./commands")
//       .filter((file) => file.endsWith(".js"));

//     for (const file of commandFiles) {
//       const command = require(`../commands/${file}`);
//       // Set a new item in the Collection
//       // With the key as the command name and the value as the exported module
      
//       client.commands.set(command.data.name, command);
//     }

    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    // console.log('interaction: ', interaction.commandId)
    // console.log('interaction: ', interaction)
    // console.log('commands: ', client.commands)
    // console.log('command: ', command.data)
    // const command = client.commands.filter((e)=>{e.id == interaction.commandId});

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
