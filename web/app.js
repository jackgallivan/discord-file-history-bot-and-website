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

app.get('/a8Djes0', (req, res) => {
	const content = {}
	content.servername = 'Test Server'
	content.dataList = [
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
	res.render('home', content)
})

app.listen(PORT,() => console.log(`Started on http://localhost:${PORT}\nPress ctrl+c to end`))
