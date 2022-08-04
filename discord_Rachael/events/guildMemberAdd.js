const site = require("../config");
const axios = require("axios");
const {
  Permissions,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Client,
  Intents,
} = require("discord.js");
const { clientId, guildId, token } = require("../config.js");
const wait = require('node:timers/promises').setTimeout;

const client2 = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

client2.login(token);

module.exports = {
  name: "guildMemberAdd",
  once: false,
  async execute(client, member) {
    const result = await member.guild.channels.create(
      "onboarding " + member.displayName,
      {
        type: 0, // https://discord.com/developers/docs/resources/channel#channel-object-channel-types
        permissionOverwrites: [
          {
            type: "member",
            id: member.user.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
          },
          {
            type: "member",
            id: client.user.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
          },
          {
            type: "role",
            id: member.guild.roles.everyone.id,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
          },
        ],
      }
    );

    const q1button = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("q1")
        .setLabel("How's the community?")
        .setStyle("PRIMARY")
    );

    const q1message = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(`Welcome to Index Co-op`)
      .setDescription(
        "We are diverse community of finance professionals, engineers, DeFi expoerts, content creators, and crypto enthusiasts focused on making crypto investing simple, safe, and accessible."
      );

    const q2button = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("q2")
        .setLabel("Cool!")
        .setStyle("PRIMARY")
    );

    const DylanButton = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("DylanButton")
        .setLabel("Talk to Dylan")
        .setStyle("PRIMARY")
    );

    // const q2message = new MessageEmbed()
    //   .setColor("#0099ff")
    //   .setTitle(`Here at Index co-op, we focus on 3 core Business Principles:`)
    //   .setDescription(
    //     "Product growth: Our products must provide deep value to users\nCommunity autonomy: Empower contributors of different commitment levels\nProtocol sustainability: Ensure the Coop and our products are built to last"
    //   );

		const ephmeralSet = true;
		const waitTime = 2000;

    const channelId = result.id;
    const welcomeMessage = `Hey <@${member.user.id}>!`;
    let messageId = "";
    member.guild.channels.fetch(channelId).then(async (channel) => {
      const result = await channel.send({
        content: welcomeMessage,
        ephemeral: true,
        defaultPermission: false,
        components: [q1button],
        embeds: [q1message],
      });
      console.log("result: ", result);
      messageId = result.id;
    });

    client.on("interactionCreate", async (interaction) => {
      	interaction.guild.me.setNickname('Client 2', 'reason');
      if (!interaction.isButton()) return;
      // await interaction.deferReply();
      const q = ["q1", "q2"];
      if (q.indexOf(interaction.customId) > -1) {
        switch (interaction.customId) {
          // case "q1":
          //   console.log("q1 button clicked");
          //   q1button.components[0].setDisabled(true);

          //   member.guild.channels.fetch(channelId).then(async (channel) => {
          //     const message = await channel.messages.fetch(messageId);
          //     await message.edit({
          //       content: welcomeMessage,
          //       components: [q1button],
          //       embeds: [q1message],
          //       ephemeral: ephmeralSet,
          //       defaultPermission: false,
          //     });
          //   });

					// 	// call q2

          //   // await interaction.editReply({
          //   //   content: `You choose ${interaction.customId}`,
          //   //   // components: [],
          //   //   ephemeral: true,
          //   //   defaultPermission: false,
          //   // });
					// 	await interaction
					// 	.deferReply({ ephemeral: ephmeralSet, defaultPermission: false })
					// 	.catch((err) => {
					// 		console.log("server error", err);
					// 	});
					// // await interaction.editReply({
					// //   content: `You choose ${interaction.customId}`,
					// //   // components: [],
					// //   ephemeral: true,
					// //   defaultPermission: false,
					// // });
					// await wait(waitTime);
					// await interaction.editReply({
					// 	content: `Here at Index co-op, we focus on 3 core Business Principles:`,
					// 	// components: [q2button],
					// 	// embeds: [q2message],
					// 	ephemeral: ephmeralSet,
					// 	defaultPermission: false,
					// });
					// await wait(waitTime);
					// await interaction.followUp({
					// 	content: `Product growth: Our products must provide deep value to users`,
					// 	// components: [q2button],
					// 	// embeds: [q2message],
					// 	ephemeral: ephmeralSet,
					// 	defaultPermission: false,
					// });
					// await wait(waitTime);
					// await interaction.followUp({
					// 	content: `Community autonomy: Empower contributors of different commitment levels`,
					// 	// components: [q2button],
					// 	// embeds: [q2message],
					// 	ephemeral: ephmeralSet,
					// 	defaultPermission: false,
					// });
					// await wait(waitTime);
					// await interaction.followUp({
					// 	content: `Protocol sustainability: Ensure the Coop and our products are built to last`,
					// 	// components: [q2button],
					// 	// embeds: [q2message],
					// 	ephemeral: ephmeralSet,
					// 	defaultPermission: false,
					// });
					// await wait(waitTime);
					// await interaction.followUp({
					// 	// content: ``,
					// 	components: [q2button],
					// 	// embeds: [q2message],
					// 	ephemeral: ephmeralSet,
					// 	defaultPermission: false,
					// });
          //   break;
					case 'q2':
						await interaction
						.deferReply({ ephemeral: true, defaultPermission: false })
						.catch((err) => {
							console.log("server error", err);
						});
					// await interaction.editReply({
					//   content: `You choose ${interaction.customId}`,
					//   // components: [],
					//   ephemeral: true,
					//   defaultPermission: false,
					// });
					await interaction.editReply({
						content: `Sweet! Let me introduce you to Dylan from the Engineering guild, he will walk you through the process.`,
						// components: [q2button],
						// embeds: [q2message],
						ephemeral: ephmeralSet,
						defaultPermission: false,
					});
					await interaction.followUp({
						// content: ``,
						components: [DylanButton],
						// embeds: [q2message],
						ephemeral: ephmeralSet,
						defaultPermission: false,
					});
          break;

          case 'DylanButton':
            case 'DylanButton':
              console.log('DylanButton');
              await interaction
              .deferReply()
              .catch((err) => {
                console.log("server error", err);
              });
              await wait(waitTime);
              await interaction.editReply({content: `Hey there! Welcome to engineering guild, let me get you set up so you are ready to be a part-time contributor for engineering related bounties.`, ephemeral: ephmeralSet, defaultPermission: false });
              break;
          default:
            break;
        }
      }
    });

    // client2.on("interactionCreate", async (interaction) => {
		// 	console.log('interaction in client2: ', interaction)
			
		// 	//this works but all the other instance and all the past messages are affected
		// 	interaction.guild.me.setNickname('Client 2', 'reason');

    //   if (!interaction.isButton()) return;
		// 	switch(interaction.customId) {
		// 		case 'DylanButton':
		// 			console.log('DylanButton');
		// 			await interaction
		// 			.deferReply()
		// 			.catch((err) => {
		// 				console.log("server error", err);
		// 			});
		// 			await wait(waitTime);
		// 			await interaction.editReply({content: `Hey there! Welcome to engineering guild, let me get you set up so you are ready to be a part-time contributor for engineering related bounties.`, ephemeral: ephmeralSet, defaultPermission: false });
		// 			break;
		// 		default:
		// 			break;
		// 	}
		// });

    return member;
  },
};
