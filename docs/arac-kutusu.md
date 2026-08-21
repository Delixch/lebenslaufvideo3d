# Araç Kutusu

Bu makinede kurulu olan ve bu projede işe yarayan araçlar: ne oldukları,
ne işe yaradıkları, nasıl kullanıldıkları.

Durum: 21 Ağustos 2026.

---

## Yapay zekâ bunları kendiliğinden görür mü?

**Hayır.** Oturuma başlarken bilmez. Kabuğa (terminal) erişimi varsa
`ffmpeg -version` gibi bir komutla *öğrenebilir* — ama aklına gelirse.
Bugün de öyle oldu: ffmpeg'i arayıp bulamadım, "yok" dedim ve videoları
küçültemedim.

Üç yol var, en iyisinden en kötüsüne:

**1. `CLAUDE.md` (önerilen).** Proje kökündeki bu dosya her oturumda
otomatik yüklenir. Bir kere yazarsın, bir daha söylemene gerek kalmaz.
Bu klasördeki `arac-kutusu-CLAUDE.md` dosyası hazır bir taslak — proje
köküne `CLAUDE.md` adıyla kopyalaman yeterli.

**2. Prompt'ta söylemek.** Çalışır ama her seferinde tekrarlaman gerekir,
ve unuttuğun oturumda yapay zekâ yine "bu araç yok" der.

**3. Hiç söylememek.** Yapay zekâ kontrol etmeyi akıl ederse bulur,
etmezse işi eksik yapar. Bugün olan buydu.

Kısacası: **prompt'a yazmak yerine `CLAUDE.md`'ye yaz.** Fark, bir kere
söylemekle her seferinde söylemek arasındaki fark.

---

## Kurulu araçlar

### ffmpeg 9.0 · ffprobe 9.0

Video ve ses dönüştürücü. Bu projede işe yarayacağı yer: arka plan
videolarını gösterildikleri boyuta indirmek.

```
winget install --id Gyan.FFmpeg -e
```

Kurulu yeri (PATH'e eklendi, yeni pencerede düz `ffmpeg` yeter):

```
C:\Users\xdd\AppData\Local\Microsoft\WinGet\Packages\
  Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin
```

Kullanım:

```bat
:: Videonun gercek olcusunu ogren
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,bit_rate -of default=nw=1 video.mp4

:: Genisligi 360'a indir, yuksekligi orana gore hesapla, sesi at
ffmpeg -i giris.mp4 -vf "scale=360:-2" -an -c:v libx264 -crf 26 -preset slow -movflags +faststart cikis.mp4

:: Ayni kaynak, modern codec (daha kucuk, ama Safari destegi sinirli)
ffmpeg -i giris.mp4 -vf "scale=360:-2" -an -c:v libvpx-vp9 -crf 34 -b:v 0 cikis.webm
```

Bilinmesi gerekenler:

- `-crf` kalite ayarı: **küçük sayı = daha iyi kalite, daha büyük dosya.**
  H.264 için 18–28 arası mantıklı, 23 varsayılan.
- `-vf "scale=360:-2"` genişliği 360 yapar, yüksekliği oranı bozmadan
  hesaplar. `-2` çift sayıya yuvarlar — codec'ler tek sayı sevmez.
- `-an` sesi atar. Arka plan videosu `muted` oynadığı için ses gereksiz
  yüktür.
- `-movflags +faststart` dosyanın başlık bilgisini başa alır; video
  tamamen inmeden oynamaya başlar. Web videosunda **her zaman ekle.**
- `-preset slow` daha uzun sürer ama daha küçük dosya verir.

### python-docx 1.2.0

Python'dan Word (.docx) belgesi üretmek için. Kurulum:

```
python -m pip install python-docx
```

Kullanım:

```python
from docx import Document
from docx.shared import Pt, RGBColor

belge = Document()
belge.add_heading('Başlık', level=1)
p = belge.add_paragraph('Normal metin. ')
p.add_run('Kalın kısım.').bold = True
belge.save('cikti.docx')
```

Not: `docs/duyarli-site-brifing.docx` bu kütüphane **kurulmadan önce**
üretildi — .docx aslında içinde XML olan bir ZIP olduğu için elle yazıldı.
Bundan sonraki Word işlerinde python-docx kullanılacak, daha temiz.

### sharp 0.35.3

Görsel dönüştürücü. Projenin `devDependencies` listesinde zaten var,
ayrıca kurmaya gerek yok. Bugün `hero-lamp.png` bununla **1693 kB → 78 kB**
WebP'ye indirildi.

```js
const sharp = require('sharp');

// Ayni olcu, WebP olarak
await sharp('public/hero-lamp.png')
  .webp({ quality: 84, effort: 6 })
  .toFile('public/hero-lamp.webp');

// Olcuyu da kucult
await sharp('giris.png')
  .resize({ width: 780 })
  .webp({ quality: 82 })
  .toFile('cikis.webp');
```

`quality` denemeye değer: 78 / 84 / 90 arasında dosya boyutu ciddi
değişir. Bugün 78 → 56 kB, 84 → 77 kB, 90 → 118 kB çıktı; 84 seçildi.

### Python 3.14.7 · pip 26.2.1

`C:\Python314\python.exe`. Zaten kuruluydu. `py` launcher da var.

### winget

Windows paket yöneticisi. Yukarıdaki kurulumlar bununla yapıldı.

```
winget search <ad>          :: dogru paket kimligini bul
winget install --id <ID> -e :: kur
winget list --id <ID>       :: kurulu mu diye bak
winget upgrade --all        :: hepsini guncelle
```

Kurulumdan sonra **yeni bir terminal aç** — PATH güncellemesi açık olan
pencerelere yansımaz.

---

## Kurulu OLMAYAN

### pandoc

Markdown ↔ Word ↔ PDF dönüştürücü. Kurulmadı ve **gerekli değil**;
Word işleri python-docx ile yapılıyor. İstenirse:

```
winget install --id JohnMacFarlane.Pandoc -e
```

Doğru paket kimliği **`JohnMacFarlane.Pandoc`** — `JGM.Pandoc` diye bir
paket yok, o kimlikle "paket bulunamadı" hatası alınır.
