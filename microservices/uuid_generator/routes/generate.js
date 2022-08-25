const express = require('express')
const generateRouter = express.Router()
const generateUuid = require('../utils/uuid')

generateRouter.get("/generate", (req, res, next) => {
  // generate UUID and send response
  res.json({uuid: generateUuid()});
})

module.exports = generateRouter