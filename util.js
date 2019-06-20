const fs = require('fs')
const path = require('path')
const md = require('markdown-it')({
  html: true,
  breaks: true
}).use(require('markdown-it-video', {
  youtube: { width: 640, height: 390 },
  vimeo: { width: 500, height: 281 }
})).use(require('markdown-it-attrs'), {
  leftDelimiter: '{',
  rightDelimiter: '}',
  allowedAttributes: []
})

module.exports = {
  truncate(str, n = 15, useWordBoundary = true) {
    if (str.length <= n) {
      return str
    }

    const subString = str.substr(0, n - 3)

    if (useWordBoundary) {
      const match = subString.match(/[^A-Za-z0-9]/g)

      if (match) {
        const lastIndex = subString.lastIndexOf(match[match.length - 1])

        return subString.substr(0, lastIndex) + '...'
      }
    }

    return subString + '...'
  },

  formatDate(date) {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ]

    var day = date.getDate()
    var monthIndex = date.getMonth()
    var year = date.getFullYear()

    return day + ' ' + monthNames[monthIndex] + ' ' + year
  },

  getAllFilesInDirectory(dirpath) {
    if (!fs.existsSync(dirpath)) {
      return []
    }

    return fs.readdirSync(dirpath)
  },

  renderMarkdownFile(filepath) {
    return md.render(fs.readFileSync(filepath).toString())
  },

  getBlogpostDescription(blogpost) {
    return blogpost.description || this.truncate(blogpost.content, 150)
  },

  playLinkIcon(channel) {
    let channelName = channel.name.toLowerCase().replace(/\s+/, '-')

    if (channelName == 'apple-music') {
      channelName = 'itunes'
    }

    return channelName
  }
}
