# lebenslaufvideo3d

Genel kurallar ve kurulu araçlar `~/.claude/CLAUDE.md` içinde ve otomatik
yüklenir. Burada sadece **bu projeye özel** olanlar var.

## Canlı adres

**https://lebenslaufvideo3d.vercel.app/** — Adnan hep buraya bakar.
`main`'e push edilmemiş bir değişiklik onun için yok demektir; bir işi
"tamam" diye bildirmeden önce yayında olup olmadığını kontrol et.

Ölçüm için `npm run dev` kullanma — geliştirme kipi üretimden belirgin
yavaştır ve yanıltır. `npm run build` + `npx vite preview`, ya da doğrudan
canlı adres.

Adnan doğrudan `main` üzerinde çalışır ve Vercel'den bakar.

## Referans ekranlar

| Ekran | Ölçü |
|---|---|
| Büyük PC (referans, değişmemeli) | 1564 × 1060 |
| Laptop | 1283 × 587 |

1564'te doğrulanmış değerler: başlıklar 86.4 / 88 / 88 / 88 / 72 px,
kart başlığı 36, gövde 14.5 / 14 / 13, sayfa kenarı 80, kart iç boşluğu
36 / 40, sahne plakası 1280, menü çubuğu 612 px @ 471.
1283'te: menü 612 @ 330, `ÜBER MICH` 372.

## Akışkan ölçekler

`src/index.css` sonunda tanımlı: `fluid-display` (`--gross` ile hedef boyut,
`fluid-display-about` 5.4 / `fluid-display-kontakt` 4.5 / `fluid-display-liste` 4),
`fluid-title`, `fluid-body`, `fluid-body-m`, `fluid-body-s`, `fluid-eyebrow`,
`fluid-pad`, `fluid-pad-gross`, `fluid-gap`, `fluid-gutter`.

Hepsi `@import "tailwindcss"` sonrasında, katmansız duruyor — bu yüzden her
Tailwind utility'sini yenerler. Üst sınırları **1500px**'te eski sabit
değerlere oturur, böylece büyük PC değişmez.

## Proje bölümünün 1200px eşiği

Notebook sahnesi tüm beşiğini `cqw` ile, yani resmin genişliğine göre ölçer.
768px'te bilgi kartı 4.4–5.5px'e düşüyordu. 1200'ün altında aşağı açılır
liste devreye girer.

Eşik **üç yerde** geçer ve hepsi aynı ifadeyi kullanmak zorunda:
`App.tsx` içindeki `SCHMAL = '(min-width: 1200px)'` sabiti, aynı sorgu
`MobileProjectsSection` içinde, ve `min-[1200px]` sınıfları iki bölümde.
Farklı yazılırsa (`< 1200` ile `max-width: 1199px` gibi) kesirli
genişliklerde ikisi de yanlış olur ve proje bölümü tamamen boş kalır.

## Hero

`HeroSection.tsx` dikkatli ayarlandı, gerekmedikçe dokunma.

- Fener camının merkezi `BULB_X 0.457 / BULB_Y 0.150`, figürün kafa üstü
  resmin `%25.82`'si — hepsi `hero-lamp` görselinden piksel taramasıyla
  ölçüldü. Görseli değiştirirsen **piksel ölçüsü aynı kalmalı** (1672×941).
- Sabit arka plan katmanı (`fixed inset-0 z-0`) hero ekrandan çıkınca
  gizlenir ve videoları durur. Bu bilinçli: yoksa iki video sayfa boyunca
  dönüyor ve hero fotoğrafı bölümler arasından sızıyordu.

## Dil

Kod yorumları ve commit metinleri **Almanca**, Umlaut'suz (oe/ue/ae).
Belgeler ve cevaplar Türkçe.

## Ayrıntılı belgeler

- `docs/duyarli-site-brifing.md` — 9 maddelik kural listesi, her biri
  ölçülmüş bir hatayla
- `docs/arac-kutusu.md` — kurulu araçlar ve komut örnekleri
