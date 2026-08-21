# Taslak: proje köküne `CLAUDE.md` olarak kopyala

Bu dosya bir taslaktır. Proje kökünde `CLAUDE.md` adıyla dururken her
oturumda otomatik okunur — yapay zekâya bir daha "bende şu araç var"
demen gerekmez.

Kullanmak için:

```
copy docs\arac-kutusu-CLAUDE.md CLAUDE.md
```

Aşağıdaki çizginin altındaki metin `CLAUDE.md`'nin içeriğidir.

---

## Bu makinede kurulu araçlar

Bunlar var, kullanmadan önce "yok" varsayma:

- **ffmpeg 9.0 / ffprobe 9.0** — video ve ses dönüştürme. PATH'te.
  Web videosunda `-movflags +faststart` her zaman eklensin.
- **sharp 0.35.3** — görsel dönüştürme, `devDependencies` içinde.
  PNG fotoğrafları WebP'ye çevirmek için bu kullanılsın.
- **Python 3.14.7 + pip 26.2.1** — `C:\Python314\python.exe`
- **python-docx 1.2.0** — Word belgesi üretmek için
- **winget** — paket kurulumu

**pandoc kurulu değil.** Word işleri için python-docx kullan.

Ayrıntılı kullanım örnekleri: `docs/arac-kutusu.md`

## Bu projede uyulacak kurallar

Duyarlı tasarım ve performans kuralları `docs/duyarli-site-brifing.md`
içinde, her biri ölçülmüş bir hatayla birlikte. Yeni bir bölüm veya
bileşen yazmadan önce oku. Özeti:

- Ölçüler `clamp()` ile akışkan olsun; `sm: md: lg:` zinciri kurma.
  Fluid sınıflar `src/index.css` sonunda tanımlı: `fluid-display`,
  `fluid-title`, `fluid-body`, `fluid-pad`, `fluid-gutter` vb.
  Üst sınırları 1500px'te eski sabit değerlere oturur.
- Bir eşik hem JS'te hem CSS'te geçiyorsa **tek bir ifade** kullan.
  Bu projede o ifade `(min-width: 1200px)` — `App.tsx` içindeki `SCHMAL`
  sabiti, `MobileProjectsSection` ve `min-[1200px]` sınıfları aynı sınırı
  paylaşır.
- `cqw`/`cqh` ile boyutlanan yazıya taban koy.
- Her bölümde `overflow-hidden` olsun; genişlik için `w-screen` değil
  `w-full`.
- Tam ekran `position: fixed` + `mask`/`blur` katmanı ekleme.
- İş bitince 320–2560 arası genişlik taraması yap ve sonucu sayı ver.
- Referans ekran 1564×1060; oradaki değerler değişmemeli, ölçerek göster.

## Dil ve biçim

- Kod yorumları ve commit metinleri **Almanca**, Umlaut'suz
  (ö→oe, ü→ue, ä→ae).
- Belgeler ve kullanıcıya cevaplar **Türkçe**.
- Sonuçlar sayıyla bildirilsin: "düzeldi" değil, "412px, önce 517px".

## Çalışma ortamı

- Canlı site: https://lebenslaufvideo3d.vercel.app/ — kullanıcı hep oraya
  bakar. `main`'e push edilmeyen bir değişiklik onun için yok demektir.
- Ölçüm için `npm run dev` kullanma, geliştirme kipi yanıltır.
  `npm run build` + `npx vite preview` ya da doğrudan canlı adres.
- Kullanıcı doğrudan `main` üzerinde çalışır.
