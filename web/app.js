const PORT = 3000

const mysql = require('./dbcon')
const express = require('express')
const exphbs = require('express-handlebars')
const request = require('request')
const https = require('https')

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
app.get('/:shortID', (req, res) => {
	const context = {}

	// Get guild name
	const selectGuildName = 'SELECT guildName FROM guilds WHERE shortID = ?'
	mysql.pool.query(selectGuildName, [req.params.shortID],
		function (error, guildResults, fields) {
			if (error) {
				next(error)
				return
			}
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
			mysql.pool.query(selectData, [req.params.shortID],
				function (error, dataResults, fields) {
					if (error) {
						next(error)
						return
					}
					if (dataResults.length < 1) {
						res.render('home', context)
						return
					}
					context.dataList = dataResults
					// Mark images as such
					context.dataList.forEach(function (row) {
						if (row.contentType == 'image/png' || row.contentType == 'image/jpeg') {
							// // Contact image microservice
							// https.get(row.url, stream => {
							// 	console.log(stream)
							// 	const options = {
							// 		'method': 'POST',
							// 		'url': 'http://flip1.engr.oregonstate.edu:7081/upload',
							// 		'headers': {},
							// 		'formData': {
							// 			'image': {
							// 				'value': stream
							// 			}
							// 		}
							// 	}
							// 	request(options, function (error, response) {
							// 		if (error) throw new Error(error)
							// 		console.log(response.body)
							// 	})
							// })
							row.image = true
						}
					})
					res.render('home', context)
				})
		})
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
