import discord
from discord.ext import tasks
import pymysql.cursors
import pickle
import json
from datetime import timezone, datetime

connection = pymysql.connect(host='localhost',
                             user='root',
                             password='',
                             port=3306,
                             database='',
                             cursorclass=pymysql.cursors.DictCursor)


async def insert_all_members(targetGuild):
    print('insert_all_members: guild_id: ', targetGuild)

    guild_id = targetGuild.id
    guild_name = '"""' + targetGuild.name.replace('"', "'") + '"""'

    with connection.cursor() as cursor:
        for member in targetGuild.members:

            discord_id = member.id
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


async def insert_all_channels(targetGuild):
    print('insert_all_channels', targetGuild)

    guild_id = targetGuild.id

    with connection.cursor() as cursor:
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

            isDeleted = 0

            sql = f"INSERT INTO `discord_channel` (`guild_id`, `category_id`, `category_name`, `channel_id`, `type`, `channel_name`, `topic`, `isDeleted`)\
                    VALUES ({guild_id}, {category_id}, {category_name}, {channel_id}, '{type}', {channel_name}, {topic}, {isDeleted})"
            print('sql: ', sql)

            try:
                cursor.execute(sql)
                connection.commit()
            except Exception as e:
                print('Exception: ', e)


async def insert_all_messages(targetGuild):
    print('insert_all_messages', targetGuild)

    guild_id = targetGuild.id
    guild_name = '"""' + targetGuild.name.replace('"', "'") + '"""'

    for channel in targetGuild.channels:
        print('channel: ', channel)
        if str(channel.type) not in ('category', 'voice'):
            with connection.cursor() as cursor:
                async for message in channel.history():

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

    with connection.cursor() as cursor:
        for member in targetGuild.members:

            discord_id = member.id

            record = {
                'event_time': member.joined_at,
                'discord_id': discord_id,
                'event': 'joined',
                'guild_id': guild_id
            }

            insert_member_join(record)


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
