import { createI18n } from 'vue-i18n'
import zh from './zh.json'
import en from './en.json'

// Get saved language from localStorage
const savedLocale = localStorage.getItem('user-locale')

// If no saved locale, check system language
let defaultLocale = 'en'
if (savedLocale) {
  defaultLocale = savedLocale
} else {
  const systemLang = navigator.language.toLowerCase()
  if (systemLang.startsWith('zh')) {
    defaultLocale = 'zh'
  }
}

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
})

export default i18n
