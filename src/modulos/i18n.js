'use sctrict'
// const moment = require('moment')

let locales = ['pt-BR', 'en']
let locale = 'pt-BR' // Língua selecionada atualmente

const langs = {
  'FormatarDatas': {
    'pt-BR': {
      daysAgo: ' dias atrás',
      indays1: 'em ',
      indays2: ' dias',
      today: 'hoje',
      yesterday: 'ontem',
      tomorrow: 'amanhã'
    },
    'en': {
      daysAgo: ' days ago',
      indays1: 'in ',
      indays2: ' days',
      today: 'today',
      yesterday: 'yesterday',
      tomorrow: 'tomorrow'
    }
  }
}

function getPagei18n (page) {
  if (!langs[page]) return null
  return langs[page][locale]
}

getPagei18n.setLocale = function (lang) {
  if (lang && locales.includes(lang)) {
    locale = lang
    // moment.locale(locale)
  }
}

export default getPagei18n
