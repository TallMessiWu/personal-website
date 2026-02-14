import { createI18n } from 'vue-i18n'
import zh from './zh.json'
import en from './en.json'

// Get saved language from localStorage or default to 'zh'
const savedLocale = localStorage.getItem('user-locale') || 'zh'

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
})

export default i18n
