/**
 * Add missing project/common translation keys to tr, es, fr. Run: node scripts/add-project-keys.js
 */
const fs = require('fs');
const path = require('path');

const newProjectKeys = {
  newSchedule: '',
  currentSchedules: '',
  noSchedulesYet: '',
  addScheduleAbove: '',
  cronExpression: '',
  cronExpressionHelp: '',
  scheduleAdded: '',
  selectRevision: '',
  leftRevision: '',
  rightRevision: '',
  auditLog: '',
  evidenceTimeline: '',
  selectTemplate: '',
  scanning: '',
  newTemplate: '',
  createTemplate: '',
  semanticMatches: '',
  coOptionalLabel: '',
  emailOptionalLabel: '',
};

const tr = {
  ...newProjectKeys,
  newSchedule: 'Yeni zamanlama',
  currentSchedules: 'Mevcut zamanlamalar',
  noSchedulesYet: 'Henüz zamanlama yok.',
  addScheduleAbove: 'Yukarıdan yeni zamanlama ekleyin.',
  cronExpression: 'Cron ifadesi',
  cronExpressionHelp: 'Cron ifadesi: dakika saat gün ay haftanın günü (örn. 0 9 * * 1 = her Pazartesi 09:00)',
  scheduleAdded: 'Zamanlama eklendi.',
  selectRevision: 'Revizyon seçin',
  leftRevision: 'Sol revizyon',
  rightRevision: 'Sağ revizyon',
  auditLog: 'Denetim günlüğü',
  evidenceTimeline: 'Kanıt zaman çizelgesi',
  evidenceTimelineDesc: 'Bu olayla bağlantılı kronolojik kanıtlar.',
  selectTemplate: 'Şablon seçin',
  scanning: 'Taranıyor…',
  newTemplate: 'Yeni şablon',
  createTemplate: 'Şablon oluştur',
  semanticMatches: 'Anlamsal eşleşmeler',
  coOptionalLabel: "CO (isteğe bağlı, boş = tüm CO'lar)",
  emailOptionalLabel: 'E-posta (isteğe bağlı, dışa aktarma sonrası gönderilir)',
  addTemplateAbove: 'Yukarıdan yeni şablon ekleyin.',
  templateCreated: 'Şablon oluşturuldu.',
  signalScanCompleted: 'Sinyal taraması tamamlandı.',
  links: 'Bağlantılar',
};

const es = {
  ...newProjectKeys,
  newSchedule: 'Nueva programación',
  currentSchedules: 'Programaciones actuales',
  noSchedulesYet: 'Aún no hay programaciones.',
  addScheduleAbove: 'Añade una nueva programación arriba.',
  cronExpression: 'Expresión cron',
  cronExpressionHelp: 'Expresión cron: minuto hora día mes día_semana (ej. 0 9 * * 1 = cada lunes 09:00)',
  scheduleAdded: 'Programación añadida.',
  selectRevision: 'Seleccionar revisión',
  leftRevision: 'Revisión izquierda',
  rightRevision: 'Revisión derecha',
  auditLog: 'Registro de auditoría',
  evidenceTimeline: 'Línea de tiempo de evidencias',
  evidenceTimelineDesc: 'Evidencias cronológicas vinculadas a este evento.',
  selectTemplate: 'Seleccionar plantilla',
  scanning: 'Escaneando…',
  newTemplate: 'Nueva plantilla',
  createTemplate: 'Crear plantilla',
  semanticMatches: 'Coincidencias semánticas',
  coOptionalLabel: 'CO (opcional, vacío = todos los CO)',
  emailOptionalLabel: 'Email (opcional, se envía tras exportar)',
  addTemplateAbove: 'Añade una nueva plantilla arriba.',
  templateCreated: 'Plantilla creada.',
  signalScanCompleted: 'Escaneo de señales completado.',
  links: 'Enlaces',
};

const fr = {
  ...newProjectKeys,
  newSchedule: 'Nouvelle planification',
  currentSchedules: 'Planifications actuelles',
  noSchedulesYet: 'Aucune planification pour le moment.',
  addScheduleAbove: 'Ajoutez une nouvelle planification ci-dessus.',
  cronExpression: 'Expression cron',
  cronExpressionHelp: "Expression cron : minute heure jour mois jour_semaine (ex. 0 9 * * 1 = chaque lundi 09h00)",
  scheduleAdded: 'Planification ajoutée.',
  selectRevision: 'Sélectionner la révision',
  leftRevision: 'Révision gauche',
  rightRevision: 'Révision droite',
  auditLog: "Journal d'audit",
  evidenceTimeline: 'Chronologie des preuves',
  evidenceTimelineDesc: 'Preuves chronologiques liées à cet événement.',
  selectTemplate: 'Sélectionner le modèle',
  scanning: 'Analyse…',
  newTemplate: 'Nouveau modèle',
  createTemplate: 'Créer un modèle',
  semanticMatches: 'Correspondances sémantiques',
  coOptionalLabel: 'CO (optionnel, vide = tous les CO)',
  emailOptionalLabel: "E-mail (optionnel, envoyé après l'export)",
  addTemplateAbove: "Ajoutez un nouveau modèle ci-dessus.",
  templateCreated: "Modèle créé.",
  signalScanCompleted: "Analyse des signaux terminée.",
  links: "Liens",
};

const atLeastTwo = {
  tr: 'Karşılaştırma için en az iki plan revizyonu yüklenmiş olmalıdır.',
  es: 'Se deben subir al menos dos revisiones de plan para comparar.',
  fr: 'Au moins deux révisions de plan doivent être téléchargées pour la comparaison.',
};

const orgExtra = {
  tr: { webhookAdded: 'Webhook eklendi.', selectAtLeastOneEvent: 'En az bir olay seçin.', addWebhook: 'Webhook ekle' },
  es: { webhookAdded: 'Webhook añadido.', selectAtLeastOneEvent: 'Selecciona al menos un evento.', addWebhook: 'Añadir webhook' },
  fr: { webhookAdded: 'Webhook ajouté.', selectAtLeastOneEvent: 'Sélectionnez au moins un événement.', addWebhook: 'Ajouter un webhook' },
};

const commonAdding = { tr: 'Ekleniyor…', es: 'Añadiendo…', fr: 'Ajout…' };

const dir = path.join(__dirname, '..', 'messages');
['tr', 'es', 'fr'].forEach((locale) => {
  const file = path.join(dir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data.project) data.project = {};
  const projectKeys = locale === 'tr' ? tr : locale === 'es' ? es : fr;
  Object.assign(data.project, projectKeys);
  data.project.atLeastTwoPlanRevisions = atLeastTwo[locale];
  if (!data.org) data.org = {};
  Object.assign(data.org, orgExtra[locale]);
  if (!data.common) data.common = {};
  data.common.adding = commonAdding[locale];
  fs.writeFileSync(file, JSON.stringify(data), 'utf8');
  console.log('Updated', locale + '.json');
});
