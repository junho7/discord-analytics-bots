const site = require('./config'),
    axios = require('axios');


// const JSON = require('JSON')

module.exports = {
    fetchMember: async function (discordid, guild = site.guildid) {

        if (!discordid) {
            return { error: "No id set", status: "fail" }
        }

        const url = `${site.discordapi}/guilds/${guild}/members/${discordid}`

        const response = await axios.get(url, { headers: site.botHeader })
            .then(async response => {
                if (response.status === 200) {
                    return response.data
                } else {
                    return { error: "Not in guild", status: "fail" }
                }
            }).catch(err => {
                console.log(err.message)
                return { error: err.message, status: "fail" }
            })
        return response;
    },
    fetchUser: async function (discordid) {

        if (!discordid) {
            return { error: "No id set", status: "fail" }
        }

        const url = `${site.discordapi}/users/${discordid}`

        const response = await axios.get(url, { headers: site.botHeader })
            .then(async response => {
                if (response.status === 200) {
                    return response.data
                } else {
                    return { error: "Cannot find user", status: "fail" }
                }
            }).catch(err => {
                console.log(err.message)
                return { error: err.message, status: "fail" }
            })
        return response;
    },
    getRoles: async function (discordid, guild = site.guildid) {
        if (!discordid) {
            return { error: "No id set", status: "fail" }
        }
        const member = await this.fetchMember(discordid, guild);
        console.log('member: ', member)
        let roles = [];
        if (member.user) {
            roles = member.roles
        }
        return roles;
    },
    addRole: async function (discordid, guild = site.guildid, roleid) {
        if (!discordid) {
            return { error: "No id set", status: "fail" }
        }
        console.log('discordid: ', discordid)
        console.log('guild: ', guild)
        console.log('roleid: ', roleid)
        const url = `${site.discordapi}/guilds/${guild}/members/${discordid}/roles/${roleid}`
        console.log('url: ', url)
        const response = await axios.put(url, {}, { headers: site.botHeader })
            .then(async response => {
                if (response.status === 204) {
                    return { status: 200 }
                } else {
                    return { error: "Not added", status: "fail" }
                }
            }).catch(err => {
                console.log(err.message)
                return { error: err.message, status: "fail" }
            })
        return response;
    },
    removeRole: async function (discordid, guild = site.guildid, roleid) {
        if (!discordid) {
            return { error: "No id set", status: "fail" }
        }

        const url = `${site.discordapi}/guilds/${guild}/members/${discordid}/roles/${roleid}`
        const response = await axios.delete(url, { headers: site.botHeader })
            .then(async response => {
                if (response.status === 204) {
                    return { status: 200 }
                } else {
                    return { error: "Not added", status: "fail" }
                }
                //console.log(response)
            }).catch(err => {
                //console.log(err)
                return { error: err.message, status: "fail" }
            })
        return response;
    },
    removeRoles: async function (discordid, guild = site.guildid, roles) {
        if (!discordid) {
            return { error: "No id set", status: "fail" }
        }

         let i = 0, howManyTimes = roles.length;
        async function f() {
            //logic here
            const url = `${site.discordapi}/guilds/${guild}/members/${discordid}/roles/${roles[i]}`;
            await axios.delete(url, { headers: site.botHeader })
                .then(async response => {
                    console.log(response.status)
                    if (response.status === 204) {

                        return { status: 200 }
                    } else {
                        return { error: "Not added", status: "fail" }
                    }

                }).catch(err => {
                    //console.log(err)
                    return { error: err.message, status: "fail" }
                })

            i++;
            if (i < howManyTimes) {
                setTimeout(f, 7000);
            }
        }
        if (roles.length > 0) {
            f();
        }
        return;
    },
    createGuildChannel: async function (guild = site.guildid) {
        const url = `${site.discordapi}/guilds/${guild}/channels`
        let datetime = Date.now()
        const data = {
            "name" : "test_channel"+datetime
        }
        const response = await axios.post(url, data, { headers: site.botHeader })
            .then(async response => {
                return response.data
            }).catch(err => {
                console.log(err.message)
                return { error: err.message, status: "fail" }
            })
        return response;
    },    
    listActiveThreads: async function (guild = site.guildid) {
        const url = `${site.discordapi}/guilds/${guild}/threads/active`

        const response = await axios.get(url, { headers: site.botHeader })
            .then(async response => {
                // console.log(JSON.stringify(response.data.threads[0].thread_metadata))
                return response.data
            }).catch(err => {
                console.log(err.message)
                return { error: err.message, status: "fail" }
            })
        return response;
    },
    // this is not adding others to your guild. It's adding myself to the other server
    // it doesn't work
    addGuildMember: async function (discordid, guild = site.guildid) {
        if (!discordid) {
            return { error: "No id set", status: "fail" }
        }

            //logic here
            const url = `${site.discordapi}/guilds/${guild}/members/${discordid}`;
            const response = await axios.put(url, { headers: site.botHeader })
            .then(async response => {
                    if (response.status === 204) {

                        return { status: 200 }
                    } else {
                        return { error: "Not added", status: "fail" }
                    }

                }).catch(err => {
                    console.log(err)
                    return { error: err.message, status: "fail" }
                })
        return response;
    },
    modifyGuildMember: async function (discordid, guild = site.guildid) {
        if (!discordid) {
            return { error: "No id set", status: "fail" }
        }

        const data = {
            // "nick": "test_nick",
            "channel_id": "967613857050800211" //General
        }

            //logic here
            const url = `${site.discordapi}/guilds/${guild}/members/${discordid}`;
            const response = await axios.patch(url, data, { headers: site.botHeader })
            .then(async response => {
                    console.log('response: ', response.data)
                    return response.data
                }).catch(err => {
                    console.log(err)
                    return { error: err.message, status: "fail" }
                })
        return response;
    },
    removeGuildMember: async function (discordid, guild = site.guildid) {
        if (!discordid) {
            return { error: "No id set", status: "fail" }
        }

        const url = `${site.discordapi}/guilds/${guild}/members/${discordid}`
        const response = await axios.delete(url, { headers: site.botHeader })
            .then(async response => {
                if (response.status === 204) {
                    return { status: 200 }
                } else {
                    return { error: "Not added", status: "fail" }
                }
                //console.log(response)
            }).catch(err => {
                //console.log(err)
                return { error: err.message, status: "fail" }
            })
        return response;
    },
    getGuildInvites: async function (guild = site.guildid) {

        const url = `${site.discordapi}/guilds/${guild}/invites`
        const response = await axios.get(url, { headers: site.botHeader })
            .then(async response => {
                // console.log(response)
                return response.data
            }).catch(err => {
                //console.log(err)
                return { error: err.message, status: "fail" }
            })
        return response;
    },
    listGuildMembers: async function (guild = site.guildid) {

            //logic here
            const url = `${site.discordapi}/guilds/${guild}/members`;
            console.log('url: ', url)
            const response = await axios.get(url, { headers: site.botHeader })
            .then(async response => {
                    console.log(response.status)
                    console.log(response)
                    return response.data
                }).catch(err => {
                    console.log(err)
                    return { error: err.message, status: "fail" }
                })
        return response;
    },
    getGuildRole: async function (guild = site.guildid) {

            //logic here
            const url = `${site.discordapi}/guilds/${guild}/roles`;
            const response = await axios.get(url, { headers: site.botHeader })
            .then(async response => {
                    return response.data
                }).catch(err => {
                    console.log(err)
                    return { error: err.message, status: "fail" }
                })
        return response;
    },
    createGuildRole: async function (guild = site.guildid, permissions) {

            const data = {
                name: "Create Invite",
                permissions: permissions
            }
            //logic here
            const url = `${site.discordapi}/guilds/${guild}/roles`;
            const response = await axios.post(url, data, { headers: site.botHeader })
            .then(async response => {
                    return response.data
                }).catch(err => {
                    console.log(err)
                    return { error: err.message, status: "fail" }
                })
        return response;
    },
    modifyGuildRole: async function (guild = site.guildid, roleid, permissions) {

            const data = {
                name: "Test Role 1",
                permissions: permissions
            }
            //logic here
            const url = `${site.discordapi}/guilds/${guild}/roles/${roleid}`;
            const response = await axios.patch(url, data, { headers: site.botHeader })
            .then(async response => {
                    return response.data
                }).catch(err => {
                    console.log(err)
                    return { error: err.message, status: "fail" }
                })
        return response;
    },
    getChannelMessages: async function (channelid) {
        if (!channelid) {
            return { error: "No id set", status: "fail" }
        }
        // message = JSON.stringify(message);

        const url = `${site.discordapi}/channels/${channelid}/messages?limit=50`
        const response = await axios.get(url, { headers: site.botHeader })
            .then(async response => {
                return response.data
            }).catch(err => {
                console.log('err: ', err)
                // console.log('err: ', JSON.stringify(err))
                throw Error({ error: err.data, status: "fail" });
            })
        return response;
    },
    createMessage: async function (channelid, message) {
        if (!channelid) {
            return { error: "No id set", status: "fail" }
        }
        // message = JSON.stringify(message);

        const content = 
        {
            "content": message
        }
        
        const url = `${site.discordapi}/channels/${channelid}/messages`
        const response = await axios.post(url, content, { headers: site.botHeader })
            .then(async response => {
                if (response.status === 200) {
                    return { status: 200 }
                } else {
                    return { error: "Not added", status: "fail" }
                }
            }).catch(err => {
                console.log('err: ', err)
                console.log('err: ', JSON.stringify(err))
                throw Error({ error: err.message, status: "fail" });
            })
        return response;
    },
    sendDm: async function (discordid, message) {
        if (!discordid) {
            return { error: "No target set", status: "fail" }
        }
        //message = JSON.stringify(message);
        //
        const dmurl = `${site.discordapi}/users/@me/channels`
        const dmresponse = await axios.post(dmurl, { "recipient_id": discordid }, { headers: site.botHeader })
            .then(async response => {
                if (response.status === 200) {
                    return { status: 200, data: response.data }
                } else {
                    return { error: "Not added", status: "fail" }
                }
            }).catch(err => {
                return { error: err, status: "fail" }
            })

        console.log(dmresponse)

        if (dmresponse.error) {
            throw Error(dmresponse.error)
        }

        const response = await this.sendMessage(dmresponse.data.id, message)

        return response;
    },
    
    avatar: async function (discordid, size = '2048', format = 'jpg') {
        if (!channelid) {
            return { error: "No id set", status: "fail" }
        }
        const user = await this.fetchUser(discordid);
        if (!user) {
            return { error: "User not found", status: "fail" }
        }
        const url = `https://cdn.discordapp.com/avatars/${discordid}/${user.avatar}.${format}?size=${size}`;
        return url;

    }
}
