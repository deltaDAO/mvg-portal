interface Language {
  code: string
  name: string
  direction: 'ltr' | 'rtl'
}

export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', direction: 'ltr' },
  { code: 'es', name: 'Spanish', direction: 'ltr' },
  { code: 'fr', name: 'French', direction: 'ltr' },
  { code: 'de', name: 'German', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', direction: 'ltr' },
  { code: 'ru', name: 'Russian', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', direction: 'rtl' },
  { code: 'he', name: 'Hebrew', direction: 'rtl' },
  { code: 'fa', name: 'Persian', direction: 'rtl' },
  { code: 'ur', name: 'Urdu', direction: 'rtl' },
  { code: 'hi', name: 'Hindi', direction: 'ltr' },
  { code: 'ro', name: 'Romanian', direction: 'ltr' },
  { code: 'it', name: 'Italian', direction: 'ltr' },
  { code: 'nl', name: 'Dutch', direction: 'ltr' },
  { code: 'tr', name: 'Turkish', direction: 'ltr' },
  { code: 'ko', name: 'Korean', direction: 'ltr' },
  { code: 'pl', name: 'Polish', direction: 'ltr' }
]
