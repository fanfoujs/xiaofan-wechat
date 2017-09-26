const fm = require('../components/feeds-manager')

module.exports = {
  tapTxt (e) {
    const txt = e.currentTarget.dataset.value
    switch (txt.type) {
      case 'at':
        fm.showUser(null, txt.id)
        break
      case 'tag':
        fm.navigateTo(`../feeds/feeds?q=${txt.query}`)
        break
      default: // Link
        wx.setClipboardData({
          data: txt.link,
          success () {
            wx.showModal({
              title: '请用浏览器访问',
              content: '小程序暂不支持跳转网页，链接已复制，请用浏览器访问。',
              showCancel: false,
              confirmText: '好的'
            })
          }
        })
    }
  },
  tapAvatar (e) {
    fm.showUser(e.currentTarget.dataset.user)
  },
  tapFeed (e) {
    fm.showFeed(e.currentTarget.dataset.feed)
  },
  tapListItem (e) {
    fm.navigateTo(`${e.currentTarget.dataset.page}?url=${e.currentTarget.dataset.url}&id=${this.data.user.id}&name=${e.currentTarget.dataset.name}`)
  }
}
