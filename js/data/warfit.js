// Scheda Addominali WARFIT — 12 settimane periodizzate
// Struttura: { sets, reps, rest (sec), notes, timed?, morning?, superset? }
// `reps` può essere numero o stringa (es. 'MAX', '20+20', '30s')
// `timed` = secondi se esercizio a tempo
// `superset` = array di sotto-esercizi se super-serie a tempo alternato

export const warfit = {
  id: 'warfit',
  name: 'Warfit Addominali',
  shortName: 'Addome',
  description: '12 settimane periodizzate — focus ipertrofia addominale',
  color: '#e63946',
  weeks: [
    {
      number: 1,
      title: 'Settimana 1',
      note: '2 allenamenti con 2 giorni di distanza (es. Lun e Gio oppure Mar e Ven).',
      days: [
        {
          number: 1, title: 'Giorno 1',
          exercises: [
            { name: 'Vacuum', sets: 1, reps: 'MAX', rest: 0, morning: true, notes: 'Singola serie, al mattino a digiuno appena ti svegli; ~30/40 secondi.' },
            { name: 'Crunch piedi a terra', sets: 5, reps: 'MAX', rest: 40, notes: 'MAX = quante ripetizioni riesci a fare; rispetta i tempi di recupero.' },
            { name: 'Plank', sets: 5, reps: '30s', timed: 30, rest: 30, notes: 'Se non arrivi a 30s, solo questa settimana parti da 20s.' }
          ]
        },
        {
          number: 2, title: 'Giorno 2',
          exercises: [
            { name: 'Vacuum', sets: 1, reps: 'MAX', rest: 0, morning: true, notes: 'Singola serie, mattino a digiuno.' },
            {
              name: 'Crunch piedi a terra + Plank', sets: 5, reps: '30s ogni esercizio', rest: 30,
              superset: [
                { name: 'Crunch piedi a terra', timed: 30 },
                { name: 'Plank', timed: 30 }
              ],
              notes: 'Alterna 30s di crunch e 30s di plank; riposo solo a fine serie.'
            }
          ]
        }
      ]
    },
    {
      number: 2, title: 'Settimana 2',
      note: '3 allenamenti alternando 1 giorno di riposo (es. Lun-Mer-Ven).',
      days: [
        {
          number: 1, title: 'Giorno 1',
          exercises: [
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 60, morning: true, notes: '2 serie, mattino a digiuno.' },
            { name: 'Crunch piedi a terra', sets: 5, reps: 'MAX', rest: 40 },
            { name: 'Plank', sets: 5, reps: '35s', timed: 35, rest: 30 }
          ]
        },
        {
          number: 2, title: 'Giorno 2',
          exercises: [
            { name: 'Vacuum', sets: 1, reps: 'MAX', rest: 0, morning: true },
            {
              name: 'Crunch piedi a terra + Plank', sets: 5, reps: '30s ogni esercizio', rest: 30,
              superset: [
                { name: 'Crunch piedi a terra', timed: 30 },
                { name: 'Plank', timed: 30 }
              ]
            }
          ]
        },
        {
          number: 3, title: 'Giorno 3',
          exercises: [
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 60, morning: true },
            { name: 'Crunch piedi a terra', sets: 5, reps: 'MAX', rest: 40 },
            { name: 'Plank', sets: 5, reps: '35s', timed: 35, rest: 30 }
          ]
        }
      ]
    },
    {
      number: 3, title: 'Settimana 3',
      note: 'Stessa struttura della Settimana 2 (3 allenamenti alternati).',
      days: [
        {
          number: 1, title: 'Giorno 1',
          exercises: [
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 60, morning: true },
            { name: 'Crunch piedi a terra', sets: 5, reps: 'MAX', rest: 40 },
            { name: 'Plank', sets: 5, reps: '35s', timed: 35, rest: 30 }
          ]
        },
        {
          number: 2, title: 'Giorno 2',
          exercises: [
            { name: 'Vacuum', sets: 1, reps: 'MAX', rest: 0, morning: true },
            {
              name: 'Crunch piedi a terra + Plank', sets: 5, reps: '30s ogni esercizio', rest: 30,
              superset: [
                { name: 'Crunch piedi a terra', timed: 30 },
                { name: 'Plank', timed: 30 }
              ]
            }
          ]
        },
        {
          number: 3, title: 'Giorno 3',
          exercises: [
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 60, morning: true },
            { name: 'Crunch piedi a terra', sets: 5, reps: 'MAX', rest: 40 },
            { name: 'Plank', sets: 5, reps: '35s', timed: 35, rest: 30 }
          ]
        }
      ]
    },
    {
      number: 4, title: 'Settimana 4',
      note: 'Iniziamo il sovraccarico. Se vedi un numero di reps, usa un carico che ti permetta di restare in quel range.',
      days: [
        {
          number: 1, title: 'Giorno 1',
          exercises: [
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 60, morning: true },
            { name: 'Crunch gambe sollevate', sets: 4, reps: '20+20', rest: 40, notes: '20 reps con sovraccarico (disco/manubrio 5kg sopra la testa) + 20 senza peso. Riposo solo a fine serie.' },
            { name: 'Leg raises', sets: 2, reps: 'MAX', rest: 60, notes: 'Negativa (discesa) in 5 secondi.' },
            { name: 'Plank', sets: 2, reps: '40s', timed: 40, rest: 60 }
          ]
        },
        {
          number: 2, title: 'Giorno 2',
          exercises: [
            { name: 'Vacuum', sets: 1, reps: 'MAX', rest: 0, morning: true },
            {
              name: 'Crunch gambe sollevate + Plank', sets: 5, reps: '35s ogni esercizio', rest: 30,
              superset: [
                { name: 'Crunch gambe sollevate', timed: 35 },
                { name: 'Plank', timed: 35 }
              ]
            }
          ]
        },
        {
          number: 3, title: 'Giorno 3',
          exercises: [
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 60, morning: true },
            {
              name: 'Crunch gambe sollevate + Leg raises', sets: 5, reps: '20 + MAX + 20', rest: 60,
              notes: '20 crunch con sovraccarico + MAX leg raises + 20 crunch senza peso.'
            }
          ]
        }
      ]
    },
    {
      number: 5, title: 'Settimana 5',
      days: [
        {
          number: 1, title: 'Giorno 1',
          exercises: [
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 60, morning: true },
            { name: 'Crunch gambe sollevate', sets: 4, reps: '20+20', rest: 40 },
            { name: 'Leg raises', sets: 2, reps: 'MAX', rest: 60, notes: 'Negativa in 5 secondi.' },
            { name: 'Plank', sets: 2, reps: '40s', timed: 40, rest: 60 }
          ]
        },
        {
          number: 2, title: 'Giorno 2',
          exercises: [
            { name: 'Vacuum', sets: 1, reps: 'MAX', rest: 0, morning: true },
            {
              name: 'Crunch gambe sollevate + Plank', sets: 5, reps: '35s ogni esercizio', rest: 30,
              superset: [
                { name: 'Crunch gambe sollevate', timed: 35 },
                { name: 'Plank', timed: 35 }
              ]
            }
          ]
        },
        {
          number: 3, title: 'Giorno 3',
          exercises: [
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 60, morning: true },
            { name: 'Crunch gambe sollevate + Leg raises', sets: 6, reps: '20 + MAX + 20', rest: 50 }
          ]
        }
      ]
    },
    {
      number: 6, title: 'Settimana 6',
      note: 'Da questa settimana il vacuum si fa durante l\'allenamento (non più al mattino).',
      days: [
        {
          number: 1, title: 'Giorno 1',
          exercises: [
            {
              name: 'Crunch gambe sollevate + Vacuum', sets: 5, reps: '20 + MAX', rest: 60,
              notes: '20 crunch con peso + MAX di vacuum.'
            },
            {
              name: 'Leg raises + Plank', sets: 4, reps: '45s per esercizio', rest: 40,
              superset: [
                { name: 'Leg raises', timed: 45 },
                { name: 'Plank', timed: 45 }
              ]
            }
          ]
        },
        {
          number: 2, title: 'Giorno 2',
          exercises: [
            { name: 'Crunch gambe sollevate + Crunch tocco caviglie', sets: 5, reps: 'MAX', rest: 30 },
            { name: 'Plank', sets: 2, reps: '45s', timed: 45, rest: 60 },
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 30 }
          ]
        },
        {
          number: 3, title: 'Giorno 3',
          exercises: [
            {
              name: 'Leg raises + Crunch gambe sollevate + Leg raises', sets: 4, reps: '30s per esercizio', rest: 20,
              superset: [
                { name: 'Leg raises', timed: 30 },
                { name: 'Crunch gambe sollevate', timed: 30 },
                { name: 'Leg raises', timed: 30 }
              ]
            },
            {
              name: 'Plank + Vacuum', sets: 2, reps: '30s per esercizio', rest: 40,
              superset: [
                { name: 'Plank', timed: 30 },
                { name: 'Vacuum', timed: 30 }
              ]
            }
          ]
        }
      ]
    },
    {
      number: 7, title: 'Settimana 7',
      days: [
        {
          number: 1, title: 'Giorno 1',
          exercises: [
            { name: 'Crunch gambe sollevate + Vacuum', sets: 5, reps: '20 + MAX', rest: 60 },
            {
              name: 'Leg raises + Plank', sets: 5, reps: '45s per esercizio', rest: 40,
              superset: [{ name: 'Leg raises', timed: 45 }, { name: 'Plank', timed: 45 }]
            }
          ]
        },
        {
          number: 2, title: 'Giorno 2',
          exercises: [
            { name: 'Crunch gambe sollevate + Crunch tocco caviglie', sets: 5, reps: 'MAX', rest: 30 },
            { name: 'Plank', sets: 3, reps: '45s', timed: 45, rest: 60 },
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 30 }
          ]
        },
        {
          number: 3, title: 'Giorno 3',
          exercises: [
            {
              name: 'Leg raises + Crunch gambe sollevate + Leg raises', sets: 4, reps: '30s per esercizio', rest: 20,
              superset: [
                { name: 'Leg raises', timed: 30 },
                { name: 'Crunch gambe sollevate', timed: 30 },
                { name: 'Leg raises', timed: 30 }
              ]
            },
            {
              name: 'Plank + Vacuum', sets: 3, reps: '30s per esercizio', rest: 40,
              superset: [{ name: 'Plank', timed: 30 }, { name: 'Vacuum', timed: 30 }]
            }
          ]
        }
      ]
    },
    {
      number: 8, title: 'Settimana 8',
      days: [
        {
          number: 1, title: 'Giorno 1',
          exercises: [
            { name: 'Crunch gambe sollevate', sets: 5, reps: '15+15+15', rest: 40, notes: 'Peso più alto per le prime 15 + peso inferiore per le 15 intermedie + ultime 15 senza peso.' },
            { name: 'Leg raises', sets: 3, reps: 'MAX', rest: 40, notes: 'Negativa in 8 secondi.' },
            { name: 'Plank', sets: 2, reps: '45s', timed: 45, rest: 60 }
          ]
        },
        {
          number: 2, title: 'Giorno 2',
          exercises: [
            { name: 'Crunch gambe sollevate + Crunch tocco caviglie', sets: 5, reps: 'MAX', rest: 30 },
            { name: 'Plank', sets: 3, reps: '45s', timed: 45, rest: 40 },
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 30 }
          ]
        },
        {
          number: 3, title: 'Giorno 3',
          exercises: [
            {
              name: 'Leg raises + Crunch gambe sollevate + Leg raises', sets: 4, reps: '30s per esercizio', rest: 20,
              superset: [
                { name: 'Leg raises', timed: 30 },
                { name: 'Crunch gambe sollevate', timed: 30 },
                { name: 'Leg raises', timed: 30 }
              ]
            },
            {
              name: 'Plank + Vacuum', sets: 3, reps: '30s per esercizio', rest: 40,
              superset: [{ name: 'Plank', timed: 30 }, { name: 'Vacuum', timed: 30 }]
            }
          ]
        }
      ]
    },
    {
      number: 9, title: 'Settimana 9',
      days: [
        {
          number: 1, title: 'Giorno 1',
          exercises: [
            { name: 'Crunch gambe sollevate', sets: 5, reps: '15+15+15', rest: 40 },
            { name: 'Leg raises', sets: 3, reps: 'MAX', rest: 40, notes: 'Negativa in 8 secondi.' },
            { name: 'Plank', sets: 2, reps: '45s', timed: 45, rest: 60 }
          ]
        },
        {
          number: 2, title: 'Giorno 2',
          exercises: [
            { name: 'Crunch gambe sollevate + Crunch tocco caviglie', sets: 5, reps: 'MAX', rest: 30 },
            { name: 'Plank', sets: 3, reps: '45s', timed: 45, rest: 40 },
            { name: 'Vacuum', sets: 2, reps: 'MAX', rest: 30 }
          ]
        },
        {
          number: 3, title: 'Giorno 3',
          exercises: [
            {
              name: 'Leg raises + Crunch gambe sollevate + Leg raises', sets: 4, reps: '30s per esercizio', rest: 20,
              superset: [
                { name: 'Leg raises', timed: 30 },
                { name: 'Crunch gambe sollevate', timed: 30 },
                { name: 'Leg raises', timed: 30 }
              ]
            },
            {
              name: 'Plank + Vacuum', sets: 2, reps: '30s per esercizio', rest: 40,
              superset: [{ name: 'Plank', timed: 30 }, { name: 'Vacuum', timed: 30 }]
            }
          ]
        }
      ]
    },
    {
      number: 10, title: 'Settimana 10',
      note: '4 allenamenti: 2 + 1 riposo + 2 (es. Lun-Mar / Mer riposo / Gio-Ven).',
      days: [
        {
          number: 1, title: 'Giorno 1',
          exercises: [
            {
              name: 'Crunch gambe sollevate + Plank + Leg raises + Vacuum', sets: 5, reps: '35s per esercizio', rest: 30,
              superset: [
                { name: 'Crunch gambe sollevate con peso', timed: 35 },
                { name: 'Plank', timed: 35 },
                { name: 'Leg raises', timed: 35 },
                { name: 'Vacuum', timed: 35 }
              ]
            }
          ]
        },
        {
          number: 2, title: 'Giorno 2',
          exercises: [
            { name: 'Crunch tocco caviglie', sets: 5, reps: 'MAX', rest: 20 },
            { name: 'Plank', sets: 3, reps: '50s', timed: 50, rest: 40 },
            { name: 'Vacuum', sets: 3, reps: 'MAX', rest: 30 }
          ]
        },
        {
          number: 3, title: 'Giorno 3',
          exercises: [
            { name: 'Crunch gambe sollevate', sets: 5, reps: '15+15+15', rest: 40 },
            { name: 'Leg raises', sets: 3, reps: 'MAX', rest: 40, notes: 'Negativa in 8 secondi.' },
            { name: 'Plank', sets: 2, reps: '45s', timed: 45, rest: 60 }
          ]
        },
        {
          number: 4, title: 'Giorno 4',
          exercises: [
            {
              name: 'Leg raises + Crunch gambe sollevate + Leg raises', sets: 4, reps: '30s per esercizio', rest: 20,
              superset: [
                { name: 'Leg raises', timed: 30 },
                { name: 'Crunch gambe sollevate', timed: 30 },
                { name: 'Leg raises', timed: 30 }
              ]
            },
            {
              name: 'Plank + Vacuum', sets: 3, reps: '30s per esercizio', rest: 40,
              superset: [{ name: 'Plank', timed: 30 }, { name: 'Vacuum', timed: 30 }]
            }
          ]
        }
      ]
    },
    {
      number: 11, title: 'Settimana 11',
      note: 'Stessa struttura della Settimana 10.',
      days: [] // copiata dinamicamente da S10
    },
    {
      number: 12, title: 'Settimana 12',
      note: 'Stessa struttura della Settimana 10.',
      days: []
    }
  ]
};

// Copia S10 in S11 e S12 (medesimo programma)
warfit.weeks[10].days = JSON.parse(JSON.stringify(warfit.weeks[9].days));
warfit.weeks[11].days = JSON.parse(JSON.stringify(warfit.weeks[9].days));
