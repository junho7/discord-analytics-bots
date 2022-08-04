const site = require("./config");
const axios = require("axios");
const {
  Permissions,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Client,
  Intents,
} = require("discord.js");

const wait = require("node:timers/promises").setTimeout;

module.exports = {

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

  const buttonMaker = function (option) {
    return new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(option.customId)
        .setLabel(option.label)
        .setStyle("PRIMARY")
    );
  };

  const q1Option = {
    customId: "q1",
    label: "How's the community?",
  };

  const q1button = buttonMaker(q1Option);

  const q1message = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(`Welcome to Index Co-op`)
    .setDescription(
      "We are diverse community of finance professionals, engineers, DeFi expoerts, content creators, and crypto enthusiasts focused on making crypto investing simple, safe, and accessible."
    );



  const dylanOption = {
    customId: "DylanButton",
    label: "Talk to Dylan",
  };
  const DylanButton = buttonMaker(dylanOption);

  const ephmeralSet = false;
  const waitTime = 1000;

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

  const messageMaker = async (message) => {
    return member.guild.channels.fetch(channelId).then(async (channel) => {
      await channel.sendTyping(waitTime);
      await wait(waitTime);
      const result = await channel.send({
        content: message,
        ephemeral: true,
        defaultPermission: false,
      });
    });
  };

  client.on("interactionCreate", async (interaction) => {
    console.log('customId: ', interaction.customId)
    if (!interaction.isButton()) return;
    const q = ['q1', 'q2', 'q3', 'q4', 'contributor', 'invest', 'looking around', 'engineering', 'finance', 'marketing', 'community management', 'DylanButton'];
    if (q.indexOf(interaction.customId) > -1) {
      switch (interaction.customId) {
        case "q1":
          // q1button.components[0].setDisabled(true);

          member.guild.channels.fetch(channelId).then(async (channel) => {
            const message = await channel.messages.fetch(messageId);
            await message.edit({
              content: welcomeMessage,
              components: [q1button],
              embeds: [q1message],
              ephemeral: ephmeralSet,
              defaultPermission: false,
            });
          });

          await interaction
            .deferReply({ ephemeral: ephmeralSet, defaultPermission: false })
            .catch((err) => {
              console.log("server error", err);
            });
          await wait(waitTime);
          await interaction.editReply({
            content: `Here at Index co-op, we focus on 3 core Business Principles:`,
            ephemeral: ephmeralSet,
            defaultPermission: false,
          });

          await messageMaker(
            "Product growth: Our products must provide deep value to users"
          );
          await messageMaker(
            "Community autonomy: Empower contributors of different commitment levels"
          );
          await messageMaker(
            "Protocol sustainability: Ensure the Coop and our products are built to last"
          );

          const q2Option = {
            customId: "q2",
            label: "Cool!",
          };
          const q2button = buttonMaker(q2Option);

          member.guild.channels.fetch(channelId).then(async (channel) => {
            const result = await channel.send({
              ephemeral: true,
              defaultPermission: false,
              components: [q2button],
            });
          });


          break;
        case "q2":
          await interaction
            .deferReply({ ephemeral: true, defaultPermission: false })
            .catch((err) => {
              console.log("server error", err);
            });
          await wait(waitTime);

          const q3Option = {
            customId: "q3",
            label: "That's awesome!",
          };
          const q3button = buttonMaker(q3Option);

          await interaction.editReply({
            content: `Contributors should feel they are part of something they are proud of and passionate about. Everyone needs to feel they can communicate openly without judgment or attack. Through building common understanding, we arrive at solutions that address all concerns and work towards our shared goal.`,
            ephemeral: ephmeralSet,
            defaultPermission: false,
            components: [q3button],
          });
          break;
        case "q3":
          await interaction
            .deferReply({ ephemeral: true, defaultPermission: false })
            .catch((err) => {
              console.log("server error", err);
            });
          await wait(waitTime);

          const q4Option = {
            customId: "q4",
            label: "Can't wait to get started!",
          };
          const q4button = buttonMaker(q4Option);

          await interaction.editReply({
            content: `We value growing as individuals, as a cooperative, and as a community. We respectfully challenge each other and our assumptions, constantly searching for new areas to grow, whatever “grow” might mean. We recognize that the world is dynamic and constantly changes - thus we collectively need to adapt and change too.`,
            ephemeral: ephmeralSet,
            defaultPermission: false,
            components: [q4button],
          });
          break;
        case "q4":
          await interaction
            .deferReply({ ephemeral: true, defaultPermission: false })
            .catch((err) => {
              console.log("server error", err);
            });
          await wait(waitTime);

          const q5button = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('contributor')
              .setLabel('I want to be a part-time contributor')
              .setStyle("PRIMARY")
            )
          .addComponents(
            new MessageButton()
              .setCustomId('invest')
              .setLabel('I want to invest in index')
              .setStyle("PRIMARY")
            )
          .addComponents(
            new MessageButton()
              .setCustomId('looking around')
              .setLabel('I am just looking around')
              .setStyle("PRIMARY")
            )
            ;

          await interaction.editReply({
            content: `Great! So what are you looking for here?`,
            ephemeral: ephmeralSet,
            defaultPermission: false,
            components: [q5button],
          });
          break;


        case "contributor":
          console.log('conributor')


        

            const q6button = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setCustomId('engineering')
                .setLabel('Engineering')
                .setStyle("PRIMARY")
              )
            .addComponents(
              new MessageButton()
                .setCustomId('finance')
                .setLabel('Finance')
                .setStyle("PRIMARY")
              )
            .addComponents(
              new MessageButton()
                .setCustomId('marketing')
                .setLabel('Marketing')
                .setStyle("PRIMARY")
              )
            .addComponents(
              new MessageButton()
                .setCustomId('community management')
                .setLabel('Community Management')
                .setStyle("PRIMARY")
              )
              ;
              await interaction
                .deferReply({ ephemeral: true, defaultPermission: false })
                .catch((err) => {
                  console.log("server error", err);
                });
                await wait(waitTime);
              await interaction.editReply({
                content: `Glad to have another fellow contributor building our product!`,
                ephemeral: ephmeralSet,
                defaultPermission: false,
                // components: [q6button],
              });

              await messageMaker(
                "Most DAO members work part-time and instead of a fixed salary are compensated based on the contributions they make that month to their Nest or Pod's goals. Some examples would be completing items from a bounty board, engaging with a team on a long-term project, or promoting Index Coop products to new audiences."
                );
              // await messageMaker(
              // 	"What skillsets do you have?"
              // 	);
                member.guild.channels.fetch(channelId).then(async (channel) => {
                  const result = await channel.send({
                    content: 'What skillsets do you have?',
                    ephemeral: true,
                    defaultPermission: false,
                    components: [q6button],
                  });
                });
    
          break;
        case "engineering":
          await interaction
            .deferReply({ ephemeral: true, defaultPermission: false })
            .catch((err) => {
              console.log("server error", err);
            });
          await wait(waitTime);
          await interaction.editReply({
            content: `Sweet! Let me introduce you to Dylan from the Engineering guild, he will walk you through the process.`,
            ephemeral: ephmeralSet,
            defaultPermission: false,
            components: [DylanButton],
          });
          break;

        case "DylanButton":
          console.log("DylanButton clicked");

          interaction.deferUpdate();

          member.guild.channels.fetch(channelId).then(async (channel) => {
            await channel.sendTyping(waitTime);
            await wait(waitTime);
            const result = await channel.send({
              content: `Let me introduce <@${site.dylan_id}>`,
              ephemeral: true,
              defaultPermission: false,
            });
          });

          break;
          case 'looking around':
          case 'invest':
            case 'marketing':
              case 'community management':
        case "finance":
          console.log("RachaelButton clicked");

          interaction.deferUpdate();

          member.guild.channels.fetch(channelId).then(async (channel) => {
            await channel.sendTyping(waitTime);
            await wait(waitTime);
            const result = await channel.send({
              content: `Let me introduce <@${site.rachael_id}>`,
              ephemeral: true,
              defaultPermission: false,
            });
          });

          break;
        default:
          break;
      }
    }
  });

  // client2.on("interactionCreate", async (interaction) => {
  // 	console.log('interaction in client2: ', interaction)

  // 	//this works but all the other instance and all the past messages are affected
  // 	// interaction.guild.me.setNickname('Dylan', 'reason');

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
}

}