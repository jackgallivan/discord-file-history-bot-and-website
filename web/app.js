const PORT = 3000

const mysql = require('./dbcon')
const express = require('express')
const exphbs = require('express-handlebars')
const request = require('request-promise-native').defaults({encoding: null})

const app = express()
const hbs = exphbs.create({
	layoutsDir: __dirname + '/views/layouts',
	extname: 'hbs',
	defaultLayout: 'main',
	partialsDir: __dirname + '/views/partials'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.use(express.static('public'))

// Main page display
app.get('/:shortID', async (req, res, next) => {
	try {
		const context = {}

		// Get guild name
		const selectGuildName = 'SELECT guildName FROM guilds WHERE shortID = ?'
		const [guildResults, guildFields] = await mysql.pool.query(selectGuildName, [req.params.shortID])
		if (guildResults.length < 1) {
			res.render('home', context)
			return
		}
		context.servername = guildResults[0].guildName
		// Get all data corresponding to guild
		const selectData = 'SELECT ch.channelName AS channel, IF(mem.userNick IS NULL, mem.userName, mem.userNick) AS username, DATE_FORMAT(msg.messageDate, "%Y-%m-%d %T") AS date, att.attType AS contentType, att.attName AS filename, att.attURL AS url ' +
		'FROM attachments att ' +
		'JOIN messages msg ON att.messageID = msg.messageID ' +
		'JOIN members mem ON msg.userID = mem.userID ' +
		'JOIN channels ch ON msg.channelID = ch.channelID ' +
		'JOIN guilds g ON msg.guildID = g.guildID ' +
		'WHERE g.shortID = ?'
		const [dataResults, dataFields] = await mysql.pool.query(selectData, [req.params.shortID])
		if (dataResults.length < 1) {
			res.render('home', context)
			return
		}
		context.dataList = dataResults
		// Mark images as such
		for (let row of context.dataList) {
			if (row.contentType == 'image/png' || row.contentType == 'image/jpeg') {
				row.image = true

				// Contact image microservice
				const options = {
					method: 'POST',
					url: 'http://flip1.engr.oregonstate.edu:7099/upload',
					'headers': {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					'form': {
						'image': row.url
					},
					resolveWithFullResponse: true
				}
				const response = await request(options).catch(err => {throw new Error(err)})
				console.log(response.headers)
				row.imgData = 'data:' + response.headers['content-type'] + ';base64,' + Buffer.from(response.body).toString('base64')
			}
		}
		res.render('home', context)
	} catch(err) {
		next(err)
		return
	}

})

// 404
app.use(function (req, res) {
	res.status(404)
	res.render('404')
})

// 500
app.use(function (err, req, res, next) {
	console.error(err.stack)
	res.status(500)
	res.render('500')
})

app.listen(PORT,() => console.log(`Started on http://localhost:${PORT}\nPress ctrl+c to end`))
