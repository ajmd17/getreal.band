var PlayBox = {
  /** @type HTMLElement */
  _elm: null,
  /** @type boolean */
  _playing: false,
  /** @type HTMLAudioElement */
  _audio: null,
  /** @type boolean */
  _initialized: false,

  initialize() {
    this._audio = null

    setTimeout(() => {
      this._audio = new Audio('/audio/sr.mp3')
    })

    this._elm = document.getElementById('play-box-wrapper')

    if (!this._elm) {
      return false
    }

    if (!this._mainContainer) {
      return false
    }

    this._elm.addEventListener('click', this._toggleAudio.bind(this))

    this._initialized = true

    return true
  },

  update() {
    if (!this._mainContainer) {
      return false
    }

    var landerImg = document.getElementById('lander-img')

    if (!landerImg) {
      return false
    }

    this._elm.style.width = landerImg.clientWidth + 'px'
    this._elm.style.height = landerImg.clientHeight + 'px'

    return true
  },

  get initialized() {
    return this._initialized
  },

  get _mainContainer() {
    var mainContainer = document.getElementById('main-container')

    if (!mainContainer.classList.contains('landing')) {
      return null
    }

    return mainContainer
  },

  show() {
    this.update()
    this._elm.style.display = 'block'

    setTimeout(() => {
      this._elm.style.opacity = '1.0'

      try {
        document.getElementById('lander-img-wrapper').style.filter = 'blur(1px)'
      } catch (err) {
        // ...
      }
    }, 300)
  },

  hide() {
    this._elm.style.opacity = '0.0'
    this._elm.style.display = 'none'

    try {
      document.getElementById('lander-img-wrapper').style.filter = 'none'
    } catch (err) {
      // ...
    }
  },

  _toggleAudio() {
    if (this._playing) {
      this._pauseAudio()
      return
    }

    if (this._audio == null) {
      setTimeout(() => {
        this._toggleAudio()
      }, 10)
      return
    }

    this._playing = true

    var playButtonIcon = document.querySelector('#play-button i')
    playButtonIcon.classList.add('fa-pause-circle')
    playButtonIcon.classList.remove('fa-play-circle')

    this._audio.play().catch((err) => {
      this._pauseAudio()

      alert('There was an error playing the audio stream.')
      console.error(err)
    })
    // audioSrc.controls = true
  },

  _pauseAudio() {
    this._audio.pause()
    this._playing = false

    var playButtonIcon = document.querySelector('#play-button i')
    playButtonIcon.classList.remove('fa-pause-circle')
    playButtonIcon.classList.add('fa-play-circle')
  }
}