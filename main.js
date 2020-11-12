const express = require('express')
const path = require('path')
const fs = require('fs')
const http = require('http')
const https = require('https')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const htmlToText = require('html-to-text')

const util = require('./util')
const serverConfig = require('./server_config.json')

const app = express()

function createServer() {
  if (process.env.NODE_ENV == 'production') {
    const httpsConfig = {
      ca: fs.readFileSync(path.join(__dirname, serverConfig.SSL_CA)).toString(),
      key: fs.readFileSync(path.join(__dirname, serverConfig.SSL_KEY)).toString(),
      cert: fs.readFileSync(path.join(__dirname, serverConfig.SSL_CERT)).toString()
    }

    return https.createServer(httpsConfig, app)
  } else {
    return http.createServer(app)
  }
}

const server = createServer()

function partialData(opts = {}) {
  return Object.assign({ util, serverConfig }, require('./data'), opts)
}

app
.set('view engine', 'ejs')
.set('views', path.join(__dirname, 'web'))
.use(bodyParser.json())
.use('/audio', express.static(path.join(__dirname, 'web', 'audio')))
.use('/css', express.static(path.join(__dirname, 'web', 'css')))
.use('/images', express.static(path.join(__dirname, 'web', 'images')))
.use('/js', express.static(path.join(__dirname, 'web', 'js')))
.use('/favicon.ico', express.static(path.join(__dirname, 'web', 'favicon.ico')))
.use('/sitemap.xml', express.static(path.join(__dirname, 'web', 'sitemap.xml')))
.use(['/api', '/api/*'], require('./api'))
.get('/teaser', (req, res, next) => {
  ejs.renderFile(path.join(__dirname, 'web', 'teaser.ejs'), {}, (err, str) => {
    if (err) {
      next()
      res.status(500).send('Server error')
      console.error('Server error: ', err)
    } else {
      res.send(str)
    }
  })
})
.get('/ep2', (req, res, next) => {
  ejs.renderFile(path.join(__dirname, 'web', 'twiof.ejs'), {}, (err, str) => {
    if (err) {
      next()
      res.status(500).send('Server error')
      console.error('Server error: ', err)
    } else {
      res.send(str)
    }
  })
})
.get('/', (req, res, next) => {
  const urlComponents = /\/?([A-Za-z0-9-_]+)(?:\/([A-Za-z0-9-_]*))?/.exec(req.originalUrl),
    partialName = 'home',
    paramsStr = '',
    params = []

  renderIndexPage(req, res, next, {
    urlComponents,
    partialName,
    paramsStr,
    params
  })
})
.get('/*', (req, res, next) => {
  const urlComponents = /\/?([A-Za-z0-9-_]+)(?:\/([A-Za-z0-9-_]*))?/.exec(req.originalUrl),
    partialName = urlComponents[1],
    paramsStr = urlComponents[2],
    params = (paramsStr && paramsStr.length) ? paramsStr.split('/') : []

  if (partialName === 'home' && Object.keys(req.query).length === 0) {
    res.redirect('/')

    return
  }

  renderIndexPage(req, res, next, {
    urlComponents,
    partialName,
    paramsStr,
    params
  })
})
// 404
.use((req, res) => {
  res.status(404)

  ejs.renderFile(path.join(__dirname, 'web', '404.ejs'), partialData(), (err, str) => {
    if (err) {
      res.status(500).send('Server error')
      console.error('Server error: ', err)
    } else {
      res.send(str)
    }
  })
})

function renderIndexPage(req, res, next, { urlComponents, partialName, paramsStr, params }) {
  const getPageInfo = (page, params) => {
    if (page === 'blog') {
      const blogposts = require('./data/blogposts.json')

      if (params.length > 0) {
        let blogpostIndex = blogposts.findIndex(obj => obj.slug == params[0]),
          blogpost = (blogpostIndex === -1) ? null : blogposts[blogpostIndex]

        if (blogpost == null) {
          return {
            pageTitle: null,
            metaDescription: null
          }
        }

        return {
          pageTitle: `Blog #${blogpostIndex + 1}: ${blogpost.title}`,
          metaDescription: util.getBlogpostDescription(blogpost),
          coverPhoto: blogpost.cover
        }
      }

      return {
        pageTitle: 'Blog',
        metaDescription: null,
        coverPhoto: blogposts
          .map(obj => obj.cover)
          .filter(obj => obj != null)[0]
      }
    } else if (page === 'releases') {
      const releases = require('./data/releases.json')

      if (params.length > 0) {
        let release = releases.find(obj => obj.slug == params[0])

        if (release != null) {
          return {
            pageTitle: release.title,
            metaDescription: null
          }
        }
      }

      return {
        pageTitle: 'Releases',
        metaDescription: 'Get Real! releases: ' + releases.map((release) => {
          return `${release.title} \u2022 ${release.released}`
        }).join(' / ')
      }
    } else if (page === 'lyrics') {
      if (params.length > 0) {
        let lyric = require('./data/lyrics.json').find(obj => obj.slug == params[0])

        if (lyric != null) {
          return {
            pageTitle: 'Get Real! - ' + lyric.title + ' Lyrics',
            metaDescription: util.truncate(htmlToText.fromString(util.renderMarkdownFile(path.join(__dirname, 'data', 'lyrics', lyric.slug + '.md'))).trim().replace(/\n+/g, ' / '), 250)
          }
        }
      }

      return {
        pageTitle: 'Lyrics',
        metaDescription: 'View lyrics to songs by Get Real!'
      }
    } else if (page === 'merch') {
      let itemContent = 'Buy Get Real! band merchandise',
          pageTitle = 'Merch'

      if (params.length > 0) {
        let item = require('./data/merch.json').find(obj => obj.slug == params[0])

        if (item != null) {
          try {
            itemContent = util.getTruncatedContent(util.renderMarkdownFile(path.join(__dirname, 'data', 'merch', item.slug + '.md')))
          } catch (err) {
            // no-op
          }

          pageTitle = item.title
        }
      }

      return {
        pageTitle: pageTitle,
        metaDescription: util.truncate(itemContent.trim().replace(/\n+/g, ' / '), 250),
        coverPhoto: item.cover
      }
    } else if (page === 'contact') {
      return {
        pageTitle: 'Contact Us',
        metaDescription: null
      }
    }

    return {
      pageTitle: null,
      metaDescription: null
    }
  }

  try {
    ejs.renderFile(path.join(__dirname, 'web', 'partials', `_${partialName}.ejs`), partialData({
      params
    }), (err, contentStr) => {
      if (err) {
        console.error('Failed to render partial ' + partialName + ': ', err)
        next()

        return
      }

      if (req.query.layout && req.query.layout === 'false') {
        res.send(contentStr)

        return
      }

      ejs.renderFile(path.join(__dirname, 'web', 'index.ejs'), partialData(
        Object.assign({
          content: contentStr
        }, getPageInfo(partialName, params))
      ), (err, indexStr) => {
        if (err) {
          next()
          res.status(500).send('Server error')
          console.error('Server error: ', err)
        } else {
          res.send(indexStr)
        }
      })
    })

  } catch (err) {
    next()
    console.error('Error ', err)
  }
}



function startServer({ port, httpsRedirectPort }) {
  if (process.env.NODE_ENV === 'production' && httpsRedirectPort) {
    http.createServer((req, res) => {
      res.writeHead(301, {
        'Location': `https://${serverConfig.PRIMARY_DOMAIN}${req.url}`
      })

      res.end()
    }).listen(httpsRedirectPort)
  }

  server.listen(port)
}

startServer({
  port: 8081,
  httpsRedirectPort: 8080
})
