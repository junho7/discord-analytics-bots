import discord
from discord.ext import tasks
import pymysql.cursors
from sshtunnel import SSHTunnelForwarder
import pickle
import json
from datetime import timezone, datetime

# start sshtunnel
tunnel = SSHTunnelForwarder(('44.198.245.25', 22),
                            ssh_pkey='~/.ssh/oxygen.cer',
                            ssh_username='ec2-user',
                            remote_bind_address=('localhost', 3306))
tunnel.start()

connection = pymysql.connect(host='localhost',
                             user='root',
                             password='',
                             port=tunnel.local_bind_port,
                             database='oxygen',
                             cursorclass=pymysql.cursors.DictCursor)


def check_channel_member_exists(discord_id, channel_id, guild_id):
    with connection.cursor() as cursor:
        sql = f"SELECT `discord_id`, `isLeft` FROM `discord_channel_member` WHERE `discord_id` = {discord_id} and `CHANNEL_ID` = {channel_id} and `GUILD_ID` = {guild_id}"
        cursor.execute(sql)
        result = cursor.fetchone()
        return result


def check_channel_exists(channel_id):
    with connection.cursor() as cursor:
        sql = f"SELECT `channel_id` FROM `discord_channel` WHERE `CHANNEL_ID` = {channel_id} and isDeleted = 0"
        cursor.execute(sql)
        result = cursor.fetchone()
        return result


def get_channels(guild_id):
    with connection.cursor() as cursor:
        sql = f"SELECT `channel_id` FROM `discord_channel` WHERE `GUILD_ID` = {guild_id} and isDeleted = 0"
        cursor.execute(sql)
        result = cursor.fetchall()
        return result

def get_members(guild_id):
    with connection.cursor() as cursor:
        sql = f"SELECT `discord_id`, `joined_at`, `left_at` FROM `discord_member` WHERE `GUILD_ID` = {guild_id}"
        cursor.execute(sql)
        result = cursor.fetchall()
        return result

def get_channel_members(channel_id, guild_id):
    with connection.cursor() as cursor:
        sql = f"SELECT `discord_id` FROM `discord_channel_member` WHERE `GUILD_ID` = {guild_id} and `channel_id` = {channel_id} and isLeft = 0"
        cursor.execute(sql)
        result = cursor.fetchall()
        return result

def get_member_join(guild_id):
    with connection.cursor() as cursor:
        sql = f"with latest as (SELECT `discord_id`, `event`, `event_time`, row_number() over (partition by `discord_id` order by `event_time` desc) as row_num FROM `discord_member_join`\
                WHERE `GUILD_ID` = {guild_id}\
                )\
                select `discord_id`, `event`, `event_time` from `latest` where row_num = 1" 
        cursor.execute(sql)
        result = cursor.fetchall()
        return result

def get_channel_member_join(channel_id, guild_id):
    with connection.cursor() as cursor:
        sql = f"with latest as (SELECT `discord_id`, `event`, `event_time`, row_number() over (partition by `discord_id` order by `event_time` desc) as row_num FROM `discord_channel_member_join`\
                WHERE `GUILD_ID` = {guild_id} and `channel_id` = {channel_id}\
                )\
                select `discord_id`, `event`, `event_time` from `latest` where row_num = 1" 
        cursor.execute(sql)
        result = cursor.fetchall()
        return result


async def insert_all_members(targetGuild):
    print('insert_all_members: guild_id: ', targetGuild)

    guild_id = targetGuild.id
    guild_name = '"""' + targetGuild.name.replace('"', "'") + '"""'

    members_result = get_members(guild_id)
    all_members_in_db = [item['discord_id'] for item in members_result]
    current_members_in_db = [item['discord_id'] for item in members_result if item['left_at'] is None or item['joined_at'] > item['left_at']]

    target_member_ids = [item.id for item in targetGuild.members]

    removed_members = list(set(all_members_in_db) - set(target_member_ids))

    now = datetime.utcnow()
    event_time = now.strftime('%Y-%m-%d %H:%M:%S')

    with connection.cursor() as cursor:
        for member in targetGuild.members:

            discord_id = member.id

            if discord_id not in all_members_in_db:

                display_name = '"""' + \
                    member.display_name.replace('"', "'") + '"""'
                name = '"""' + member.name.replace('"', "'") + '"""'
                nick = member.nick
                if nick is not None:
                    nick = '"""' + nick.replace('"', "'") + '"""'
                else:
                    nick = 'null'
                discriminator = member.discriminator
                bot = json.dumps(member.bot)
                created_at = json.dumps(
                    member.created_at, sort_keys=True, default=str)
                joined_at = json.dumps(
                    member.joined_at, sort_keys=True, default=str)

                roles = [str(role.id) for role in member.roles]
                roles = json.dumps(roles, default=str)
                top_role = member.top_role.id

                sql = f"INSERT INTO `discord_member` (`discord_id`, `display_name`, `name`, `nick`, `discriminator`, `bot`, `created_at`, `joined_at`, `roles`, `top_role`, `guild_id`)\
                    VALUES ({discord_id}, {display_name}, {name}, {nick}, '{discriminator}', {bot}, {created_at}, {joined_at}, '{roles}', '{top_role}', '{guild_id}')"
                print('sql: ', sql)

                try:
                    cursor.execute(sql)
                    connection.commit()
                except Exception as e:
                    print('Exception: ', e)

            elif discord_id in all_members_in_db and discord_id not in current_members_in_db:
                sql = f"UPDATE `discord_member` set `display_name` = {display_name}, `name` = {name}, `nick` = {nick}, `discriminator` = '{discriminator}',\
                        `joined_at` = {joined_at}, `roles` = '{roles}', `top_role` = '{top_role}'`\
                        where `guild_id` = {guild_id} and `discord_id` = {discord_id}"
                print('sql: ', sql)

                try:
                    cursor.execute(sql)
                    connection.commit()
                except Exception as e:
                    print('Exception: ', e)

        for deleted_member_id in removed_members:


            sql = f"UPDATE `discord_member` \
                    set `left_at` = '{event_time}'\
                    where `guild_id` = {guild_id} and `discord_id` = {deleted_member_id}"
            print('sql: ', sql)

            try:
                cursor.execute(sql)
                connection.commit()
            except Exception as e:
                print('Exception: ', e)


            isLeft = 1

            sql_channel_member = f"UPDATE `discord_channel_member` \
            set `isLeft` = {isLeft}\
            where `guild_id` = {guild_id} and `discord_id` = {deleted_member_id}"
            print('sql: ', sql_channel_member)

            try:
                cursor.execute(sql_channel_member)
                connection.commit()
            except Exception as e:
                print('Exception: ', e)


async def insert_all_channels(targetGuild):
    print('insert_all_channels', targetGuild)

    guild_id = targetGuild.id

    with connection.cursor() as cursor:
        channels_result = get_channels(guild_id)
        # print('channels_result', channels_result)
        channels_in_db = [item['channel_id'] for item in channels_result]
        print('channels_result', channels_in_db)

        target_channels = targetGuild.channels
        target_channel_ids = [ item.id for item in target_channels]

        new_channels = list(set(target_channel_ids) - set(channels_in_db))
        # deleted_channels = list(set(channels_in_db) - set(target_channel_ids))


        for channel in targetGuild.channels:

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

            if channel_id in new_channels:

                isDeleted = 0

                sql = f"INSERT INTO `discord_channel` (`guild_id`, `category_id`, `category_name`, `channel_id`, `type`, `channel_name`, `topic`, `isDeleted`)\
                            VALUES ({guild_id}, {category_id}, {category_name}, {channel_id}, '{type}', {channel_name}, {topic}, {isDeleted})"
                print('sql: ', sql)

                try:
                    cursor.execute(sql)
                    connection.commit()
                except Exception as e:
                    print('Exception: ', e)

        # for deleted_channel_id in deleted_channels:

        #     isDeleted = 1

        #     sql = f"UPDATE `discord_channel` set `isDeleted` = {isDeleted}\
        #                 where `guild_id` = {guild_id} and `channel_id` = {deleted_channel_id}"
        #     print('sql: ', sql)


        #     try:
        #         cursor.execute(sql)
        #         connection.commit()
        #     except Exception as e:
        #         print('Exception: ', e)


async def insert_all_channels_members(targetGuild):
    print('insert_all_channels_members')
    
    guild_id = targetGuild.id

    with connection.cursor() as cursor:
        channels_result = get_channels(guild_id)
        # print('channels_result', channels_result)
        channels_in_db = [ item['channel_id'] for item in channels_result]
        print('channels_result', channels_in_db)

        target_channels = targetGuild.channels
        target_channel_ids = [ item.id for item in target_channels]

        # new_channels = list(set(target_channel_ids) - set(channels_in_db))
        deleted_channels = list(set(channels_in_db) - set(target_channel_ids))


        for channel in targetGuild.channels:

            if str(channel.type) not in ('category', 'voice'):

                channel_id = channel.id
                members_result = get_channel_members(channel_id = channel_id, guild_id = guild_id)
                print('members_result', members_result)
                members_in_db = [ item['discord_id'] for item in members_result]
                print('members_in_db', members_in_db)

                target_members_ids = [ item.id for item in channel.members]

                new_members = list(set(target_members_ids) - set(members_in_db))
                deleted_members = list(set(members_in_db) - set(target_members_ids))            

                # channel_id = channel.id
                # if channel.name is None:
                #     channel_name = 'null'
                # else:
                #     channel_name = '"""' + channel.name.replace('"', "'") + '"""'
                # type = channel.type

                # if channel.category is None or channel.category.name is None:
                #     category_name = 'null'
                # else:
                #     category_name = '"""' + \
                #         channel.category.name.replace('"', "'") + '"""'

                # if channel.category_id is None:
                #     category_id = 'null'
                # else:
                #     category_id = channel.category_id

                # if str(channel.type) in ('category', 'voice') or channel.topic is None:
                #     topic = 'null'
                # else:
                #     topic = '"""' + channel.topic.replace('"', "'") + '"""'

                # if channel_id in new_channels:

                now = datetime.utcnow()
                event_time = now.strftime('%Y-%m-%d %H:%M:%S')

                for new_member_id in new_members:
                    isLeft = 0
                    discord_id = new_member_id

                    sql = f"INSERT INTO `discord_channel_member` (`discord_id`, `channel_id`, `guild_id`, `event_time`, `isLeft`)\
                                VALUES ({discord_id}, {channel_id}, {guild_id}, '{event_time}', {isLeft})"
                    print('sql: ', sql)

                    try:
                        cursor.execute(sql)
                        connection.commit()
                    except Exception as e:
                        print('Exception: ', e)

                for deleted_member_id in deleted_members:
                    isLeft = 1
                    discord_id = deleted_member_id

                    sql = f"UPDATE `discord_channel_member` set `isLeft` = {isLeft}, `event_time` = '{event_time}'\
                                where `guild_id` = {guild_id} and `channel_id` = {channel_id} and `discord_id` = {discord_id}"
                    print('sql: ', sql)

                    try:
                        cursor.execute(sql)
                        connection.commit()
                    except Exception as e:
                        print('Exception: ', e)

        for deleted_channel_id in deleted_channels:

            isLeft = 1

            sql_channel_member = f"UPDATE `discord_channel_member` set `isLeft` = {isLeft}, `event_time` = '{event_time}'\
                        where `guild_id` = {guild_id} and `channel_id` = {deleted_channel_id}"
            print('sql: ', sql_channel_member)


            try:
                cursor.execute(sql_channel_member)
                connection.commit()
            except Exception as e:
                print('Exception: ', e)

            isDeleted = 1

            sql_channel = f"UPDATE `discord_channel` set `isDeleted` = {isDeleted}\
                        where `guild_id` = {guild_id} and `channel_id` = {deleted_channel_id}"
            print('sql: ', sql_channel)


            try:
                cursor.execute(sql_channel)
                connection.commit()
            except Exception as e:
                print('Exception: ', e)


async def insert_all_recent_messages(targetGuild, after):
    print('insert_all_recent_messages', targetGuild)

    guild_id = targetGuild.id
    guild_name = '"""' + targetGuild.name.replace('"', "'") + '"""'

    for channel in targetGuild.channels:
        print('channel: ', channel)
        if str(channel.type) not in ('category', 'voice'):
            with connection.cursor() as cursor:
                async for message in channel.history(after=after):

                    message_id = message.id
                    author_id = message.author.id
                    author_name = '"""' + \
                        message.author.name.replace('"', "'") + '"""'
                    channel_id = message.channel.id
                    channel_name = '"""' + \
                        message.channel.name.replace('"', "'") + '"""'
                    category_id = message.channel.category_id
                    content = '"""' + \
                        message.content[:990].replace('"', "'") + '"""'
                    created_at = json.dumps(message.created_at, default=str)
                    edited_at = json.dumps(None, default=str)
                    jump_url = json.dumps(message.jump_url, default=str)
                    mention_everyone = json.dumps(
                        message.mention_everyone, default=str)
                    mentions = [{'id': mention.id, 'name': mention.name + '#' +
                                 mention.discriminator} for mention in message.mentions[:10]]
                    mentions = json.dumps(mentions[:490], default=str)
                    pinned = json.dumps(message.pinned, default=str)
                    type = json.dumps(message.type, default=str)

                    sql = f"INSERT INTO `discord_message` (`message_id`, `author_id`, `author_name`, `guild_id`, `guild_name`, `channel_id`, `channel_name`, `category_id`, `content`, `created_at`, `edited_at`, `jump_url`, `mention_everyone`, `mentions`, `pinned`, `type`)\
                            VALUES ({message_id}, {author_id}, {author_name}, {guild_id}, {guild_name}, {channel_id}, {channel_name}, {category_id}, {content}, {created_at}, {edited_at}, '{jump_url}', {mention_everyone}, '{mentions}', {pinned}, '{type}')"
                    print('sql: ', sql)
                    try:
                        cursor.execute(sql)
                        connection.commit()
                    except Exception as e:
                        print('Exception: ', e)


async def backfill_member_join(targetGuild):
    print('backfill_member_join: ', targetGuild)

    guild_id = targetGuild.id
    now = datetime.utcnow()
    event_time = now.strftime('%Y-%m-%d %H:%M:%S')

    with connection.cursor() as cursor:

        member_join_result = get_member_join(guild_id=guild_id)
        members_id_in_db = [item['discord_id'] for item in member_join_result if item['event'] == 'joined']
        current_members = [item.id for item in targetGuild.members]
        removed_members = list(set(members_id_in_db) - set(current_members))
        
        for member in targetGuild.members:

            discord_id = member.id

            if discord_id not in members_id_in_db:

                record = {
                    'event_time': member.joined_at,
                    'discord_id': discord_id,
                    'event': 'joined',
                    'guild_id': guild_id
                }

                insert_member_join(record)

        for member in removed_members:

            discord_id = member

            record = {
                'event_time': event_time,
                'discord_id': discord_id,
                'event': 'left',
                'guild_id': guild_id
            }

            insert_member_join(record)

async def backfill_channel_member_join(targetGuild):
    print('backfill_channel_member_join: ', targetGuild)

    guild_id = targetGuild.id
    now = datetime.utcnow()
    event_time = now.strftime('%Y-%m-%d %H:%M:%S')

    with connection.cursor() as cursor:
        for channel in targetGuild.channels:
            if str(channel.type) not in ('category', 'voice'):
                channel_id = channel.id
                channel_member_join_result = get_channel_member_join(channel_id=channel_id, guild_id=guild_id)
                members_id_in_db = [item['discord_id'] for item in channel_member_join_result if item['event'] == 'joined']

                for member in channel.members:

                    discord_id = member.id

                    if discord_id not in members_id_in_db:


                        record = {
                            'event_time': event_time,
                            'discord_id': discord_id,
                            'channel_id': channel_id,
                            'event': 'joined',
                            'guild_id': guild_id
                        }

                        insert_channel_member_join(record)


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
        try:
            cursor.execute(sql)
            connection.commit()
        except Exception as e:
            print('Exception: ', e)

def insert_channel_member_join(record):
    with connection.cursor() as cursor:
        discord_id = record['discord_id']
        guild_id = record['guild_id']
        channel_id = record['channel_id']
        event = record['event']
        event_time = record['event_time']

        sql = f"INSERT INTO `discord_channel_member_join` (`event_time`, `discord_id`, `event`, `guild_id`, `channel_id`)\
                VALUES ('{event_time}', {discord_id}, '{event}', {guild_id}, {channel_id})"
        print('sql: ', sql)
        try:
            cursor.execute(sql)
            connection.commit()
        except Exception as e:
            print('Exception: ', e)
