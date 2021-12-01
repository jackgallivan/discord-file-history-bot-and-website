// module.exports = ServerDataHandler

const request = require('request-promise-native')

class ServerDataHandler {

	/* Public class fields */
	msg
	guildObj
	errorMsg = ''

	/* Private class fields */
	#guild = {};
	#channels = []
	#members = []
	#messages = []
	#attachments = []

	/* Class constructor */
	constructor(msg, guild) {
		this.msg = msg
		this.guildObj = guild
	}

	/* Publc class methods */

	// Finds and stores in class fields all the necessary server info
	async init () {
		await this.#saveGuildInfo()

		for (const channel of this.guildObj.channels.filter(channel => channel.type == 0)) {
			// Save channel info
			this.#saveChannelInfo(channel)

			// Process the channel's messages
			await this.#handleChannelMessages(channel)
		}
	}

	/* Getter methods */

	getGuild () {
		return this.#guild
	}

	getChannels () {
		return this.#channels
	}

	getMembers () {
		return this.#members
	}

	getMessages () {
		return this.#messages
	}

	getAttachments () {
		return this.#attachments
	}

	/* Private class methods */

	// Saves guild info
	async #saveGuildInfo () {
		this.#guild.guildID = this.guildObj.id
		this.#guild.guildName = this.guildObj.name
		this.#guild.shortID = await this.#requestShortId()
	}

	// Requests a short uuid from external microservice
	async #requestShortId () {
		this.errorMsg = 'Error creating URL.'
		const body = await request('http://3.22.67.101/generate')
		const content = JSON.parse(body)
		return content.uuid
	}

	async #handleChannelMessages (channel) {
		let [earliestMsgId, earliestMsgTime] = [this.msg.id, this.msg.timestamp]
		this.errorMsg = 'Error getting message history.'
		let chMessages = await channel.getMessages({before: earliestMsgId})

		while (chMessages.length > 0) {
			for (const msg of chMessages) {
				// Track earliest message in ChMessages array
				if (msg.timestamp < earliestMsgTime) {
					[earliestMsgTime, earliestMsgId] = [msg.timestamp, msg.id]
				}
				// Process the message's data
				await this.#handleMessageData(msg)
			}

			this.errorMsg = 'Error getting message history.'
			chMessages = await channel.getMessages({before: earliestMsgId})
		}
	}

	async #handleMessageData (msg) {
		// Skip messages without attachments
		if (msg.attachments.length < 1) return

		// Process the message's author data
		this.#handleMemberData(msg)

		// Save message info
		this.#saveMessageInfo(msg)

		// Save attachment info
		for (const attachment of msg.attachments) {
			this.#saveAttachmentInfo(msg, attachment)
		}
	}

	#handleMemberData (msg) {
		// No duplicates
		if (this.#members.filter(mem => mem.userID == msg.member.id).length < 1) {
			// Save member info
			this.#saveMemberInfo(msg)
		}
	}

	#saveChannelInfo (channel) {
		this.#channels.push({
			channelID: channel.id,
			channelName: channel.name,
			guildID: channel.guild.id
		})
	}

	#saveMemberInfo (msg) {
		this.#members.push({
			userID: msg.author.id,
			guildID: msg.guildID,
			userName: msg.author.username,
			userNick: msg.member.nick || null
		})
	}

	#saveMessageInfo (msg) {
		const time = new Date(msg.timestamp)
		this.#messages.push({
			messageID: msg.id,
			channelID: msg.channel.id,
			guildID: msg.guildID,
			userID: msg.author.id,
			messageDate: time.toISOString()
		})
	}

	#saveAttachmentInfo (msg, attachment) {
		this.#attachments.push({
			attachmentID: attachment.id,
			messageID: msg.id,
			attType: attachment.content_type,
			attName: attachment.filename,
			attURL: attachment.url
		})
	}
}

module.exports = ServerDataHandler