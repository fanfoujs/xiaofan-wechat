'use strict'

module.exports = {
  pop () {
    const ani = wx.createAnimation({
      duration: 100,
      timingFunction: 'ease'
    })
    ani.scale(0.7).step()
    ani.scale(1).step()
    return ani
  },

  fadeIn () {
    const ani = wx.createAnimation({duration: 200})
    ani.opacity(1).step()
    return ani
  },

  fadeOut () {
    const ani = wx.createAnimation({duration: 200})
    ani.opacity(0).step()
    return ani
  }
}
