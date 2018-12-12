'use strict'

const audioContext = wx.createInnerAudioContext()

module.exports = {
  bubble () {
    audioContext.src = '/assets/bubble.wav'
    audioContext.play()
  }
}
