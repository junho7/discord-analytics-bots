import asyncio
import discord
import threading
from discord.ext import tasks
import pymysql.cursors
import pickle
import json
from datetime import timezone, datetime
from utils import insert_all_members, insert_all_channels, insert_all_messages, backfill_member_join

intents = discord.Intents.default()
intents.members = True
intents.presences = True

client_hourly = discord.Client(intents=intents)

connection = pymysql.connect(host='localhost',
                             user='root',
                             password='',
                             port=3306,
                             database='oxygen',
                             cursorclass=pymysql.cursors.DictCursor)


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

async def insert_all_channels_members(targetGuild):
    print('insert_all_channels_members', targetGuild)

    guild_id = targetGuild.id
    guild_name = '"""' + targetGuild.name.replace('"', "'") + '"""'

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


async def update_channel(channel, command):
    print('update_channel', channel, command)

    guild_id = channel.guild.id

    with connection.cursor() as cursor:

        channel_id = channel.id
        if channel.name is None:
            channel_name = 'null'
        else:
            channel_name = '"""' + channel.name.replace('"', "'") + '"""'
        type = channel.type

        if channel.category is None or channel.category.name is None:
            category_name = 'null'
        else:
            category_name = '"""' + \
                channel.category.name.replace('"', "'") + '"""'

        if channel.category_id is None:
            category_id = 'null'
        else:
            category_id = channel.category_id

        if str(channel.type) in ('category', 'voice') or channel.topic is None:
            topic = 'null'
        else:
            topic = '"""' + channel.topic.replace('"', "'") + '"""'

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
        elif command == 'DELETE':
            sql = f"UPDATE `discord_channel`\
                    SET `isDeleted` = 1\
                    WHERE `channel_id` = {channel_id} and `guild_id` = {guild_id}"
            print('sql: ', sql)
            cursor.execute(sql)

async def insert_all_channels_members_snapshot(targetGuild):
    print('insert_all_channels_members_snapshot', targetGuild)

    guild_id = targetGuild.id
    guild_name = '"""' + targetGuild.name.replace('"', "'") + '"""'

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

@client_hourly.event
async def on_ready():
    print('Client_hourly have logged in as {0.user}'.format(client_hourly))
    hourly_job.start()

@tasks.loop(hours=1)
async def hourly_job():
    print('hourly job')
    await client_hourly.wait_until_ready()
    print('hourly job client is ready')
    for guild in client_hourly.guilds:
        await insert_all_channels_members_snapshot(guild)


# Oxygen bot Oxygen#2093
client_hourly.run(
    'TOKEN')