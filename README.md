# Breakout — pezzaliAPP (PWA)

- Coordinate fisse **360×640** + DPR scaling
- Paddle sempre visibile (`VH-48` + clamp)
- Start robusto su iPhone (tap/click/pointer)
- Dispositivo selezionabile (iPhone / Samsung / Laptop)
- Mattoncini d’acciaio 🛡 (rompibili dopo 3 colpi)
- Offline via Service Worker (`breakout-pezzaliapp-v9-0`)

## Comandi
- **◀/▶** muovi • **Spazio** lancia • **P** pausa • **R** restart
- **Touch**: trascina sul canvas, pulsanti rapidi in basso

## Installazione PWA
- iPhone/iPad (Safari): Condividi → Aggiungi a Home
- Android (Chrome): Menu ⋮ → Aggiungi a schermata Home
- Desktop: Chrome/Edge → Installa app

## Build/Deploy
Metti i file in una cartella pubblica. Aggiornando, cambia il `CACHE` del service worker per forzare l’update.
