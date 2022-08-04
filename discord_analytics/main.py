import asyncio
import discord
import threading
from discord.ext import tasks
import pymysql.cursors
import pickle
import json
from datetime import timezone, datetime
from utils import insert_all_members, insert_all_channels, insert_all_messages, backfill_member_join, connection
from discord.abc import PrivateChannel, GuildChannel

intents = discord.Intents.default()
intents.members = True
intents.presences = True

client = discord.Client(intents=intents)
client_hourly = discord.Client(intents=intents)

def check_member_exists(discord_id, guild_id):
    with connection.cursor() as cursor:
        sql = f"SELECT `discord_id`, `joined_at`, `left_at` FROM `discord_member` WHERE `discord_id` = {discord_id} and `GUILD_ID` = {guild_id}"
        cursor.execute(sql)
        result = cursor.fetchone()
        return result


def check_channel_member_exists(discord_id, channel_id, guild_id):
    with connection.cursor() as cursor:
        sql = f"SELECT `discord_id`, `isLeft` FROM `discord_channel_member` WHERE `discord_id` = {discord_id} and `CHANNEL_ID` = {channel_id} and `GUILD_ID` = {guild_id}"
        cursor.execute(sql)
        result = cursor.fetchone()
        return result


def check_channel_exists(channel_id):
    with connection.cursor() as cursor:
        sql = f"SELECT `channel_id` FROM `discord_channel` WHERE `CHANNEL_ID` = {channel_id}"
        cursor.execute(sql)
        result = cursor.fetchone()
        return result

###########################################
# START - First data pulling when bot is added to server
###########################################


# async def insert_all_members(targetGuild):
#     print('insert_all_members: guild_id: ', targetGuild)

#     # targetGuild = client.get_guild(target_guild_id)

#     guild_id = targetGuild.id
#     guild_name = '"""' + targetGuild.name.replace('"', "'") + '"""'

#     with connection.cursor() as cursor:
#         for member in targetGuild.members:

#             discord_id = member.id
#             display_name = '"""' + \
#                 member.display_name.replace('"', "'") + '"""'
#             name = '"""' + member.name.replace('"', "'") + '"""'
#             nick = member.nick
#             if nick is not None:
#                 nick = '"""' + nick.replace('"', "'") + '"""'
#             else:
#                 nick = 'null'
#             discriminator = member.discriminator
#             bot = json.dumps(member.bot)
#             created_at = json.dumps(
#                 member.created_at, sort_keys=True, default=str)
#             joined_at = json.dumps(
#                 member.joined_at, sort_keys=True, default=str)

#             roles = [str(role.id) for role in member.roles]
#             roles = json.dumps(roles, default=str)
#             top_role = member.top_role.id

#             sql = f"INSERT INTO `discord_member` (`discord_id`, `display_name`, `name`, `nick`, `discriminator`, `bot`, `created_at`, `joined_at`, `roles`, `top_role`, `guild_id`)\
#                 VALUES ({discord_id}, {display_name}, {name}, {nick}, '{discriminator}', {bot}, {created_at}, {joined_at}, '{roles}', '{top_role}', '{guild_id}')"
#             print('sql: ', sql)
#             cursor.execute(sql)

#             connection.commit()


async def insert_team(targetGuild):
    print('insert_team: guild_id: ', targetGuild)

    guild_id = targetGuild.id
    if targetGuild.name is None:
        guild_name = 'null'
    else:
        guild_name = '"""' + targetGuild.name.replace('"', "'") + '"""'

    with connection.cursor() as cursor:

        avatar = 'null'

        if targetGuild.description is None:
            description = 'null'
        else:
            description = '"""' + \
                targetGuild.description.replace('"', "'") + '"""'
        auth = 'null'
        status = 'enabled'
        isDelete = 0
        createdAt = json.dumps(datetime.utcnow().strftime(
            '%Y-%m-%d %H:%M:%S'), default=str)
        updatedAt = createdAt

        sql = f"INSERT INTO `team` (`name`, `avatar`, `description`, `auth`, `status`, `isDelete`, `createdAt`, `updatedAt`, `discord_guild_id`)\
            VALUES ({guild_name}, {avatar}, {description}, {auth}, '{status}', {isDelete}, {createdAt}, {updatedAt}, {guild_id})"
        print('sql: ', sql)
        cursor.execute(sql)

        connection.commit()


# async def insert_all_channels(targetGuild):
#     print('insert_all_channels', targetGuild)

#     guild_id = targetGuild.id

#     with connection.cursor() as cursor:
#         for channel in targetGuild.channels:

#             channel_id = channel.id
#             if channel.name is None:
#                 channel_name = 'null'
#             else:
#                 channel_name = '"""' + channel.name.replace('"', "'") + '"""'
#             type = channel.type

#             if channel.category is None or channel.category.name is None:
#                 category_name = 'null'
#             else:
#                 category_name = '"""' + \
#                     channel.category.name.replace('"', "'") + '"""'

#             if channel.category_id is None:
#                 category_id = 'null'
#             else:
#                 category_id = channel.category_id

#             if str(channel.type) in ('category', 'voice') or channel.topic is None:
#                 topic = 'null'
#             else:
#                 topic = '"""' + channel.topic.replace('"', "'") + '"""'

#             isDeleted = 0

#             sql = f"INSERT INTO `discord_channel` (`guild_id`, `category_id`, `category_name`, `channel_id`, `type`, `channel_name`, `topic`)\
#                     VALUES ({guild_id}, {category_id}, {category_name}, {channel_id}, '{type}', {channel_name}, {topic}, {isDeleted})"
#             print('sql: ', sql)
#             cursor.execute(sql)

#             connection.commit()


async def insert_all_channels_members(targetGuild):
    print('insert_all_channels_members', targetGuild)

    guild_id = targetGuild.id

    count = 0
    with connection.cursor() as cursor:
        for channel in targetGuild.channels:
            if str(channel.type) not in ('category', 'voice'):

                for member in channel.members:

                    discord_id = member.id
                    channel_id = channel.id
                    event_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

                    sql = f"INSERT INTO `discord_channel_member` (`discord_id`, `channel_id`, `guild_id`, `event_time`)\
                    VALUES ({discord_id}, {channel_id}, {guild_id}, '{event_time}')"
                    print('sql: ', sql)
                    cursor.execute(sql)

                    connection.commit()


# async def update_channel_members(channel):
#     print('update_channel_members', dir(channel))

#     guild_id = channel.guild.id
#     channel_id = channel.id
#     # guild_name = '"""' + targetGuild.name.replace('"', "'") + '"""'

#     with connection.cursor() as cursor:
#         if str(channel.type) not in ('category', 'voice'):
#     #   print('channel: ', dir(channel))
#     #   print('type: ', channel.type)
#     #   print('category: ', dir(channel.category))
#     #   print('category_id: ', channel.category_id)

#             for member in channel.members:

#                 discord_id = member.id

#                 event_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

#                 sql = f"INSERT INTO `discord_channel_member_snapshot` (`discord_id`, `channel_id`, `guild_id`, `event_time`)\
#                     VALUES ({discord_id}, {channel_id}, {guild_id}, '{event_time}')"
#                 print('sql: ', sql)
#                 cursor.execute(sql)

#                 connection.commit()

# async def insert_all_messages(targetGuild):
#     print('insert_all_messages', targetGuild)

#     guild_id = targetGuild.id
#     guild_name = '"""' + targetGuild.name.replace('"', "'") + '"""'

#     for channel in targetGuild.channels:
#         if str(channel.type) not in ('category', 'voice'):
#             with connection.cursor() as cursor:
#                 async for message in channel.history():

#                     message_id = message.id
#                     author_id = message.author.id
#                     author_name = '"""' + \
#                         message.author.name.replace('"', "'") + '"""'
#                     channel_id = message.channel.id
#                     channel_name = '"""' + \
#                         message.channel.name.replace('"', "'") + '"""'
#                     category_id = message.channel.category_id
#                     content = '"""' + \
#                         message.content[:990].replace('"', "'") + '"""'
#                     created_at = json.dumps(message.created_at, default=str)
#                     edited_at = json.dumps(None, default=str)
#                     jump_url = json.dumps(message.jump_url, default=str)
#                     mention_everyone = json.dumps(
#                         message.mention_everyone, default=str)
#                     mentions = [{'id': mention.id, 'name': mention.name + '#' +
#                                  mention.discriminator} for mention in message.mentions[:10]]
#                     mentions = json.dumps(mentions[:490], default=str)
#                     pinned = json.dumps(message.pinned, default=str)
#                     type = json.dumps(message.type, default=str)

#                     sql = f"INSERT INTO `discord_message` (`message_id`, `author_id`, `author_name`, `guild_id`, `guild_name`, `channel_id`, `channel_name`, `category_id`, `content`, `created_at`, `edited_at`, `jump_url`, `mention_everyone`, `mentions`, `pinned`, `type`)\
#                             VALUES ({message_id}, {author_id}, {author_name}, {guild_id}, {guild_name}, {channel_id}, {channel_name}, {category_id}, {content}, {created_at}, {edited_at}, '{jump_url}', {mention_everyone}, '{mentions}', {pinned}, '{type}')"
#                     print('sql: ', sql)
#                     cursor.execute(sql)

#                     connection.commit()


# async def backfill_member_join(targetGuild):
#     print('backfill_member_join: ', targetGuild)

#     guild_id = targetGuild.id

#     with connection.cursor() as cursor:
#         for member in targetGuild.members:

#             discord_id = member.id

#             record = {
#                 'event_time': member.joined_at,
#                 'discord_id': discord_id,
#                 'event': 'joined',
#                 'guild_id': guild_id
#             }

#             insert_member_join(record)

###########################################
# END - First data pulling when bot is added to server
###########################################


def insert_member(record):
    with connection.cursor() as cursor:
        discord_id = record['discord_id']
        guild_id = record['guild_id']
        display_name = '"""' + record['display_name'].replace('"', "'") + '"""'
        name = '"""' + record['name'].replace('"', "'") + '"""'
        nick = record['nick']
        if nick is not None:
            nick = '"""' + nick.replace('"', "'") + '"""'
        else:
            nick = 'null'
        discriminator = record['discriminator']
        bot = json.dumps(record['bot'])
        created_at = json.dumps(
            record['created_at'], sort_keys=True, default=str)
        joined_at = json.dumps(
            record['joined_at'], sort_keys=True, default=str)
        roles = json.dumps(record['roles'])
        top_role = json.dumps(record['top_role'], sort_keys=True, default=str)

        check_result = check_member_exists(discord_id, guild_id)

        if check_result:
            new_joined_at = json.dumps(record['joined_at'], default=str)

            sql = f"UPDATE `discord_member`\
                SET `joined_at` = {new_joined_at}\
                WHERE `discord_id` = '{discord_id}' and `guild_id` = '{guild_id}'"
        else:
            sql = f"INSERT INTO `discord_member` (`discord_id`, `display_name`, `name`, `nick`, `discriminator`, `bot`, `created_at`, `joined_at`, `roles`, `top_role`, `guild_id`)\
                VALUES ({discord_id}, {display_name}, {name}, {nick}, '{discriminator}', {bot}, {created_at}, {joined_at}, '{roles}', '{top_role}', {guild_id})"

        cursor.execute(sql)

    connection.commit()

def insert_member_join(record):
    with connection.cursor() as cursor:
        discord_id = record['discord_id']
        guild_id = record['guild_id']
        event = record['event']
        event_time = json.dumps(
            record['event_time'], sort_keys=True, default=str)

        sql = f"INSERT INTO `discord_member_join` (`event_time`, `discord_id`, `event`, `guild_id`)\
                VALUES ({event_time}, {discord_id}, '{event}', {guild_id})"
        print('sql: ', sql)
        cursor.execute(sql)

    connection.commit()

def insert_member_status(record):
    with connection.cursor() as cursor:
        discord_id = record['discord_id']
        status = record['status']
        mobile_status = record['mobile_status']
        desktop_status = record['desktop_status']
        web_status = record['web_status']
        now = datetime.utcnow()
        event_time = now.strftime('%Y-%m-%d %H:%M:%S')

        sql = f"INSERT INTO `discord_member_status` (`event_time`, `discord_id`, `status`, `mobile_status`, `desktop_status`, `web_status`)\
            VALUES ('{event_time}', {discord_id}, '{status}', '{mobile_status}', '{desktop_status}', '{web_status}')"

        print('sql: ', sql)

        cursor.execute(sql)

        connection.commit()


async def update_channel(before, after, command):
    print('update_channel', before, after, command)

    guild_id = after.guild.id

    with connection.cursor() as cursor:

        channel_id = after.id
        if after.name is None:
            channel_name = 'null'
        else:
            channel_name = '"""' + after.name.replace('"', "'") + '"""'
        type = after.type

        if after.category is None or after.category.name is None:
            category_name = 'null'
        else:
            category_name = '"""' + \
                after.category.name.replace('"', "'") + '"""'

        if after.category_id is None:
            category_id = 'null'
        else:
            category_id = after.category_id

        if str(after.type) in ('category', 'voice') or after.topic is None:
            topic = 'null'
        else:
            topic = '"""' + after.topic.replace('"', "'") + '"""'

        print('members compare: ', after.guild.members  == after.members )
        event_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

        isDeleted = 0

        if command == 'CREATE':

            sql = f"INSERT INTO `discord_channel` (`guild_id`, `category_id`, `category_name`, `channel_id`, `type`, `channel_name`, `topic`, `isDeleted`)\
                VALUES ({guild_id}, {category_id}, {category_name}, {channel_id}, '{type}', {channel_name}, {topic}, {isDeleted})"
            print('sql: ', sql)
            cursor.execute(sql)

            connection.commit()
        elif command == 'UPDATE':
            sql = f"UPDATE `discord_channel`\
                    SET `category_id` = {category_id}, `category_name` = {category_name}, `type` = '{type}', `channel_name` = {channel_name}, `topic` = {topic}\
                    WHERE `channel_id` = {channel_id} and `guild_id` = {guild_id}"
            print('sql: ', sql)
            cursor.execute(sql)
            connection.commit()

            if before.members != after.members:
                for member in list(set(after.members) - set(before.members)):
                    discord_id = member.id

                    event = 'joined'

                    sql_channel_member_join = f"INSERT INTO `discord_channel_member_join` (`discord_id`, `channel_id`, `guild_id`, `event_time`, `event`)\
                        VALUES ({discord_id}, {channel_id}, {guild_id}, '{event_time}', '{event}')"
                    print('sql_members: ', sql_channel_member_join)
                    cursor.execute(sql_channel_member_join)
                    connection.commit()

                    isLeft = 0

                    sql_channel_member = f"REPLACE INTO `discord_channel_member`\
                        (`guild_id`, `channel_id`, `discord_id`, `isLeft`, `event_time`)\
                        VALUES ({guild_id}, {channel_id}, {discord_id}, {isLeft}, '{event_time}')\
                        "
                    
                    cursor.execute(sql_channel_member)
                    connection.commit()

                for member in list(set(before.members) - set(after.members)):
                    discord_id = member.id

                    event = 'left'

                    sql_channel_member_join = f"INSERT INTO `discord_channel_member_join` (`discord_id`, `channel_id`, `guild_id`, `event_time`, `event`)\
                    VALUES ({discord_id}, {channel_id}, {guild_id}, '{event_time}', '{event}')"
                    print('sql_channel_member_join: ', sql_channel_member_join)
                    cursor.execute(sql_channel_member_join)
                    connection.commit()

                    isLeft = 1

                    sql_channel_member = f"REPLACE INTO `discord_channel_member`\
                        (`guild_id`, `channel_id`, `discord_id`, `isLeft`, `event_time`)\
                        VALUES ({guild_id}, {channel_id}, {discord_id}, {isLeft}, '{event_time}')\
                        "

                    cursor.execute(sql_channel_member)
                    connection.commit()

        elif command == 'DELETE':
            sql = f"UPDATE `discord_channel`\
                    SET `isDeleted` = 1\
                    WHERE `channel_id` = {channel_id} and `guild_id` = {guild_id}"
            print('sql: ', sql)
            cursor.execute(sql)


async def insert_all_channels_members_snapshot(targetGuild):
    print('insert_all_channels_members_snapshot', targetGuild)

    guild_id = targetGuild.id

    count = 0
    with connection.cursor() as cursor:
        for channel in targetGuild.channels:
            if str(channel.type) not in ('category', 'voice'):
                event_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

                for member in channel.members:

                    discord_id = member.id
                    channel_id = channel.id

                    sql = f"INSERT INTO `discord_channel_member_hourly_snapshot` (`discord_id`, `channel_id`, `guild_id`, `event_time`)\
                    VALUES ({discord_id}, {channel_id}, {guild_id}, '{event_time}')"
                    print('sql: ', sql)
                    cursor.execute(sql)

                    connection.commit()

                    res = check_channel_member_exists(
                        discord_id, channel_id, guild_id)

                    if res and not res['isLeft']:
                        print('exists')
                    elif res and res['isLeft']:
                        sql = f"UPDATE `discord_channel_member`\
                    SET `event_time` = '{event_time}', `isLeft` = 0 \
                    WHERE `discord_id` = {discord_id} and `channel_id` = {channel_id} and `guild_id` = {guild_id}"
                        cursor.execute(sql)
                        connection.commit()
                    else:
                        sql = f"INSERT INTO `discord_channel_member` (`discord_id`, `channel_id`, `guild_id`, `event_time`, `isLeft`)\
                        VALUES ({discord_id}, {channel_id}, {guild_id}, '{event_time}', 0)"
                        print('sql: ', sql)
                        cursor.execute(sql)
                        connection.commit()

                sql = f"UPDATE `discord_channel_member` as d\
                left join `discord_channel_member_hourly_snapshot` as s\
                on d.`discord_id` = s.`discord_id`\
                    and d.`channel_id` = s.`channel_id`\
                    and d.`guild_id` = s.`guild_id`\
                    and s.`event_time` = '{event_time}'\
                SET d.`event_time` = '{event_time}', d.`isLeft` = 1 \
                WHERE d.`channel_id` = {channel_id} and d.`guild_id` = {guild_id} \
                    and s.`discord_id` IS NULL"

                print('sql: ', sql)
                r = cursor.execute(sql)
                print(r)
                connection.commit()


def insert_message(record):
    print('insert_message record', record)
    with connection.cursor() as cursor:
        message_id = record['message_id']
        author_id = record['author_id']
        author_name = '"""' + record['author_name'].replace('"', "'") + '"""'
        guild_id = record['guild_id']
        guild_name = '"""' + record['guild_name'].replace('"', "'") + '"""'
        channel_id = record['channel_id']
        channel_name = '"""' + record['channel_name'].replace('"', "'") + '"""'
        category_id = record['category_id']
        content = '"""' + record['content'].replace('"', "'") + '"""'
        content = json.dumps(content)
        created_at = json.dumps(record['created_at'], default=str)
        edited_at = json.dumps(record['edited_at'], default=str)
        jump_url = json.dumps(record['jump_url'])
        mention_everyone = json.dumps(record['mention_everyone'])
        mentions = json.dumps(record['mentions'])
        pinned = json.dumps(record['pinned'])
        type = json.dumps((record['type'].name, record['type'].value))

        sql = f"INSERT INTO `discord_message` (`message_id`, `author_id`, `author_name`, `guild_id`, `guild_name`, `channel_id`, `channel_name`, `category_id`, `content`, `created_at`, `edited_at`, `jump_url`, `mention_everyone`, `mentions`, `pinned`, `type`)\
              VALUES ({message_id}, {author_id}, {author_name}, {guild_id}, {guild_name}, {channel_id}, {channel_name}, {category_id}, {content}, {created_at}, {edited_at}, '{jump_url}', {mention_everyone}, '{mentions}', {pinned}, '{type}')"
        print('sql: ', sql)
        result = cursor.execute(sql)
        print('result: ', result)

        connection.commit()

@client.event
async def on_ready():
    print('Client have logged in as {0.user}'.format(client))
    
@client.event
async def on_guild_join(guild):
    print(f'Bot has been added to a new server: {guild.name}')
    await insert_all_members(guild)
    await insert_team(guild)
    await insert_all_channels(guild)
    await insert_all_channels_members(guild)
    await insert_all_messages(guild)
    await backfill_member_join(guild)

# group does't trigger
@client.event
async def on_group_join(channel, user):
    print('on_group_join', channel, user)

@client.event
async def on_group_remove(channel, user):
    print('on_group_remove', channel, user)

# private channel does't trigger
@client.event
async def on_private_channel_create(channel):
    print('on_private_channel_create', channel)

@client.event
async def on_private_channel_update(before, after):
    print('on_private_channel_update', after)

@client.event
async def on_private_channel_delete(channel):
    print('on_private_channel_delete', channel)

# guild_channel works for public, private channels
@client.event
async def on_guild_channel_create(channel):
    print('on_channel_create', channel)
    await update_channel(channel, 'CREATE')

# member join/leave group channel (not public channel)
# it doesn't trigger when new member joins the channel automatically after joining a guild.
# type is still text instead of private or group
@client.event
async def on_guild_channel_update(before, after):
    print('on_channel_update', after)
    await update_channel(before, after, 'UPDATE')

@client.event
async def on_guild_channel_delete(channel):
    print('on_channel_delete', channel)
    await update_channel(channel, 'DELETE')

@client.event
async def on_member_join(member):
    print('new member join')
    # no referrer data

    record = {
        'discord_id': member.id,
        'guild_id': member.guild.id,
        'display_name': member.display_name,
        'name': member.name,
        'nick': member.nick,
        'discriminator': member.discriminator,
        'bot': member.bot,
        'created_at': member.created_at,
        'joined_at': member.joined_at,
        'roles': [{'id': role.id, 'name': role.name} for role in member.roles],
        'top_role': {'id': member.top_role.id, 'name': member.top_role.name}
    }

    insert_member(record)

    record_join = {
        'discord_id': member.id,
        'guild_id': member.guild.id,
        'event_time': member.joined_at,
        'event': 'joined'
    }
    insert_member_join(record_join)

@client.event
async def on_member_remove(member):
    print('member left')

    with connection.cursor() as cursor:

        record = {
            'discord_id': member.id,
            'guild_id': member.guild.id,
            'event_time': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            'event': 'left'
        }
        insert_member_join(record)
        new_left_at = json.dumps(record['event_time'], default=str)

        sql = f"UPDATE `discord_member`\
                SET `left_at` = {new_left_at}\
                WHERE `discord_id` = {record['discord_id']} and `guild_id` = {record['guild_id']}"

        cursor.execute(sql)

        connection.commit()


@client.event
async def on_message(message):

    record = {}

    if message.content.startswith('$hello'):
        response = 'Hello!'
        await message.channel.send(response)
    else:
        record = {
            'message_id': message.id,
            'author_id': message.author.id,
            'author_name': message.author.name,
            'guild_id': message.guild.id,
            'guild_name': message.guild.name,
            'channel_id': message.channel.id,
            'channel_name': message.channel.name,
            'category_id': message.channel.category_id,
            'content': message.content,
            'created_at': message.created_at,
            'edited_at': None,
            'jump_url': message.jump_url,
            'mention_everyone': message.mention_everyone,
            'mentions': [{'id': mention.id, 'name': mention.name + '#' + mention.discriminator} for mention in message.mentions],
            'pinned': message.pinned,
            'type': message.type
        }

    insert_message(record)

@client.event
async def on_member_update(before, after):
    print('on_member_update')
    record = {
        'discord_id': after.id,
        'status': after.status.value,
        'mobile_status': after.mobile_status.value,
        'desktop_status': after.desktop_status.value,
        'web_status': after.web_status.value
    }

    print('record: ', record)

    insert_member_status(record)

# Oxygen bot Oxygen#2093
client.run('TOKEN')