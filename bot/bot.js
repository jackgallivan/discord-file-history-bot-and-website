// References:
// [1]	How to Make a Discord Bot: an Overview and Tutorial
//		https://www.toptal.com/chatbot/how-to-make-a-discord-bot
// [2]	Documentation for Eris
//		https://abal.moe/Eris/docs/
// [3]	JavaScript Reference
//		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference

const mysql = require('./dbcon')
const request = require('request')

const eris = require('eris')
const credentials = require('../credentials')

const PREFIX = 'hist!'
const BOT_OWNER_ID = '155066306415034368'

const bot = new eris.CommandClient(credentials.bot_token, {}, {
	description: 'Provides a web interface to view file uploads to your server.',
	prefix: PREFIX,
	owner: ''
})

bot.on('ready', () => {
	console.log('Connected and ready.')
})

bot.on('error', err => {
	console.error(err)
})

function requestShortId () {
	request('http://3.22.67.101:3000/generate', function (err, response, body) {
		if (!err && response.statusCode < 400) {
			const content = JSON.parse(body)
			return content.uuid
		}
		return null
	})
}

bot.registerCommand('init', (msg, args) => {
	msg.channel.createMessage('Logging file upload history...')

	const guild = msg.channel.guild

	// Get guild id, name, and shortId
	const guilds = {}
	guilds.guildID = guild.id
	guilds.guildName = guild.name
	const shortId = requestShortId()  // Create shortID for guild
	if (shortId == null) {
		// TODO: handle error
	} else {
		guilds.shortID = shortId
	}

	// Get text channels, attachment-containing messages, and attachments
	const channels = []
	const members = []
	const messages = []
	const attachments = []
	// For each guild channel
	for (const [_, channel] of guild.channels) {

		// Get only text channels (type == 0)
		if (channel.type == 0) {

			// Save channel ID, name, guild ID
			channels.push({
				channelID: channel.id,
				channelName: channel.name,
				guildID: guild.id
			})

			// For each channel message
			for (const [_, message] of channel.messages) {
				// Skip messages without attachments
				if (!message.attachments) {
					continue
				}

				// Get message member, attachments
				const member = message.member
				const messageAttachments = message.attachment

				// Save member info
				members.push({
					userID: member.id,
					guildID: guild.id,
					userName: member.username,
					userNick: member.nick || null
				})

				// Save message info
				messages.push({
					messageID: message.id,
					channelID: channel.id,
					guildID: guild.id,
					userID: member.id,
					messageDate: message.timestamp
				})

				// Save attachment info
				messageAttachments.forEach(attachment => {
					attachments.push({
						attachmentID: attachment.id,
						messageID: message.id,
						attType: attachment.content_type,
						attName: attachment.filename,
						attURL: attachment.url
					})
				})  // messageAttachments.forEach
			}  // for (...of channel.messages)
		}  // if (channel.type == 0)
	}  // for (...of guild.channels)

	// Add guild info to database
	const addGuildString = 'INSERT INTO guilds (guildId, guildName, shortID) ' +
		'VALUES (?, ?, ?)'
	mysql.pool.query(addGuildString, [guilds.id, guilds.name, guilds.shortID],
		function (err, result) {
			if (err) {
				// TODO: Handle error
				return
			}
		})

	// Add channels' info to database
	const addChannelString = 'INSERT INTO channels (channelID, channelName, guildID) ' +
		'VALUES (?, ?, ?)'
	channels.forEach(ch => {
		mysql.pool.query(addChannelString, [ch.channelID, ch.channelName, ch.guildID],
			function (err, result) {
				if (err) {
					// TODO: Handle error
					return
				}
			})
	})

	// Add member info to database
	const addMemberString = 'INSERT INTO members (userID, guildID, userName, userNick) ' +
		'VALUES (?, ?, ?, ?)'
	members.forEach(mem => {
		mysql.pool.query(addMemberString, [mem.userID, mem.guildID, mem.userName, mem.userNick],
			function (err, result) {
				if (err) {
					// TODO: Handle error
					return
				}
			})
	})

	// Add message info to database
	const addMessageString = 'INSERT INTO messages (messageID, channelID, guildID, userID, messageDate) ' +
		'VALUES (?, ?, ?, ?, CAST(? AS DATETIME))'
	messages.forEach(msg => {
		mysql.pool.query(addMessageString, [msg.messageID, msg.channelID, msg.guildID, msg.userID, msg.messageDate],
			function (err, result) {
				if (err) {
					// TODO: Handle error
					return
				}
			})
	})

	// Add attachment info to database
	const addAttachmentString = 'INSERT INTO attachments (attachmentID, messageID, attType, attName, attURL) ' +
		'VALUES (?, ?, ?, ?, ?)'
	attachments.forEach(att => {
		mysql.pool.query(addAttachmentString, [att.attachmentID, att.messageID, att.attType, att.attName, att.attURL],
			function (err, result) {
				if (err) {
					// TODO: Handle error
					return
				}
			})
	})

	return 'Initialization complete. All attachment data logged and ready for webview.'
}, {
	argsRequired: false,
	description: 'Logs file upload history. Use after adding the bot to the server to log older message attachments.'
})

bot.registerCommand('url', (msg, args) => {
	// TODO: query URL from web server

	url = 'http://localhost:3000/a8Djes0'  // Example

	return url
}, {
	argsRequired: false,
	description: "Produces the URL to the web page showing your server's file upload history."
})

bot.on('messageCreate', async (msg) => {
	try {
		const attachments = msg.attachments

		// Ignore messages without attachments
		if (!attachments[0]) {
			return
		}

		attachments.forEach(async attachment => {
			// TODO: log all message attachments in database
			await msg.channel.createMessage(`Attachment logged!\ncontent_type: ${attachment['content_type']}\nurl: ${attachment['url']}`)
		})
	} catch (err) {
		console.warn('Error logging message attachment')
		console.warn(err)
	}
})

bot.connect()
