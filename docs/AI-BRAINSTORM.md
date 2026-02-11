# SiteScribe – AI Desteği Beyin Fırtınası

Bu belge, projeye nasıl AI desteği eklenebileceğine dair fikirleri öncelik ve uygulanabilirlik açısından gruplar. **Mevcut durum:** LLM ile CO taslağı (kanıt chunk’larından scope/madde referansları, `[EVID:id#chunk:i]`) ve kural tabanlı sinyal tespiti (anahtar kelime, plan revizyonu, gecikme/maliyet regex) zaten var.

---

## 1. Mevcut AI’ı Güçlendirmek (Hızlı kazanımlar)

| Fikir | Açıklama | Zorluk | Etki |
|-------|----------|--------|------|
| **Yapılandırılmış LLM çıktısı** | CO taslağında `scopeNarrative`, `contractClauses`, `assumptions` için JSON/structured output kullan; UI’da alanlara doğrudan map et. | Düşük | Orta |
| **Maliyet / süre çıkarımı** | LLM’e “Bu metinden tahmini ek maliyet (para birimi) ve gecikme (gün) çıkar” prompt’u ekle; CO’da opsiyonel “AI önerisi: +X gün, +Y TL” alanı. | Orta | Yüksek |
| **Daha iyi citation** | Sadece chunk metni değil, chunk’ın hangi evidence’a ait olduğunu (başlık, tarih) da context’e ver; LLM’in referansları daha anlamlı kullanmasını sağla. | Düşük | Orta |
| **Çok dilli CO taslağı** | Kullanıcı dil tercihine göre (TR/EN) scope ve maddeleri o dilde üret; mevcut i18n ile uyumlu. | Düşük | Orta |

---

## 2. Sinyal Tespitini AI ile Zenginleştirmek

| Fikir | Açıklama | Zorluk | Etki |
|-------|----------|--------|------|
| **LLM ile sinyal skorlama** | Heuristik skorlamaya ek: evidence metnini LLM’e verip “Bu metin bir değişiklik/gecikme/ek iş sinyali mi? 0–1 skor ve kısa gerekçe ver” (batch, rate limit ile). | Orta | Yüksek |
| **Sinyal birleştirme (clustering)** | Aynı olayı işaret eden birden fazla kanıtı LLM veya embedding benzerliği ile grupla; “3 kanıt aynı değişikliğe işaret ediyor” önerisi. | Orta | Yüksek |
| **Yeni sinyal tipleri** | LLM’den “risk”, “claim”, “force majeure”, “fark/keşif” gibi etiketler çıkar; filtreleme ve raporlama için kullan. | Orta | Orta |

---

## 3. Kanıt (Evidence) Anlama ve Arama

| Fikir | Açıklama | Zorluk | Etki |
|-------|----------|--------|------|
| **Semantik arama** | Evidence + CO metinlerini embedding’le (OpenAI ada / local sentence-transformers) vektörleştir; “gecikme nedeni”, “ek maliyet hangi dokümanda” gibi doğal dil sorguları. | Orta | Çok yüksek |
| **Otomatik özet** | Yüklenen her evidence için LLM ile 2–3 cümlelik özet üret; listeleme ve CO taslağı context’inde kullan. | Düşük | Orta |
| **Evidence sınıflandırma** | Kullanıcı “SITE_LOG” seçmek yerine LLM’e “Bu metin ne tür?” (site log / RFI / sözleşme / revizyon) sordur; öneri olarak sun. | Düşük | Orta |
| **Eksik alan önerisi** | Başlık/ açıklama boşsa, extracted text’ten LLM ile başlık ve kısa açıklama öner. | Düşük | Düşük |

---

## 4. Proje / CO Seviyesinde “Asistan”

| Fikir | Açıklama | Zorluk | Etki |
|-------|----------|--------|------|
| **Sohbet botu (RAG)** | Proje veya CO sayfasında “Bu CO’ya hangi kanıtlar bağlı?”, “Gecikme gerekçesi nedir?” gibi sorular; context = ilgili evidence chunk’ları + CO metni, cevap stream edilebilir. | Orta | Çok yüksek |
| **Dashboard özeti** | “Son 7 günde neler oldu?” için LLM ile 3–5 cümlelik özet (yeni evidence, sinyaller, CO durumları). | Orta | Orta |
| **Onay özeti** | Onay bekleyen CO’lar için PM’e “Bu CO’nun özeti ve kritik noktaları” tek paragraf. | Düşük | Orta |

---

## 5. Belge ve Görsel Anlama

| Fikir | Açıklama | Zorluk | Etki |
|-------|----------|--------|------|
| **Plan revizyonu karşılaştırma** | İki plan PDF’inin metnini çıkar; LLM’e “Değişen maddeleri listele” veya “Revizyon notu özetle” dedir; compare sayfasında göster. | Orta | Yüksek |
| **Fotoğraf açıklaması** | Evidence tipi PHOTO için vision model (GPT-4V vb.) ile “Sahada ne görünüyor?” açıklaması; extractedText veya ayrı alan. | Orta | Orta |
| **Tablo / çizelge çıkarımı** | PDF’lerdeki tabloları (maliyet, süre) yapılandırılmış veri olarak çıkarmak için LLM + layout; CO kalem önerisi için kullan. | Yüksek | Yüksek |

---

## 6. Tahmine Dayalı ve Risk

| Fikir | Açıklama | Zorluk | Etki |
|-------|----------|--------|------|
| **Gecikme/maliyet risk skoru** | Geçmiş CO ve evidence’lardan “benzer” olayları topla; LLM veya basit model ile “Bu olayın gecikme/maliyet riski yüksek/orta/düşük” etiketi. | Yüksek | Orta |
| **Sözleşme uyum kontrolü** | CO metnini, projeye yüklenen sözleşma maddeleriyle LLM ile karşılaştır; “Bu madde sözleşmada var mı / çelişiyor mu?” özeti. | Orta | Yüksek |

---

## 7. Altyapı ve Operasyon

| Fikir | Açıklama | Zorluk | Etki |
|-------|----------|--------|------|
| **Model seçimi** | UI veya env ile “CO taslağı için model” (gpt-4o-mini / gpt-4o / local) seçimi; maliyet/kalite trade-off. | Düşük | Orta |
| **Queue + retry** | Uzun LLM işleri (tüm sinyalleri skorlama, toplu özet) için job queue (örn. in-memory veya Redis); timeout ve retry. | Orta | Orta |
| **Maliyet izleme** | Her LLM çağrısında token sayısı (ve isteğe bağlı maliyet) logla; org/proje bazında rapor. | Düşük | Düşük |
| **Yerel / özel model** | Gizlilik için Ollama, vLLM veya Azure OpenAI gibi endpoint; `OPENAI_API_KEY` yerine `OPENAI_BASE_URL` + aynı API. | Orta | Gizlilik |

---

## 8. Kullanıcı Deneyimi

| Fikir | Açıklama | Zorluk | Etki |
|-------|----------|--------|------|
| **“AI ile zenginleştir” butonu** | CO sayfasında mevcut taslağı “LLM ile tekrar üret” veya “sadece maliyet/gecikme ekle”; kullanıcı ne zaman AI kullandığını net görsün. | Düşük | Orta |
| **Güven göstergesi** | LLM çıktılarında “İnsan incelemesi gerekir”, “Kanıt referansları: …” ve hangi chunk’lara dayandığı linkleri. | Düşük | Orta |
| **Hata ve fallback** | LLM zaman aşımı veya hata durumunda şablon/heuristik ile devam et; kullanıcıya “AI şu an kullanılamadı, şablon kullanıldı” bilgisi. | Düşük | Düşük |

---

## Önerilen Uygulama Sırası (MVP → İleri)

1. **Kısa vadede (mevcut kodu iyileştir)**  
   - Yapılandırılmış LLM çıktısı (CO taslağı).  
   - Maliyet/gecikme çıkarımı (opsiyonel alan).  
   - Evidence özeti (yeni alan veya listelemede tooltip).

2. **Orta vadede (yeni özellikler)**  
   - Semantik arama (embedding + proje/CO context).  
   - Proje/CO sohbet botu (RAG).  
   - LLM ile sinyal skorlama (heuristik ile birlikte).

3. **Uzun vadede**  
   - Plan revizyonu LLM özeti, vision ile fotoğraf açıklaması.  
   - Sözleşme uyum kontrolü, risk skoru.  
   - Yerel/özel model seçeneği ve maliyet izleme.

---

## Teknik Notlar

- **Mevcut stack:** OpenAI Chat Completions (`lib/llm-co.ts`), `ENABLE_LLM_CO_DRAFT`, `OPENAI_API_KEY`, `OPENAI_MODEL`.  
- **Veri:** Evidence chunks (Prisma), extractedText, CO metinleri; RAG için chunk’lar + metadata (evidence id, tarih, tip) kullanılabilir.  
- **Güvenlik:** Tüm LLM çağrıları server-side; kullanıcı sadece kendi org/proje verisine erişebilir (`requireProjectAccess` / `requireOrgRole`).  
- **Maliyet:** Özellikle toplu sinyal skorlama ve büyük context’ler token maliyetini artırır; rate limit ve “AI’ı açık kullan” tercihi ile sınırlanabilir.

Bu belge, geliştirme önceliğinize göre maddeleri seçip `future-developments.md` veya sprint’lere taşıyabilirsiniz.
