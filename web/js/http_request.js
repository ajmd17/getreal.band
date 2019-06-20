var HTTP = {
  _request: function (method, url, data, cb) {
    var xhttp = new XMLHttpRequest()

    xhttp.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status == 200) {
          cb(null, xhttp.responseText)
        } else {
          cb(Error(xhttp.responseText || xhttp.statusText))
        }
      }
    }

    xhttp.open(method, url, true)

    if (typeof data === 'object') {
      xhttp.setRequestHeader('Content-Type', 'application/json')
      xhttp.send(JSON.stringify(data))
    } else {
      xhttp.send(data !== undefined && data !== null
        ? String(data)
        : undefined)
    }
  },

  get: function (url, cb) {
    return this._request('GET', url, null, cb)
  },
  post: function (url, data, cb) {
    return this._request('POST', url, data, cb)
  },
  put: function (url, data, cb) {
    return this._request('PUT', url, data, cb)
  },
  delete: function (url, cb) {
    return this._request('DELETE', url, null, cb)
  }
}