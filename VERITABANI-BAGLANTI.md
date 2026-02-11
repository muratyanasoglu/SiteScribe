# Veritabanı Bağlantısı – Baştan Sona Rehber

Bu rehber, **SiteScribe** projesi için MySQL veritabanı bağlantısını **sıfırdan** kurmanızı adım adım anlatır.

---

## İçindekiler

1. [Gereksinimler](#1-gereksinimler)
2. [MySQL Kurulumu](#2-mysql-kurulumu)
3. [Veritabanı ve Kullanıcı Oluşturma](#3-veritabanı-ve-kullanıcı-oluşturma)
4. [Proje Ortam Değişkenleri (.env)](#4-proje-ortam-değişkenleri-env)
5. [Bağımlılıklar ve Prisma Client](#5-bağımlılıklar-ve-prisma-client)
6. [Şemayı Veritabanına Uygulama](#6-şemayı-veritabanına-uygulama)
7. [Örnek Veri (Seed)](#7-örnek-veri-seed)
8. [Bağlantıyı Doğrulama](#8-bağlantıyı-doğrulama)
9. [Sorun Giderme](#9-sorun-giderme)

---

## 1. Gereksinimler

- **Node.js** 18 veya üzeri
- **MySQL** 8.x (yerel veya uzak sunucu)
- **npm** veya **yarn**

İsteğe bağlı: **MySQL Workbench** veya başka bir MySQL istemcisi (veritabanını görüntülemek için).

---

## 2. MySQL Kurulumu

### Windows

1. [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) indirin (MySQL 8.x).
2. Kurulum sihirbazını çalıştırın; **root** için bir şifre belirleyin.
3. MySQL’i **Windows hizmeti** olarak çalışacak şekilde bırakın (varsayılan).
4. Kurulum bitince **MySQL 8.0 Command Line Client** veya **MySQL Workbench** ile bağlanabilirsiniz.

### macOS (Homebrew)

```bash
brew install mysql@8.0
brew services start mysql@8.0
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

MySQL’in çalıştığını kontrol edin:

```bash
mysql -u root -p
```

Şifreyi girdikten sonra `mysql>` istemine düşmelisiniz.

---

## 3. Veritabanı ve Kullanıcı Oluşturma

Aşağıdaki komutları **MySQL root** (veya yönetici) kullanıcısıyla çalıştırın.

### Yöntem A: Komut satırı (mysql client)

1. MySQL’e bağlanın:

   ```bash
   mysql -u root -p
   ```

2. Aşağıdaki SQL komutlarını **sırayla** yapıştırıp Enter’a basın:

   ```sql
   CREATE DATABASE sitescribe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'sitescribe'@'localhost' IDENTIFIED BY 'sitescribe';
   GRANT ALL PRIVILEGES ON sitescribe.* TO 'sitescribe'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. Bağlantıyı test edin:

   ```bash
   mysql -u sitescribe -psitescribe sitescribe -e "SELECT 1;"
   ```

   Hata almadan `1` dönmeli.

### Yöntem B: MySQL Workbench

1. Workbench’i açın, root ile bağlanın.
2. **File → Open SQL Script** ile `scripts/setup-database.sql` dosyasını açın **veya** aşağıdaki komutları yeni bir SQL sekmesine yapıştırın.
3. Önce sadece şu satırları çalıştırın (veritabanı + kullanıcı):

   ```sql
   CREATE DATABASE sitescribe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'sitescribe'@'localhost' IDENTIFIED BY 'sitescribe';
   GRANT ALL PRIVILEGES ON sitescribe.* TO 'sitescribe'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. Tabloları oluşturmak için projede **Prisma** kullanacağız (Adım 6). İsterseniz tüm SQL komutları için `scripts/setup-database.sql` dosyasına bakın.

### Uzak sunucu kullanıyorsanız

- `'sitescribe'@'localhost'` yerine erişim izni verdiğiniz host’u kullanın, örneğin:
  - `'sitescribe'@'%'` (herhangi bir IP)
  - veya `'sitescribe'@'192.168.1.100'`
- Bağlantı dizesinde `HOST` kısmını sunucu IP veya alan adı yapın (aşağıda).

---

## 4. Proje Ortam Değişkenleri (.env)

1. Proje kök dizinine gidin:

   ```bash
   cd "c:\Users\akade\Desktop\PROJELER-EKSTRA\fikirler - 2"
   ```

2. Örnek env dosyasını kopyalayın:

   ```bash
   cp .env.example .env
   ```

   Windows (PowerShell):

   ```powershell
   Copy-Item .env.example .env
   ```

3. `.env` dosyasını bir metin editörüyle açın ve en az şunları ayarlayın:

   ```env
   DATABASE_URL="mysql://sitescribe:sitescribe@localhost:3306/sitescribe"
   NEXTAUTH_SECRET="buraya-32-byte-rastgele-bir-deger-yazin"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   - **DATABASE_URL** formatı:  
     `mysql://KULLANICI:SIFRE@HOST:PORT/VERITABANI_ADI`
   - Yerel MySQL: `localhost`, port genelde `3306`.
   - Uzak sunucu: `HOST` kısmına sunucu IP veya alan adını yazın.
   - **NEXTAUTH_SECRET**: Güçlü rastgele bir anahtar. Örnek üretmek için:
     ```bash
     openssl rand -base64 32
     ```
   - **NEXTAUTH_URL**: Uygulamanın çalışacağı adres (geliştirme: `http://localhost:3000`).

4. `.env` dosyasını **asla** Git’e eklemeyin; `.gitignore` içinde olduğundan emin olun.

---

## 5. Bağımlılıklar ve Prisma Client

1. Node paketlerini yükleyin:

   ```bash
   npm install
   ```

2. Prisma Client’ı oluşturun (şemayı okuyup TypeScript/JS kodunu üretir):

   ```bash
   npx prisma generate
   ```

   Hata almadan “Generated Prisma Client” benzeri bir çıktı görmelisiniz.

---

## 6. Şemayı Veritabanına Uygulama

Tabloları oluşturmak için iki yöntem var.

### Yöntem A: Prisma Migrations (önerilen)

Geçmişi tutar, production için uygundur:

```bash
npx prisma migrate dev
```

- İlk çalıştırmada tüm migration’lar uygulanır.
- Veritabanı bağlantısı `.env` içindeki `DATABASE_URL` üzerinden yapılır.

### Yöntem B: Prisma db push (hızlı prototip)

Migration dosyası oluşturmadan şemayı veritabanına yansıtır:

```bash
npx prisma db push
```

- Sadece geliştirme / deneme için uygun; production’da `migrate` kullanın.

### Manuel SQL ile (isteğe bağlı)

Tüm SQL komutları (veritabanı + kullanıcı + tablolar) **`scripts/setup-database.sql`** dosyasında toplanmıştır. MySQL root ile çalıştırabilirsiniz:

```bash
mysql -u root -p < scripts/setup-database.sql
```

Veya MySQL Workbench’te **File → Open SQL Script** ile bu dosyayı açıp çalıştırın. **Dikkat:** Dosyanın Bölüm 2 kısmı `DROP DATABASE IF EXISTS sitescribe` içerir; mevcut veritabanı ve tüm veri silinir.

---

## 7. Örnek Veri (Seed)

Demo kullanıcı ve örnek organizasyon/proje eklemek için:

```bash
npx prisma db seed
```

Varsayılan giriş bilgileri (örnek):

- **E-posta:** `demo@sitescribe.app`
- **Şifre:** `demo1234`

Bu bilgileri `prisma/seed.ts` içinde görebilirsiniz; yalnızca geliştirme ortamında kullanın.

---

## 8. Bağlantıyı Doğrulama

### Prisma Studio

Veritabanındaki tabloları ve kayıtları görüntülemek için:

```bash
npx prisma studio
```

Tarayıcıda açılan arayüzden tablolara göz atabilirsiniz.

### Uygulamayı çalıştırma

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine gidin. Demo hesabıyla giriş yapabiliyorsanız veritabanı bağlantısı doğru çalışıyordur.

### MySQL istemcisi

```bash
mysql -u sitescribe -psitescribe sitescribe -e "SHOW TABLES;"
```

SiteScribe tablolarının listesini görmelisiniz.

---

## 9. Sorun Giderme

### "Can't connect to MySQL server"

- MySQL servisinin çalıştığından emin olun (Windows: Hizmetler, macOS/Linux: `brew services list` / `systemctl status mysql`).
- `DATABASE_URL` içindeki `HOST` ve `PORT` (genelde 3306) doğru mu kontrol edin.
- Güvenlik duvarı MySQL portunu engelliyor olabilir.

### "Access denied for user 'sitescribe'@'localhost'"

- Kullanıcı adı ve şifre `.env` ile veritabanındaki kullanıcıyla aynı mı kontrol edin.
- `GRANT ALL PRIVILEGES ON sitescribe.* TO 'sitescribe'@'localhost';` ve `FLUSH PRIVILEGES;` komutlarını çalıştırdığınızdan emin olun.

### "Unknown database 'sitescribe'"

- Önce `CREATE DATABASE sitescribe ...` komutunu çalıştırın (Adım 3).

### SSL/TLS hataları (ör. uzak MySQL)

- Bazı sunucularda bağlantı dizesine SSL parametresi eklemeniz gerekir, örneğin:
  - `DATABASE_URL="mysql://...?sslmode=require"`
  - Sunucu dokümantasyonundaki tam parametreleri kullanın.

### Prisma Client güncel değil

- `prisma/schema.prisma` değiştiyse:
  ```bash
  npx prisma generate
  ```
- Şema veya migration değiştiyse:
  ```bash
  npx prisma migrate dev
  ```
  veya (migration kullanmıyorsanız) `npx prisma db push`

---

## Özet Kontrol Listesi

| Adım | Komut / İşlem |
|------|-------------------------------|
| 1 | Node.js 18+ ve MySQL 8.x kurulu |
| 2 | MySQL servisi çalışıyor |
| 3 | `CREATE DATABASE sitescribe ...` ve `CREATE USER` / `GRANT` çalıştırıldı |
| 4 | `.env` oluşturuldu; `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` ayarlandı |
| 5 | `npm install` ve `npx prisma generate` |
| 6 | `npx prisma migrate dev` veya `npx prisma db push` |
| 7 | (İsteğe bağlı) `npx prisma db seed` |
| 8 | `npm run dev` ile uygulama açılıyor ve giriş yapılabiliyor |

Bu adımlar tamamlandığında veritabanı bağlantınız kurulmuş olur.
