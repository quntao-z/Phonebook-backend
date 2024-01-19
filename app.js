const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const express = require('express')
const cors = require('cors')
const personsRouter = require('./controllers/persons')
const app = express()
const mongoose = require('mongoose')
mongoose.set('strictQuery',false)

const url = config.MONGODB_URI
logger.info('connecting to', url)

mongoose.connect(url)
  .then(
    logger.info('connected to MongoDB')
  )
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })


app.use(middleware.requestLogger)
app.use(express.json())
app.use(express.static('dist'))
app.use(cors)

app.use('/api/persons', personsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app

