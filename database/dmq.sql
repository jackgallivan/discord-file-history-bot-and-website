-- Data Manipulation Queries:
-- using @ to denote variables


-- DISCORD BOT

-- GUILDS TABLE OPERATIONS

-- CREATE new guild
INSERT INTO guilds (guildID, guildName)
VALUES (@guild_id, @guild_name);

-- READ guild shortID
SELECT shortID
FROM guilds
WHERE guildID = @guild_id;

-- UPDATE guild shortID
UPDATE guilds
SET shortID = @short_id
WHERE guildID = @guild_id;

-- UPDATE guild name
UPDATE guilds
SET guildName = @guild_name
WHERE guildID = @guild_id;

-- DELETE guild
DELETE FROM guilds
WHERE guildID = @guild_id;


-- CHANNELS TABLE OPERATIONS

-- CREATE new channel
INSERT INTO channels (channelID, channelName, guildID)
VALUES (@channel_id, @channel_name, @guild_id);

-- UPDATE channel name
UPDATE channels
SET channelName = @channel_name
WHERE channelID = @channel_id;

-- DELETE channel
DELETE FROM channels
WHERE channelID = @channel_id;


-- MEMBERS TABLE OPERATIONS

-- CREATE new member
INSERT INTO members (userID, guildID, userName, userNick)
VALUES (@user_id, @guild_id, @user_name, @user_nick);

-- UPDATE member name
UPDATE members
SET userName = @user_name
WHERE userID = @user_id;

-- UPDATE member nick
UPDATE members
SET userNick = @user_nick
WHERE userID = @user_id;

-- DELETE member
DELETE FROM members
WHERE userID = @user_id;


-- MESSAGES TABLE OPERATIONS

-- CREATE new message
INSERT INTO messages (messageID, channelID, guildID, userID, messageDate)
VALUES (@message_id, @channel_id, @guild_id, @user_id, @message_date);

-- UPDATE message date
UPDATE messages
SET messageDate = @message_date
WHERE messageID = @message_id;

-- DELETE message
DELETE FROM messages
WHERE messageID = @message_id;


-- ATTACHMENTS TABLE OPERATIONS

-- CREATE new attachment
INSERT INTO attachments (attachmentID, messageID, attType, attName, attURL)
VALUES (@attachment_id, @message_id, @content_type, @filename, @url);

-- attachments can't be updated
-- attachments are only deleted when the corresponding message is deleted


-- OTHER OPERATIONS

-- READ all attachment for a specified URL path (@short_id)
SELECT g.guildName, ch.channelName, IF(mem.userNick IS NULL, mem.userNick, mem,userName), msg.messageDate, att.attType, att.attName, att.attURL
FROM attachments att
JOIN messages msg ON att.messageID = msg.messageID
JOIN members mem ON msg.userID = mem.userID
JOIN channel ch ON msg.channelID = ch.channelID
JOIN guild g ON msg.guildID = g.guildID
WHERE g.shortID = @short_id;

-- TRIGGERS

-- TRIGGER AFTER DELETE message.
-- If no other messages contain the deleted message's userID, then delete the
--	member with the corresponding userID.
delimiter //
CREATE TRIGGER delete_member AFTER DELETE ON messages
FOR EACH ROW
BEGIN
IF (SELECT COUNT(userID) FROM messages WHERE userID = old.userID) != 0 THEN
DELETE FROM members WHERE userID = old.userID;
END IF;
END;//
delimiter ;
