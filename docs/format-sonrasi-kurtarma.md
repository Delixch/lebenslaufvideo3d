# Format Sonrası Kurtarma

Bilgisayara format attıktan sonra her şeyi geri getirme adımları.
Durum: 21 Ağustos 2026.

---

## Önce: neyin kaybolacağını bil

Her şey aynı derecede tehlikede değil. Üç grup var.

### Grup 1 — Zaten güvende (iki kopyası var)

**Proje klasörü**
`C:\Users\xdd\OneDrive\Desktop\Proje\lebenslaufvideo3d`

Bu klasör **OneDrive içinde**, yani buluta kendiliğinden yükleniyor.
Ayrıca GitHub'da da duruyor: `github.com/Delixch/lebenslaufvideo3d`.
İki kopya var, formatta kaybolmaz.

**Ama dikkat:** GitHub'daki kopya sadece **push edilmiş** hâlidir.
Commit edilmemiş dosyalar orada yok — onlar sadece OneDrive'da. OneDrive
senkronu tamamlanmadan format atarsan onlar da gider.

> Formattan önceki tek en iyi hareket: `git push`.

### Grup 2 — HİÇBİR yedeği yok (asıl tehlike burada)

```
C:\Users\xdd\.claude\
```

Bu klasör OneDrive'ın **dışında**. İçinde:

- `CLAUDE.md` — her projede otomatik okunan genel kurallar
- `projects\<proje-adi>\memory\` — yapay zekânın kalıcı hafızası:
  ölçülmüş değerler, tekrarlayan hatalar, çalışma tercihleri
- `settings.json` — izinler ve ayarlar

Format atarsan bunlar gider ve yapay zekâ sıfırdan başlar: hangi ekranın
referans olduğunu, hangi hatanın daha önce yapıldığını, nasıl çalışmanı
istediğini bilmez.

**Formattan önce mutlaka kopyala:**

```bat
xcopy "C:\Users\xdd\.claude" "C:\Users\xdd\OneDrive\Yedek\claude" /E /I /H /Y
```

`/E` alt klasörler, `/I` hedef klasör yoksa oluştur, `/H` gizli dosyalar,
`/Y` üzerine yazmayı sorma.

### Grup 3 — Yedeklemeye değmez

`node_modules`, `dist`, tarayıcı önbelleği. Bunlar tek komutla geri gelir,
yer kaplamalarına değmez.

---

## Formattan önce yapılacaklar (5 dakika)

1. **Push et:**
   ```bat
   cd C:\Users\xdd\OneDrive\Desktop\Proje\lebenslaufvideo3d
   git add -A
   git commit -m "vor Format gesichert"
   git push origin main
   ```

2. **`.claude` klasörünü yedekle** (yukarıdaki `xcopy` komutu).

3. **OneDrive senkronunu bekle.** Görev çubuğundaki bulut simgesine tıkla,
   "Güncel" yazana kadar bekle. Yükleme sürüyorsa kapatma.

4. **Kontrol et:** github.com/Delixch/lebenslaufvideo3d adresini aç, son
   commit'in göründüğünü gör. OneDrive'da `Yedek\claude` klasörünün
   dolu olduğunu gör.

---

## Formattan sonra — sırayla

### 1. Temel programlar

PowerShell'i aç ve sırayla yapıştır:

```
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Microsoft.VisualStudioCode -e
winget install --id Python.Python.3.13 -e
winget install --id Gyan.FFmpeg -e
```

Sonra **yeni bir PowerShell penceresi aç** — PATH güncellemesi açık olan
pencerelere yansımaz.

Kontrol:

```
git --version
node --version
python --version
ffmpeg -version
```

Dördü de sürüm yazdırmalı. Yazdırmıyorsa o program kurulmamıştır.

### 2. Python paketi

```
python -m pip install python-docx
```

### 3. Claude Code

```
npm install -g @anthropic-ai/claude-code
```

Sonra bir klasörde `claude` yazıp giriş yap. Tarayıcı açılır, hesabınla
onaylarsın.

### 4. OneDrive'ı kur ve senkronu bekle

OneDrive'a giriş yap, proje klasörü ve `Yedek\claude` inene kadar bekle.
Bu adım atlanırsa sonraki adımlar boşa gider.

### 5. `.claude` klasörünü geri koy

```bat
xcopy "C:\Users\xdd\OneDrive\Yedek\claude" "C:\Users\xdd\.claude" /E /I /H /Y
```

Bu adım **en önemlisi.** Yapay zekânın hafızası ve genel kuralları burada.

### 6. Projeyi hazırla

OneDrive proje klasörünü zaten indirdiyse:

```bat
cd C:\Users\xdd\OneDrive\Desktop\Proje\lebenslaufvideo3d
npm install
npm run dev
```

İndirmediyse veya bir şey ters gittiyse GitHub'dan çek:

```bat
cd C:\Users\xdd\OneDrive\Desktop\Proje
git clone https://github.com/Delixch/lebenslaufvideo3d.git
cd lebenslaufvideo3d
npm install
```

`npm install` birkaç dakika sürer, `node_modules` yeniden kurulur.

### 7. Git kimliğini ayarla

```
git config --global user.name "Adnan Aydin"
git config --global user.email "aydinekam@gmail.com"
```

### 8. Kontrol et

```
npm run build
```

Hatasız biterse her şey yerinde demektir.

---

## Yapay zekâ formattan sonra ne bilecek?

`.claude` klasörünü geri koyduysan **her şeyi.** Hiçbir şey anlatman
gerekmez; oturumu açtığında şunlar otomatik yüklenir:

- `~/.claude/CLAUDE.md` — kurulu araçlar, duyarlı tasarım kuralları,
  Türkçe cevap verme, sonuçları sayıyla bildirme
- Proje kökündeki `CLAUDE.md` — bu projenin referans ekranları, fluid
  sınıflar, 1200px eşiği, canlı adres
- `~/.claude/projects/.../memory/` — ölçülmüş değerler ve geçmiş hatalar

`.claude` klasörünü geri koymadıysan yapay zekâ sıfırdan başlar. Proje
kökündeki `CLAUDE.md` yine de okunur (o repoda), ama hafıza ve genel
kurallar gitmiş olur.

---

## Kalıcı çözüm: bunu bir daha yaşama

`.claude` klasörünü elle yedeklemeyi unutmamak yerine, OneDrive'a bir
kısayol (junction) kur. Böylece klasör **sürekli** buluta senkronlanır:

```bat
move "C:\Users\xdd\.claude" "C:\Users\xdd\OneDrive\claude-ayarlar"
mklink /J "C:\Users\xdd\.claude" "C:\Users\xdd\OneDrive\claude-ayarlar"
```

İlk komut klasörü OneDrive'a taşır, ikincisi eski yerine bir bağlantı koyar.
Programlar hiçbir farkı görmez ama artık her değişiklik anında buluta gider.

Yönetici yetkisi gerekebilir; PowerShell'i "Yönetici olarak çalıştır" ile aç.

---

## Özet: format öncesi 3 komut

```bat
git add -A && git commit -m "vor Format gesichert" && git push origin main
xcopy "C:\Users\xdd\.claude" "C:\Users\xdd\OneDrive\Yedek\claude" /E /I /H /Y
```

Ve OneDrive'ın "Güncel" yazmasını bekle. Bu üçü tamamsa hiçbir şey kaybolmaz.
