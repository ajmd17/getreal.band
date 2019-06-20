const express = require('express')

const mailer = require('../mailer')
const dataStore = require('../datastore')

const apiRouter = express.Router()

apiRouter.get('/', (req, res) => {
  res.sendStatus(200)
})

apiRouter.post('/contact', (req, res) => {
  if (!req.body.email || !req.body.email.length) {
    return res.status(400).send('email unprovided')
  }

  if (!req.body.message || !req.body.message.length) {
    return res.status(400).send('message unprovided')
  }

  dataStore.add('contact', {
    email: req.body.email,
    message: req.body.message,
    timestamp: new Date().toString()
  }).then(() => {
    res.send('Message sent successfully')
  }).catch((err) => {
    console.error(err)
    res.status(500).send('Message could not be sent: Server error')
  })

  // mailer.send('band@getreal.band', `Contact Form Submission from ${req.body.email}`, req.body.message).then(() => {
  //   res.send('Message send successfully')
  // }).catch((err) => {
  //   console.error(err)
  //   res.status(500).send('Message could not be sent: Server error')
  // })
})

apiRouter.use((req, res) => {
  res.sendStatus(404)
})

module.exports = apiRouter