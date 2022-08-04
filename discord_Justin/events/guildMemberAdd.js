// const site = require("../config");
// const axios = require("axios");
// const {
//   Permissions,
//   MessageActionRow,
//   MessageButton,
//   MessageEmbed,
//   Client,
//   Intents,
// } = require("discord.js");

const { execute } = require('../common_commands');

// const wait = require("node:timers/promises").setTimeout;

module.exports = {
  name: "guildMemberAdd",
  once: false,
	execute
};
