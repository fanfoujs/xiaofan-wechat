const tab = require('../../components/tab')
const extend = require('../../utils/extend')
const post = require('../../mixins/post')

Page(extend({
  onShow () {
    tab.renderNotis()
  }
}, post))
