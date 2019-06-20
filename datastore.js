const fs = require('fs')
const path = require('path')

const dataStore = {
  directory: path.join(__dirname, 'data/store'),

  _mkdir() {
    return new Promise((resolve, reject) => {
      fs.exists(dataStore.directory, (exists) => {
        if (!exists) {
          fs.mkdir(dataStore.directory, () => {
            resolve()
          })
        } else {
          resolve()
        }
      })
    })
  },

  add(filename, data) {
    return new Promise((resolve, reject) => {
      this._mkdir().then(() => {
        if (fs.existsSync(path.join(dataStore.directory, filename + '.json'))) {
          return this.load(filename).then((loadedFileContents) => {
            if (!Array.isArray(loadedFileContents)) {
              return reject(Error('loaded file is not an array'))
            }

            loadedFileContents.push(data)
            resolve()
          })
        }

        return this.save(filename, [data]).then(() => {
          resolve()
        }).catch((err) => {
          reject(err)
        })
      })
    })
  },

  save(filename, data) {
    return new Promise((resolve, reject) => {
      this._mkdir().then(() => {
        fs.writeFile(path.join(dataStore.directory, filename + '.json'), JSON.stringify(data), (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      }).catch(reject)
    })
  },

  load(filename) {
    return new Promise((resolve, reject) => {
      this._mkdir().then(() => {
        fs.readFile(path.join(dataStore.directory, filename + '.json'), (err, data) => {
          if (err) {
            reject(err)
          } else {
            let object

            try {
              object = JSON.parse(data)
            } catch (err) {
              return reject(err)
            }

            resolve(object)
          }
        })
      }).catch(reject)
    })
  }
}

module.exports = dataStore;