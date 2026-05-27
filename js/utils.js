// Utility varie
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') node.innerHTML = v;
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

export function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function fmtDateShort(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
}
export function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}
export function fmtDuration(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}
export function fmtMMSS(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

// ===== Beep via Web Audio =====
let audioCtx = null;
function getAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { audioCtx = null; }
  }
  return audioCtx;
}
export function beep(freq = 880, dur = 0.12, vol = 0.3) {
  const ctx = getAudio();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = freq;
  o.type = 'sine';
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + dur);
}
export function beepSequence(notes) {
  // notes: [[freq, dur, delay], ...]
  const ctx = getAudio();
  if (!ctx) return;
  let t = 0;
  notes.forEach(([f, d, delay = 0]) => {
    t += delay;
    setTimeout(() => beep(f, d, 0.35), t * 1000);
    t += d;
  });
}
export function vibrate(pattern) {
  if (navigator.vibrate) try { navigator.vibrate(pattern); } catch {}
}

// ===== Wake Lock =====
let wakeLock = null;
export async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return false;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {});
    return true;
  } catch { return false; }
}
export async function releaseWakeLock() {
  if (wakeLock) try { await wakeLock.release(); } catch {}
  wakeLock = null;
}
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    try { wakeLock = await navigator.wakeLock.request('screen'); } catch {}
  }
});

// ===== Toast =====
export function toast(msg, type = '') {
  const root = $('#toast-root');
  if (!root) return;
  const t = el('div', { class: 'toast ' + type }, msg);
  root.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ===== Modal =====
export function modal({ title, body, actions, onClose }) {
  const root = $('#modal-root');
  const backdrop = el('div', { class: 'modal-backdrop', onclick: e => {
    if (e.target === backdrop) close();
  }});
  function close() {
    backdrop.remove();
    if (onClose) onClose();
  }
  const m = el('div', { class: 'modal' });
  m.appendChild(el('div', { class: 'modal-handle' }));
  if (title) m.appendChild(el('h3', {}, title));
  if (body instanceof Node) m.appendChild(body);
  else if (typeof body === 'string') m.appendChild(el('div', { html: body }));
  if (actions) {
    const row = el('div', { class: 'row', style: { marginTop: '16px', gap: '8px' } });
    actions.forEach(a => {
      const b = el('button', { class: 'btn ' + (a.class || 'ghost') + ' full', onclick: () => {
        const r = a.onClick && a.onClick();
        if (r !== false) close();
      }}, a.label);
      row.appendChild(b);
    });
    m.appendChild(row);
  }
  backdrop.appendChild(m);
  root.appendChild(backdrop);
  return { close, element: m };
}

// ===== Confirm =====
export function confirm({ title, message, confirmLabel = 'Conferma', danger = false }) {
  return new Promise(resolve => {
    modal({
      title,
      body: el('p', {}, message),
      actions: [
        { label: 'Annulla', class: 'ghost', onClick: () => resolve(false) },
        { label: confirmLabel, class: danger ? 'danger' : 'primary', onClick: () => resolve(true) }
      ],
      onClose: () => resolve(false)
    });
  });
}

// ===== Parse recupero (es. "60''", "60-90''") =====
export function parseRest(s) {
  if (typeof s === 'number') return s;
  if (!s) return 0;
  const m = String(s).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

// ===== Range helpers =====
export function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // lun=0
  x.setHours(0,0,0,0);
  x.setDate(x.getDate() - day);
  return x;
}
export function addDays(d, n) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}
