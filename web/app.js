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

app.get('/', (req, res) => {
	content = {}
	res.render('home', content)
})

app.listen(PORT,() => console.log(`Started on http://localhost:${PORT}\nPress ctrl+c to end`))
