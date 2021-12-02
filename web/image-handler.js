module.exports = handleImages

const request = require('request-promise-native').defaults({encoding: null})

async function handleImages(dataList) {
	try {
		for (let row of dataList) {
			if (row.contentType != 'image/png' && row.contentType != 'image/jpeg') {
				continue
			}
			// Contact image microservice
			row.imgData = await getThumbnails(row)
			row.image = true
		}
	} catch (err) {
		console.error(err)
		return
	}
}

async function getThumbnails(row) {
	const response = await request({
		method: 'POST',
		url: 'http://flip1.engr.oregonstate.edu:7099/upload',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		form: {image: row.url},
		resolveWithFullResponse: true,
	})
	const thumbnail =
		'data' +
		response.headers['content-type'] +
		';base64,' +
		Buffer.from(response.body).toString('base64')
	return thumbnail
}
