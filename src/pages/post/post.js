const tab = require('../../components/tab')
const extend = require('../../utils/extend')
const post = require('../../components/post')

Page(extend({
  onShow: function () {
    tab.renderNotis()
  }
}, post))
