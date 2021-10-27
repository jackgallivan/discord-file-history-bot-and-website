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
			channel: '#fun',
			username: 'mutable#4057',
			date: '10/26/2021',
			filetype: 'PNG',
			filename: 'test_image.png',
			image: true,
			url: 'https://cdn.discordapp.com/attachments/902068000927121469/902721484143865897/test_image.png'
		},
		{
			channel: '#general',
			username: 'mutable#4057',
			date: '10/25/2021',
			filetype: 'PDF',
			filename: 'CS361_Assignment_3_Fall_2021.pdf',
			image: false,
			url: 'https://cdn.discordapp.com/attachments/902068000927121469/902279497750044692/CS361_Assignment_3_Fall_2021.pdf'
		}
	]
	res.render('home', content)
})

app.listen(PORT,() => console.log(`Started on http://localhost:${PORT}\nPress ctrl+c to end`))
