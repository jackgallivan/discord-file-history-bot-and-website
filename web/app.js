const mysql = require('./dbcon')

const express = require('express')
const app = express()
const PORT = 3000

const handlebars = require('express-handlebars')
app.set('view engine', 'hbs')
app.engine('hbs', handlebars({
	layoutsDir: __dirname + '/views/layouts',
	extname: 'hbs',
	defaultLayout: 'main',
	partialsDir: __dirname + '/views/partials'
}))

app.use(express.static('public'))

// Example page
app.get('/a8Djes0', (req, res) => {
	const context = {}
	context.servername = 'Test Server'
	context.dataList = [
		{
			channel: '#general',
			username: 'mutable',
			date: '10/27/2021',
			filetype: 'PDF',
			filename: 'CS361_Assignment_5_Fall_2021.pdf',
			image: false,
			url: 'https://cdn.discordapp.com/attachments/903085352401662033/903085855021883455/CS361_Assignment_5_Fall_2021.pdf'
		},
		{
			channel: '#random',
			username: 'mutable',
			date: '10/27/2021',
			filetype: 'PNG',
			filename: 'test_image.png',
			image: true,
			url: 'https://cdn.discordapp.com/attachments/903085420609417267/903085890006548480/test_image.png'
		}
	]
	res.render('home', context)
})

// Main page display
app.get('/:shortID', (req, res) => {
	const context = {}
	// Get guild name
	const selectGuildName = 'SELECT guildName FROM guilds WHERE guildID = ?'
	mysql.pool.query(selectGuildName, [req.params.shortID], function (err, rows, fields) {
		if (err) {
			next(err)
			return
		}
		context.servername = rows[0]
	})
	// Get all data corresponding to guild
	const selectData = 'SELECT ch.channelName AS channel, IF(mem.userNick IS NULL, mem.userNick, mem.userName) AS username, DATE_FORMAT(msg.messageDate, "%Y-%m-%d") AS date, att.attType AS filetype, att.attName AS filename, att.attURL AS url ' +
	'FROM attachments att ' +
	'JOIN messages msg ON att.messageID = msg.messageID ' +
	'JOIN members mem ON msg.userID = mem.userID ' +
	'JOIN channel ch ON msg.channelID = ch.channelID ' +
	'JOIN guild g ON msg.guildID = g.guildID ' +
	'WHERE g.shortID = ?'
	mysql.pool.query(selectData, [req.params.shortID], function (err, rows, fields) {
		if (err) {
			next(err)
			return
		}
		context.dataList = rows
	})
	// Mark images as such
	context.dataList.forEach(function (row) {
		if (row.filetype == 'png' || row.filetype == 'jpg' || row.filetype == 'jpeg') {
			row.image = true
		} else {
			row.image = false
		}
	})
	res.render('home', context)
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
