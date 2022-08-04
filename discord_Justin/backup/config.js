const site = {};

//9d04
// const client_id = '969338742022213692'
// const redirect_url = 'http://localhost:53134'

//collab-test
// general
site.guildId = '967613856480362547';
// api-test bot
site.token = 'TOKEN'
site.clientId ='967683190401695764';
// site.token = 'token from discord bot goes here'

//OAUTH2
// site.token = 'NTA1NzU5MjQzMjg3MjY1Mjk1.YktmcA.woxs20i8RXC3_O0gQfVqre1mzhc'
site.bearerToken = 'Bearer TOKEN'

//my wrapper
site.discordapi = 'https://discordapp.com/api'
site.botHeader = {"Authorization": "Bot "+site.token, 'Content-Type': 'application/json'};
// site.botHeader = {"Authorization": "Bearer "+site.token, 'Content-Type': 'application/json'};


module.exports = site;
