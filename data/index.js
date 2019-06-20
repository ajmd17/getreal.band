const path = require('path')
const htmlToText = require('html-to-text')

const util = require('../util')

module.exports = {
  releases: require('./releases.json'),
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
  })
}
