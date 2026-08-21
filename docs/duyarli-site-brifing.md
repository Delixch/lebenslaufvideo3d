# Duyarlı Site Brifingi

Yeni bir web projesine başlarken yapay zekâya verilecek ilk mesaj.
Her madde, bu projede 20–21 Ağustos 2026'da gerçekten karşılaşılan ve
tarayıcıda ölçülen bir hatadan çıkarıldı.

---

## Talimat (kopyala–yapıştır)

```
Bu siteyi kurarken aşağıdaki kurallara uy. Her maddeyi uygula ve
sonunda ölçümle kanıtla. "İyi görünüyor" demen yeterli değil, sayı ver.

1. ÖLÇÜLER BASAMAKLI DEĞİL, AKIŞKAN OLSUN
   Yazı boyutu, iç boşluk, kutu aralığı ve sayfa kenar boşluğu için
   kırılma noktası zincirleri (sm: md: lg:) kullanma. Her birini
   clamp(alt, taban + Nvw, üst) olarak yaz. Üst sınırı, referans
   genişlikte tam olarak tasarım değerini verecek şekilde hesapla ve
   hesabı yorum satırı olarak yanına koy.

2. SABİT PİKSEL İLE BÜYÜYEN ÖLÇÜYÜ YAN YANA KOYMA
   Bir öğe pencereyle büyüyorsa yanındaki her şey de büyümeli. 170px'lik
   sabit bir kutuyu, yüksekliğe göre küçülen bir görselin yanına koyma;
   küçük ekranda biri diğerini geçer.

3. BİR EŞİK, TEK BİR İFADE
   Bir düzen hem JS'te hem CSS'te kontrol ediliyorsa ikisinde de aynı
   ifadeyi kullan. max-width:1199px ile min-width:1200px birbirinin
   TERSİ DEĞİLDİR: 1199.4px'te ikisi de yanlış olur ve o bölüm tamamen
   kaybolur. Tek sabit tanımla, her yerde onu çağır.

4. KONTEYNER BİRİMLERİNE (cqw/cqh) TABAN KOY
   cqw ile boyutlanan yazı, konteyner küçülünce okunmaz olur. Her cqw
   değerini max(Xcqw, YPx) biçiminde yaz; ya da konteyner belli bir
   genişliğin altına düşünce o düzeni tamamen başka bir düzenle değiştir.

5. HER BÖLÜMÜN KENDİ ZEMİNİ VE overflow-hidden'I OLSUN
   Dekoratif ışık/gradyan daireleri bölümün dışına taşıp sayfayı yatay
   kaydırtır. Genişlik için w-screen değil w-full kullan: 100vw kaydırma
   çubuğunu da sayar.

6. PERFORMANS BÜTÇESİ BAŞTAN KONSUN
   - İlk yüklemede toplam medya 1.5 MB'ı geçmesin.
   - Fotoğraf PNG değil WebP/AVIF, gösterildiği boyutun en çok 2 katı
     çözünürlükte.
   - Tam ekran position:fixed katmanları (özellikle mask, backdrop-filter
     veya büyük blur içerenler) sayfanın her karesinde yeniden bindirilir.
     Kullanma; kullanacaksan görünmediği anda visibility:hidden yap.
   - Arka plan videosu ekrandan çıkınca pause() edilsin; sonsuz loop
     sayfa boyunca çalışmasın.
   - Sürekli çalışan tam ekran CSS animasyonu koyma.

7. KANIT: CİHAZ LİSTESİ DEĞİL, GENİŞLİK TARAMASI
   320px'den 2560px'e 10px adımlarla tara ve raporla: yatay taşma var mı,
   her bölüm görünüyor mu (hiçbiri kaybolmuyor mu), menüye her genişlikte
   erişilebiliyor mu, başlık çubuğunda çakışma var mı, 9px altında yazı
   kaldı mı. Sonucu sayı olarak ver.

8. REFERANS EKRAN DEĞİŞMESİN
   Var olan bir siteyi düzenliyorsan önce referans ekranda tüm değerleri
   ölç ve yaz. Değişiklikten sonra aynı ölçümleri tekrarla ve sapmanın
   0 olduğunu göster.

9. SONUÇLARI SAYIYLA BİLDİR
   "Düzeldi" değil: "412px, önce 517px".
```

---

## Her madde hangi hatadan geldi

**1 · Akışkan ölçüler.** Başlıklar 768px'te tam boyuta sıçrayıp orada
kalıyordu; iPad'de 672px genişliğinde bir sütunda 72px'lik satırlar duruyordu.
Skills başlığı, önce → sonra: 768px `72 → 52.0` · 1024px `88 → 64.6` ·
1500px ve üstü `88 → 88`.

**3 · Tek eşik ifadesi.** JS'te `max-width:1199px`, CSS'te `min-width:1200px`
vardı. 1199px'te `#work` sıfır çocuk öğeyle kaldı — ne sahne ne liste göründü.

**4 · Konteyner birimine taban.** Notebook sahnesi tüm yazısını `cqw` ile
ölçüyor. 768px'te bilgi kartının yazıları `4.4 – 5.5px` oldu.

**5 · Bölüm zemini ve taşma.** Proje bölümünde tek başına `overflow-hidden`
eksikti; dekoratif ışık dairesi sağ kenarı aşıyordu.
768px pencerede `body.scrollWidth` `832 → 768`.

**6 · Performans bütçesi.** Tam ekran `mask-composite` katmanı her karede
sayfanın üstüne yeniden bindiriliyordu. Pahalı olan boyut değildi: 320vmax'ı
150vmax'a düşürmek hiçbir şey değiştirmedi. Kaldırınca kaydırmada kare süresi
`131–141ms → 52–67ms`, düşen kare `39/41 → 1/41`, ilk yükleme medyası
`7.83 MB → 4.9 MB`.

**7 · Genişlik taraması.** Cihaz listesi eskir, tarama eskimez. Siteyi bir
`iframe`'e koyup sadece çerçeveyi adım adım genişletmek yeterli — `vw`, `cqw`
ve medya sorguları çerçeveye göre çalışır, 150 genişlik tek seferde taranır.
320 → 2560 arası 158 genişlik denendi; taşma, kayıp bölüm, erişilemeyen menü
ve çakışma sayısı: `0`.

---

Web sürümü (kopyala butonuyla):
https://claude.ai/code/artifact/b2cc057c-d7ba-4453-a386-184c448ebb64
