'use strict'

module.exports = {
  pop () {
    const ani = wx.createAnimation({duration: 100})
    ani.scale(0.7).step()
    ani.scale(1).step()
    return ani
  },

  fadeIn () {
    const ani = wx.createAnimation()
    ani.opacity(1).step()
    return ani
  },

  fadeOut () {
    const ani = wx.createAnimation()
    ani.opacity(0).step()
    return ani
  }
}
