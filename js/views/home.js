import { el } from '../utils.js';
import { programs } from '../data/exercises.js';
import { progress, workouts, activeWorkout } from '../storage.js';
import { fmtDate, fmtDuration } from '../utils.js';

export function renderHome() {
  const root = el('div', { class: 'view-section stack' });

  // Hero
  const active = activeWorkout.get();
  if (active) {
    const hero = el('div', { class: 'card accent' });
    hero.appendChild(el('div', { class: 'card-title' }, '▶ Workout in corso'));
    hero.appendChild(el('div', { class: 'card-sub' },
      `${active.programName} · Sett. ${active.week} · ${active.dayTitle}`));
    const row = el('div', { class: 'row', style: { marginTop: '12px', gap: '8px' } });
    row.appendChild(el('a', { class: 'btn primary full', href: '#/workout/resume' }, 'Riprendi'));
    hero.appendChild(row);
    root.appendChild(hero);
  }

  // Programmi: prossimo workout
  root.appendChild(el('div', { class: 'section-title' }, 'Prossimo workout'));
  programs.forEach(p => {
    const prog = progress.get(p.id);
    const week = p.weeks.find(w => w.number === prog.week) || p.weeks[0];
    const day = week.days.find(d => d.number === prog.day) || week.days[0];
    const card = el('div', { class: 'card', style: { borderLeft: `4px solid ${p.color}` } });
    card.appendChild(el('div', { class: 'card-title' }, p.name));
    card.appendChild(el('div', { class: 'card-sub' }, p.description));
    const meta = el('div', { class: 'row', style: { marginTop: '8px', gap: '6px' } });
    meta.appendChild(el('span', { class: 'chip' }, `Sett. ${prog.week}/${p.weeks.length}`));
    if (day) meta.appendChild(el('span', { class: 'chip accent' }, day.title));
    card.appendChild(meta);
    const actions = el('div', { class: 'row', style: { marginTop: '12px', gap: '8px' } });
    if (day && !day.rest) {
      actions.appendChild(el('a', {
        class: 'btn primary full',
        href: `#/workout/${p.id}/${prog.week}/${prog.day}`
      }, '▶ Inizia'));
    } else if (day && day.rest) {
      actions.appendChild(el('div', { class: 'btn ghost full', style: { opacity: '.7' } }, '🛌 Giorno di riposo'));
    }
    actions.appendChild(el('a', { class: 'btn ghost', href: `#/schede/${p.id}` }, 'Vedi'));
    card.appendChild(actions);
    root.appendChild(card);
  });

  // Ultimi workout
  const recent = workouts.all().slice(0, 5);
  if (recent.length) {
    root.appendChild(el('div', { class: 'section-title' }, 'Ultimi allenamenti'));
    recent.forEach(w => {
      const item = el('a', { class: 'list-item', href: `#/storico/${w.id}` });
      const lead = el('div', { class: 'lead' });
      lead.appendChild(el('div', { class: 'title' }, w.programName));
      lead.appendChild(el('div', { class: 'sub' },
        `${fmtDate(w.endedAt || w.startedAt)} · Sett. ${w.week} · ${w.dayTitle}`));
      item.appendChild(lead);
      item.appendChild(el('div', { class: 'trail' }, fmtDuration(w.durationSec || 0)));
      root.appendChild(item);
    });
  } else {
    root.appendChild(el('div', { class: 'empty' },
      el('div', { class: 'icon' }, '💪'),
      el('div', {}, 'Nessun allenamento ancora.'),
      el('div', { class: 'small muted' }, 'Inizia il tuo primo workout dalla card sopra.')
    ));
  }

  return root;
}
