function displaySocialMedia() {
  var menu = document.getElementById('social-media-menu')

  menu.style.display = 'block'

  setTimeout(function () {
    menu.classList.add('shown')
  }, 50)
}

function hideSocialMedia() {
  var menu = document.getElementById('social-media-menu')
  menu.classList.remove('shown')
}

function updateHashLinks() {
  document.querySelectorAll('[data-hashlink]').forEach((element) => {
    if (element.hasAttribute('data-hashlink-bound')) {
      return
    }

    element.setAttribute('data-hashlink-bound', 'true')

    element.addEventListener('click', function (event) {
      var hashUrl

      if (!this.hasAttribute('data-hashlink')) {
        return
      }

      event.preventDefault()

      hashUrl = /\/?(.*)/.exec(this.getAttribute('href'))

      if (hashUrl == null) {
        return
      }

      if (/\/?(.*)\/?/.exec(window.location.pathname) !== null) {
        window.location.href = '/#' + encodeURIComponent(hashUrl[1])
        return
      }

      window.location.hash = encodeURIComponent(hashUrl[1])
    })
  })
}

function afterPageInitialization() {
  registerContactFormSubmission()
}

function landerMode() {
  let mainContainer = document.getElementById('main-container')
  mainContainer.classList.add('landing')

  // if (!PlayBox.initialized) {
  //   PlayBox.initialize()
  // }

  // PlayBox.show()

  afterPageInitialization()
}

function pagerMode() {
  var mainContainer = document.getElementById('main-container'),
    sidebar = document.getElementById('sidebar')

  mainContainer.classList.remove('landing')

  // if (PlayBox.initialized) {
  //   PlayBox.hide()
  // }

  afterPageInitialization()
}

function scrollToTop() {
  if (typeof scrollTo === 'function') {
    scrollTo(0, 0)
  }
}


function updateHashState() {
  updateHashLinks()

  var updateHashStateOnPathname = function () {
    var match = /\/?(.*)\/?/.exec(window.location.pathname)
  
    if (match !== null && match[1].length != 0) {
      pagerMode()
  
      return
    }
  
    landerMode()
  }

  if (window.location.hash && window.location.hash.length) {
    // first, check if there is an element with the ID of hash,
    // in that case we drop out of this routine to let the browser do its scroll thing
    var match = /#(.*)/.exec(window.location.hash)

    if (match !== null && document.getElementById(match[1]) !== null) {
      updateHashStateOnPathname()

      return
    }

    var hashDecoded = decodeURIComponent(window.location.hash),
      templateElement = document.querySelector('.template[data-page="' + window.location.hash + '"]')

    if (templateElement != null && hashDecoded.indexOf('/') === -1) {
      document.getElementById('content').innerHTML = templateElement.innerHTML

      pagerMode()
      scrollToTop()
    } else {
      HTTP.get('/' + /#(.*)/.exec(hashDecoded)[1] + '?layout=false', function (err, resp) {
        if (err) {
          landerMode()
          alert('Page not found')
        } else {
          document.getElementById('content').innerHTML = resp

          updateHashLinks()
          pagerMode()
          scrollToTop()
        }
      })
    }
  } else {
    updateHashStateOnPathname()
  }
}

function registerContactFormSubmission() {
  var contactButton = document.getElementById('contact-button')

  if (contactButton == null) {
    return
  }

  if (contactButton.hasAttribute('data-bound')) {
    return
  }

  contactButton.addEventListener('click', function () {
    var emailBox = document.getElementById('email-box'),
      otherFields = {},
      contactForm = document.getElementById('contact-form'),
      contactFormErrors = document.getElementById('contact-form-errors')
      errors = []

    contactFormErrors.style.display = 'none'
    contactFormErrors.innerHTML = ''

    if (emailBox.value.trim().length == 0) {
      // TODO: validation
      errors.push('Please enter a valid email address')
    }

    contactForm.querySelectorAll('[data-form-field]').forEach((element) => {
      otherFields[element.getAttribute('name')] = {
        value: element.value,
        required: element.dataset.formField === 'required'
      }
    })

    if (Object.keys(otherFields).length > 0) {
      Object.keys(otherFields).forEach((key) => {
        if (otherFields[key].required && (!otherFields[key].value || otherFields[key].value.trim().length === 0)) {
          errors.push('The ' + key + ' field is required.')
        }
      })
    }

    if (errors.length != 0) {
      contactFormErrors.innerHTML = errors.reduce(function (accum, errorText) {
        return `${accum}<div><i class="fas fa-exclamation-triangle"></i>&nbsp;${errorText}</div>`
      }, '')

      contactFormErrors.style.display = 'block'

      return
    }

    let postData = {
      email: emailBox.value
    }

    Object.keys(otherFields).forEach((key) => {
      postData[key] = otherFields[key].value
    })

    HTTP.post('/api/contact', postData, function (err, result) {
      if (err) {
        contactFormErrors.innerHTML ='<div><i class="fas fa-exclamation-triangle"></i>&nbsp;' + err.message + '</div>'
        contactFormErrors.style.display = 'block'
      } else {
        var contactSuccessMessage = document.getElementById('contact-success-message')
        contactSuccessMessage.getElementsByClassName('content')[0].innerHTML = result
        contactSuccessMessage.style.display = 'block'


        document.getElementById('contact-form').style.display = 'none'
      }
    })
  })

  contactButton.setAttribute('data-bound', 'true')
}



window.addEventListener('hashchange', updateHashState)
window.addEventListener('load', function () {
  updateHashState()
})
// window.addEventListener('resize', () => {
//   PlayBox.update()
// })
