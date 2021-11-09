SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS guilds;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE guilds (
	guildID varchar(19) NOT NULL PRIMARY KEY,
	guildName varchar(100) NOT NULL,
	shortID varchar(10) DEFAULT NULL
);

CREATE TABLE channels (
	channelID varchar(19) NOT NULL PRIMARY KEY,
	channelName varchar(100) NOT NULL,
	guildID varchar(19) NOT NULL,
	FOREIGN KEY (guildID) REFERENCES guilds (guildID) ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE members (
	userID varchar(19) NOT NULL,
	guildID varchar(19) NOT NULL,
	userName varchar(32) NOT NULL,
	userNick varchar(32) DEFAULT NULL,
	FOREIGN KEY (guildID) REFERENCES guilds (guildID) ON DELETE CASCADE ON UPDATE RESTRICT,
	PRIMARY KEY (userID, guildID)
);

CREATE TABLE messages (
	messageID varchar(19) NOT NULL PRIMARY KEY,
	channelID varchar(19) NOT NULL,
	guildID varchar(19) NOT NULL,
	userID varchar(19),
	messageDate datetime NOT NULL,
	FOREIGN KEY (channelID) REFERENCES channels (channelID) ON DELETE CASCADE ON UPDATE RESTRICT,
	FOREIGN KEY (guildID) REFERENCES guilds (guildID) ON DELETE CASCADE ON UPDATE RESTRICT,
	FOREIGN KEY (userID) REFERENCES members (userID) ON DELETE SET NULL ON UPDATE RESTRICT
);

CREATE TABLE attachments (
	attachmentID varchar(19) NOT NULL PRIMARY KEY,
	messageID varchar(19) NOT NULL,
	attType varchar(128) NOT NULL,
	attName varchar(255) NOT NULL,
	attURL varchar(512) UNIQUE NOT NULL,
	FOREIGN KEY (messageID) REFERENCES messages (messageID) ON DELETE CASCADE ON UPDATE RESTRICT
);
