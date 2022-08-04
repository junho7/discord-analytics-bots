-- oxygen.discord_member_status definition

CREATE TABLE `discord_member_status` (
  `event_time` timestamp NULL DEFAULT NULL,
  `discord_id` bigint unsigned DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  `mobile_status` varchar(10) DEFAULT NULL,
  `desktop_status` varchar(10) DEFAULT NULL,
  `web_status` varchar(10) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- oxygen.discord_member definition

CREATE TABLE `discord_member` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `display_name` varchar(50) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `nick` varchar(50) DEFAULT NULL,
  `discriminator` varchar(50) DEFAULT NULL,
  `bot` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT NULL,
  `left_at` timestamp NULL DEFAULT NULL,
  `locale` varchar(10) DEFAULT NULL,
  `roles` varchar(1000) DEFAULT NULL,
  `top_role` varchar(100) DEFAULT NULL,
  `guild_id` bigint unsigned DEFAULT NULL,
  `userId` bigint unsigned DEFAULT NULL,
  `discord_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discord_member_UN` (`guild_id`,`discord_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- oxygen.discord_channel definition

CREATE TABLE `discord_channel` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guild_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `channel_id` bigint unsigned NOT NULL,
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `channel_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `topic` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `category_name` varchar(100) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discord_channel_UN` (`channel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='部门信息表';

-- oxygen.discord_channel_member definition

CREATE TABLE `discord_channel_member` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `discord_id` bigint unsigned NOT NULL,
  `channel_id` bigint unsigned NOT NULL,
  `guild_id` bigint unsigned NOT NULL,
  `event_time` timestamp NOT NULL,
  `isLeft` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discord_channel_member_UN` (`discord_id`,`channel_id`,`guild_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户信息表';

-- oxygen.discord_channel_member_join definition

CREATE TABLE `discord_channel_member_join` (
  `event_time` timestamp NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `event` varchar(6) DEFAULT NULL,
  `guild_id` bigint unsigned NOT NULL,
  `discord_id` bigint unsigned NOT NULL,
  `channel_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discord_channel_member_join_UN` (`guild_id`,`discord_id`,`channel_id`,`event`,`event_time`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- oxygen.discord_channel_member_hourly_snapshot definition

-- CREATE TABLE `discord_channel_member_hourly_snapshot` (
--   `id` bigint unsigned NOT NULL AUTO_INCREMENT,
--   `discord_id` bigint unsigned NOT NULL,
--   `channel_id` bigint unsigned NOT NULL,
--   `guild_id` bigint unsigned NOT NULL,
--   `event_time` timestamp NOT NULL,
--   PRIMARY KEY (`id`)
-- ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- oxygen.discord_member_join definition

CREATE TABLE `discord_member_join` (
  `event_time` timestamp NOT NULL,
  `discord_id` bigint unsigned NOT NULL,
  `event` varchar(6) NOT NULL,
  `guild_id` bigint unsigned NOT NULL,
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discord_member_join_UN` (`event_time`,`discord_id`,`event`,`guild_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- oxygen.discord_message definition

CREATE TABLE `discord_message` (
  `message_id` bigint unsigned NOT NULL,
  `author_id` bigint unsigned DEFAULT NULL,
  `author_name` varchar(50) DEFAULT NULL,
  `guild_id` bigint unsigned DEFAULT NULL,
  `guild_name` varchar(50) DEFAULT NULL,
  `channel_id` bigint unsigned DEFAULT NULL,
  `channel_name` varchar(50) DEFAULT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `content` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `edited_at` timestamp NULL DEFAULT NULL,
  `jump_url` varchar(500) DEFAULT NULL,
  `mention_everyone` tinyint(1) DEFAULT NULL,
  `mentions` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `pinned` tinyint(1) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discord_message_UN` (`message_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- oxygen.team definition

CREATE TABLE `team` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `auth` text,
  `status` enum('enabled','disabled') NOT NULL DEFAULT 'enabled',
  `isDelete` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `discord_guild_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='team信息表';