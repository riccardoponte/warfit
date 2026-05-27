import { el, fmtDate, fmtDuration, confirm, toast } from '../utils.js';
import { workouts } from '../storage.js';

export function renderStorico() {
  const root = el('div', { class: 'view-section stack' });
  const list = workouts.all();

  // Statistiche rapide
  root.appendChild(renderStats(list));

  if (!list.length) {
    root.appendChild(el('div', { class: 'empty' },
      el('div', { class: 'icon' }, '📊'),
      el('div', {}, 'Nessun workout salvato.')
    ));
    return root;
  }

  // Selettore esercizio per grafico progressione
  root.appendChild(renderProgressionChart(list));

  // Lista cronologica
  root.appendChild(el('div', { class: 'section-title' }, 'Cronologia'));
  // raggruppa per mese
  const byMonth = {};
  list.forEach(w => {
    const d = new Date(w.endedAt || w.startedAt);
    const key = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    (byMonth[key] = byMonth[key] || []).push(w);
  });
  Object.entries(byMonth).forEach(([month, ws]) => {
    root.appendChild(el('div', { class: 'small muted upper', style: { marginTop: '12px', marginBottom: '6px' } }, month));
    ws.forEach(w => {
      const item = el('a', { class: 'list-item', href: `#/storico/${w.id}` });
      const lead = el('div', { class: 'lead' });
      lead.appendChild(el('div', { class: 'title' }, `${w.programName} · ${w.dayTitle}`));
      const setCount = (w.exercises||[]).reduce((a,e) => a + e.sets.filter(s=>s.done).length, 0);
      lead.appendChild(el('div', { class: 'sub' },
        `${fmtDate(w.endedAt || w.startedAt)} · ${setCount} serie · ${fmtDuration(w.durationSec||0)}`));
      item.appendChild(lead);
      item.appendChild(el('div', { class: 'trail' }, '›'));
      root.appendChild(item);
    });
  });

  return root;
}

function renderStats(list) {
  const card = el('div', { class: 'card' });
  card.appendChild(el('div', { class: 'card-title' }, '📊 Statistiche'));

  const total = list.length;
  const totalVol = list.reduce((a, w) => a + (w.exercises||[]).reduce((b, ex) =>
    b + ex.sets.reduce((c, s) => c + ((+s.weight)||0) * ((+s.reps)||0), 0), 0), 0);
  const totalTime = list.reduce((a, w) => a + (w.durationSec || 0), 0);
  const streak = calcStreak(list);

  const grid = el('div', { class: 'grid grid-2', style: { marginTop: '8px' } });
  const stat = (val, lbl) => {
    const d = el('div', { class: 'card compact center', style: { background: 'var(--bg-3)' } });
    d.appendChild(el('div', { class: 'big accent' }, String(val)));
    d.appendChild(el('div', { class: 'tiny muted upper' }, lbl));
    return d;
  };
  grid.append(
    stat(total, 'Workout'),
    stat(streak, 'Streak (gg)'),
    stat(Math.round(totalVol).toLocaleString('it-IT') + ' kg', 'Volume tot.'),
    stat(fmtDuration(totalTime), 'Tempo tot.')
  );
  card.appendChild(grid);
  return card;
}

function calcStreak(list) {
  if (!list.length) return 0;
  const days = new Set(list.map(w => new Date(w.endedAt || w.startedAt).toISOString().slice(0,10)));
  let s = 0;
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0,10);
    if (days.has(k)) s++;
    else if (i > 0) break;
    else continue; // oggi senza workout: continua
  }
  return s;
}

function renderProgressionChart(list) {
  const card = el('div', { class: 'card' });
  card.appendChild(el('div', { class: 'card-title' }, '📈 Progressione esercizio'));

  // Elenco esercizi distinti
  const names = new Set();
  list.forEach(w => (w.exercises||[]).forEach(ex => { if (!ex.skipped && ex.sets.some(s => s.done && s.weight)) names.add(ex.name); }));
  const opts = Array.from(names).sort();
  if (!opts.length) {
    card.appendChild(el('div', { class: 'small muted' }, 'Registra peso & reps per vedere la progressione.'));
    return card;
  }

  const sel = el('select', { class: 'select', style: { marginTop: '8px' } });
  opts.forEach(n => sel.appendChild(el('option', { value: n }, n)));
  card.appendChild(sel);

  const canvas = el('canvas', { class: 'chart' });
  card.appendChild(canvas);

  function draw(name) {
    const points = [];
    [...list].reverse().forEach(w => {
      const ex = (w.exercises||[]).find(e => e.name === name && !e.skipped);
      if (!ex) return;
      const valid = ex.sets.filter(s => s.done && +s.weight > 0);
      if (!valid.length) return;
      const maxW = Math.max(...valid.map(s => +s.weight));
      points.push({ x: w.endedAt || w.startedAt, y: maxW });
    });
    drawChart(canvas, points);
  }
  sel.onchange = () => draw(sel.value);
  setTimeout(() => draw(opts[0]), 0);
  return card;
}

function drawChart(canvas, points) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0,0,w,h);
  if (!points.length) {
    ctx.fillStyle = '#666'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Nessun dato', w/2, h/2);
    return;
  }
  const pad = 30;
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys) * 0.9, maxY = Math.max(...ys) * 1.1;
  const dx = maxX === minX ? 1 : maxX - minX;
  const dy = maxY === minY ? 1 : maxY - minY;
  const X = x => pad + ((x - minX) / dx) * (w - 2*pad);
  const Y = y => h - pad - ((y - minY) / dy) * (h - 2*pad);

  // griglia y
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1;
  ctx.fillStyle = '#6a6a6a'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const v = minY + (dy * i / 4);
    const y = Y(v);
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - 8, y); ctx.stroke();
    ctx.fillText(Math.round(v) + 'kg', pad - 4, y + 3);
  }

  // linea
  ctx.strokeStyle = '#e63946'; ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = X(p.x), y = Y(p.y);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  // punti
  ctx.fillStyle = '#e63946';
  points.forEach(p => { ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 3, 0, Math.PI*2); ctx.fill(); });
}

// ===== Dettaglio workout =====
export function renderWorkoutDetail(id) {
  const w = workouts.get(id);
  if (!w) return el('div', { class: 'empty' }, 'Workout non trovato');
  const root = el('div', { class: 'view-section stack' });

  const head = el('div', { class: 'card' });
  head.appendChild(el('div', { class: 'card-title' }, `${w.programName} · ${w.dayTitle}`));
  head.appendChild(el('div', { class: 'card-sub' },
    `${fmtDate(w.endedAt || w.startedAt)} · Sett. ${w.week} · ${fmtDuration(w.durationSec || 0)}`));
  root.appendChild(head);

  if (w.note) root.appendChild(el('div', { class: 'card compact', style: { fontStyle: 'italic' } }, w.note));

  w.exercises.forEach((ex, i) => {
    const card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'card-title' }, `${i+1}. ${ex.name}` + (ex.skipped ? ' (saltato)' : '')));
    if (!ex.skipped) {
      ex.sets.forEach((s, si) => {
        if (!s.done && !s.weight && !s.reps) return;
        const line = el('div', { class: 'row', style: { padding: '4px 0', borderTop: si ? '1px solid var(--border)' : 'none' } });
        line.appendChild(el('div', { class: 'mono', style: { width: '30px' } }, '#' + (si+1)));
        line.appendChild(el('div', { class: 'mono', style: { flex: 1 } },
          `${s.weight || '–'}kg × ${s.reps || '–'}${ex.timed ? 's' : ''}`));
        if (s.rpe) line.appendChild(el('span', { class: 'chip' }, 'RPE ' + s.rpe));
        if (s.done) line.appendChild(el('span', { class: 'chip success' }, '✓'));
        card.appendChild(line);
        if (s.note) card.appendChild(el('div', { class: 'small muted', style: { paddingLeft: '36px' } }, '— ' + s.note));
      });
    }
    root.appendChild(card);
  });

  root.appendChild(el('button', {
    class: 'btn danger full', style: { marginTop: '16px' },
    onclick: async () => {
      if (await confirm({ title: 'Eliminare?', message: 'Questo workout verrà rimosso dallo storico.', danger: true, confirmLabel: 'Elimina' })) {
        workouts.delete(id); toast('Eliminato'); location.hash = '#/storico';
      }
    }
  }, '🗑 Elimina workout'));

  return root;
}
