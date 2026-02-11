/**
 * i18n message keys and default (English) values. Locale files: messages/{en,tr,es,fr}.json.
 */

export const messages = {
  tr: {
    app: { name: 'SiteScribe', tagline: 'Change Order Copilot' },
    nav: {
      org: 'Organizasyonlar',
      projects: 'Projeler',
      evidence: 'Kanıtlar',
      signals: 'Sinyaller',
      exports: 'Dışa Aktarmalar',
      dashboard: 'Dashboard',
      search: 'Ara',
      templates: 'Şablonlar',
      links: 'Kanıt zinciri',
    },
    auth: { signIn: 'Giriş yap', signOut: 'Çıkış', register: 'Kayıt ol' },
    evidence: { upload: 'Kanıt yükle', type: 'Tür', occurredAt: 'Oluşum tarihi' },
    signals: { runDetection: 'Sinyal tara', status: 'Durum' },
    co: { draft: 'CO taslağı', generate: 'Taslak oluştur', export: 'Dışa aktar', exportAndEmail: 'Dışa aktar ve e-posta gönder' },
    common: { save: 'Kaydet', cancel: 'İptal', delete: 'Sil', loading: 'Yükleniyor...' },
  },
  en: {
    app: { name: 'SiteScribe', tagline: 'Change Order Copilot' },
    nav: {
      org: 'Organizations',
      projects: 'Projects',
      evidence: 'Evidence',
      signals: 'Signals',
      exports: 'Exports',
      dashboard: 'Dashboard',
      search: 'Search',
      templates: 'Templates',
      links: 'Evidence links',
    },
    auth: { signIn: 'Sign in', signOut: 'Sign out', register: 'Register' },
    evidence: { upload: 'Upload evidence', type: 'Type', occurredAt: 'Occurred at' },
    signals: { runDetection: 'Run detection', status: 'Status' },
    co: { draft: 'CO draft', generate: 'Generate draft', export: 'Export', exportAndEmail: 'Export & email' },
    common: { save: 'Save', cancel: 'Cancel', delete: 'Delete', loading: 'Loading...' },
  },
} as const;

export type Locale = 'tr' | 'en';

export function getMessages(locale: Locale) {
  return messages[locale] || messages.en;
}
