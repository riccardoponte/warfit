// Registro delle schede disponibili (built-in + custom utente)
import { warfit } from './warfit.js';
import { berserker, berserkerLegend } from './berserker.js';
import { customPrograms } from '../storage.js';

export const builtinPrograms = [warfit, berserker];

export function getAllPrograms() {
  return [...builtinPrograms, ...customPrograms.list()];
}

// Compat: alcuni file fanno `programs.forEach`. Usiamo un Proxy che riflette dinamicamente.
export const programs = new Proxy([], {
  get(_t, prop) {
    const arr = getAllPrograms();
    const val = arr[prop];
    return typeof val === 'function' ? val.bind(arr) : val;
  },
  has(_t, prop) { return prop in getAllPrograms(); },
  ownKeys() { return Reflect.ownKeys(getAllPrograms()); },
  getOwnPropertyDescriptor(_t, prop) {
    return Object.getOwnPropertyDescriptor(getAllPrograms(), prop);
  }
});

export function isCustom(programId) {
  return customPrograms.list().some(p => p.id === programId);
}

export function getProgram(id) {
  return getAllPrograms().find(p => p.id === id);
}

export function getDay(programId, weekNum, dayNum) {
  const p = getProgram(programId);
  if (!p) return null;
  const w = p.weeks.find(w => w.number === weekNum);
  if (!w) return null;
  return w.days.find(d => d.number === dayNum) || null;
}

export function getWeek(programId, weekNum) {
  const p = getProgram(programId);
  if (!p) return null;
  return p.weeks.find(w => w.number === weekNum) || null;
}

export { berserkerLegend };
