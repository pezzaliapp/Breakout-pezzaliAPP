# Breakout — pezzaliAPP 🎮

Versione PWA del classico **Breakout / Arkanoid**: funziona **offline**, è **installabile**, e supporta **tastiera, mouse e touch**.

- Canvas 360×640, UI dark coerente con Tetris pezzaliAPP
- Fisica palla/racchetta/muri, collisioni mattoncini
- Tipi di brick: normali, **strong (2 colpi)**, **steel (indistruttibili)**, **power‑up**
- Power‑up: **L** (pad largo), **S** (slow ball), **M** (multi‑ball), **+1** (vita extra)
- Progressione **livelli** (più righe e leggera crescita velocità)
- **PWA offline‑ready** con Service Worker e Manifest

## ▶️ Provalo
- Sito: `https://www.alessandropezzali.it/Breakout-pezzaliAPP/` (se pubblicato sul dominio)
- GitHub Pages: `https://pezzaliapp.github.io/Breakout-pezzaliAPP/` (se abilitato in Settings → Pages)

## 📦 Struttura
```
Breakout-pezzaliAPP/
├── index.html
├── app.js
├── style.css
├── manifest.json
├── service-worker.js
├── readme.html        # guida per l’utente finale (HTML)
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## ⌨️ Comandi
**Desktop**
- **◀︎ / ▶︎** muovi la racchetta
- **Spazio** lancia la palla
- **P** pausa • **R** restart
- **Mouse**: muovi la racchetta seguendo la palla

**Mobile**
- Pulsanti touch: Sinistra, Destra, Lancia
- Trascina sul canvas per muovere la racchetta (eventi pointer/mouse/touch)

## 📱 Installazione PWA
- **iOS (Safari):** Condividi → **Aggiungi a Home** → apri l’app dalla Home (schermo intero)
- **Android/Chrome:** Installa app dal banner o menu ⋮ → **Aggiungi alla schermata Home**

## 🛠️ Sviluppo locale
I service worker richiedono **https** o **localhost**. Avvia un server statico:

- Python
  ```bash
  python3 -m http.server 5173
  # poi apri http://localhost:5173
  ```

- Node
  ```bash
  npx http-server -p 5173 .
  # oppure: npx serve .
  ```

## 🚀 Deploy
### GitHub Pages
1. Carica i file nella **root** della repo (o in `/docs`).  
2. **Settings → Pages** → **Build and deployment**: `Deploy from a branch` → `main` + `/ (root)` (oppure `/docs`).  
3. Attendi il deploy e visita l’URL indicato.

### Hosting proprio
Metti la cartella nel tuo dominio, es. `https://www.alessandropezzali.it/Breakout-pezzaliAPP/`.  
Assicurati che i file statici siano serviti con **cache valida** e **HTTPS**.

## 🔁 Aggiornamenti
Quando rilasci una nuova versione, incrementa la costante `CACHE` in `service-worker.js` (es. `breakout-pezzaliapp-v4`) per forzare l’update sugli utenti. Dopo il deploy, fai un **hard refresh** (⌘⇧R / Ctrl⇧R).

## ❗️Troubleshooting
- **Il bottone “Gioca” non chiude l’overlay** → verifica che in `style.css` ci sia:
  ```css
  .hidden { display: none !important; }
  ```
  e che il JS chiami `hideOverlay()` al click/spazio.
- **Non parte offline** → apri almeno una volta online per permettere al SW di cachare gli asset.
- **Vedo la versione vecchia** → cambia `CACHE` nel SW e ricarica con hard refresh.

## 📄 Licenza
MIT — © 2025 pezzaliAPP
