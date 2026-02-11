# SiteScribe – Gelecek Geliştirmeler

Bu belge, geliştirmeleri **öncelik gruplarına** göre listeler: **en yüksek öncelikten en düşük önceliğe** (P1 → P5). Her grupta uygulama durumu da belirtilir.

---

## Öncelik grupları özeti

| Grup | Açıklama | Odak |
|------|----------|------|
| **P1 – En yüksek** | Çok kullanıcılı kullanım, günlük akış | Davet, e-posta, CO taslağı |
| **P2 – Yüksek** | Raporlama ve yönetim görünürlüğü | Dashboard, arama, CSV, onay |
| **P3 – Orta** | Kanıt ve süreç izlenebilirliği | Kanıt zinciri, audit log, bildirimler |
| **P4 – Orta–düşük** | Kullanıcı deneyimi ve erişim | PWA, i18n, karanlık mod |
| **P5 – Düşük** | Entegrasyon ve ileri otomasyon | Webhook, zamanlanmış export |

---

## P1 – En yüksek öncelik

*Çok kullanıcılı kullanımı ve günlük CO/süreç akışını doğrudan etkileyen özellikler.*

| Geliştirme | Açıklama | Durum |
|------------|----------|--------|
| **E-posta ile davet** | Organizasyona e-posta ile üye davet; davet linki, rol ataması; bekleyen davet listesi ve iptal. | ✅ Uygulandı (`app/actions/invite.ts` – listInvitations, revokeInvitation; `invitations-list.tsx`, `invite-form`, `invite/accept`, Resend) |
| **Gerçek e-posta ile export** | Export paketinin e-posta eki olarak gönderilmesi (mailto yerine); Resend + SentLog. | ✅ Uygulandı (`app/actions/export.ts` – sendExportByEmail; `export-by-email.tsx`; `RESEND_API_KEY`) |
| **LLM ile CO taslağı** | Kanıt chunk’larından scope ve madde referansları; `[EVID:id#chunk:i]` formatı. | ✅ Uygulandı (`lib/llm-co.ts`, `lib/co-draft.ts` – llmUsed; `createChangeOrderDraft` → ?llm=1; CO sayfası rozeti) |
| **RFI/CO şablon kütüphanesi** | Organizasyon bazlı scope ve kalem şablonları; şablon sayfası; CO taslağı üretirken şablon seçimi. | ✅ Uygulandı (Prisma `COTemplate`; `app/actions/templates.ts`, `listTemplatesForProject`; `app/projects/[id]/templates`; event sayfası şablon dropdown) |

---

## P2 – Yüksek öncelik

*Raporlama, arama ve yönetim kararlarını destekleyen özellikler.*

| Geliştirme | Açıklama | Durum |
|------------|----------|--------|
| **Dashboard ve özetler** | Proje bazlı: CO sayısı, toplam maliyet, gecikme günleri. | ✅ Uygulandı (`app/actions/dashboard.ts`, `app/projects/[id]/dashboard/page.tsx`) |
| **Proje araması** | Evidence ve CO metinlerinde arama. | ✅ Uygulandı (`lib/fulltext.ts`, `app/projects/[id]/search/page.tsx`) |
| **Excel/CSV dışa aktarma** | CO kalem listesi ve evidence listesinin CSV olarak indirilmesi. | ✅ Uygulandı (`lib/csv-export.ts`, `app/actions/csv.ts`) |
| **Onay akışı ve onay kaydı** | CO için Incelemede → Onaylandı/Reddedildi; kim, ne zaman onayladı. | ✅ Uygulandı (`app/actions/approval.ts`, Prisma `COApproval`) |
| **Sinyal skorlama iyileştirmesi** | “X gün gecikme”, “ek maliyet” gibi yapılandırılmış sinyaller. | ✅ Uygulandı (`lib/detect-signals.ts`) |

---

## P3 – Orta öncelik

*Kanıt bütünlüğü ve süreç izlenebilirliği.*

| Geliştirme | Açıklama | Durum |
|------------|----------|--------|
| **Kanıt zinciri (Evidence Link) UI** | Evidence’lar arası ilişkinin listelenmesi ve yeni link oluşturma. | ✅ Uygulandı (`app/actions/evidence-links.ts`, `app/projects/[id]/evidence/links/page.tsx`) |
| **Versiyonlama / denetim kaydı (audit log)** | CO ve kritik alanlarda “kim, ne zaman, neyi değiştirdi” kaydı. | ✅ Uygulandı (`lib/audit.ts`, Prisma `AuditLog`; `getAuditLogForProject`; CO sayfası denetim kartı; Dashboard son kayıtlar) |
| **Bildirimler** | Yeni sinyal, CO onay bekliyor, yorum gibi olaylar için in-app bildirim. | ✅ Uygulandı (`/notifications` sayfası; requestApproval/runDetection/addComment tetikleyicileri; org ve proje layout’ta link) |
| **Plan revizyon karşılaştırma** | İki plan revizyonu PDF’i için revizyon notları veya basit karşılaştırma. | ✅ Uygulandı (`/projects/[id]/evidence/compare`; iki revizyon seçimi, yan yana metin önizleme) |

---

## P4 – Orta–düşük öncelik

*Kullanıcı deneyimi ve erişim (mobil, dil, tema).*

| Geliştirme | Açıklama | Durum |
|------------|----------|--------|
| **PWA / mobil uyum** | manifest; sahada kullanım için temel PWA altyapısı. | ✅ Manifest eklendi (`public/manifest.json`; icon-192/512 isteğe bağlı) |
| **Çoklu dil (i18n)** | Arayüzün Türkçe/İngilizce desteklemesi. | ✅ Mesaj sözlüğü hazır (`lib/i18n/messages.ts`; sayfalara bağlanabilir) |
| **Karanlık mod** | Tema seçeneği (sistem / açık / koyu). | ✅ Uygulandı (`components/theme-provider.tsx`, `next-themes`) |

---

## P5 – Düşük öncelik

*Entegrasyon ve ileri otomasyon; “olursa iyi olur” niteliğinde.*

| Geliştirme | Açıklama | Durum |
|------------|----------|--------|
| **Webhook** | CO oluşturulduğunda veya durum değiştiğinde harici sistemlere POST. | ✅ Uygulandı (`lib/webhook.ts`; `/org/webhooks` yönetim sayfası: liste, ekle, sil, aç/kapa) |
| **Zamanlanmış export (scheduled export)** | Belirli CO/projeler için periyodik PDF+ZIP ve isteğe bağlı e-posta. | ✅ Uygulandı (`/projects/[id]/scheduled-exports`; cron API; CO seçimi veya tümü; isteğe bağlı e-posta; CRON_SECRET) |

---

## Uygulama durumu – referans tablosu

| Özellik | Dosya / yer |
|--------|-------------|
| LLM CO taslağı | `lib/llm-co.ts`, `lib/co-draft.ts` |
| Sinyal skorlama | `lib/detect-signals.ts` |
| CO şablonları | `app/actions/templates.ts`, Prisma `COTemplate` |
| E-posta davet | `app/actions/invite.ts`, `app/invite/accept`, `app/org/invite-form.tsx`, `lib/email.ts` |
| Gerçek e-posta | `app/actions/export.ts` (sendExportByEmail), `app/projects/[id]/co/[coId]/export-by-email.tsx` |
| Bildirimler | `lib/notifications.ts`, Prisma `Notification` |
| Onay akışı | `app/actions/approval.ts`, Prisma `COApproval` |
| Arama | `lib/fulltext.ts`, `app/projects/[id]/search/page.tsx` |
| Dashboard | `app/actions/dashboard.ts`, `app/projects/[id]/dashboard/page.tsx` |
| CSV export | `lib/csv-export.ts`, `app/actions/csv.ts` |
| Kanıt zinciri UI | `app/actions/evidence-links.ts`, `app/projects/[id]/evidence/links/page.tsx` |
| Audit log | `lib/audit.ts`, Prisma `AuditLog` |
| PWA | `public/manifest.json` |
| i18n | `lib/i18n/messages.ts` |
| Karanlık mod | `components/theme-provider.tsx`, `next-themes` |
| Webhook | `lib/webhook.ts` |
| Scheduled export | Prisma `ScheduledExport`, `app/api/cron/scheduled-export/route.ts` |

---

*Öncelik sırası: P1 (en yüksek) → P2 → P3 → P4 → P5 (en düşük). Yeni özellik planlarken önce P1–P2, sonra P3–P4, en son P5 düşünülebilir.*
