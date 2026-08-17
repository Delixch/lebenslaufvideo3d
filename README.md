# Adnan Aydin — Portfolio

Persönliche Portfolio-Seite von Adnan Aydin, Web-Entwickler in Zürich.
Dunkler Auftritt mit Gold-Akzenten, Video-Hero, scroll-getriebenen Animationen
und einem optionalen Klangteppich.

**Live:** wird auf Vercel deployed · **Kontakt:** adnan.aydin@bluewin.ch

---

## Stack

| Bereich | Technik |
| --- | --- |
| Framework | React 19, TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Animation | framer-motion, Lenis (Smooth Scroll) |
| Linting | Oxlint |

## Aufbau

```
src/
  App.tsx                  Reihenfolge der Abschnitte
  components/
    HeroSection.tsx        Video-Ebene, Navigation, Headline, Signatur
    AboutSection.tsx       Porträt, Text, Kennzahlen
    ProjectsSection.tsx    Projektkarten (Daten oben in der Datei)
    ScrollStack.tsx        Stapel-Effekt der Projektkarten
    SkillsSection.tsx      Bento-Raster der Werkzeuge
    ExperienceSection.tsx  Werdegang als Zeitstrahl
    ContactSection.tsx     Formular (öffnet das Mailprogramm) und Fusszeile
    AmbientSound.tsx       Klangschalter unten links
public/
  audio/background.mp3     Hintergrundmusik
  videos/                  Platz für lokale Videodateien
```

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # Typprüfung + Produktionsbuild
npm run preview  # Produktionsbuild lokal ansehen
npm run lint     # Oxlint
```

Der Dev-Server läuft bewusst auf Port **5174**, damit er neben dem 3D-Portfolio
(Port 5173) laufen kann.

## Inhalte ändern

| Was | Wo |
| --- | --- |
| Hero-Video | `src/components/HeroSection.tsx`, `<source src="…">` |
| Standbild des Videos | dort das `poster`-Attribut |
| Porträt «Über mich» | `src/components/AboutSection.tsx`, `src={…}` |
| Projekte | `src/components/ProjectsSection.tsx`, Array `projects` oben |
| Werkzeuge | `src/components/SkillsSection.tsx`, Array `bentoCategories` |
| Werdegang | `src/components/ExperienceSection.tsx`, Array `journey` |
| Lautstärke | `src/components/AmbientSound.tsx`, `MUSIC_VOLUME` und `VIDEO_VOLUME` |

Bilder und Videos liegen aktuell auf Cloudinary und werden über ihre URL
eingebunden. Wer sie lieber mitliefert, legt sie unter `public/` ab und trägt
den lokalen Pfad ein.

## Klang

Der Schalter unten links startet die Hintergrundmusik und hebt gleichzeitig die
Stummschaltung des Hero-Videos auf. Ohne Klick bleibt die Seite still, weil
Browser Ton ohne Nutzergeste nicht erlauben. Die Musikdatei wird erst beim
ersten Einschalten geladen (`preload="none"`).

## Kontaktformular

Das Formular hat kein Backend. Beim Absenden öffnet es das Mailprogramm mit
vorbereiteter Nachricht an `adnan.aydin@bluewin.ch`. Wer echten Versand will,
hängt hier einen Dienst wie Resend an.

## Credits

Basiert auf dem Template
[cinematic-portfolio](https://github.com/lohithadamisetti123/cinematic-portfolio)
von D Shamya Lohitha. Inhalte, Texte, Bilder, Video und Klangauswahl stammen von
Adnan Aydin.

Musik: [«Titan» von Scott Buckley](https://www.scottbuckley.com.au/library/titan/)
— lizenziert unter [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
