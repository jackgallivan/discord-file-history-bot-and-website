const PORT = 3000

const queries = require('./query-functions')
const handleImages = require('./image-handler')
const express = require('express')
const exphbs = require('express-handlebars')

const app = express()
const hbs = exphbs.create({
	layoutsDir: __dirname + '/views/layouts',
	extname: 'hbs',
	defaultLayout: 'main',
	partialsDir: __dirname + '/views/partials',
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.use(express.static('public'))

// Main page display
app.get('/history/:shortID', async (req, res, next) => {
	try {
		const context = {}

		// Get guild name
		context.servername = await queries.getGuildName(req.params.shortID)

		// Get all data corresponding to guild
		context.dataList = await queries.getGuildData(req.params.shortID)

		// Mark images as such
		await handleImages(context.dataList)

		// Render page
		res.render('home', context)
		return
	} catch (err) {
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
	console.error(err)
	res.status(500)
	res.render('500')
})

app.listen(PORT, () =>
	console.log(`Started on http://localhost:${PORT}\nPress ctrl+c to end`)
)
