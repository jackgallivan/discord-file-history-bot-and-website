const express = require('express');
const bodyParser = require('body-parser')
const Jimp = require('jimp');
const app = express();
const path = require('path');

const PORT = 7099;
const thumbnail = path.join(__dirname, '/uploads/thumbnail.png');

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use(bodyParser.urlencoded({ extended: true }));

// upload route
app.post('/upload', (req, res) => {
    try {
        Jimp.read(req.body.image, async (err, image) => {
            if (err) throw err;
            await image
            .resize(100,100)
            //saves thumbnail into uploads directory
            .writeAsync(thumbnail);
            res.sendFile(thumbnail);
        });
        // return res.status(201).json({
        //     message: "Image has been resized"
        // });
    } catch (error) {
        console.error(error);
    }
});

app.listen(PORT, () => console.log(`Image microservice listening on port ${PORT}`));
