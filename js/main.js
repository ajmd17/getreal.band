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

// document.addEventListener('click', function (event) {

//   var menu = document.getElementById('social-media-menu')

//   if (!menu.contains(event.target)) {
//     hideSocialMedia()
//   }
// })
