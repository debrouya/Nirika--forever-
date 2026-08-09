import { createContext, useContext, useState, useCallback } from 'react'
import fr from './fr.json'
import en from './en.json'

const translations = { fr, en }
const SUPPORTED = ['fr', 'en']
const FALLBACK = 'fr'

const I18nContext = createContext()

function getDefaultLocale() {
  try {
    const stored = localStorage.getItem('nirika_locale')
    if (stored && SUPPORTED.includes(stored)) return stored
  } catch {}
  const browserLang = navigator.language?.slice(0, 2)
  if (SUPPORTED.includes(browserLang)) return browserLang
  return FALLBACK
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getDefaultLocale)

  const setLocale = useCallback((lng) => {
    if (!SUPPORTED.includes(lng)) return
    setLocaleState(lng)
    try { localStorage.setItem('nirika_locale', lng) } catch {}
  }, [])

  const t = useCallback((key, params = {}) => {
    const keys = key.split('.')
    let value = translations[locale]
    for (const k of keys) {
      if (!value || typeof value !== 'object') break
      value = value[k]
    }
    if (typeof value !== 'string') return key
    return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`)
  }, [locale])

  return (
    <I18nContext.Provider value={{ t, locale, setLocale, SUPPORTED }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return { t: (k) => k, locale: 'fr', setLocale: () => {}, SUPPORTED: ['fr','en'] }
  }
  return ctx
}
