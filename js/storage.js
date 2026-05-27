// Storage layer su localStorage
const PREFIX = 'warfit:';

function read(key, def) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? def : JSON.parse(raw);
  } catch { return def; }
}
function write(key, val) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); }
  catch (e) { console.error('storage write', e); }
}
function remove(key) { try { localStorage.removeItem(PREFIX + key); } catch {} }

// ===== Settings =====
const DEFAULTS = {
  sound: true,
  vibration: true,
  autoStartRest: true,
  showLast: true,
  defaultRest: 60,
  theme: 'dark' // 'dark' | 'light'
};
export const settings = {
  get() { return { ...DEFAULTS, ...read('settings', {}) }; },
  set(patch) { write('settings', { ...this.get(), ...patch }); }
};

// ===== Active program / progress =====
export const progress = {
  // { warfit: { week: 3, day: 2 }, berserker: { week: 1, day: 1 } }
  all() { return read('progress', {}); },
  get(programId) { return this.all()[programId] || { week: 1, day: 1 }; },
  set(programId, week, day) {
    const all = this.all();
    all[programId] = { week, day };
    write('progress', all);
  }
};

// ===== Workouts (history) =====
// Record: { id, programId, programName, week, day, dayTitle, startedAt, endedAt,
//   durationSec, exercises: [{ name, notes, pattern?, sets:[{weight,reps,rpe,done,note,timed}], skipped }],
//   note }
export const workouts = {
  all() { return read('workouts', []); },
  save(w) {
    const list = this.all();
    const idx = list.findIndex(x => x.id === w.id);
    if (idx >= 0) list[idx] = w;
    else list.unshift(w);
    write('workouts', list);
    return w;
  },
  delete(id) {
    write('workouts', this.all().filter(w => w.id !== id));
  },
  get(id) { return this.all().find(w => w.id === id) || null; },
  lastForExercise(exName, beforeTs = Infinity) {
    const norm = exName.trim().toLowerCase();
    for (const w of this.all()) {
      if (w.endedAt && w.endedAt > beforeTs) continue;
      for (const ex of (w.exercises || [])) {
        if ((ex.name || '').trim().toLowerCase() === norm && !ex.skipped) {
          const done = (ex.sets || []).filter(s => s.done);
          if (done.length) return { workoutId: w.id, date: w.endedAt || w.startedAt, sets: done };
        }
      }
    }
    return null;
  }
};

// ===== Custom programs =====
// Stessa forma dei programmi hardcoded:
// { id, name, description, color, custom: true,
//   weeks: [{ number, title?, note?, days: [{ number, title, rest?, exercises: [...] }] }] }
export const customPrograms = {
  list() { return read('customPrograms', []); },
  get(id) { return this.list().find(p => p.id === id) || null; },
  save(p) {
    const list = this.list();
    const i = list.findIndex(x => x.id === p.id);
    if (i >= 0) list[i] = p;
    else list.push(p);
    write('customPrograms', list);
    return p;
  },
  delete(id) { write('customPrograms', this.list().filter(p => p.id !== id)); }
};

// ===== Active workout (riprendi) =====
export const activeWorkout = {
  get() { return read('active', null); },
  set(w) { write('active', w); },
  clear() { remove('active'); }
};

// ===== Food log =====
// foodEntries: array di { id, date(YYYY-MM-DD), ts, name, brand?, barcode?,
//   grams, per100: { kcal, protein, carbs, sugars, fat, fiber?, salt? },
//   meal: 'colazione'|'pranzo'|'cena'|'spuntino' }
export const food = {
  all() { return read('food', []); },
  byDate(date) { return this.all().filter(e => e.date === date); },
  add(entry) {
    const list = this.all();
    list.unshift(entry);
    write('food', list);
  },
  delete(id) { write('food', this.all().filter(e => e.id !== id)); },
  update(id, patch) {
    const list = this.all();
    const i = list.findIndex(e => e.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...patch }; write('food', list); }
  }
};

// Cache prodotti (barcode -> dati nutrizionali per100g)
export const foodCache = {
  all() { return read('foodCache', {}); },
  get(barcode) { return this.all()[barcode] || null; },
  set(barcode, data) {
    const all = this.all();
    all[barcode] = data;
    write('foodCache', all);
  }
};

// ===== Food goals =====
const GOAL_DEFAULTS = {
  kcal: 2200, protein: 140, carbs: 250, sugars: 50, fat: 70
};
export const foodGoals = {
  get() { return { ...GOAL_DEFAULTS, ...read('foodGoals', {}) }; },
  set(patch) { write('foodGoals', { ...this.get(), ...patch }); }
};

// ===== Export / Import =====
export function exportAll() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: settings.get(),
    progress: progress.all(),
    workouts: workouts.all(),
    customPrograms: customPrograms.list(),
    food: food.all(),
    foodCache: foodCache.all(),
    foodGoals: foodGoals.get()
  };
}
export function importAll(data) {
  if (!data || typeof data !== 'object') throw new Error('Dati non validi');
  if (data.settings) write('settings', data.settings);
  if (data.progress) write('progress', data.progress);
  if (Array.isArray(data.workouts)) write('workouts', data.workouts);
  if (Array.isArray(data.customPrograms)) write('customPrograms', data.customPrograms);
  if (Array.isArray(data.food)) write('food', data.food);
  if (data.foodCache) write('foodCache', data.foodCache);
  if (data.foodGoals) write('foodGoals', data.foodGoals);
}
export function wipeAll() {
  ['settings','progress','workouts','customPrograms','food','foodCache','foodGoals','active'].forEach(remove);
}

// uid
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
