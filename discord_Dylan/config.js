const site = {};

//9d04
// user id: 968257565295259748
// const client_id = '969338742022213692'
// const redirect_url = 'http://localhost:53134'

//bot#2
// general
site.bot2_id = '971598912383238165';
site.guildId = '967613856480362547';
site.token = 'TOKEN'
site.clientId ='971598912383238165';
site.public_key ='PUBLIC_KEY';
// site.token = 'token from discord bot goes here'

//community manager
site.communityManagerId = '967683190401695764';

//OAUTH2
site.bearerToken = 'Bearer TOKEN'

//my wrapper
site.discordapi = 'https://discordapp.com/api'
site.botHeader = {"Authorization": "Bot "+site.token, 'Content-Type': 'application/json'};
// site.botHeader = {"Authorization": "Bearer "+site.token, 'Content-Type': 'application/json'};


module.exports = site;
