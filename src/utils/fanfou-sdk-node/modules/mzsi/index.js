const i18n = require('../../../../i18n/index')

module.exports = (month, day, languageCode) => {
  'use strict'

  const monthTypeOf = typeof month

  if (monthTypeOf !== 'number') {
    throw new TypeError('The month should be a number')
  }

  const dayTypeOf = typeof day

  if (dayTypeOf !== 'number') {
    throw new TypeError('The day should be a number')
  }

  const possibilities = [
    {
      id: 1,
      begin: [20, 1],
      end: [18, 2]
    },
    {
      id: 2,
      begin: [19, 2],
      end: [20, 3]
    },
    {
      id: 3,
      begin: [21, 3],
      end: [19, 4]
    },
    {
      id: 4,
      begin: [20, 4],
      end: [20, 5]
    },
    {
      id: 5,
      begin: [21, 5],
      end: [20, 6]
    },
    {
      id: 6,
      begin: [21, 6],
      end: [21, 7]
    },
    {
      id: 7,
      begin: [22, 7],
      end: [22, 8]
    },
    {
      id: 8,
      begin: [23, 8],
      end: [22, 9]
    },
    {
      id: 9,
      begin: [23, 9],
      end: [22, 10]
    },
    {
      id: 10,
      begin: [23, 10],
      end: [21, 11]
    },
    {
      id: 11,
      begin: [22, 11],
      end: [21, 12]
    },
    {
      id: 12,
      begin: [22, 12],
      end: [19, 1]
    }
  ]

  const sign = possibilities.filter(sign => {
    const itIsAmongTheBeginning = (day >= sign.begin[0] && month === sign.begin[1])
    const itIsAmongTheEnd = (day <= sign.end[0] && month === sign.end[1])

    return (itIsAmongTheBeginning || itIsAmongTheEnd)
  })

  const translatedLanguages = ['zh-cn']

  let languageToDisplay = 'zh-cn'

  if (translatedLanguages.indexOf(languageCode) > -1) {
    languageToDisplay = languageCode
  }

  const aboutSign = i18n.zodiac_sign[sign[0].id]

  return {
    name: aboutSign.name,
    symbol: require('./get-symbol')(sign[0].id),
    about: aboutSign
  }
}
