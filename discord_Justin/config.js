const site = {};

//9d04
// user id: 968257565295259748
// const client_id = '969338742022213692'
// const redirect_url = 'http://localhost:53134'

//collab-test
// general
site.guildId = '967613856480362547';
// api-test bot
site.token = 'TOKEN'
site.clientId ='967683190401695764'; // same to user id
// site.token = 'token from discord bot goes here'

//Dylan bot
site.dylan_id = '971598912383238165';

//Rachael bot
site.rachael_id = '971914316037120030';

//OAUTH2
site.bearerToken = 'Bearer TOKEN'

//my wrapper
site.discordapi = 'https://discordapp.com/api'
site.botHeader = {"Authorization": "Bot "+site.token, 'Content-Type': 'application/json'};
// site.botHeader = {"Authorization": "Bearer "+site.token, 'Content-Type': 'application/json'};


module.exports = site;
