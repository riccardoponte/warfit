# WARFIT — Workout & Food Tracker

App web mobile-first (PWA) per gestire le schede di allenamento **Addominali Warfit (12 settimane)** e **Protocollo Berserker (5 sett + Berserker Week)**, con tracking dei workout e diario alimentare via barcode (OpenFoodFacts).

Tutto offline, dati salvati solo nel browser, nessun account.

## Avvio

La fotocamera (scanner barcode) richiede **HTTPS** o **`localhost`**. Aprendo `index.html` direttamente con `file://` lo scanner non funziona (puoi comunque inserire il barcode manualmente o usare l'inserimento manuale degli alimenti).

### Opzione 1 — VS Code "Live Server"
1. Installa l'estensione **Live Server** in VS Code
2. Click destro su `index.html` → **Open with Live Server**
3. Apri l'URL `http://localhost:5500/` (anche da telefono nella stessa rete)

### Opzione 2 — Python
```powershell
cd workout-app
python -m http.server 8080
```
Poi apri `http://localhost:8080/` nel browser.

### Opzione 3 — Node
```powershell
npx serve workout-app
```

### Opzione 4 — Online (gratis)
Caricala su **GitHub Pages**, **Netlify Drop** o **Vercel** per usarla da telefono ovunque (e ottenere automaticamente HTTPS).

## Installa come app

Una volta aperta nel browser su telefono:
- **iOS Safari**: Condividi → "Aggiungi a Home"
- **Android Chrome**: menu → "Installa app" / "Aggiungi a schermata Home"

## Funzionalità

### Workout
- **Schede precaricate**: Warfit (12 sett), Berserker (5 sett + Berserker Week)
- Esecuzione con **timer di recupero automatico** + beep + vibrazione
- Per ogni serie: peso, reps, **RPE opzionale** (1-10), nota
- **Riordino esercizi** durante il workout (drag o menu)
- **Indice esercizi** rapido per saltare avanti
- **Salta**, **sostituisci** o **rimuovi** esercizi
- **Aggiungi esercizio custom** al volo
- **Ultima volta**: mostra peso/reps della sessione precedente per lo stesso esercizio
- **Wake Lock**: schermo sempre acceso durante il workout
- **Salvataggio automatico**: se chiudi il browser puoi **riprendere** dal punto in cui eri
- **Note di workout** a fine sessione
- **Avanzamento automatico** alla prossima giornata/settimana al termine

### Storico & Statistiche
- Cronologia raggruppata per mese
- Workout totali, **streak giorni consecutivi**, volume totale, tempo totale
- **Grafico progressione peso** per esercizio (seleziona dal menu)
- Dettaglio singolo workout con tutte le serie e RPE

### Food tracking
- **Scansione barcode** con la fotocamera (BarcodeDetector API)
- **Lookup automatico** su OpenFoodFacts (db gratuito, copre praticamente tutti i prodotti europei)
- Inserimento **manuale** se il prodotto non è trovato
- **Inserimento barcode da tastiera** in fallback
- Diario per pasto: colazione / pranzo / cena / spuntino
- **Anello kcal giornaliero** + barre per proteine / carbo / zuccheri / grassi
- **Grafico settimanale** con totale 7 giorni
- **Obiettivi nutrizionali** personalizzabili (kcal e macros)
- Navigazione giorni precedenti

### Impostazioni
- Toggle suoni, vibrazione, recupero automatico
- **Export / Import JSON** (backup completo)
- Reset progresso per scheda
- Cancella tutti i dati
- Legenda Berserker (WU/F/W/B/SST/Drop-set/Rest pause)

## Tecnologie

- Vanilla JS con **moduli ES** (nessun build step)
- LocalStorage per i dati
- Service Worker per offline / installabilità PWA
- BarcodeDetector API + OpenFoodFacts REST
- Web Audio API (beep) + Vibration API + Wake Lock API
- Canvas vanilla per i grafici

## Struttura file

```
workout-app/
├── index.html
├── manifest.webmanifest
├── sw.js
├── README.md
├── css/
│   ├── theme.css
│   ├── layout.css
│   └── components.css
├── js/
│   ├── app.js              (router)
│   ├── storage.js          (localStorage)
│   ├── state.js            (event bus)
│   ├── utils.js            (DOM, beep, modal, toast, timer...)
│   ├── views/
│   │   ├── home.js
│   │   ├── schede.js
│   │   ├── workout.js
│   │   ├── storico.js
│   │   ├── food.js
│   │   └── settings.js
│   └── data/
│       ├── warfit.js
│       ├── berserker.js
│       └── exercises.js
└── assets/icons/icon.svg
```

## Note

- I dati sono salvati **solo sul tuo dispositivo** (localStorage). Cancellando i dati del browser perdi tutto: usa **Esporta** periodicamente.
- OpenFoodFacts è community-driven: alcuni prodotti potrebbero avere dati nutrizionali incompleti.
- Le icone PWA sono SVG minimaliste: puoi sostituirle in `assets/icons/`.

Buon allenamento. 💪
