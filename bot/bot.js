// References:
// [1]	How to Make a Discord Bot: an Overview and Tutorial
//		https://www.toptal.com/chatbot/how-to-make-a-discord-bot
// [2]	Documentation for Eris
//		https://abal.moe/Eris/docs/
// [3]	JavaScript Reference
//		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference

const eris = require('eris')
const credentials = require('../credentials')

const PREFIX = 'uh!'
const BOT_OWNER_ID = '155066306415034368'

const bot = new eris.CommandClient(credentials.bot_token, {}, {
	description: 'Provides a web interface to view file uploads to your server.',
	prefix: PREFIX
})

bot.on('ready', () => {
	console.log('Connected and ready.')
})

bot.on('error', err => {
	console.error(err)
})

bot.registerCommand('init', (msg, args) => {
	msg.channel.createMessage('Logging file upload history...')

	// TODO: log file uploads to database

	return 'File uploads logged.'
}, {
	argsRequired: false,
	description: 'Logs file upload history.'
})

bot.registerCommand('url', (msg, args) => {
	// TODO: query URL from web server

	url = 'http://localhost:3000/a8Djes0'

	return url
}, {
	argsRequired: false,
	description: "Responds with the URL to your server's file upload history."
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
