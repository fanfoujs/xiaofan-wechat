const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')

Page(
  extend(
    {},
    tap,
    {},
    {
      data: {
        statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
      },
    },
  ),
)
