import { el, toast, confirm } from '../utils.js';
import { settings, exportAll, importAll, wipeAll, progress } from '../storage.js';
import { berserkerLegend } from '../data/exercises.js';
import { programs } from '../data/exercises.js';

export function renderSettings() {
  const root = el('div', { class: 'view-section stack' });
  const s = settings.get();

  // Preferenze
  root.appendChild(el('div', { class: 'section-title' }, 'Preferenze'));
  const card = el('div', { class: 'card stack' });

  // Tema
  const themeRow = el('div', { class: 'row between' });
  themeRow.appendChild(el('span', {}, 'Tema'));
  const themeSel = el('select', { class: 'select', style: { width: 'auto' } });
  ['dark', 'light'].forEach(v => {
    const o = el('option', { value: v }, v === 'dark' ? 'Scuro' : 'Chiaro');
    if (s.theme === v) o.selected = true;
    themeSel.appendChild(o);
  });
  themeSel.onchange = () => {
    settings.set({ theme: themeSel.value });
    applyTheme(themeSel.value);
  };
  themeRow.appendChild(themeSel);
  card.appendChild(themeRow);

  card.appendChild(toggle('Suoni timer', s.sound, v => { settings.set({ sound: v }); }));
  card.appendChild(toggle('Vibrazione', s.vibration, v => { settings.set({ vibration: v }); }));
  card.appendChild(toggle('Avvia recupero automatico', s.autoStartRest, v => { settings.set({ autoStartRest: v }); }));
  card.appendChild(toggle('Mostra "ultima volta"', s.showLast, v => { settings.set({ showLast: v }); }));
  root.appendChild(card);

  // Progresso schede
  root.appendChild(el('div', { class: 'section-title' }, 'Progresso schede'));
  programs.forEach(p => {
    const pr = progress.get(p.id);
    const row = el('div', { class: 'card compact row between' });
    row.appendChild(el('div', {}, el('strong', {}, p.name), ' ', el('span', { class: 'small muted' }, `Sett. ${pr.week} · Giorno ${pr.day}`)));
    row.appendChild(el('button', { class: 'btn small ghost', onclick: async () => {
      if (await confirm({ title: 'Reset progresso', message: `Riportare ${p.name} alla Settimana 1?`, danger: true, confirmLabel: 'Reset' })) {
        progress.set(p.id, 1, 1); toast('Reset eseguito'); location.reload();
      }
    }}, 'Reset'));
    root.appendChild(row);
  });

  // Backup
  root.appendChild(el('div', { class: 'section-title' }, 'Backup'));
  const backupCard = el('div', { class: 'card stack' });
  backupCard.appendChild(el('button', { class: 'btn primary full', onclick: exportData }, '⬇ Esporta dati (JSON)'));
  const importInput = el('input', { type: 'file', accept: 'application/json', style: { display: 'none' } });
  importInput.onchange = importData;
  backupCard.appendChild(el('button', { class: 'btn ghost full', onclick: () => importInput.click() }, '⬆ Importa dati'));
  backupCard.appendChild(importInput);
  root.appendChild(backupCard);

  // Legenda
  root.appendChild(el('div', { class: 'section-title' }, 'Riferimenti'));
  root.appendChild(el('a', { class: 'btn ghost full', href: '#/legenda' }, '📖 Legenda Berserker'));

  // Danger zone
  root.appendChild(el('div', { class: 'section-title' }, 'Zona pericolosa'));
  root.appendChild(el('button', { class: 'btn danger full', onclick: async () => {
    if (await confirm({ title: 'Cancellare tutto?', message: 'TUTTI i workout, dati food e impostazioni verranno persi. Azione irreversibile.', danger: true, confirmLabel: 'Cancella tutto' })) {
      wipeAll(); toast('Tutto azzerato'); setTimeout(() => location.reload(), 500);
    }
  }}, '🗑 Cancella tutti i dati'));

  // App info
  root.appendChild(el('div', { class: 'empty', style: { marginTop: '24px' } },
    el('div', { class: 'small muted' }, 'WARFIT — Workout & Food Tracker'),
    el('div', { class: 'tiny faint' }, 'v1.0 · dati salvati solo sul tuo dispositivo')
  ));

  return root;
}

function toggle(label, value, onChange) {
  const row = el('label', { class: 'row between', style: { cursor: 'pointer' } });
  row.appendChild(el('span', {}, label));
  const sw = el('input', { type: 'checkbox', style: { width: '40px', height: '24px' } });
  sw.checked = value;
  sw.onchange = () => onChange(sw.checked);
  row.appendChild(sw);
  return row;
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#0a0a0a');
}

function exportData() {
  const data = exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `warfit-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup esportato', 'success');
}

async function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!await confirm({ title: 'Importare?', message: 'I dati attuali verranno sovrascritti con quelli del file.', danger: true, confirmLabel: 'Importa' })) return;
    importAll(data);
    toast('Importato', 'success');
    setTimeout(() => location.reload(), 500);
  } catch (err) {
    toast('File non valido', 'error');
  }
}

// ===== Legenda =====
export function renderLegend() {
  const root = el('div', { class: 'view-section stack' });
  root.appendChild(el('div', { class: 'card' },
    el('div', { class: 'card-title' }, '📖 Legenda Protocollo Berserker'),
    el('div', { class: 'card-sub' }, 'Glossario notazione esercizi e tecniche di intensità')
  ));
  berserkerLegend.forEach(item => {
    const card = el('div', { class: 'card' });
    const row = el('div', { class: 'row', style: { gap: '8px', marginBottom: '4px' } });
    row.appendChild(el('span', { class: `pattern-tag ${item.tag}` }, item.tag));
    row.appendChild(el('strong', {}, item.name));
    card.appendChild(row);
    card.appendChild(el('div', { class: 'small muted' }, item.desc));
    root.appendChild(card);
  });
  return root;
}
