module.exports = {
	guildExists,
	addGuild,
	addChannels,
	addMembers,
	addMessages,
	addAttachments,
	getShortID,
	getThenAddMember
}

const mysql = require('./dbcon')

/* MySQL query functions */

async function guildExists(guildID) {
	// Checks database to see if the specified guild already exists
	const [guildResults, _] = await mysql.pool.query('SELECT * FROM guilds WHERE guildID = ?', [guildID])
	if (guildResults.length != 0) {
		return true
	}
	return false
}

async function addGuild(guild) {
	// Adds guild to database
	const insertGuild = 'INSERT INTO guilds (guildId, guildName, shortID) ' +
		'VALUES (?, ?, ?)'
	try {
		await mysql.pool.query(insertGuild, [guild.guildID, guild.guildName, guild.shortID])
	} catch (err) {
		console.error(err)
		throw 'Error inserting guild info into database'
	}
}

async function addChannels(channels) {
	// Add channels to database
	const insertChannel = 'INSERT INTO channels (channelID, channelName, guildID) ' +
		'VALUES (?, ?, ?)'
	for (const ch of channels) {
		try {
			// Perform an individual query to insert each channel into the database
			await mysql.pool.query(insertChannel, [ch.channelID, ch.channelName, ch.guildID])
		} catch (err) {
			console.error(err)
			throw 'Error inserting channel info into database.'
		}
	}
}

async function addMembers(members) {
	// Add guild members to database
	const insertMember = 'INSERT INTO members (userID, guildID, userName, userNick) ' +
		'VALUES (?, ?, ?, ?)'
	for (const mem of members) {
		try {
			await mysql.pool.query(insertMember, [mem.userID, mem.guildID, mem.userName, mem.userNick])
		} catch (err) {
			console.error(err)
			throw 'Error inserting member info into database.'
		}
	}
}

async function addMessages(messages) {
	// Add messages to database
	const insertMessage = 'INSERT INTO messages (messageID, channelID, guildID, userID, messageDate) ' +
		'VALUES (?, ?, ?, ?, STR_TO_DATE(?, \'%Y-%m-%dT%T.%fZ\'))'
	for (const msg of messages) {
		try {
			// Perform an individual query to insert each message into the database
			await mysql.pool.query(insertMessage, [msg.messageID, msg.channelID, msg.guildID, msg.userID, msg.messageDate])
		} catch (err) {
			console.error(err)
			throw 'Error inserting message info into database.'
		}
	}
}

async function addAttachments(attachments) {
	// Add attachments to database
	const insertAttachment = 'INSERT INTO attachments (attachmentID, messageID, attType, attName, attURL) ' +
		'VALUES (?, ?, ?, ?, ?)'
	for (const att of attachments) {
		try {
			// Perform an individual query to insert each attachment into the database
			await mysql.pool.query(insertAttachment, [att.attachmentID, att.messageID, att.attType, att.attName, att.attURL])
		} catch (err) {
			console.error(err)
			throw 'Error inserting attachment info into database.'
		}
	}
}

async function getShortID (guildId, web_domain, prefix) {
	const selectShortId = 'SELECT shortID FROM guilds WHERE guildID = ?'
	try {
		// Query shortId from database
		const [results, _] = await mysql.pool.query(selectShortId, [guildId])
		if (results.length == 0) {
			return 'Error: Please use ' + prefix + 'init command first.'
		}
		return web_domain + '/' + results[0].shortID
	} catch (err) {
		console.error(err)
		throw 'Error getting URL from database.'
	}
}

async function getThenAddMember(member) {
	const getMember = 'SELECT * FROM members WHERE members.userID = ? AND members.guildID = ?'
	try {
		// Check if member already in database
		const [results, _] = await mysql.pool.query(getMember, [member.userID, member.guildID])
		// If member not in database, add them
		if (results.length < 1) {
			await addMembers(member)
		}
	} catch (err) {
		console.warn('Error selecting or inserting member info')
		throw err
	}
}