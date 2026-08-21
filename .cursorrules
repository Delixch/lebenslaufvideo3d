# Responsive ve Performans Sözleşmesi

Bu kurallar bütün web projelerinde geçerlidir. Cihaz kovalamak yerine kısıt
tarif ederler; her madde gerçek bir arızadan türedi.

## GEÇTİ / KALDI KAPILARI

Bunlar sağlanmadan iş bitmiş sayılmaz.

- **A.** 320–2560 px arasında hiçbir genişlikte yatay taşma olmayacak.
- **B.** Her genişlikte menüye erişilebilecek, hiçbir bölüm kaybolmayacak.
- **C.** Hiçbir yerde 9 px'in altında yazı kalmayacak.

## 1. Ölçüler akışkan olsun, basamaklı değil

Yazı boyutu, iç boşluk, kutu aralığı ve sayfa kenar boşluğu için kırılma
noktası zinciri (`sm:` `md:` `lg:`) kullanma. Her birini
`clamp(alt, taban + Nvw, üst)` olarak yaz. Üst sınırı, referans genişlikte tam
olarak tasarım değerini verecek şekilde hesapla ve hesabı yorum satırı olarak
yanına koy.

İstisna: düzenin **topolojisi** değişiyorsa (tek sütun → iki sütun, yatay şerit
→ dikey liste) kırılma noktası meşrudur. En fazla iki tane, ve neden orada
olduğu yorumda yazsın.

## 2. Sabit piksel ile büyüyen ölçüyü yan yana koyma

Bir öğe pencereyle büyüyorsa yanındaki her şey de büyümeli. 170 px'lik sabit bir
kutuyu, yüksekliğe göre küçülen bir görselin yanına koyma; küçük ekranda biri
diğerini geçer.

## 3. Bir eşik, tek bir ifade

Bir düzen hem JS'te hem CSS'te kontrol ediliyorsa ikisinde de aynı ifadeyi
kullan. `max-width:1199px` ile `min-width:1200px` birbirinin **tersi değildir**:
1199.4 px'te ikisi de yanlış olur ve o bölüm tamamen kaybolur. Tek sabit
tanımla, her yerde onu çağır.

## 4. Konteyner birimlerine (cqw/cqh) taban koy

`cqw` ile boyutlanan yazı, konteyner küçülünce okunmaz olur. Her `cqw` değerini
`max(Xcqw, Ypx)` biçiminde yaz; ya da konteyner belli bir genişliğin altına
düşünce o düzeni tamamen başka bir düzenle değiştir.

## 5. Her bölümün kendi zemini ve overflow-hidden'ı olsun

Dekoratif ışık ve gradyan daireleri bölümün dışına taşıp sayfayı yatay
kaydırtır. Genişlik için `w-screen` değil `w-full` kullan: `100vw` kaydırma
çubuğunu da sayar.

Yatay lastik kaydırmayı `overscroll-behavior-x: none` ile kapat.
`overflow-x: hidden` **kullanma** — `body`'yi kaydırma kabına çevirir ve
`position: sticky`'yi tüm projede sessizce öldürür.

## 6. Yükseklik de bir eksendir

Tam ekran yükseklik için `100vh` yazma. iOS'ta adres çubuğu girip çıkarken
`100vh` değişir, bölüm boyu oynar, sayfa titrer. `100svh` kullan; kasıtlı olarak
büyüyüp küçülmesini istiyorsan `dvh`.

## 7. Tam ekran katmanlar: yasak değil, koşullu

`position: fixed` bir katman düzen görünümüne göre konumlanır ve iOS onu adres
çubuğuyla birlikte oynatır — hiçbir compositing hilesi bunu düzeltmez. Katman
bir bölüme aitse `fixed` değil, o bölümün içinde `absolute` olsun; bölüm zaten
`overflow-hidden` ve sabit yükseklikte olsun.

Gerçekten `fixed` olacaksa:

- Kendi compositing katmanına al: `transform: translateZ(0)`,
  `backface-visibility: hidden`.
- Görünmediği anda `visibility: hidden` yap.
- Kaydırma sırasında `blur`/`mask` ile yeniden boyanmasına izin verme.

## 8. Performans bütçesi baştan konsun

- İlk yüklemede toplam medya 1.5 MB'ı geçmesin.
- Fotoğraf PNG değil WebP/AVIF, gösterildiği boyutun en çok 2 katı
  çözünürlükte. PNG sadece şeffaflık için.
- Arka plan videosu ekrandan çıkınca `pause()` edilsin; sonsuz loop sayfa
  boyunca çalışmasın.
- Sürekli çalışan tam ekran CSS animasyonu koyma.
- Ekran dışındaki ağır içerik (gömülü site, 3D sahne, rAF döngüsü)
  `IntersectionObserver` ile durdurulsun. Görünmeyen şey hesaplamaz.

## 9. Hareket azaltmaya saygı

`prefers-reduced-motion: reduce` açıksa süslü hareket çalışmasın: animasyonlar,
parçacıklar, otomatik kaydırma, titreşim. İşlev kaybolmasın, sadece hareket
dursun.

## 10. Kanıt: cihaz listesi değil, tarama

Site bir iframe'e konup sadece çerçeve genişletilerek taranır; `vw`, `cqw` ve
medya sorguları çerçeveye göre çalışır.

- Genişlik: 320 → 2560 px, 10 px adımlarla.
- Yükseklik: 500 → 1400 px, 50 px adımlarla (svh/dvh ve dikey taşma için).
- Her adımda raporla: yatay taşma, kaybolan bölüm, erişilemeyen menü, başlık
  çubuğunda çakışma, 9 px altında yazı.
- Sonucu sayı olarak ver.

## 11. Taramanın göremedikleri — gerçek cihazda bakılacak

Bunlar CSS ile kapatılamaz; sadece bilinir ve test edilir.

- iOS: `fixed` katmanların adres çubuğuyla oynaması, `svh` davranışı.
- Safari: gömülü çerçevede WebGL'in hiç başlamaması.
- Dokunmatik: hover diye bir şey yok; hover'a bağlı bilgi kaybolur.
- iOS sessize alma düğmesi WebAudio'yu kesebilir.
- Tablet en tehlikeli aralıktır: masaüstü düzenini alır ama dokunmatiktir.
  768–1024 px mutlaka gerçek cihazda görülsün.

## 12. Referans ekran değişmesin

Var olan bir siteyi düzenliyorsan önce referans ekranda tüm değerleri ölç ve
yaz. Değişiklikten sonra aynı ölçümleri tekrarla ve sapmanın 0 olduğunu göster.

## 13. Sonuçları sayıyla bildir

"Düzeldi" değil: "412 px, önce 517 px".
"Hızlandı" değil: "kare süresi 131 ms → 58 ms, düşen kare 39/41 → 1/41".
