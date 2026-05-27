// Bootstrap + router hash-based
import { $, clear } from './utils.js';
import { renderHome } from './views/home.js';
import { renderSchede, renderWeek, renderDay } from './views/schede.js';
import { renderWorkout } from './views/workout.js';
import { renderStorico, renderWorkoutDetail } from './views/storico.js';
import { renderFood } from './views/food.js';
import { renderSettings, renderLegend, applyTheme } from './views/settings.js';
import { settings } from './storage.js';

// Applica tema PRIMA del primo render per evitare flash
applyTheme(settings.get().theme);

const routes = [
  { match: /^#\/home$/, render: renderHome, tab: 'home', title: 'WARFIT', back: false },
  { match: /^#\/schede$/, render: renderSchede, tab: 'schede', title: 'Schede', back: false },
  { match: /^#\/schede\/([^/]+)$/, render: (m) => renderWeek(m[1]), tab: 'schede', title: 'Settimane', back: '#/schede' },
  { match: /^#\/schede\/([^/]+)\/(\d+)$/, render: (m) => renderWeek(m[1], parseInt(m[2],10)), tab: 'schede', title: 'Giorni', back: (m) => `#/schede/${m[1]}` },
  { match: /^#\/schede\/([^/]+)\/(\d+)\/(\d+)$/, render: (m) => renderDay(m[1], +m[2], +m[3]), tab: 'schede', title: 'Giorno', back: (m) => `#/schede/${m[1]}/${m[2]}` },
  { match: /^#\/workout\/([^/]+)\/(\d+)\/(\d+)$/, render: (m) => renderWorkout(m[1], +m[2], +m[3]), tab: null, title: 'Allenamento', back: '#/home' },
  { match: /^#\/workout\/resume$/, render: () => renderWorkout('__resume__'), tab: null, title: 'Allenamento', back: '#/home' },
  { match: /^#\/storico$/, render: renderStorico, tab: 'storico', title: 'Storico', back: false },
  { match: /^#\/storico\/([^/]+)$/, render: (m) => renderWorkoutDetail(m[1]), tab: 'storico', title: 'Dettaglio', back: '#/storico' },
  { match: /^#\/food$/, render: renderFood, tab: 'food', title: 'Food', back: false },
  { match: /^#\/settings$/, render: renderSettings, tab: 'settings', title: 'Impostazioni', back: false },
  { match: /^#\/legenda$/, render: renderLegend, tab: 'settings', title: 'Legenda Berserker', back: '#/settings' }
];

function route() {
  const hash = location.hash || '#/home';
  for (const r of routes) {
    const m = hash.match(r.match);
    if (m) {
      const view = $('#view');
      clear(view);
      const node = r.render(m);
      if (node) view.appendChild(node);
      // top bar
      const title = $('#page-title');
      title.textContent = typeof r.title === 'function' ? r.title(m) : r.title;
      // back
      const back = $('#back-btn');
      const b = typeof r.back === 'function' ? r.back(m) : r.back;
      if (b === false) { back.hidden = true; }
      else { back.hidden = false; back.onclick = () => { location.hash = b; }; }
      // active tab
      document.querySelectorAll('#tabbar a').forEach(a => {
        a.classList.toggle('active', a.dataset.tab === r.tab);
      });
      // scroll top
      window.scrollTo(0, 0);
      return;
    }
  }
  location.hash = '#/home';
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/home';
  else route();
  // menu btn → settings
  $('#menu-btn').onclick = () => { location.hash = '#/settings'; };
});

// Service worker + auto-update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      // check aggiornamenti periodici
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateToast(reg);
          }
        });
      });
    } catch {}
  });
  let _reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (_reloading) return;
    _reloading = true;
    location.reload();
  });
}

function showUpdateToast(reg) {
  const root = document.getElementById('toast-root');
  if (!root) return;
  const el = document.createElement('div');
  el.className = 'toast info';
  el.innerHTML = '<span>Nuova versione disponibile</span> <button class="btn small primary" style="margin-left:8px">Aggiorna</button>';
  el.querySelector('button').onclick = () => {
    reg.waiting && reg.waiting.postMessage('SKIP_WAITING');
  };
  root.appendChild(el);
}

// Indicatore stato offline
function updateOnlineBadge() {
  let badge = document.getElementById('offline-badge');
  if (!navigator.onLine) {
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'offline-badge';
      badge.textContent = 'Offline';
      document.body.appendChild(badge);
    }
  } else if (badge) {
    badge.remove();
  }
}
window.addEventListener('online', updateOnlineBadge);
window.addEventListener('offline', updateOnlineBadge);
window.addEventListener('DOMContentLoaded', updateOnlineBadge);
