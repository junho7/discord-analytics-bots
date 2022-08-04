import discord
import pymysql.cursors
import json
from datetime import datetime, timedelta

from utils_ssh_tunnel import insert_all_members, insert_all_channels, insert_all_recent_messages, backfill_member_join, insert_all_channels_members, backfill_channel_member_join

intents = discord.Intents.default()
intents.members = True
intents.presences = True

client = discord.Client(intents=intents)


@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))
    for guild in client.guilds:
        if guild.id == 968271436701646869:  # 9d04
          await pull_missing_data(guild)


async def pull_missing_data(targetGuild):
    print('pull_missing_data')

    await insert_all_members(targetGuild)
    await insert_all_channels(targetGuild)
    await insert_all_channels_members(targetGuild)
    await insert_all_recent_messages(targetGuild, datetime.utcnow() - timedelta(hours=24))
    await backfill_member_join(targetGuild)
    await backfill_channel_member_join(targetGuild)

# Oxygen analytics
client.run('TOKEN')
