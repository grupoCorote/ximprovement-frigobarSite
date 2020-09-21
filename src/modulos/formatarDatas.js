'use strict'
import i18ns from './i18n.js'

let i18n = i18ns('FormatarDatas')

const fdat = {
  updateLocale () {
    i18n = i18ns('FormatarDatas')
  },

  formDate (datajs) {
    return datajs ? `${datajs.toLocaleDateString()} (${this.dicaDias(this.numeroDeDias(datajs))})` : ''
  },

  formDateTime (datajs) {
    return datajs ? `${datajs.toLocaleString()} (${this.dicaDias(this.numeroDeDias(datajs))})` : ''
  },

  formSDate (obj, field) {
    if (obj[field]) obj[field] = new Date(obj[field])
    obj['s' + field] = this.formDate(obj[field])
  },

  formSDateTime (obj, field) {
    if (obj[field]) obj[field] = new Date(obj[field])
    obj['s' + field] = this.formDateTime(obj[field])
  },

  numeroDeDias (date, agora) {
    if (!date) return NaN
    date = new Date(date)
    if (!agora) agora = new Date()
    else agora = new Date(agora)
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    agora.setHours(0)
    agora.setMinutes(0)
    agora.setSeconds(0)
    agora.setMilliseconds(0)
    let numDias = Math.round((date - agora) / 1000 / 60 / 60 / 24)
    return numDias
  },

  dicaDias (numDias) {
    if (numDias === 0) return i18n.today
    if (numDias === 1) return i18n.tomorrow
    if (numDias === -1) return i18n.yesterday
    if (numDias > 0) return i18n.indays1 + String(numDias) + i18n.indays2
    if (numDias < 0) return String(-numDias) + i18n.daysAgo
    return `?`
  }
}

export default fdat
