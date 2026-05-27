import { el, clear, fmtDate, toast, modal, confirm, todayKey, startOfWeek, addDays } from '../utils.js';
import { food, foodCache, foodGoals, uid } from '../storage.js';

let currentDate = todayKey();

export function renderFood() {
  const root = el('div', { class: 'view-section stack' });

  // Date selector
  const hdr = el('div', { class: 'row between' });
  hdr.appendChild(el('button', { class: 'btn small ghost', onclick: () => { currentDate = shiftDate(currentDate, -1); rerender(); } }, '‹'));
  const dateLabel = el('div', {}, formatDay(currentDate));
  dateLabel.style.fontWeight = '700';
  hdr.appendChild(dateLabel);
  hdr.appendChild(el('button', {
    class: 'btn small ghost',
    onclick: () => { if (currentDate < todayKey()) { currentDate = shiftDate(currentDate, 1); rerender(); } }
  }, '›'));
  root.appendChild(hdr);

  // Daily summary
  const goals = foodGoals.get();
  const entries = food.byDate(currentDate);
  const tot = sumMacros(entries);

  const summary = el('div', { class: 'card', style: { marginTop: '8px' } });
  const ringWrap = el('div', { class: 'row', style: { gap: '16px', alignItems: 'center' } });
  const pct = Math.min(100, Math.round((tot.kcal / goals.kcal) * 100));
  const ring = el('div', { class: 'kcal-ring', style: { '--p': String(pct), '--c': tot.kcal > goals.kcal ? 'var(--danger)' : 'var(--accent)' } });
  ring.appendChild(el('div', { class: 'val' }, String(Math.round(tot.kcal))));
  ring.appendChild(el('div', { class: 'lbl' }, `/ ${goals.kcal} kcal`));
  ringWrap.appendChild(ring);

  const macros = el('div', { style: { flex: 1 } });
  ['protein','carbs','sugars','fat'].forEach(k => {
    const labels = { protein:'Proteine', carbs:'Carboidrati', sugars:'Zuccheri', fat:'Grassi' };
    const colors = { protein:'#3498db', carbs:'#f39c12', sugars:'#e91e63', fat:'#9c27b0' };
    const v = tot[k] || 0;
    const g = goals[k] || 1;
    const p = Math.min(100, (v / g) * 100);
    const row = el('div', { class: 'macro' });
    row.appendChild(el('div', { class: 'name' }, labels[k]));
    const bar = el('div', { class: 'bar' });
    bar.appendChild(el('div', { class: 'fill' + (v > g ? ' over' : ''), style: { width: p + '%', background: colors[k] } }));
    row.appendChild(bar);
    row.appendChild(el('div', { class: 'val' }, `${Math.round(v)}/${g}g`));
    macros.appendChild(row);
  });
  ringWrap.appendChild(macros);
  summary.appendChild(ringWrap);
  root.appendChild(summary);

  // Add buttons
  const addRow = el('div', { class: 'row', style: { marginTop: '12px' } });
  addRow.appendChild(el('button', { class: 'btn primary full', onclick: () => openScanner(rerender) }, '📷 Scansiona'));
  addRow.appendChild(el('button', { class: 'btn ghost full', onclick: () => openManualAdd(rerender) }, '✏️ Manuale'));
  root.appendChild(addRow);
  root.appendChild(el('button', { class: 'btn ghost full small', style: { marginTop: '8px' }, onclick: () => openBarcodeInput(rerender) }, '⌨️ Inserisci barcode'));

  // Entries by meal
  root.appendChild(el('div', { class: 'section-title' }, 'Pasti'));
  const meals = ['colazione','pranzo','cena','spuntino'];
  meals.forEach(meal => {
    const list = entries.filter(e => (e.meal || 'spuntino') === meal);
    const card = el('div', { class: 'card', style: { marginBottom: '8px' } });
    const sub = sumMacros(list);
    card.appendChild(el('div', { class: 'row between' },
      el('div', { class: 'card-title', style: { textTransform: 'capitalize' } }, meal),
      el('div', { class: 'small muted' }, `${Math.round(sub.kcal)} kcal`)
    ));
    if (!list.length) {
      card.appendChild(el('div', { class: 'small muted', style: { marginTop: '4px' } }, '—'));
    } else {
      list.forEach(e => card.appendChild(renderEntry(e, rerender)));
    }
    root.appendChild(card);
  });

  // Weekly
  root.appendChild(renderWeeklySummary());

  // Goals
  root.appendChild(el('button', { class: 'btn ghost full', style: { marginTop: '8px' }, onclick: () => openGoals(rerender) }, '🎯 Modifica obiettivi'));

  return root;

  function rerender() {
    const view = document.getElementById('view');
    clear(view);
    view.appendChild(renderFood());
  }
}

function formatDay(key) {
  const d = new Date(key + 'T12:00:00');
  if (key === todayKey()) return 'Oggi · ' + d.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'short' });
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'short' });
}
function shiftDate(key, n) {
  const d = new Date(key + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0,10);
}

function macrosFromEntry(e) {
  const f = e.grams / 100;
  const p = e.per100 || {};
  return {
    kcal: (p.kcal || 0) * f,
    protein: (p.protein || 0) * f,
    carbs: (p.carbs || 0) * f,
    sugars: (p.sugars || 0) * f,
    fat: (p.fat || 0) * f,
    fiber: (p.fiber || 0) * f,
    salt: (p.salt || 0) * f
  };
}
function sumMacros(entries) {
  return entries.reduce((a, e) => {
    const m = macrosFromEntry(e);
    Object.keys(m).forEach(k => a[k] = (a[k] || 0) + m[k]);
    return a;
  }, { kcal: 0, protein: 0, carbs: 0, sugars: 0, fat: 0, fiber: 0, salt: 0 });
}

function renderEntry(e, refresh) {
  const m = macrosFromEntry(e);
  const item = el('div', {
    class: 'list-item', style: { marginTop: '6px' },
    onclick: () => openEditEntry(e, refresh)
  });
  const lead = el('div', { class: 'lead' });
  lead.appendChild(el('div', { class: 'title' }, e.name));
  lead.appendChild(el('div', { class: 'sub' },
    `${e.grams}g · ${Math.round(m.kcal)} kcal · P:${Math.round(m.protein)} C:${Math.round(m.carbs)} G:${Math.round(m.fat)}`));
  item.appendChild(lead);
  return item;
}

function renderWeeklySummary() {
  const card = el('div', { class: 'card', style: { marginTop: '12px' } });
  card.appendChild(el('div', { class: 'card-title' }, '📅 Settimana corrente'));
  const start = startOfWeek();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    return { date: d.toISOString().slice(0,10), label: ['L','M','M','G','V','S','D'][i] };
  });
  const goals = foodGoals.get();
  const max = Math.max(goals.kcal, ...days.map(d => sumMacros(food.byDate(d.date)).kcal)) || 1;
  const wrap = el('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', marginTop: '8px' } });
  days.forEach(d => {
    const m = sumMacros(food.byDate(d.date));
    const h = Math.max(2, (m.kcal / max) * 100);
    const col = el('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' } });
    const spacer = el('div', { style: { flex: 1 } });
    col.appendChild(spacer);
    const bar = el('div', { style: {
      width: '100%', height: h + '%',
      background: m.kcal > goals.kcal ? 'var(--danger)' : 'var(--accent)',
      borderRadius: '4px 4px 0 0',
      opacity: d.date === todayKey() ? '1' : '.7'
    }, title: `${Math.round(m.kcal)} kcal` });
    col.appendChild(bar);
    col.appendChild(el('div', { class: 'tiny faint' }, d.label));
    wrap.appendChild(col);
  });
  card.appendChild(wrap);

  // tot settimanale
  let totKcal = 0, totP = 0, totC = 0, totF = 0;
  days.forEach(d => { const m = sumMacros(food.byDate(d.date)); totKcal += m.kcal; totP += m.protein; totC += m.carbs; totF += m.fat; });
  card.appendChild(el('div', { class: 'small muted', style: { marginTop: '8px' } },
    `Totale settimana: ${Math.round(totKcal)} kcal · P:${Math.round(totP)} C:${Math.round(totC)} G:${Math.round(totF)}`));
  return card;
}

// ===== Scanner (BarcodeDetector) =====
async function openScanner(refresh) {
  if (!('BarcodeDetector' in window)) {
    toast('Scanner non supportato in questo browser. Usa "Inserisci barcode".', 'error');
    return;
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  } catch (e) {
    toast('Permesso fotocamera negato', 'error');
    return;
  }
  const ov = el('div', { id: 'scanner-view' });
  const video = el('video', { autoplay: true, playsinline: true, muted: true });
  ov.appendChild(video);
  ov.appendChild(el('div', { class: 'scan-frame' }));
  const actions = el('div', { class: 'scan-actions' });
  actions.appendChild(el('button', { class: 'btn ghost full', onclick: () => close() }, 'Annulla'));
  ov.appendChild(actions);
  document.body.appendChild(ov);
  video.srcObject = stream;
  const detector = new BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128','code_39'] });
  let stopped = false;
  function close() {
    stopped = true;
    stream.getTracks().forEach(t => t.stop());
    ov.remove();
  }
  async function loop() {
    if (stopped) return;
    try {
      const codes = await detector.detect(video);
      if (codes.length) {
        const code = codes[0].rawValue;
        close();
        lookupBarcode(code, refresh);
        return;
      }
    } catch {}
    requestAnimationFrame(loop);
  }
  video.onloadedmetadata = () => loop();
}

function openBarcodeInput(refresh) {
  const body = el('div', { class: 'stack' });
  body.appendChild(el('div', { class: 'label' }, 'Codice a barre'));
  const inp = el('input', { class: 'input', type: 'tel', inputmode: 'numeric', placeholder: 'es. 8001505005707' });
  body.appendChild(inp);
  modal({
    title: 'Cerca per barcode', body,
    actions: [
      { label: 'Annulla', class: 'ghost' },
      { label: 'Cerca', class: 'primary', onClick: () => {
        const c = inp.value.trim();
        if (c) lookupBarcode(c, refresh);
      }}
    ]
  });
}

async function lookupBarcode(code, refresh) {
  // cache
  const cached = foodCache.get(code);
  if (cached) {
    openAddFromProduct(cached, code, refresh);
    return;
  }
  toast('Cerco prodotto...');
  try {
    if (!navigator.onLine) {
      toast('Offline: il prodotto non è in cache. Aggiungi manualmente.', 'error');
      openManualAdd(refresh, { barcode: code });
      return;
    }
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
    const j = await res.json();
    if (j.status !== 1 || !j.product) {
      toast('Prodotto non trovato', 'error');
      openManualAdd(refresh, { barcode: code });
      return;
    }
    const p = j.product;
    const n = p.nutriments || {};
    const data = {
      name: p.product_name || p.product_name_it || 'Prodotto',
      brand: p.brands || '',
      per100: {
        kcal: round(n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g']/4.184 : 0)),
        protein: round(n['proteins_100g']),
        carbs: round(n['carbohydrates_100g']),
        sugars: round(n['sugars_100g']),
        fat: round(n['fat_100g']),
        fiber: round(n['fiber_100g']),
        salt: round(n['salt_100g'])
      },
      serving: p.serving_quantity ? +p.serving_quantity : null
    };
    foodCache.set(code, data);
    openAddFromProduct(data, code, refresh);
  } catch (e) {
    toast('Errore rete', 'error');
    openManualAdd(refresh, { barcode: code });
  }
}
function round(v) { return v == null ? 0 : Math.round(v * 10) / 10; }

function openAddFromProduct(data, barcode, refresh) {
  const body = el('div', { class: 'stack' });
  body.appendChild(el('div', { class: 'card-title' }, data.name));
  if (data.brand) body.appendChild(el('div', { class: 'card-sub' }, data.brand));
  body.appendChild(el('div', { class: 'small muted', style: { marginTop: '6px' } },
    `Per 100g: ${Math.round(data.per100.kcal)} kcal · P:${data.per100.protein} C:${data.per100.carbs} Z:${data.per100.sugars} G:${data.per100.fat}`));
  body.appendChild(el('div', { class: 'label', style: { marginTop: '12px' } }, 'Grammi consumati'));
  const grams = el('input', { class: 'input numeric center', type: 'number', inputmode: 'decimal', value: String(data.serving || 100), min: '1' });
  body.appendChild(grams);
  body.appendChild(el('div', { class: 'label', style: { marginTop: '12px' } }, 'Pasto'));
  const meal = el('select', { class: 'select' });
  ['colazione','pranzo','cena','spuntino'].forEach(m => meal.appendChild(el('option', { value: m }, m[0].toUpperCase() + m.slice(1))));
  meal.value = guessMeal();
  body.appendChild(meal);

  modal({
    title: 'Aggiungi al diario', body,
    actions: [
      { label: 'Annulla', class: 'ghost' },
      { label: 'Salva', class: 'primary', onClick: () => {
        food.add({
          id: uid(), date: currentDate, ts: Date.now(),
          name: data.name, brand: data.brand, barcode,
          grams: Math.max(1, +grams.value || 100),
          per100: data.per100,
          meal: meal.value
        });
        toast('Aggiunto', 'success');
        refresh();
      }}
    ]
  });
}

function openManualAdd(refresh, prefill = {}) {
  const body = el('div', { class: 'stack' });
  body.appendChild(el('div', { class: 'label' }, 'Nome alimento'));
  const nm = el('input', { class: 'input', value: prefill.name || '' });
  body.appendChild(nm);
  body.appendChild(el('div', { class: 'label', style: { marginTop: '8px' } }, 'Grammi'));
  const g = el('input', { class: 'input numeric center', type: 'number', value: prefill.grams || '100' });
  body.appendChild(g);
  body.appendChild(el('div', { class: 'label', style: { marginTop: '8px' } }, 'Per 100g'));
  const row = el('div', { class: 'row wrap' });
  const fields = {
    kcal: el('input', { class: 'input', type: 'number', placeholder: 'kcal' }),
    protein: el('input', { class: 'input', type: 'number', placeholder: 'P (g)' }),
    carbs: el('input', { class: 'input', type: 'number', placeholder: 'C (g)' }),
    sugars: el('input', { class: 'input', type: 'number', placeholder: 'Z (g)' }),
    fat: el('input', { class: 'input', type: 'number', placeholder: 'G (g)' })
  };
  Object.entries(fields).forEach(([k, inp]) => {
    inp.style.flex = '1 1 30%';
    row.appendChild(inp);
  });
  body.appendChild(row);
  body.appendChild(el('div', { class: 'label', style: { marginTop: '8px' } }, 'Pasto'));
  const meal = el('select', { class: 'select' });
  ['colazione','pranzo','cena','spuntino'].forEach(m => meal.appendChild(el('option', { value: m }, m[0].toUpperCase() + m.slice(1))));
  meal.value = guessMeal();
  body.appendChild(meal);
  modal({
    title: 'Nuovo alimento', body,
    actions: [
      { label: 'Annulla', class: 'ghost' },
      { label: 'Salva', class: 'primary', onClick: () => {
        if (!nm.value.trim()) return false;
        food.add({
          id: uid(), date: currentDate, ts: Date.now(),
          name: nm.value.trim(),
          barcode: prefill.barcode || null,
          grams: +g.value || 100,
          per100: {
            kcal: +fields.kcal.value || 0,
            protein: +fields.protein.value || 0,
            carbs: +fields.carbs.value || 0,
            sugars: +fields.sugars.value || 0,
            fat: +fields.fat.value || 0
          },
          meal: meal.value
        });
        toast('Aggiunto', 'success');
        refresh();
      }}
    ]
  });
}

function openEditEntry(entry, refresh) {
  const body = el('div', { class: 'stack' });
  body.appendChild(el('div', { class: 'card-title' }, entry.name));
  if (entry.brand) body.appendChild(el('div', { class: 'card-sub' }, entry.brand));
  body.appendChild(el('div', { class: 'label', style: { marginTop: '12px' } }, 'Grammi'));
  const g = el('input', { class: 'input numeric center', type: 'number', value: String(entry.grams) });
  body.appendChild(g);
  body.appendChild(el('div', { class: 'label', style: { marginTop: '8px' } }, 'Pasto'));
  const meal = el('select', { class: 'select' });
  ['colazione','pranzo','cena','spuntino'].forEach(m => meal.appendChild(el('option', { value: m }, m[0].toUpperCase() + m.slice(1))));
  meal.value = entry.meal || 'spuntino';
  body.appendChild(meal);
  modal({
    title: 'Modifica', body,
    actions: [
      { label: 'Elimina', class: 'danger', onClick: async () => {
        if (await confirm({ title: 'Eliminare?', message: entry.name, danger: true })) { food.delete(entry.id); refresh(); }
      }},
      { label: 'Salva', class: 'primary', onClick: () => {
        food.update(entry.id, { grams: +g.value || entry.grams, meal: meal.value });
        refresh();
      }}
    ]
  });
}

function openGoals(refresh) {
  const goals = foodGoals.get();
  const body = el('div', { class: 'stack' });
  const fields = {};
  [
    ['kcal', 'Calorie giornaliere'],
    ['protein', 'Proteine (g)'],
    ['carbs', 'Carboidrati (g)'],
    ['sugars', 'Zuccheri (g)'],
    ['fat', 'Grassi (g)']
  ].forEach(([k, lbl]) => {
    body.appendChild(el('div', { class: 'label' }, lbl));
    fields[k] = el('input', { class: 'input', type: 'number', value: String(goals[k]) });
    body.appendChild(fields[k]);
  });
  modal({
    title: 'Obiettivi nutrizionali', body,
    actions: [
      { label: 'Annulla', class: 'ghost' },
      { label: 'Salva', class: 'primary', onClick: () => {
        const patch = {};
        Object.entries(fields).forEach(([k, i]) => patch[k] = +i.value || goals[k]);
        foodGoals.set(patch);
        refresh();
      }}
    ]
  });
}

function guessMeal() {
  const h = new Date().getHours();
  if (h < 11) return 'colazione';
  if (h < 15) return 'pranzo';
  if (h < 18) return 'spuntino';
  if (h < 22) return 'cena';
  return 'spuntino';
}
