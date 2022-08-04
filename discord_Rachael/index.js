const fs = require("node:fs");
const {
  Client,
  Collection,
  Intents,
  Permissions,
  GuildMember,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const {
  clientId,
  guildId,
  token,
  bot_id,
  communityManagerId,
} = require("./config.js");
const wait = require("node:timers/promises").setTimeout;
const waitTime = 2000;
const ephmeralSet = true;


const buttonMaker = function (option) {
  return new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId(option.customId)
      .setLabel(option.label)
      .setStyle("PRIMARY")
  );
};

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES
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
  console.log("login");
  // client.guild.me.setNickname("Dylan", "reason");
  // client.on("interactionCreate", async (interaction) => {
  //   console.log('interaction')
  //   console.log('customId', interaction.customId)
  //   // interaction.guild.me.setNickname("Dylan", "reason");
  //   if (!interaction.isButton()) return;
  //   // await interaction.deferReply();
  //   const q = ["q1", "q2", "DylanButton"];
  //   if (q.indexOf(interaction.customId) > -1) {
  //     switch (interaction.customId) {
  //       case "DylanButton":
  //         console.log("DylanButton");
  //         await interaction.deferReply().catch((err) => {
  //           console.log("server error", err);
  //         });
  //         await wait(waitTime);
  //         await interaction.editReply({
  //           content: `Hey there! Welcome to engineering guild, let me get you set up so you are ready to be a part-time contributor for engineering related bounties.`,
  //           ephemeral: ephmeralSet,
  //           defaultPermission: false,
  //         });
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  // });

  const notionLink = {
    url: "https://www.notion.so/Weekly-Checkpoints-0039397c97e94d43944965dcdef0054d",
    title: "Notion link",
    description: "Notion for Co-op Index",
    color: "#0099ff",
  };

  let newMemberId = "";
  let onboardChannelId = "";
  let userInputName;
  let askNameTimestamp;
  let userInputIntroduction;
  let askIntroductionTimestamp;
  let userInputLanguage;
  let askLanguageTimestamp;
  

  client.on("messageCreate", async (message) => {
    // console.log('message: ', message)
    console.log('message: ', message.member.presence.clientStatus)
    // const presence = message.guild.members.cache;
    // const presence = message.guild.members.cache.filter(member => member.presence?.status === "online");
  // console.log(presence);
    console.log('mmm: ', message.channelId)
    console.log('mmm: ', onboardChannelId)
    console.log('mmm: ', message.channelId == onboardChannelId)
    console.log('mmm: ', message.author.id == newMemberId)
    console.log('yyy: ', !userInputName)
    console.log('yyy: ', message.createdTimestamp > askNameTimestamp)
    if (
      message.mentions.users.has(bot_id) &&
      message.author.id == communityManagerId
    ) {
      
      onboardChannelId = message.channelId;

      const sendMessageEmbeded = async function (msg, link) {
        await message.channel.sendTyping(waitTime);
        await wait(waitTime);
        await message.channel.send({
          content: msg,
          ephemeral: true,
          defaultPermission: false,
          embeds: [link],
        });
      };
      const sendMessage = async function (msg) {
        await message.channel.sendTyping(waitTime);
        await wait(waitTime);
        await message.channel.send({
          content: msg,
          ephemeral: true,
          defaultPermission: false,
        });
        // await wait(waitTime);
        // message.channel.send('yo sup');
      };

      const msg1 =
        "Hey! This is Rachael from the Index Council and Governance team, I want to walk you through our structure as an organization.";
      const msg2 =
        "We do not have a CEO or Board of Directors. Our community is led by a loosely defined group of core contributors. DAO members vote periodically on a rotating group of senior contributors that make up the Index Council, Nest, and Pod leadership.";


      sendMessage(msg1);
      await message.channel.sendTyping(waitTime);
      await wait(waitTime);

      const q1Option = {
        customId: "rachael_q1",
        label: "That's fascinating! How do I participate as a member?",
      };

      const q1button = buttonMaker(q1Option);

      await message.channel.send({
        content: msg2,
        ephemeral: true,
        defaultPermission: false,
        components: [q1button],
      });

  
    } else if (message.channelId == onboardChannelId && message.author.id == newMemberId ) {
      
      console.log('User input: ', message.content)
      
      if(!userInputName &&  message.createdTimestamp > askNameTimestamp) {
        userInputName = message.content;
      // const confirmNameOption = {
      //   customId: "rachael_confirm_name",
      //   label: `${userInputName}, Is it your name?`,
      // };

      // const confirmNamebutton = buttonMaker(confirmNameOption);

      const confirmNamebutton = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('nameConfirmYes')
            .setLabel('Yes')
            .setStyle("PRIMARY")
        )
        .addComponents(
          new MessageButton()
            .setCustomId('nameConfirmNo')
            .setLabel('No')
            .setStyle("PRIMARY")
        )
        ;

      await message.channel.send({
        content: `${userInputName}, is it your name?`,
        ephemeral: true,
        defaultPermission: false,
        components: [confirmNamebutton],
      });
      
    }
      else if(!userInputIntroduction &&  message.createdTimestamp > askIntroductionTimestamp) {
        userInputIntroduction = message.content;
      // const confirmNameOption = {
      //   customId: "rachael_confirm_name",
      //   label: `${userInputName}, Is it your name?`,
      // };

      // const confirmNamebutton = buttonMaker(confirmNameOption);

      const confirmIntroductionButton = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('introductionConfirmYes')
            .setLabel('Yes')
            .setStyle("PRIMARY")
        )
        .addComponents(
          new MessageButton()
            .setCustomId('introductionConfirmNo')
            .setLabel('No')
            .setStyle("PRIMARY")
        )
        ;

      await message.channel.send({
        content: `${userInputIntroduction}, is it correct?`,
        ephemeral: true,
        defaultPermission: false,
        components: [confirmIntroductionButton],
      });
      
    }
    else if(!userInputLanguage &&  message.createdTimestamp > askLanguageTimestamp) {
      userInputLanguage = message.content;

      const confirmLanguageButton = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('languageConfirmYes')
          .setLabel('Yes')
          .setStyle("PRIMARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId('languageConfirmNo')
          .setLabel('No')
          .setStyle("PRIMARY")
      )
      ;

    await message.channel.send({
      content: `${userInputLanguage}, is it correct?`,
      ephemeral: true,
      defaultPermission: false,
      components: [confirmLanguageButton],
    });
    }
    } else {
      return;
    }
  });

  const initiateConversation = async (interaction) => {
    console.log('interaction: ', interaction)
    if (!interaction.isButton()) return;

    newMemberId = interaction.user.id;
    // onboardChannelId = message.channelId;

    const q = ['rachael_q1', 'rachael_q2', 'nameConfirmYes', 'nameConfirmNo', 'introductionConfirmYes', 'introductionConfirmNo', 'languageConfirmYes', 'languageConfirmNo'];
    if (q.indexOf(interaction.customId) > -1) {
      switch (interaction.customId) {
        case "rachael_q1":
          console.log("rachael_q1");

          await interaction
            .deferReply({
              ephemeral: ephmeralSet,
              defaultPermission: false,
            })
            .catch((err) => {
              console.log("server error", err);
            });
          await wait(waitTime);
          await interaction.editReply({
            content: `Most Index Coop DAO decisions can start with a contributor from within the $Index holding community submitting an Improvement Proposals (called IIPs). These are first shared on the Index Forums for community awareness and discussion and eventually make their way to a final on-chain, token holder vote using Snapshot.`,
            ephemeral: ephmeralSet,
            defaultPermission: false,
          });

          const q2Option = {
            customId: "rachael_q2",
            label: "Great! I will check it out. Anything else?",
          };

          const q2button = buttonMaker(q2Option);

          await interaction.message.channel.send({
            content:
              "You can see a history of our proposals here: https://snapshot.org/#/index-coop.eth",
            ephemeral: true,
            defaultPermission: false,
            components: [q2button],
          });
          break;
        case "rachael_q2":
          await interaction
            .deferReply({
              ephemeral: ephmeralSet,
              defaultPermission: false,
            })
            .catch((err) => {
              console.log("server error", err);
            });
          await wait(waitTime);
          const askNameQuestionResult = await interaction.editReply({
            content: `Awesome! You are almost good to go. One last thing: we want to learn more about you. What’s your name?`,
            ephemeral: ephmeralSet,
            defaultPermission: false,
          });

          askNameTimestamp = askNameQuestionResult.createdTimestamp;
          // console.log('askNameQuestionResult: ', askNameQuestionResult)

          // client.on('message', )

          break;
        case "nameConfirmYes":
          await interaction
          .deferReply({
            ephemeral: ephmeralSet,
            defaultPermission: false,
          })
          .catch((err) => {
            console.log("server error", err);
          });
        await wait(waitTime);
        const askIntroductionQuestionResult = await interaction.editReply({
          content: `How would you introduce yourself? (140 characters)`,
          ephemeral: ephmeralSet,
          defaultPermission: false,
        });

        askIntroductionTimestamp = askIntroductionQuestionResult.createdTimestamp;
          break;
        case "nameConfirmNo":
          console.log('nameConfirmNo')
          await interaction
          .deferReply({
            ephemeral: ephmeralSet,
            defaultPermission: false,
          })
          .catch((err) => {
            console.log("server error", err);
          });
          const nameConfirmNoResult = await interaction.editReply({
            content: `What’s your name?`,
            ephemeral: ephmeralSet,
            defaultPermission: false,
          });

          userInputName = '';
          askNameTimestamp = nameConfirmNoResult.createdTimestamp;

          break;
        case "introductionConfirmYes":
          await interaction
          .deferReply({
            ephemeral: ephmeralSet,
            defaultPermission: false,
          })
          .catch((err) => {
            console.log("server error", err);
          });
        await wait(waitTime);
        const askLanguageQuestionResult = await interaction.editReply({
          content: `Which language are you fluent in?`,
          ephemeral: ephmeralSet,
          defaultPermission: false,
        });

        askLanguageTimestamp = askLanguageQuestionResult.createdTimestamp;
          break;
        case "introductionConfirmNo":
          await interaction
          .deferReply({
            ephemeral: ephmeralSet,
            defaultPermission: false,
          })
          .catch((err) => {
            console.log("server error", err);
          });
          const introductionConfirmNoResult = await interaction.editReply({
            content: `How would you introduce yourself? (140 characters)`,
            ephemeral: ephmeralSet,
            defaultPermission: false,
          });

          userInputIntroduction = '';
          askIntroductionTimestamp = introductionConfirmNoResult.createdTimestamp;

          break;
        case "languageConfirmYes":
          await interaction
          .deferReply({
            ephemeral: ephmeralSet,
            defaultPermission: false,
          })
          .catch((err) => {
            console.log("server error", err);
          });
        await wait(waitTime);

        const discordLinkButton = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Take me to discord now')
            .setURL('https://discord.com/invite/Uh2vVCeN3k')
            .setStyle("LINK")
        )
        ;

        await interaction.editReply({
          content: `Perfect! That’s it, now we will take you to our community Discord. Welcome onboard!`,
          ephemeral: ephmeralSet,
          defaultPermission: false,
          components: [discordLinkButton]
        });

          break;
        case "languageConfirmNo":
          await interaction
          .deferReply({
            ephemeral: ephmeralSet,
            defaultPermission: false,
          })
          .catch((err) => {
            console.log("server error", err);
          });
          const languageConfirmNoResult = await interaction.editReply({
            content: `Which language are you fluent in?`,
            ephemeral: ephmeralSet,
            defaultPermission: false,
          });

          userInputLanguage = '';
          askLanguageTimestamp = languageConfirmNoResult.createdTimestamp;

          break;
      }
    }
  };

  client.on("interactionCreate", initiateConversation);


});
