// Stato globale + event bus
const listeners = new Map();

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => listeners.get(event).delete(fn);
}
export function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  set.forEach(fn => { try { fn(payload); } catch (e) { console.error(e); } });
}
