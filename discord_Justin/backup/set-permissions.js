const { REST } = require('@discordjs/rest');
const fetch = require('node-fetch');

const { clientId , guildId, bearerToken } = require('./config.js');

const applicationId = clientId
// const applicationId = process.env.clientId;
// const guildId = process.env.guildId;
// const bearerToken = process.env.bearerToken;

const commandId = "969976629742948413" // server command. Set this as your application ID to set default permissions
const url = `https://discord.com/api/v9/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions`;
// requires the user that the bearer token belongs to have used applications.commands.permissions.update scope and have manage guild/roles permission
console.log('url: ', url);

// since Apr 27, 2022, bot can't set permission for application permissions
// how to get bearer token https://stackoverflow.com/questions/72048570/403-error-when-setting-application-command-permissions-on-discord
const token = bearerToken; // replace {token} with what you copied from access_token

const payload = {
  permissions: [
    {
      id: "969044195232866385", // role/user/channel ID. Test Role 1
      type: 1, // 1 for role, 2 for user, and 3 for channel
      permission: false // whether or not that role/user can use the command or you can use the command in the channel
    }
  ] 
};

// const rest = new REST({ version: '9' }).setToken(token);

(async()=> {
const res = await fetch(url, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `${token}`,
      Accept: 'application/json',
     'Content-Type': 'application/json'
    },
  });
console.log('result: ', res);  
})();