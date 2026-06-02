import { el, clear, beep, beepSequence, vibrate, toast, modal, confirm,
  requestWakeLock, releaseWakeLock, fmtMMSS, fmtDuration, fmtDate } from '../utils.js';
import { getProgram, getDay } from '../data/exercises.js';
import { activeWorkout, workouts, settings, progress, uid } from '../storage.js';

let state = null;       // workout corrente
let restTimer = null;   // intervallo countdown recupero
let workTimer = null;   // intervallo countdown lavoro (timed)
let elapsedTimer = null; // intervallo aggiornamento timer trascorso

// ===== Creazione/ripresa workout =====
function buildWorkout(programId, weekNum, dayNum) {
  const p = getProgram(programId);
  const day = getDay(programId, weekNum, dayNum);
  if (!p || !day) return null;
  return {
    id: uid(),
    programId, programName: p.name,
    week: weekNum, day: dayNum,
    dayTitle: day.title,
    startedAt: Date.now(),
    exercises: day.exercises.map(ex => buildExerciseState(ex)),
    note: '',
    durationSec: 0
  };
}

function buildExerciseState(ex) {
  const superset = ex.superset || null;
  const setsCount = ex.sets || 1;
  return {
    name: ex.name,
    ref: ex.name,
    notes: ex.notes || '',
    pattern: ex.pattern || null,
    morning: !!ex.morning,
    superset, // null oppure [{name, timed?}, ...]
    timed: ex.timed || 0,
    rest: ex.rest || 0,
    reps: ex.reps,
    sets: Array.from({ length: setsCount }, () => makeSetState(superset)),
    skipped: false
  };
}

function makeSetState(superset) {
  const base = { weight: '', reps: '', rpe: null, done: false, note: '' };
  if (superset) {
    base.subs = superset.map(() => ({ done: false, reps: '', weight: '' }));
  }
  return base;
}

// Garantisce che un set di superset abbia l'array `subs` (per workout salvati prima dell'update)
function ensureSubs(ex) {
  if (!ex.superset) return;
  ex.sets.forEach(s => {
    if (!Array.isArray(s.subs) || s.subs.length !== ex.superset.length) {
      s.subs = ex.superset.map(() => ({ done: false, reps: '', weight: '' }));
      if (s.done) s.subs.forEach(x => x.done = true);
    }
  });
}

// ===== Renderer principale =====
export function renderWorkout(programId, weekNum, dayNum) {
  // Risoluzione stato
  if (programId === '__resume__') {
    state = activeWorkout.get();
    if (!state) { location.hash = '#/home'; return el('div'); }
  } else {
    const existing = activeWorkout.get();
    if (existing && existing.programId === programId && existing.week === weekNum && existing.day === dayNum) {
      state = existing;
    } else {
      if (existing) {
        // chiediamo dopo, intanto creiamo nuovo
        if (!confirmReplace(existing, () => startNew(programId, weekNum, dayNum))) {
          // crea comunque
          state = buildWorkout(programId, weekNum, dayNum);
          activeWorkout.set(state);
        }
      } else {
        state = buildWorkout(programId, weekNum, dayNum);
        activeWorkout.set(state);
      }
    }
  }

  if (!state) return el('div', { class: 'empty' }, 'Errore caricamento workout');

  requestWakeLock();
  startElapsedTimer();
  const root = el('div', { class: 'view-section' });
  render(root);
  return root;
}

function startElapsedTimer() {
  stopElapsedTimer();
  elapsedTimer = setInterval(() => {
    if (!state) { stopElapsedTimer(); return; }
    const sec = Math.round((Date.now() - state.startedAt) / 1000);
    document.querySelectorAll('.work-elapsed').forEach(n => n.textContent = fmtMMSS(sec));
  }, 1000);
}
function stopElapsedTimer() {
  if (elapsedTimer) clearInterval(elapsedTimer);
  elapsedTimer = null;
}

function confirmReplace(existing, onYes) {
  // non blocchiamo, mostriamo solo toast
  // (per ora: nuovo workout sovrascrive sempre — l'utente vede card "in corso" in home)
  return false;
}
function startNew(programId, weekNum, dayNum) {
  state = buildWorkout(programId, weekNum, dayNum);
  activeWorkout.set(state);
}

function save() { state.durationSec = Math.round((Date.now() - state.startedAt) / 1000); activeWorkout.set(state); }

function render(root) {
  clear(root);
  // Header workout con timer live
  const head = el('div', { class: 'card', style: { marginBottom: '12px' } });
  head.appendChild(el('div', { class: 'row between' },
    el('div', {},
      el('div', { class: 'card-title' }, state.dayTitle),
      el('div', { class: 'card-sub' }, `${state.programName} · Sett. ${state.week}`)
    ),
    el('button', { class: 'btn small ghost', onclick: () => openIndex(root) }, '☰ Indice')
  ));
  // Timer live grande
  const elapsedSec = Math.round((Date.now() - state.startedAt) / 1000);
  const timerRow = el('div', { class: 'row between', style: { marginTop: '10px', alignItems: 'baseline' } });
  timerRow.appendChild(el('div', { class: 'tiny upper muted' }, 'Tempo allenamento'));
  timerRow.appendChild(el('div', { class: 'work-elapsed mono', style: { fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' } }, fmtMMSS(elapsedSec)));
  head.appendChild(timerRow);
  // progress
  const total = state.exercises.length;
  const doneEx = state.exercises.filter(e => e.skipped || e.sets.every(s => s.done)).length;
  const bar = el('div', { class: 'progress', style: { marginTop: '10px' } });
  bar.appendChild(el('div', { class: 'fill', style: { width: `${(doneEx/total)*100}%` } }));
  head.appendChild(bar);
  head.appendChild(el('div', { class: 'small muted', style: { marginTop: '4px' } },
    `${doneEx}/${total} esercizi`));
  root.appendChild(head);

  // Esercizi
  state.exercises.forEach((ex, i) => {
    ensureSubs(ex);
    root.appendChild(renderExercise(ex, i, root));
  });

  // Aggiungi esercizio custom
  root.appendChild(el('button', {
    class: 'btn ghost full', style: { marginTop: '8px' },
    onclick: () => addCustomExercise(root)
  }, '+ Aggiungi esercizio'));

  // Note workout
  const noteCard = el('div', { class: 'card', style: { marginTop: '16px' } });
  noteCard.appendChild(el('div', { class: 'label' }, 'Note allenamento'));
  const ta = el('textarea', { class: 'textarea', placeholder: 'Sensazioni, forma, infortuni...' });
  ta.value = state.note || '';
  ta.oninput = () => { state.note = ta.value; save(); };
  noteCard.appendChild(ta);
  root.appendChild(noteCard);

  // Azioni finali
  const actions = el('div', { class: 'stack', style: { marginTop: '16px' } });
  actions.appendChild(el('button', {
    class: 'btn primary full big', onclick: () => finishWorkout()
  }, '✓ Termina e salva'));
  actions.appendChild(el('button', {
    class: 'btn ghost full', onclick: async () => {
      if (await confirm({ title: 'Annulla workout', message: 'Tutti i dati di questo allenamento verranno persi. Continuare?', confirmLabel: 'Annulla', danger: true })) {
        cancelWorkout();
      }
    }
  }, '🗑 Annulla workout'));
  root.appendChild(actions);
}

// ===== Render singolo esercizio =====
function renderExercise(ex, idx, root) {
  const allDone = ex.sets.every(s => s.done);
  const card = el('div', { class: 'ex-card' + (allDone || ex.skipped ? ' done' : '') });
  card.draggable = true;
  card.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', String(idx)); card.classList.add('dragging'); });
  card.addEventListener('dragend', () => card.classList.remove('dragging'));
  card.addEventListener('dragover', (e) => { e.preventDefault(); card.classList.add('drag-over'); });
  card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
  card.addEventListener('drop', (e) => {
    e.preventDefault(); card.classList.remove('drag-over');
    const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (Number.isFinite(from) && from !== idx) {
      const [m] = state.exercises.splice(from, 1);
      state.exercises.splice(idx, 0, m);
      save(); render(root);
    }
  });

  // Head
  const head = el('div', { class: 'ex-head' });
  head.appendChild(el('span', { class: 'drag-handle' }, '⋮⋮'));
  const nameWrap = el('div', { class: 'ex-name' });
  const nameRow = el('div', { class: 'row', style: { gap: '6px', alignItems: 'center' } });
  nameRow.appendChild(el('div', { style: { flex: '1', minWidth: '0' } }, `${idx+1}. ${ex.name}`));
  nameRow.appendChild(el('button', {
    class: 'icon-btn small',
    style: { width: '28px', height: '28px', flex: '0 0 auto' },
    title: 'Rinomina esercizio',
    'aria-label': 'Rinomina esercizio',
    onclick: (e) => { e.stopPropagation(); renameExercise(ex, root); }
  }, '✏️'));
  nameWrap.appendChild(nameRow);
  const meta = el('div', { class: 'ex-meta' });
  meta.appendChild(document.createTextNode(`${ex.sets.length} × ${ex.reps}`));
  if (ex.rest) meta.appendChild(document.createTextNode(` · 🕐 ${ex.rest}s`));
  if (ex.morning) { meta.appendChild(el('span', { class: 'chip warning', style: { marginLeft: '6px' } }, '🌅')); }
  nameWrap.appendChild(meta);
  head.appendChild(nameWrap);
  head.appendChild(el('button', {
    class: 'icon-btn', style: { width: '36px', height: '36px' },
    onclick: () => openExerciseMenu(ex, idx, root)
  }, '⋯'));
  card.appendChild(head);

  // Body
  const body = el('div', { class: 'ex-body' });
  if (ex.pattern) {
    const pat = el('div', { style: { marginBottom: '6px' } });
    ex.pattern.forEach(t => pat.appendChild(el('span', { class: `pattern-tag ${t}` }, t)));
    body.appendChild(pat);
  }
  if (ex.notes) body.appendChild(el('div', { class: 'ex-notes' }, ex.notes));
  if (ex.superset) {
    body.appendChild(el('div', { class: 'small muted', style: { marginBottom: '6px' } },
      '🔁 Superset: ' + ex.superset.map(s => s.name + (s.timed ? ` (${s.timed}s)` : '')).join(' → ')));
  }

  // Ultima volta
  const last = workouts.lastForExercise(ex.ref || ex.name);
  if (last && settings.get().showLast) {
    const summary = last.sets.map(s => {
      const w = s.weight ? `${s.weight}kg` : '';
      const r = s.reps || '-';
      return [w, r].filter(Boolean).join(' × ');
    }).join(' · ');
    body.appendChild(el('div', { class: 'ex-last' }, `📅 ${fmtDate(last.date)}: ${summary}`));
  }

  // Skipped
  if (ex.skipped) {
    body.appendChild(el('div', { class: 'chip warning' }, 'Saltato'));
    card.appendChild(body);
    return card;
  }

  // Superset: rendering speciale
  if (ex.superset) {
    ex.sets.forEach((s, si) => body.appendChild(renderSupersetSetRow(ex, si, root, idx)));
    body.appendChild(el('button', {
      class: 'btn small ghost', style: { marginTop: '8px' },
      onclick: () => { ex.sets.push(makeSetState(ex.superset)); save(); render(root); }
    }, '+ Round'));
    card.appendChild(body);
    return card;
  }

  // Header colonne
  const colHead = el('div', { class: 'set-row' + (ex.timed ? ' timed' : ''), style: { borderTop: 'none', fontSize: '.7rem', color: 'var(--text-faint)', textTransform: 'uppercase' } });
  colHead.append(
    el('div', {}, '#'),
    el('div', { class: 'center' }, 'kg'),
    el('div', { class: 'center' }, ex.timed ? 'sec' : 'reps'),
    ex.timed ? el('div', { class: 'center' }, '⏱') : null,
    el('div', { class: 'center' }, 'RPE'),
    el('div', { class: 'center' }, '✓')
  );
  body.appendChild(colHead);

  // Set rows
  ex.sets.forEach((s, si) => body.appendChild(renderSetRow(ex, si, root, idx)));

  // Aggiungi serie
  body.appendChild(el('button', {
    class: 'btn small ghost', style: { marginTop: '8px' },
    onclick: () => { ex.sets.push(makeSetState(null)); save(); render(root); }
  }, '+ Serie'));

  card.appendChild(body);
  return card;
}

// ===== Render set row per superset =====
function renderSupersetSetRow(ex, si, root, exIdx) {
  const s = ex.sets[si];
  const wrap = el('div', { class: 'superset-row' + (s.done ? ' done' : '') });

  const head = el('div', { class: 'row between', style: { marginBottom: '6px' } });
  head.appendChild(el('div', { class: 'set-num' }, String(si + 1)));
  const ck = el('button', { class: 'check' + (s.done ? ' done' : ''), onclick: () => toggleSet(ex, si, root, exIdx) }, s.done ? '✓' : '');
  const allBtn = el('button', { class: 'btn small ' + (s.done ? 'ghost' : 'primary'),
    onclick: () => runSupersetRound(ex, si, root)
  }, s.done ? 'Rifai round' : '▶ Avvia round');
  const right = el('div', { class: 'row', style: { gap: '6px' } }, allBtn, ck);
  head.appendChild(right);
  wrap.appendChild(head);

  // Steps sub-esercizi
  const steps = el('div', { class: 'ss-steps' });
  ex.superset.forEach((sub, ki) => {
    const subState = s.subs[ki];
    const step = el('div', { class: 'ss-step' + (subState.done ? ' done' : '') });
    const top = el('div', { class: 'row between' });
    top.appendChild(el('div', { class: 'ss-step-name' }, `${ki+1}. ${sub.name}`));
    if (sub.timed) top.appendChild(el('div', { class: 'tiny muted mono' }, `${sub.timed}s`));
    step.appendChild(top);

    const ctrl = el('div', { class: 'row', style: { gap: '6px', marginTop: '6px' } });
    if (sub.timed) {
      ctrl.appendChild(el('button', { class: 'btn small ' + (subState.done ? 'ghost' : 'primary'),
        onclick: () => startWorkTimer(sub.timed, sub.name, () => {
          subState.done = true;
          subState.reps = String(sub.timed);
          checkSetCompletion(ex, si);
          save(); render(root);
        })
      }, subState.done ? '↻' : '▶ Start'));
    } else {
      const ri = el('input', { class: 'input', type: 'number', inputmode: 'numeric', placeholder: 'reps', style: { flex: 1, minWidth: '60px' } });
      ri.value = subState.reps || '';
      ri.onchange = () => { subState.reps = ri.value; save(); };
      ctrl.appendChild(ri);
    }
    ctrl.appendChild(el('button', { class: 'check small' + (subState.done ? ' done' : ''),
      onclick: () => {
        subState.done = !subState.done;
        if (subState.done && sub.timed && !subState.reps) subState.reps = String(sub.timed);
        checkSetCompletion(ex, si);
        if (settings.get().sound) beep(880, 0.1);
        save(); render(root);
      }
    }, subState.done ? '✓' : ''));
    step.appendChild(ctrl);
    steps.appendChild(step);
  });
  wrap.appendChild(steps);
  return wrap;
}

function checkSetCompletion(ex, si) {
  const s = ex.sets[si];
  if (s.subs && s.subs.every(x => x.done)) {
    if (!s.done) {
      s.done = true;
      // somma reps come stringa indicativa
      s.reps = s.subs.map(x => x.reps || '?').join('/');
      if (settings.get().autoStartRest && ex.rest > 0) startRest(ex.rest, () => {});
    }
  } else if (s.done) {
    s.done = false;
  }
}

// Esegui in sequenza i timer del round
async function runSupersetRound(ex, si, root) {
  const s = ex.sets[si];
  for (let ki = 0; ki < ex.superset.length; ki++) {
    const sub = ex.superset[ki];
    const subState = s.subs[ki];
    if (subState.done && !sub.timed) continue;
    if (sub.timed) {
      await new Promise(res => startWorkTimer(sub.timed, sub.name, () => {
        subState.done = true;
        subState.reps = String(sub.timed);
        save(); render(root);
        res();
      }));
    } else {
      // attendi conferma manuale: mostra modal
      const ok = await new Promise(res => {
        const body = el('div', { class: 'stack' },
          el('p', {}, `Esegui: ${sub.name}`),
          el('div', { class: 'label' }, 'Reps fatte'),
          (() => { var inp = el('input', { class: 'input', type: 'number', value: subState.reps || '' });
            body._inp = inp; return inp; })()
        );
        modal({
          title: `Step ${ki+1}/${ex.superset.length}`, body,
          actions: [
            { label: 'Salta', class: 'ghost', onClick: () => res(false) },
            { label: 'Fatto', class: 'primary', onClick: () => { subState.reps = body._inp.value; subState.done = true; res(true); } }
          ],
          onClose: () => res(false)
        });
      });
      if (!ok) break;
    }
  }
  checkSetCompletion(ex, si);
  save(); render(root);
}

function renderSetRow(ex, si, root, exIdx) {
  const s = ex.sets[si];
  const row = el('div', { class: 'set-row' + (ex.timed ? ' timed' : '') + (s.done ? ' done' : '') });

  // Numero serie + tag pattern
  const num = el('div', { class: 'set-num' }, String(si + 1));
  if (ex.pattern && ex.pattern[si]) {
    num.title = ex.pattern[si];
    num.textContent = ex.pattern[si];
    num.style.fontSize = '.65rem';
  }
  row.appendChild(num);

  // Peso
  const wi = el('input', { class: 'input', type: 'number', inputmode: 'decimal', placeholder: '0', step: '0.5' });
  wi.value = s.weight;
  wi.onchange = () => { s.weight = wi.value; save(); };
  row.appendChild(wi);

  // Reps / sec
  const ri = el('input', { class: 'input', type: 'number', inputmode: 'numeric', placeholder: ex.timed ? String(ex.timed) : '0' });
  ri.value = s.reps;
  ri.onchange = () => { s.reps = ri.value; save(); };
  row.appendChild(ri);

  // Timer ▶ (solo per esercizi a tempo)
  if (ex.timed) {
    const t = el('button', { class: 'btn-play' + (s.done ? ' done' : ''),
      title: `Avvia ${ex.timed}s`,
      onclick: () => startWorkTimer(ex.timed, ex.name, () => {
        if (!s.reps) s.reps = String(ex.timed);
        if (!s.done) toggleSet(ex, si, root, exIdx);
      })
    }, '▶');
    row.appendChild(t);
  }

  // RPE
  const rpe = el('button', { class: 'rpe-btn' + (s.rpe ? ' has-value' : ''), onclick: () => pickRPE(s, () => render(root)) },
    s.rpe ? String(s.rpe) : '–');
  row.appendChild(rpe);

  // Check
  const ck = el('button', { class: 'check', onclick: () => toggleSet(ex, si, root, exIdx) }, s.done ? '✓' : '');
  row.appendChild(ck);

  return row;
}

function pickRPE(set, refresh) {
  const body = el('div', { class: 'stack' });
  body.appendChild(el('p', { class: 'small muted' }, 'RPE = Rate of Perceived Exertion (sforzo percepito). 10 = cedimento totale.'));
  const grid = el('div', { class: 'grid grid-2' });
  [6,7,7.5,8,8.5,9,9.5,10].forEach(v => {
    const b = el('button', { class: 'btn ' + (set.rpe === v ? 'primary' : 'ghost'), onclick: () => { set.rpe = v; m.close(); refresh(); }}, String(v));
    grid.appendChild(b);
  });
  body.appendChild(grid);
  const noteLbl = el('div', { class: 'label', style: { marginTop: '8px' } }, 'Nota serie');
  body.appendChild(noteLbl);
  const ta = el('textarea', { class: 'textarea', placeholder: 'Es. forma scarsa, ho ceduto a 6...' });
  ta.value = set.note || '';
  ta.oninput = () => { set.note = ta.value; };
  body.appendChild(ta);
  const m = modal({
    title: 'RPE & Nota', body,
    actions: [
      { label: 'Rimuovi RPE', class: 'ghost', onClick: () => { set.rpe = null; refresh(); } },
      { label: 'OK', class: 'primary' }
    ],
    onClose: refresh
  });
}

function toggleSet(ex, si, root, exIdx) {
  const s = ex.sets[si];
  s.done = !s.done;
  save();

  if (s.done) {
    if (settings.get().sound) beep(880, 0.12);
    if (settings.get().vibration) vibrate(40);
    // Avvia recupero
    if (settings.get().autoStartRest && ex.rest > 0) startRest(ex.rest, () => render(root));
    // Se exercise timed, propongo timer di lavoro per prossima serie
  }
  render(root);
}

// ===== Rest timer overlay =====
let restRemaining = 0;
let restCallback = null;
function startRest(seconds, onDone) {
  stopRest();
  restRemaining = seconds;
  restCallback = onDone;
  showRestOverlay();
  restTimer = setInterval(() => {
    restRemaining--;
    updateRestOverlay();
    if (restRemaining <= 3 && restRemaining > 0 && settings.get().sound) beep(660, 0.08);
    if (restRemaining <= 0) {
      stopRest(true);
    }
  }, 1000);
}
function stopRest(natural = false) {
  if (restTimer) clearInterval(restTimer); restTimer = null;
  const ov = document.getElementById('rest-overlay');
  if (ov) ov.remove();
  if (natural) {
    if (settings.get().sound) beepSequence([[880,0.15],[1100,0.15,0.05],[1320,0.25,0.05]]);
    if (settings.get().vibration) vibrate([100,40,100,40,200]);
  }
  if (restCallback) { restCallback(); restCallback = null; }
}
function showRestOverlay() {
  let ov = document.getElementById('rest-overlay');
  if (!ov) {
    ov = el('div', { id: 'rest-overlay' });
    ov.innerHTML = `
      <div class="label">Recupero</div>
      <div class="clock"></div>
      <div class="actions">
        <button class="btn ghost" data-act="-15">−15s</button>
        <button class="btn ghost" data-act="+15">+15s</button>
        <button class="btn primary" data-act="skip">Salta</button>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', e => {
      const act = e.target.dataset?.act;
      if (act === '-15') { restRemaining = Math.max(1, restRemaining - 15); updateRestOverlay(); }
      else if (act === '+15') { restRemaining += 15; updateRestOverlay(); }
      else if (act === 'skip') { stopRest(); }
    });
  }
  updateRestOverlay();
}
function updateRestOverlay() {
  const ov = document.getElementById('rest-overlay');
  if (!ov) return;
  const clk = ov.querySelector('.clock');
  clk.textContent = fmtMMSS(restRemaining);
  clk.classList.toggle('warning', restRemaining <= 5 && restRemaining > 0);
  clk.classList.toggle('done', restRemaining <= 0);
}

// ===== Menu esercizio =====
function openExerciseMenu(ex, idx, root) {
  const body = el('div', { class: 'stack' });
  const next = state.exercises[idx + 1];
  const canGroup = !ex.superset && next && !next.superset;
  const opts = [
    { label: ex.skipped ? '↺ Reinserisci' : '⏭ Salta esercizio', class: 'ghost', onClick: () => { ex.skipped = !ex.skipped; save(); render(root); } },
    { label: '✏️ Sostituisci con...', class: 'ghost', onClick: () => { renameExercise(ex, root); return false; } },
    { label: '⏱ Timer manuale (sec)', class: 'ghost', onClick: () => { startWorkTimer(ex.timed || 30, ex.name); return true; } }
  ];
  if (canGroup) opts.push({
    label: `🔁 Raggruppa con «${next.name}» (superset)`, class: 'ghost',
    onClick: () => { groupAsSuperset(idx, root); }
  });
  if (ex.superset) opts.push({
    label: '🔓 Sciogli superset', class: 'ghost',
    onClick: () => { unmakeSuperset(idx, root); }
  });
  if (ex.superset) opts.push({
    label: '✏️ Modifica sub-esercizi', class: 'ghost',
    onClick: () => { editSuperset(ex, root); return false; }
  });
  opts.push(
    { label: '⬆ Sposta su', class: 'ghost', onClick: () => { if (idx > 0) { [state.exercises[idx-1], state.exercises[idx]] = [state.exercises[idx], state.exercises[idx-1]]; save(); render(root); } } },
    { label: '⬇ Sposta giù', class: 'ghost', onClick: () => { if (idx < state.exercises.length - 1) { [state.exercises[idx+1], state.exercises[idx]] = [state.exercises[idx], state.exercises[idx+1]]; save(); render(root); } } },
    { label: '🗑 Rimuovi', class: 'danger', onClick: async () => {
      if (await confirm({ title: 'Rimuovere?', message: `Rimuovere "${ex.name}" da questo workout?`, danger: true })) {
        state.exercises.splice(idx, 1); save(); render(root);
      }
    }}
  );
  opts.forEach(o => body.appendChild(el('button', { class: 'btn ' + o.class + ' full', onclick: () => { const r = o.onClick(); if (r !== false) m.close(); }}, o.label)));
  const m = modal({ title: ex.name, body });
}

function groupAsSuperset(idx, root) {
  const a = state.exercises[idx];
  const b = state.exercises[idx + 1];
  if (!a || !b) return;
  const merged = {
    name: `${a.name} + ${b.name}`,
    ref: a.name,
    notes: [a.notes, b.notes].filter(Boolean).join(' | '),
    pattern: null,
    morning: a.morning || b.morning,
    superset: [
      { name: a.name, timed: a.timed || 0 },
      { name: b.name, timed: b.timed || 0 }
    ],
    timed: 0,
    rest: Math.max(a.rest || 0, b.rest || 0),
    reps: `${a.reps} + ${b.reps}`,
    sets: Array.from({ length: Math.max(a.sets.length, b.sets.length) }, () => makeSetState([1,2])),
    skipped: false
  };
  ensureSubs(merged);
  state.exercises.splice(idx, 2, merged);
  save(); render(root);
}

function unmakeSuperset(idx, root) {
  const ex = state.exercises[idx];
  if (!ex.superset) return;
  const children = ex.superset.map(sub => ({
    name: sub.name, ref: sub.name, notes: '', pattern: null, morning: ex.morning,
    superset: null, timed: sub.timed || 0, rest: ex.rest, reps: sub.timed ? `${sub.timed}s` : ex.reps,
    sets: Array.from({ length: ex.sets.length }, () => makeSetState(null)),
    skipped: false
  }));
  state.exercises.splice(idx, 1, ...children);
  save(); render(root);
}

function editSuperset(ex, root) {
  const body = el('div', { class: 'stack' });
  body.appendChild(el('div', { class: 'small muted' }, 'Aggiungi, rimuovi o riordina i sub-esercizi del superset.'));
  const list = el('div', { class: 'stack' });
  body.appendChild(list);
  function renderList() {
    list.innerHTML = '';
    ex.superset.forEach((sub, ki) => {
      const row = el('div', { class: 'row', style: { gap: '4px' } });
      const nm = el('input', { class: 'input', placeholder: 'Nome', style: { flex: 2 } });
      nm.value = sub.name; nm.oninput = () => { sub.name = nm.value; };
      const tm = el('input', { class: 'input', type: 'number', placeholder: 'sec (0=reps)', style: { flex: 1 } });
      tm.value = sub.timed || ''; tm.oninput = () => { sub.timed = parseInt(tm.value, 10) || 0; };
      const rm = el('button', { class: 'btn small danger', onclick: () => {
        if (ex.superset.length <= 1) { toast('Almeno 1 sub-esercizio', 'error'); return; }
        ex.superset.splice(ki, 1);
        ex.sets.forEach(s => { if (s.subs) s.subs.splice(ki, 1); });
        renderList();
      }}, '✕');
      row.append(nm, tm, rm);
      list.appendChild(row);
    });
  }
  renderList();
  body.appendChild(el('button', { class: 'btn ghost small', onclick: () => {
    ex.superset.push({ name: '', timed: 0 });
    ex.sets.forEach(s => { if (s.subs) s.subs.push({ done: false, reps: '', weight: '' }); });
    renderList();
  }}, '+ Aggiungi sub-esercizio'));
  modal({
    title: 'Modifica superset', body,
    actions: [
      { label: 'Annulla', class: 'ghost' },
      { label: 'Salva', class: 'primary', onClick: () => {
        ex.superset = ex.superset.filter(s => s.name && s.name.trim());
        if (ex.superset.length < 2) { toast('Servono almeno 2 sub-esercizi', 'error'); return false; }
        ensureSubs(ex);
        save(); render(root);
      }}
    ]
  });
}

function renameExercise(ex, root) {
  const body = el('div', { class: 'stack' });
  body.appendChild(el('div', { class: 'label' }, 'Nuovo nome esercizio'));
  const inp = el('input', { class: 'input', value: ex.name });
  body.appendChild(inp);
  body.appendChild(el('div', { class: 'small muted' }, 'Lo storico continuerà a tracciarlo sotto il nome originale.'));
  modal({
    title: 'Sostituisci esercizio', body,
    actions: [
      { label: 'Annulla', class: 'ghost' },
      { label: 'Salva', class: 'primary', onClick: () => { ex.name = inp.value.trim() || ex.name; save(); render(root); } }
    ]
  });
}

function addCustomExercise(root) {
  const body = el('div', { class: 'stack' });

  // Tipo
  const typeRow = el('div', { class: 'row', style: { gap: '4px' } });
  let mode = 'normal'; // 'normal' | 'timed' | 'superset'
  const tBtn = (val, lbl) => {
    const b = el('button', { class: 'btn small ' + (mode === val ? 'primary' : 'ghost') + ' full',
      onclick: () => { mode = val; renderForm(); }
    }, lbl);
    return b;
  };
  body.appendChild(typeRow);

  const formWrap = el('div', { class: 'stack' });
  body.appendChild(formWrap);

  // Comuni
  const setsI = el('input', { class: 'input', type: 'number', value: '3', min: '1' });
  const restI = el('input', { class: 'input', type: 'number', value: '60' });
  const nmI = el('input', { class: 'input', placeholder: 'Es. Panca piana' });
  const repsI = el('input', { class: 'input', placeholder: 'reps', value: '10' });
  const timedI = el('input', { class: 'input', type: 'number', placeholder: 'sec esecuzione', value: '30' });

  // Superset subs
  const subs = [
    { name: '', timed: 30 },
    { name: '', timed: 30 }
  ];
  const subsWrap = el('div', { class: 'stack' });
  function renderSubs() {
    subsWrap.innerHTML = '';
    subsWrap.appendChild(el('div', { class: 'label' }, 'Sub-esercizi del superset'));
    subs.forEach((sub, i) => {
      const r = el('div', { class: 'row', style: { gap: '4px' } });
      const n = el('input', { class: 'input', placeholder: `Esercizio ${i+1}`, style: { flex: 2 } });
      n.value = sub.name; n.oninput = () => { sub.name = n.value; };
      const t = el('input', { class: 'input', type: 'number', placeholder: 'sec (0=reps)', style: { flex: 1 } });
      t.value = sub.timed || ''; t.oninput = () => { sub.timed = parseInt(t.value, 10) || 0; };
      const rm = el('button', { class: 'btn small danger', onclick: () => {
        if (subs.length <= 2) { toast('Min. 2', 'error'); return; }
        subs.splice(i, 1); renderSubs();
      }}, '✕');
      r.append(n, t, rm);
      subsWrap.appendChild(r);
    });
    subsWrap.appendChild(el('button', { class: 'btn small ghost', onclick: () => { subs.push({ name: '', timed: 30 }); renderSubs(); }}, '+ Sub'));
  }

  function renderForm() {
    typeRow.innerHTML = '';
    typeRow.append(tBtn('normal', 'Normale'), tBtn('timed', 'A tempo'), tBtn('superset', 'Superset'));
    formWrap.innerHTML = '';
    if (mode !== 'superset') {
      formWrap.appendChild(el('div', { class: 'label' }, 'Nome'));
      formWrap.appendChild(nmI);
    }
    if (mode === 'superset') renderSubs();
    const metaRow = el('div', { class: 'row' });
    metaRow.append(
      el('div', { style: { flex: 1 } }, el('div', { class: 'label' }, 'Serie'), setsI),
      mode === 'normal' ? el('div', { style: { flex: 1 } }, el('div', { class: 'label' }, 'Reps'), repsI) :
        (mode === 'timed' ? el('div', { style: { flex: 1 } }, el('div', { class: 'label' }, 'Sec'), timedI) : null),
      el('div', { style: { flex: 1 } }, el('div', { class: 'label' }, 'Rec.'), restI)
    );
    formWrap.appendChild(metaRow);
    if (mode === 'superset') formWrap.appendChild(subsWrap);
  }
  renderForm();

  modal({
    title: 'Nuovo esercizio', body,
    actions: [
      { label: 'Annulla', class: 'ghost' },
      { label: 'Aggiungi', class: 'primary', onClick: () => {
        const setsCount = Math.max(1, parseInt(setsI.value, 10) || 1);
        const rest = parseInt(restI.value, 10) || 0;
        let exData;
        if (mode === 'superset') {
          const cleanSubs = subs.filter(s => s.name && s.name.trim());
          if (cleanSubs.length < 2) { toast('Servono ≥2 sub-esercizi', 'error'); return false; }
          exData = {
            name: cleanSubs.map(s => s.name).join(' + '),
            ref: cleanSubs[0].name, notes: '', pattern: null, morning: false,
            superset: cleanSubs, timed: 0, rest, reps: 'Superset',
            sets: Array.from({ length: setsCount }, () => makeSetState(cleanSubs)),
            skipped: false
          };
        } else {
          const n = nmI.value.trim();
          if (!n) { toast('Nome obbligatorio', 'error'); return false; }
          const timed = mode === 'timed' ? (parseInt(timedI.value, 10) || 30) : 0;
          exData = {
            name: n, ref: n, notes: '', pattern: null, morning: false,
            superset: null, timed, rest,
            reps: timed ? `${timed}s` : (repsI.value || ''),
            sets: Array.from({ length: setsCount }, () => makeSetState(null)),
            skipped: false
          };
        }
        state.exercises.push(exData);
        save(); render(root);
      }}
    ]
  });
}

// ===== Indice esercizi =====
function openIndex(root) {
  const body = el('div', { class: 'stack' });
  state.exercises.forEach((ex, i) => {
    const done = ex.sets.every(s => s.done);
    const item = el('button', {
      class: 'list-item', style: { textAlign: 'left', width: '100%', border: 'none' },
      onclick: () => { m.close(); document.querySelectorAll('.ex-card')[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
    const lead = el('div', { class: 'lead' });
    lead.appendChild(el('div', { class: 'title' }, `${i+1}. ${ex.name}`));
    lead.appendChild(el('div', { class: 'sub' }, `${ex.sets.filter(s=>s.done).length}/${ex.sets.length} serie`));
    item.appendChild(lead);
    if (ex.skipped) item.appendChild(el('span', { class: 'chip warning' }, 'skip'));
    else if (done) item.appendChild(el('span', { class: 'chip success' }, '✓'));
    body.appendChild(item);
  });
  const m = modal({ title: 'Indice esercizi', body });
}

// ===== Timer manuale di lavoro =====
function startWorkTimer(seconds, name, onDone) {
  const sec = seconds || 30;
  let r = sec;
  const ov = el('div', { id: 'rest-overlay', class: 'work' });
  ov.innerHTML = `<div class="label">Esecuzione — ${name || ''}</div><div class="clock"></div><div class="actions"><button class="btn ghost" data-act="-5">−5s</button><button class="btn ghost" data-act="+5">+5s</button><button class="btn primary" data-act="stop">Stop</button></div>`;
  document.body.appendChild(ov);
  const clk = ov.querySelector('.clock');
  clk.textContent = fmtMMSS(r);
  if (settings.get().sound) beep(660, 0.15);
  function cleanup() { clearInterval(t); ov.remove(); }
  const t = setInterval(() => {
    r--;
    clk.textContent = fmtMMSS(r);
    clk.classList.toggle('warning', r <= 3 && r > 0);
    if (r <= 3 && r > 0 && settings.get().sound) beep(660, 0.08);
    if (r <= 0) {
      cleanup();
      if (settings.get().sound) beepSequence([[880,0.15],[1320,0.25,0.05]]);
      if (settings.get().vibration) vibrate([100,40,200]);
      if (onDone) onDone();
    }
  }, 1000);
  ov.addEventListener('click', e => {
    const act = e.target.dataset?.act;
    if (act === '-5') { r = Math.max(1, r - 5); clk.textContent = fmtMMSS(r); }
    else if (act === '+5') { r += 5; clk.textContent = fmtMMSS(r); }
    else if (act === 'stop') { cleanup(); if (onDone) onDone(); }
  });
}

// ===== Termina workout =====
function finishWorkout() {
  state.endedAt = Date.now();
  state.durationSec = Math.round((state.endedAt - state.startedAt) / 1000);
  // Verifica: almeno una serie compiuta?
  const anyDone = state.exercises.some(ex => !ex.skipped && ex.sets.some(s => s.done));
  if (!anyDone) {
    toast('Nessuna serie completata', 'error');
    return;
  }
  workouts.save(state);
  // Avanza progresso (al prossimo giorno; se ultimo giorno → settimana successiva)
  const p = getProgram(state.programId);
  if (p) {
    const week = p.weeks.find(w => w.number === state.week);
    const days = week ? week.days.filter(d => !d.rest) : [];
    const curIdx = days.findIndex(d => d.number === state.day);
    if (curIdx >= 0 && curIdx < days.length - 1) {
      progress.set(state.programId, state.week, days[curIdx + 1].number);
    } else {
      // ultima giornata: avanza settimana
      const nextWeek = p.weeks.find(w => w.number === state.week + 1);
      if (nextWeek) {
        const first = nextWeek.days.find(d => !d.rest) || nextWeek.days[0];
        progress.set(state.programId, nextWeek.number, first ? first.number : 1);
      }
    }
  }
  activeWorkout.clear();
  releaseWakeLock();
  stopElapsedTimer();
  toast('Workout salvato 💪', 'success');
  location.hash = '#/storico/' + state.id;
}

function cancelWorkout() {
  activeWorkout.clear();
  releaseWakeLock();
  stopElapsedTimer();
  location.hash = '#/home';
}
