// References:
// [1]	How to Make a Discord Bot: an Overview and Tutorial
//		https://www.toptal.com/chatbot/how-to-make-a-discord-bot
// [2]	Documentation for Eris
//		https://abal.moe/Eris/docs/
// [3]	JavaScript Reference
//		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference

const mysql = require('./dbcon')
const request = require('request-promise')

const eris = require('eris')
const credentials = require('../credentials')

const PREFIX = 'hist!'
const BOT_OWNER_ID = '155066306415034368'
const WEB_DOMAIN = 'http://localhost:3000'

const bot = new eris.CommandClient(credentials.bot_token, {}, {
	description: 'Provides a web interface to view file uploads to your server.',
	prefix: PREFIX,
	owner: ''
})


/* Action performed when 'ready' event emitted */

bot.on('ready', () => {
	console.log('Connected and ready.')
})


/* Action performed when 'error' event emitted */

bot.on('error', err => {
	console.error(err)
})


/* Requests a short uuid from external microservice */

async function requestShortId () {
	let resMsg
	await request('http://3.22.67.101/generate', function (error, response, body) {
		if (!error && response.statusCode < 400) {
			const content = JSON.parse(body)
			resMsg = content.uuid
			return
		}
		console.error(error)
		return
	})
	return resMsg
}


/* Register init command */

bot.registerCommand('init', async (msg, args) => {
	// Command generator

	let errMsg

	// Command can only be run if guild info not yet in database
	// Verify command has not been run before by searching for guild id in database
	await mysql.pool.query('SELECT * FROM guilds WHERE guildID = ?', [msg.guildID],
		function (error, results, fields) {
			if (error) {
				console.error(error)
				errMsg = 'Error searching for guild info in database.'
				return
			}
			if (results.length != 0) {
				errMsg = 'Command can only be run once.\nUse ' + PREFIX + 'help to view other commands.'
				return
			}
		})
	if (errMsg) return errMsg

	await msg.channel.createMessage('Saving server data. Please wait...')

	/* Gather all info needed for database */

	const guild = bot.guilds.find(guild => guild.id == msg.guildID)

	// Get guild
	const guilds = {}
	guilds.guildID = guild.id
	guilds.guildName = guild.name
	guilds.shortID = await requestShortId()  // Create shortID for guild
	if (!guilds.shortID) {
		return 'Error creating URL.'
	}

	// Get text channels, attachment-containing messages, and attachments
	const channels = []
	const members = []
	const messages = []
	const attachments = []

	// For each guild text channel
	for (const channel of guild.channels.filter(channel => channel.type == 0)) {

		// Save channel ID, name, guild ID
		channels.push({
			channelID: channel.id,
			channelName: channel.name,
			guildID: guild.id
		})

		let earliestMsgId = msg.id
		let earliestMsgTime = msg.timestamp
		let chMessages = await channel.getMessages({before: earliestMsgId})
		while (chMessages.length > 0) {
			for (let message of chMessages) {
				if (message.timestamp < earliestMsgTime) {
					// Track earliest message in ChMessages array
					earliestMsgTime = message.timestamp
					earliestMsgId = message.id
				}
				// Skip messages without attachments
				if (message.attachments.length < 1) continue

				// Get message member, attachments
				const user = message.author
				const member = guild.members.find(member => member.id == user.id)
				const messageAttachments = message.attachments

				// Save member info
				if (members.filter(mem => mem.userID == user.id).length < 1) {
					members.push({
						userID: user.id,
						guildID: guild.id,
						userName: user.username,
						userNick: member.nick || null
					})
				}

				let time = new Date(message.timestamp)

				// Save message info
				messages.push({
					messageID: message.id,
					channelID: channel.id,
					guildID: guild.id,
					userID: user.id,
					messageDate: time.toISOString()
				})

				// Save attachment info
				for (const attachment of messageAttachments) {
					attachments.push({
						attachmentID: attachment.id,
						messageID: message.id,
						attType: attachment.content_type,
						attName: attachment.filename,
						attURL: attachment.url
					})
				}
			}
			chMessages = await channel.getMessages({before: earliestMsgId})
		}  // while (chMessages.length > 0)
	}  // for (channel)


	/* Add all gathered info to database */

	// Add guild info to database
	const insertGuild = 'INSERT INTO guilds (guildId, guildName, shortID) ' +
		'VALUES (?, ?, ?)'
	await mysql.pool.query(insertGuild, [guilds.guildID, guilds.guildName, guilds.shortID],
		function (error, results, fields) {
			if (error) {
				console.error(error)
				errMsg = 'Error inserting guild info into database.'
				return
			}
		})
	if (errMsg) return errMsg

	// Add channel info to database (only text channels)
	const insertChannel = 'INSERT INTO channels (channelID, channelName, guildID) ' +
		'VALUES (?, ?, ?)'
	channels.forEach(async ch => {
		// Perform an individual query to insert each channel into the database
		await mysql.pool.query(insertChannel, [ch.channelID, ch.channelName, ch.guildID],
			function (error, results, fields) {
				if (error) {
					console.error(error)
					errMsg = 'Error inserting channel info into database.'
					return
				}
			})
	})
	if (errMsg) return errMsg

	// Add member info to database (only members who have created a message with an attachment)
	const insertMember = 'INSERT INTO members (userID, guildID, userName, userNick) ' +
		'VALUES (?, ?, ?, ?)'
	for (const mem of members) {
		// Perform an individual query to insert each member into the database
		await mysql.pool.query(insertMember, [mem.userID, mem.guildID, mem.userName, mem.userNick],
			function (error, results, fields) {
				if (error) {
					console.error(error)
					errMsg = 'Error inserting member info into database.'
					return
				}
			})
	}
	if (errMsg) return errMsg

	// Add message info to database (only messages containing attachments)
	const insertMessage = 'INSERT INTO messages (messageID, channelID, guildID, userID, messageDate) ' +
		'VALUES (?, ?, ?, ?, STR_TO_DATE(?, \'%Y-%m-%dT%T.%fZ\'))'
	for (const msg of messages) {
		// Perform an individual query to insert each message into the database
		await mysql.pool.query(insertMessage, [msg.messageID, msg.channelID, msg.guildID, msg.userID, msg.messageDate],
			function (error, results, fields) {
				if (error) {
					console.error(error)
					errMsg = 'Error inserting message info into database.'
					return
				}
			})
	}
	if (errMsg) return errMsg

	// Add attachment info to database
	const insertAttachment = 'INSERT INTO attachments (attachmentID, messageID, attType, attName, attURL) ' +
		'VALUES (?, ?, ?, ?, ?)'
	for (const att of attachments) {
		// Perform an individual query to insert each attachment into the database
		await mysql.pool.query(insertAttachment, [att.attachmentID, att.messageID, att.attType, att.attName, att.attURL],
			function (error, results, fields) {
				if (error) {
					console.error(error)
					errMsg = 'Error inserting attachment info into database.'
					return
				}
			})
	}
	if (errMsg) return errMsg

	const response = 'Initialization complete. Server data logged and ready for web view.\n' +
		'View server upload history using the following link:\n\n' + WEB_DOMAIN + '/' + guilds.shortID

	return response
}, {
	// Command options
	description: 'One-time command used to save server data and past uploads. Required to enable bot functionality.',
	fullDescription: 'Saves server information and file upload information to a database.',
	requirements: {
		permissions: {
			'administrator': true
		}
	}
})


/* Register url command */

bot.registerCommand('url', async (msg, args) => {
	// Returns URL for server's upload history

	const guildId = msg.guildID
	let url = WEB_DOMAIN + '/'

	// Query shortId from database
	const selectShortId = 'SELECT shortID FROM guilds WHERE guildID = ?'
	await mysql.pool.query(selectShortId, [guildId],
		function (error, results, fields) {
			if (error) {
				console.error(error)
				return 'Error: Please use ' + PREFIX + 'init command first.'
			}
			const shortId = results[0].shortID
			url += shortId
		})

	return url
}, {
	argsRequired: false,
	description: "Get the URL to the webpage hosting your server's file upload history."
})


/* Perform action when 'messageCreate' event emitted */

bot.on('messageCreate', async (msg) => {
	try {
		const attachments = msg.attachments

		// Ignore messages without attachments
		if (!attachments[0]) {
			return
		}

		resMsg = 'Attachment(s) logged!'
		const insertAttachment = 'INSERT INTO attachments (attachmentID, messageID, attType, attName, attURL) ' +
			'VALUES (?, ?, ?, ?, ?)'
		attachments.forEach(async att => {
			// Perform an individual query to insert each attachment into the database
			await mysql.pool.query(insertAttachment, [att.attachmentID, att.messageID, att.attType, att.attName, att.attURL],
				function (error, results, fields) {
					if (error) {
						console.error(error)
						resMsg = 'Error inserting attachment(s) info into database.'
					}
				})
		})
		await msg.channel.createMessage(resMsg)
	} catch (err) {
		console.warn('Error logging message attachment')
		console.warn(err)
	}
})

/* Connect bot */
bot.connect()
