// Scheda PROTOCOLLO BERSERKER — 5 settimane + Berserker Week
// Notazione setPattern: 'WU' warmup, 'F' feder set, 'W' working set, 'B' backoff, 'SST' stripping set
// `pattern` array di lunghezza pari a `sets` con il tipo di serie
// `reps` rimane stringa descrittiva mostrata in UI

function pat(str) {
  // es. "1WU;2F;2W;1B" -> ['WU','F','F','W','W','B']
  const out = [];
  str.split(/[;,\s]+/).filter(Boolean).forEach(tok => {
    const m = tok.match(/^(\d+)\s*([A-Z]+)$/i);
    if (m) {
      const n = parseInt(m[1], 10), t = m[2].toUpperCase();
      for (let i = 0; i < n; i++) out.push(t);
    } else out.push(tok.toUpperCase());
  });
  return out;
}

const ex = (name, sets, reps, rest, notes, pattern) => {
  const e = { name, sets, reps, rest, notes: notes || '' };
  if (pattern) e.pattern = pat(pattern);
  return e;
};

export const berserker = {
  id: 'berserker',
  name: 'Protocollo Berserker',
  shortName: 'Berserker',
  description: '5 settimane + Berserker Week — 4 allenamenti/sett',
  color: '#ff5a47',
  weeks: [
    {
      number: 1, title: 'Settimana 1',
      days: [
        {
          number: 1, title: 'Lunedì — Petto / Spalle',
          exercises: [
            ex('Distensioni manubri 30°', 6, '1WU;2F;2W;1B', 75, '', '1WU;2F;2W;1B'),
            ex('Distensioni multipower orizzontale', 4, '1F;2W;1B', 75, '1 rest pause dopo l\'ultima working set', '1F;2W;1B'),
            ex('Croci manubri 30°', 4, '8', 60, '4 secondi a scendere'),
            ex('Croci cavi chiusura centrale', 4, '10+10', 60),
            ex('Croci cavi dal basso verso l\'alto', 1, '10/12', 60, 'Una sola serie con 3 drop-set'),
            ex('DIP', 5, 'MAX', 60),
            ex('Alzate laterali parziali', 3, '10', 30, 'Carico molto pesante, esecuzioni parziali (solo prima metà).'),
            ex('Alzate laterali manubri', 1, 'SST', 0, '', '1SST'),
            ex('Alzate frontali disco', 3, '10+10', 60),
            ex('Calf', 3, '30', 20)
          ]
        },
        {
          number: 2, title: 'Martedì — Dorso / Bicipiti',
          exercises: [
            ex('Lat machine presa larga', 6, '1WU;2F;2W;1B', 75, '', '1WU;2F;2W;1B'),
            ex('Rematore 1 manubrio', 4, '1WU;1F;2W', 75, '', '1WU;1F;2W'),
            ex('Pullover cavo corda', 3, '10+10', 60),
            ex('Lat machine triangolo', 1, '8/10', 0, 'Una sola serie con 5 drop-set'),
            ex('Meadows row', 2, '6/8', 60, 'Bilanciere in un angolo bloccato da un manubrio pesante.'),
            ex('Pulley triangolo', 3, '12', 60, '2 secondi di isometria ad ogni ripetizione'),
            ex('Aperture posteriori manubri', 3, '30', 60),
            ex('Bic bilanciere angolato', 4, '2F;2W', 60, '', '2F;2W'),
            ex('Curl martello insieme', 4, '6+6', 60),
            ex('Bic cavo basso asta dritta', 1, 'SST', 0, '', '1SST')
          ]
        },
        { number: 3, title: 'Mercoledì — Riposo', rest: true, exercises: [] },
        {
          number: 4, title: 'Giovedì — Gambe',
          exercises: [
            ex('Leg curl sdraiato', 5, '1WU;2F;1W;1B', 60, 'Ultima serie: 30s isometria dopo l\'ultima ripetizione, poi MAX reps.', '1WU;2F;1W;1B'),
            ex('Squat bilanciere', 5, '1WU;2F;2W', 75, '', '1WU;2F;2W'),
            ex('Leg press 45°', 4, '1F;2W;1B', 75, '2 rest pause dopo l\'ultima working set', '1F;2W;1B'),
            ex('Bulgarian squat della morte', 3, '10+10+10', 60, 'Al termine dell\'ultima da 10, resta giù in tensione per MAX.'),
            ex('Leg extension', 4, '10+10', 60),
            ex('Stacchi gambe semi-tese', 3, '15', 60),
            ex('Calf', 4, '30', 30)
          ]
        },
        {
          number: 5, title: 'Venerdì — Petto / Spalle / Tricipiti',
          exercises: [
            ex('Croci cavi panca 45°', 4, '10+10', 60),
            ex('Distensioni manubri orizzontale', 4, '1WU;1F;2W', 75, '', '1WU;1F;2W'),
            ex('Croci cavi + Flessioni piedi su panca', 4, '12 / MAX flessioni', 60),
            ex('Shoulder press', 3, '1F;2W', 60, '', '1F;2W'),
            ex('Alzate laterali', 4, '8+8', 60),
            ex('Alzate laterali cavi 1 braccio', 3, '15', 60),
            ex('Tric french press 1 manubrio', 3, '8+8', 60, '1 manubrio con 2 mani'),
            ex('Tric corda', 3, '12', 60)
          ]
        }
      ]
    },
    {
      number: 2, title: 'Settimana 2',
      days: [
        {
          number: 1, title: 'Lunedì — Petto / Spalle',
          exercises: [
            ex('Distensioni multipower 30°', 6, '1WU;2F;2W;1B', 75, '', '1WU;2F;2W;1B'),
            ex('Panca piana bilanciere', 4, '1F;2W;1B', 60, '', '1F;2W;1B'),
            ex('Croci manubri orizzontale', 3, '8+8', 60),
            ex('Croci manubri 45° + Spinte 2 manubri uniti 45°', 4, '10 / MAX', 60),
            ex('DIP', 2, 'MAX', 60),
            ex('Alzate laterali manubri', 3, '12+12', 60),
            ex('Alzate laterali + alzate frontali manubri', 3, '10 / MAX', 60, 'Stesso peso, 12 laterali e quante ne riesci frontali.'),
            ex('Flessioni presa stretta', 3, 'MAX', 60),
            ex('Calf pressa', 4, '30', 30)
          ]
        },
        {
          number: 2, title: 'Martedì — Dorso / Bicipiti',
          exercises: [
            ex('Trazioni presa larga', 4, 'MAX', 75),
            ex('Rematore 2 manubri panca 30°', 3, '8+8', 60),
            ex('Pullover cavo corda + Rematore 2 manubri', 3, '8/10', 60),
            ex('Lat machine presa larga', 3, '1F;2W', 60, '', '1F;2W'),
            ex('Rematore 1 manubrio', 2, '6+6', 60),
            ex('Scrollate manubri', 3, '10+10', 60, '2 secondi di isometria ad ogni ripetizione'),
            ex('Aperture posteriori manubri', 3, '30', 60),
            ex('Bic manubri alternati', 4, '2F;2W', 60, '', '2F;2W'),
            ex('Bic cavo basso dritto', 4, '6+6', 60),
            ex('Bic manubri insieme', 1, 'SST', 0, '', '1SST')
          ]
        },
        { number: 3, title: 'Mercoledì — Riposo', rest: true, exercises: [] },
        {
          number: 4, title: 'Giovedì — Gambe',
          exercises: [
            ex('Leg press 45°', 5, '1WU;2F;1W;1B', 60, '', '1WU;2F;1W;1B'),
            ex('Squat multipower / Hack squat', 5, '1WU;2F;2W', 75, '', '1WU;2F;2W'),
            ex('Leg extension', 4, '1F;2W;1B', 60, '', '1F;2W;1B'),
            ex('Squat sumo 1 manubrio', 3, '10+10', 60),
            ex('Leg extension 1 gamba', 4, '15', 0, 'Senza riposo'),
            ex('Hip thrust 1 gamba', 4, '20', 0, 'Senza peso'),
            ex('Calf', 4, '30', 30)
          ]
        },
        {
          number: 5, title: 'Venerdì — Petto / Spalle / Tricipiti',
          exercises: [
            ex('Panca alta bilanciere', 4, '10', 60, '5 secondi a scendere'),
            ex('Croci manubri orizzontale', 4, '1WU;1F;1W;1B', 75, '', '1WU;1F;1W;1B'),
            ex('Croci cavi', 4, '10/10/10', 60, 'Senza cambiare peso: 10 chiusura alta, 10 centrale, 10 bassa.'),
            ex('Distensioni manubri seduto (panca 90°)', 3, '8+8', 60),
            ex('Alzate laterali', 4, '1F;2W;1B', 60, '', '1F;2W;1B'),
            ex('Alzate frontali corda cavo', 3, '10+10+10', 60),
            ex('Tric french press orizzontale 2 manubri', 3, '8+8', 60),
            ex('Tric cavo asta dritta', 3, '15', 60)
          ]
        }
      ]
    },
    {
      number: 3, title: 'Settimana 3',
      days: [
        {
          number: 1, title: 'Lunedì — Petto / Spalle',
          exercises: [
            ex('Croci ai cavi', 6, '1WU;2F;2W;1B', 75, '', '1WU;2F;2W;1B'),
            ex('Distensioni manubri orizzontale', 4, '1F;3W', 60, 'Ultima serie: 3 drop-set', '1F;3W'),
            ex('Distensioni manubri 30°', 4, '8', 60, '4 secondi a scendere'),
            ex('Croci cavi chiusura centrale', 4, '10+10', 60),
            ex('Croci orizzontali', 1, 'SST', 60, '', '1SST'),
            ex('DIP', 4, 'MAX', 60),
            ex('Alzate laterali parziali + complete', 4, '10/10', 60, 'Stesso peso: 10 parziali + 10 complete.'),
            ex('Alzate laterali manubri', 1, 'SST', 0, '', '1SST'),
            ex('Alzate frontali disco', 3, '10+10', 60),
            ex('Calf', 5, '20', 20)
          ]
        },
        {
          number: 2, title: 'Martedì — Dorso / Bicipiti',
          exercises: [
            ex('Lat machine triangolo', 6, '1WU;2F;2W;1B', 75, '', '1WU;2F;2W;1B'),
            ex('Lat machine presa larga', 3, '1WU;1W;1B', 60, '', '1WU;1W;1B'),
            ex('Pulley presa larga', 3, '8+8', 60),
            ex('Scrollate bilanciere', 4, '12', 60),
            ex('Pullover corda cavo', 2, '12', 60, 'Ultima serie: 4 drop-set'),
            ex('Row presa stretta', 3, '12', 60),
            ex('Aperture posteriori manubri', 3, '30', 60),
            ex('Bic bilanciere angolato presa stretta', 3, '1F;2W', 60, '', '1F;2W'),
            ex('Curl martello insieme + Curl corda cavo basso', 4, '10', 60),
            ex('Bic cavo basso asta dritta', 1, 'SST', 0, '', '1SST')
          ]
        },
        { number: 3, title: 'Mercoledì — Riposo', rest: true, exercises: [] },
        {
          number: 4, title: 'Giovedì — Gambe',
          exercises: [
            ex('Leg extension', 5, '1WU;2F;1W;1B', 60, 'Ultima serie: 10s isometria dopo l\'ultima rep, poi MAX reps.', '1WU;2F;1W;1B'),
            ex('Squat bilanciere', 5, '1WU;2F;2W', 75, '', '1WU;2F;2W'),
            ex('Leg press 45°', 4, '1F;2W;1B', 60, '', '1F;2W;1B'),
            ex('Squat bulgaro', 3, '15', 60),
            ex('Leg extension', 4, '8+8', 60),
            ex('Leg curl', 3, '15', 60),
            ex('Abduttori + Adduttori', 4, '20', 30),
            ex('Calf', 2, '40', 30)
          ]
        },
        {
          number: 5, title: 'Venerdì — Petto / Spalle / Tricipiti',
          exercises: [
            ex('Chest press', 4, '10+10', 60),
            ex('Croci orizzontale cavi', 4, '1WU;1F;2W', 75, '', '1WU;1F;2W'),
            ex('Croci cavi dal basso', 3, '12', 60),
            ex('Shoulder press', 3, '1F;2W', 60, '', '1F;2W'),
            ex('Alzate laterali', 4, '8+8', 60),
            ex('Alzate laterali cavi 1 braccio', 3, '15', 60),
            ex('Alzate frontali manubri a martello', 3, '12', 60),
            ex('Tric french press 1 manubrio', 3, '8+8', 60, '1 manubrio con 2 mani'),
            ex('Tric corda', 4, '10+10', 60)
          ]
        }
      ]
    },
    {
      number: 4, title: 'Settimana 4',
      days: [
        {
          number: 1, title: 'Lunedì — Petto / Spalle',
          exercises: [
            ex('Distensioni manubri 30°', 6, '1WU;2F;2W;1B', 75, '', '1WU;2F;2W;1B'),
            ex('Croci cavi + Distensioni orizzontale manubri', 4, '8/10', 60),
            ex('Croci orizzontali + Chest press', 4, '10', 60),
            ex('Croci cavi chiusura bassa', 4, '10+10', 60),
            ex('Chest press presa stretta', 1, 'SST', 60, '', '1SST'),
            ex('DIP', 3, 'MAX', 60),
            ex('Alzate laterali cavi insieme', 4, '12', 60),
            ex('Alzate laterali manubri + Distensioni manubri seduto', 4, '10', 60),
            ex('Alzate frontali disco', 3, '10+10', 60),
            ex('Calf', 5, '20', 20)
          ]
        },
        {
          number: 2, title: 'Martedì — Dorso / Bicipiti',
          exercises: [
            ex('Rematore bilanciere presa prona', 6, '1WU;2F;2W;1B', 75, '', '1WU;2F;2W;1B'),
            ex('Yates row', 3, '6/8', 60, 'Corpo leggermente più inclinato, presa più stretta, gomiti stretti.'),
            ex('Trazioni presa larga', 3, 'MAX', 60),
            ex('T-Bar cavo basso', 4, '10+10', 60, 'Triangolino al cavo basso.'),
            ex('Rematore 1 manubrio', 1, '10+10+10', 60, 'Prima tutto un braccio e poi l\'altro.'),
            ex('Facepull corda cavo alto', 3, '10+10', 60),
            ex('Bic panca scott bilanciere angolato + Bic cavo basso asta dritta', 3, '10', 60),
            ex('Bic martello', 4, '12', 60, '3 secondi a scendere')
          ]
        },
        { number: 3, title: 'Mercoledì — Riposo', rest: true, exercises: [] },
        {
          number: 4, title: 'Giovedì — Gambe',
          exercises: [
            ex('Leg extension', 2, '10+10', 60),
            ex('Leg extension', 1, 'SST', 0, '', '1SST'),
            ex('Leg press 45°', 4, '8', 60, 'In OGNI serie: 1 rest pause'),
            ex('Leg curl + Affondi alternati', 3, '12', 60),
            ex('Stacchi manubri gambe semi-tese + Squat sumo 1 manubrio', 4, '10', 60),
            ex('Abduttori + Adduttori', 4, '20', 30),
            ex('Calf', 2, '40', 30)
          ]
        },
        {
          number: 5, title: 'Venerdì — Petto / Spalle / Tricipiti',
          exercises: [
            ex('Distensioni 45° multipower', 4, '12', 60, '4 secondi a scendere'),
            ex('Croci cavi', 1, 'SST', 0, '', '1SST'),
            ex('Alzate laterali manubri', 4, '1F;2W;1B', 60, '', '1F;2W;1B'),
            ex('Distensioni 90° multipower', 4, '1F;2W;1B', 60, 'In ogni working set: 1 rest pause', '1F;2W;1B'),
            ex('Alzate laterali cavi 1 braccio', 3, '8+8', 60),
            ex('Alzate laterali manubri a martello', 3, '10', 60),
            ex('Tric french press cavo alto corda', 3, '8+8', 60),
            ex('DIP su panca', 4, 'MAX', 60, 'Mani sulla panca, piedi in sospensione o per terra.')
          ]
        }
      ]
    },
    {
      number: 5, title: 'Settimana 5',
      days: [
        {
          number: 1, title: 'Lunedì — Petto / Spalle',
          exercises: [
            ex('Panca piana bilanciere', 6, '1WU;2F;2W;1B', 75, '', '1WU;2F;2W;1B'),
            ex('Panca inclinata bilanciere', 4, '1F;3W', 60, '', '1F;3W'),
            ex('Distensioni manubri orizzontale', 3, '1F;1W;1B', 60, '', '1F;1W;1B'),
            ex('Croci manubri 15°', 3, '12+12', 60),
            ex('Croci ai cavi chiusura alta', 1, 'SST', 60, '', '1SST'),
            ex('DIP', 4, 'MAX', 60),
            ex('Alzate laterali manubri 1 braccio', 3, '15', 60),
            ex('Alzate frontali corda cavo', 1, 'SST', 0, '', '1SST'),
            ex('Distensioni manubri seduto', 3, '15', 60),
            ex('Calf', 5, '20', 20)
          ]
        },
        {
          number: 2, title: 'Martedì — Dorso / Bicipiti',
          exercises: [
            ex('Row insieme', 6, '1WU;2F;2W;1B', 75, '', '1WU;2F;2W;1B'),
            ex('Pulley presa larga', 3, '1WU;1W;1B', 60, '', '1WU;1W;1B'),
            ex('Rematore bilanciere + Lat machine presa larga', 4, '8/10', 60),
            ex('Scrollate manubri + Pullover corda cavo', 4, '12', 60),
            ex('Trazioni presa inversa', 3, 'MAX', 60),
            ex('Aperture posteriori manubri + Facepull corda cavo alto', 3, '12', 60),
            ex('Bic bilanciere dritto', 3, '10/10/10', 60, 'Stesso peso: 10 presa larga, 10 normale, 10 stretta.'),
            ex('Bic martello', 3, '6+6', 60),
            ex('Bic cavo basso asta dritta', 1, 'SST', 0, '', '1SST')
          ]
        },
        { number: 3, title: 'Mercoledì — Riposo', rest: true, exercises: [] },
        {
          number: 4, title: 'Giovedì — Gambe',
          exercises: [
            ex('Squat bilanciere', 5, '1WU;2F;1W;1B', 75, '', '1WU;2F;1W;1B'),
            ex('Leg press 45°', 5, '1WU;2F;2W', 75, '', '1WU;2F;2W'),
            ex('Leg extension + Squat con 2 manubri', 4, '10+10 leg / 12 squat', 60, 'Disco sotto i talloni, piedi stretti, manubri lateralmente.'),
            ex('Squat bulgaro', 3, '20', 60),
            ex('Leg curl', 5, '12', 30),
            ex('Abduttori + Adduttori', 4, '20', 30),
            ex('Calf', 3, '25', 10)
          ]
        },
        {
          number: 5, title: 'Venerdì — Petto / Spalle / Tricipiti',
          exercises: [
            ex('Croci cavi dal basso', 4, '10+10', 60),
            ex('Croci orizzontali', 4, '10 parziali + 10 complete', 60, '10 parziali nella fase di massimo stretching + 10 complete.'),
            ex('Croci cavi dal basso', 3, '12', 60),
            ex('Shoulder press', 3, '1F;2W', 60, '', '1F;2W'),
            ex('Alzate laterali', 4, '1F;2W;1B', 60, '', '1F;2W;1B'),
            ex('Aperture posteriori manubri + Alzate laterali manubri', 3, '12', 60),
            ex('Alzate frontali disco', 3, '10+10', 60),
            ex('DIP', 3, 'MAX', 60),
            ex('Tric corda', 3, '8+8+8', 60)
          ]
        }
      ]
    },
    {
      number: 6, title: 'BERSERKER WEEK',
      note: 'Settimana finale ad alta intensità — drop-set e rest pause su quasi tutti gli esercizi.',
      days: [
        {
          number: 1, title: 'Lunedì — Petto / Spalle',
          exercises: [
            ex('Distensioni manubri 30°', 6, '1WU;2F;3W', 75, 'Ultima serie: 3 drop-set', '1WU;2F;3W'),
            ex('Distensioni multipower orizzontale', 4, '1F;3W', 60, 'Ultima serie: 3 drop-set', '1F;3W'),
            ex('Croci ai cavi chiusura bassa', 3, '1F;2W', 60, 'Ultima serie: 3 drop-set', '1F;2W'),
            ex('Croci manubri orizzontali', 3, '12', 60, 'Ultima serie: 2 drop-set'),
            ex('Chest press', 1, 'SST', 60, '', '1SST'),
            ex('DIP', 3, 'MAX', 60),
            ex('Alzate laterali', 3, '8', 60, 'Ultima serie: 3 drop-set'),
            ex('Alzate frontali disco', 2, '10', 60, 'Ultima serie: 2 drop-set'),
            ex('Calf', 5, '20', 20)
          ]
        },
        {
          number: 2, title: 'Martedì — Dorso / Bicipiti',
          exercises: [
            ex('Lat machine presa larga', 6, '1WU;2F;3W', 75, 'Ultima serie: 3 drop-set', '1WU;2F;3W'),
            ex('Pulley triangolo', 3, '1WU;2W', 60, 'Ultima serie: 3 drop-set', '1WU;2W'),
            ex('Pulley presa larga', 3, '8', 60, '1 rest pause in ogni serie'),
            ex('Scrollate bilanciere', 4, '8', 60, '4 secondi isometria in ogni ripetizione'),
            ex('Pullover corda cavo', 3, '12', 60, 'Ultima serie: 4 drop-set'),
            ex('Aperture posteriori + Facepull + Aperture posteriori a martello', 3, '10', 60),
            ex('Bic corda cavo', 3, '1F;2W', 60, 'Ultima serie: 3 drop-set', '1F;2W'),
            ex('Bic bilanciere angolato', 3, '10', 60, 'Ultima serie: 3 drop-set'),
            ex('Bic cavo basso asta dritta', 1, 'SST', 0, '', '1SST')
          ]
        },
        { number: 3, title: 'Mercoledì — Riposo', rest: true, exercises: [] },
        {
          number: 4, title: 'Giovedì — Gambe',
          exercises: [
            ex('Leg extension', 5, '1WU;2F;2W', 60, 'Ultima serie: 4 drop-set', '1WU;2F;2W'),
            ex('Squat bilanciere', 5, '1WU;2F;2W', 75, '', '1WU;2F;2W'),
            ex('Leg press 45°', 4, '1F;3W', 60, '', '1F;3W'),
            ex('Squat bulgaro', 3, '8+8+8', 60),
            ex('Leg extension', 4, '15+15', 60),
            ex('Leg curl', 4, '15', 60, '2 secondi isometria ogni ripetizione'),
            ex('Abduttori + Adduttori', 4, '20', 30),
            ex('Calf', 5, '40', 30)
          ]
        },
        {
          number: 5, title: 'Venerdì — Petto / Spalle / Tricipiti',
          exercises: [
            ex('Distensioni manubri orizzontale', 4, '8+8+8', 60, 'Riscaldati bene'),
            ex('Croci cavi', 4, '1WU;1F;2W', 75, '', '1WU;1F;2W'),
            ex('Croci cavi dal basso', 3, '20', 60),
            ex('Shoulder press', 3, '1F;2W', 60, '3 drop-set', '1F;2W'),
            ex('Alzate laterali', 4, '12+12', 60),
            ex('Alzate laterali cavi 1 braccio', 3, '25', 60),
            ex('Alzate frontali manubri a martello + Alzate laterali manubri', 4, '12', 60),
            ex('DIP + Flessioni presa stretta', 3, 'MAX', 60),
            ex('Tric corda + French press orizzontale', 4, '15', 60)
          ]
        }
      ]
    }
  ]
};

// Glossario notazione Berserker
export const berserkerLegend = [
  { tag: 'WU', name: 'Warm Up', desc: 'Riscaldamento: 15-20 reps con carico molto basso (~40%). Non stancarsi.' },
  { tag: 'F', name: 'Feder Set', desc: 'Preparazione muscolare: ~70% del carico, 8-15 reps, niente cedimento. Più F consecutive = aumento progressivo del carico.' },
  { tag: 'W', name: 'Work Set', desc: 'Serie principale: carico alto, cedimento tra 5 e 10 reps. Se ne fai più di 10, fermati a 8 e usala come Feder aggiuntiva.' },
  { tag: 'B', name: 'Backoff', desc: 'Backload: 12-15 reps con ~50% del carico del Work Set.' },
  { tag: 'SST', name: 'Stripping Set', desc: '1) 8 reps pesanti, 2) 10s riposo, 3) MAX reps stesso carico, 4) 10s riposo, 5) -20% carico + positiva lenta (4s), 6) -20% + negativa lenta, 7) -20% + esplosivo.' },
  { tag: 'DROP-SET', name: 'Drop Set', desc: 'Solo nell\'ultima serie: -20% peso e riparti senza riposo. Resta nel range di reps indicato (±2).' },
  { tag: 'REST PAUSE', name: 'Rest Pause', desc: 'Nell\'ultima serie: peso invariato + 5-8s di riposo + MAX reps. Ripeti per il numero di rest pause indicate.' },
  { tag: 'N+N', name: 'Reps doppie (es. 4×10+10)', desc: 'In OGNI serie: 10 reps pesanti + 10 reps con carico minore (senza riposo).' },
  { tag: 'A+B', name: 'Super-serie', desc: 'Esercizio 1 + Esercizio 2 nello stesso riquadro = fai entrambi senza riposo intermedio.' },
  { tag: 'Recuperi', name: 'Tempi consigliati', desc: 'WU: 30-60s • F: 60s • W: 60-90s' }
];
