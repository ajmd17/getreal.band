const nodeMailer = require('nodemailer')

const serverConfig = require('./server_config.json')

const mailer = {
  _transport: nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: serverConfig.MAILER_ADDRESS,
      pass:  serverConfig.MAILER_PASSWORD
    }
  }),

  send(to, subject, html, cc=[]) {
    return this._transport.sendMail({
      to, subject, html, cc
    });
  }
}

module.exports = mailer