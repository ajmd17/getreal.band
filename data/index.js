const path = require('path')
const moment = require('moment')
const htmlToText = require('html-to-text')

const util = require('../util')

module.exports = {
  INDEX_LOGO: '/images/logo-red.png',

  releases: require('./releases.json').map((release) => {
    let upcoming = false

    try {
      upcoming = moment().diff(moment(release.released, 'MMMM DD, YYYY'), 'days') <= 0
    } catch (err) {
      console.error(err)
    }

    return Object.assign({
      upcoming
    }, release)
  }),
  blogposts: require('./blogposts.json').map((blogpost) => {
    return Object.assign({
      content: util.renderMarkdownFile(path.join(__dirname, 'blogposts', blogpost.slug + '.md')),
      images: util.getAllFilesInDirectory(path.join(__dirname, '..', 'web', 'images', blogpost.slug)).map((imageFile) => {
        return `/images/${blogpost.slug}/${imageFile}`
      })
    }, blogpost)
  }),
  lyrics: require('./lyrics.json').map((lyric) => {
    let obj = Object.assign({
      content: util.renderMarkdownFile(path.join(__dirname, 'lyrics', lyric.slug + '.md'))
    }, lyric)

    obj.contentText = htmlToText.fromString(obj.content)

    return obj
  }),
  merchItems: require('./merch.json').map((item) => {
    let obj = Object.assign({
      content: util.renderMarkdownFile(path.join(__dirname, 'merch', item.slug + '.md'))
    }, item)

    obj.contentText = htmlToText.fromString(obj.content)

    return obj
  })
}
