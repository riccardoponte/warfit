import { el, modal, confirm, toast } from '../utils.js';
import { programs, getProgram, getDay, isCustom } from '../data/exercises.js';
import { progress, customPrograms, uid } from '../storage.js';

export function renderSchede() {
  const root = el('div', { class: 'view-section stack' });
  root.appendChild(el('div', { class: 'section-title' }, 'Le tue schede'));
  programs.forEach(p => {
    const card = el('a', { class: 'card', href: `#/schede/${p.id}`, style: { borderLeft: `4px solid ${p.color}`, display: 'block', color: 'inherit' } });
    const title = el('div', { class: 'row between' },
      el('div', { class: 'card-title' }, p.name),
      isCustom(p.id) ? el('span', { class: 'chip info' }, 'Custom') : null
    );
    card.appendChild(title);
    card.appendChild(el('div', { class: 'card-sub' }, p.description));
    const prog = progress.get(p.id);
    card.appendChild(el('div', { style: { marginTop: '8px' } },
      el('span', { class: 'chip' }, `Sei alla Sett. ${prog.week}/${p.weeks.length}`)
    ));
    root.appendChild(card);
  });

  root.appendChild(el('button', {
    class: 'btn primary full', style: { marginTop: '12px' },
    onclick: () => openProgramEditor(null)
  }, '+ Crea scheda custom'));

  root.appendChild(el('a', { class: 'btn ghost full', href: '#/legenda', style: { marginTop: '4px' } },
    '📖 Legenda Berserker (WU/F/W/B/SST/Drop/Rest pause)'));
  return root;
}

export function renderWeek(programId, weekNum) {
  const p = getProgram(programId);
  if (!p) return el('div', { class: 'empty' }, 'Scheda non trovata');
  const root = el('div', { class: 'view-section stack' });
  const prog = progress.get(p.id);

  // Header scheda
  const head = el('div', { class: 'card', style: { borderLeft: `4px solid ${p.color}` } });
  head.appendChild(el('div', { class: 'card-title' }, p.name));
  head.appendChild(el('div', { class: 'card-sub' }, p.description));
  root.appendChild(head);

  if (!weekNum) {
    // Lista settimane
    root.appendChild(el('div', { class: 'section-title' }, 'Settimane'));
    p.weeks.forEach(w => {
      const item = el('a', { class: 'list-item', href: `#/schede/${p.id}/${w.number}` });
      const lead = el('div', { class: 'lead' });
      lead.appendChild(el('div', { class: 'title' }, w.title || `Settimana ${w.number}`));
      if (w.note) lead.appendChild(el('div', { class: 'sub' }, w.note.slice(0, 80)));
      item.appendChild(lead);
      if (prog.week === w.number) item.appendChild(el('span', { class: 'chip accent' }, 'Attuale'));
      else item.appendChild(el('div', { class: 'trail' }, '›'));
      root.appendChild(item);
    });

    if (isCustom(p.id)) {
      root.appendChild(el('button', {
        class: 'btn ghost full', style: { marginTop: '12px' },
        onclick: () => openProgramEditor(p.id)
      }, '✎ Modifica scheda'));
      root.appendChild(el('button', {
        class: 'btn danger full',
        onclick: async () => {
          if (await confirm({ title: 'Eliminare scheda?', message: `"${p.name}" verrà rimossa. Lo storico dei workout già fatti resta.`, danger: true, confirmLabel: 'Elimina' })) {
            customPrograms.delete(p.id);
            toast('Scheda eliminata');
            location.hash = '#/schede';
          }
        }
      }, '🗑 Elimina scheda'));
    }

    return root;
  }

  // Vista settimana → giorni
  const week = p.weeks.find(w => w.number === weekNum);
  if (!week) return el('div', { class: 'empty' }, 'Settimana non trovata');
  root.appendChild(el('div', { class: 'section-title' }, week.title || `Settimana ${week.number}`));
  if (week.note) root.appendChild(el('div', { class: 'card compact', style: { fontSize: '.85rem', color: 'var(--text-dim)' } }, week.note));

  week.days.forEach(d => {
    const item = el('a', { class: 'list-item', href: `#/schede/${p.id}/${week.number}/${d.number}` });
    const lead = el('div', { class: 'lead' });
    lead.appendChild(el('div', { class: 'title' }, d.title));
    lead.appendChild(el('div', { class: 'sub' },
      d.rest ? 'Riposo' : `${d.exercises.length} esercizi`));
    item.appendChild(lead);
    if (d.rest) item.appendChild(el('span', { class: 'chip' }, '🛌'));
    else item.appendChild(el('div', { class: 'trail' }, '›'));
    root.appendChild(item);
  });

  // CTA imposta come corrente
  root.appendChild(el('button', {
    class: 'btn ghost full', style: { marginTop: '12px' },
    onclick: () => { progress.set(p.id, week.number, week.days[0]?.number || 1); location.hash = '#/home'; }
  }, '↺ Imposta questa settimana come attuale'));

  return root;
}

export function renderDay(programId, weekNum, dayNum) {
  const p = getProgram(programId);
  const day = getDay(programId, weekNum, dayNum);
  if (!p || !day) return el('div', { class: 'empty' }, 'Giorno non trovato');
  const root = el('div', { class: 'view-section stack' });
  root.appendChild(el('div', { class: 'card', style: { borderLeft: `4px solid ${p.color}` } },
    el('div', { class: 'card-title' }, day.title),
    el('div', { class: 'card-sub' }, `${p.name} · Settimana ${weekNum}`)
  ));

  if (day.rest) {
    root.appendChild(el('div', { class: 'empty' },
      el('div', { class: 'icon' }, '🛌'),
      el('div', {}, 'Giorno di riposo'),
      el('div', { class: 'small muted' }, 'Recupera e idratati bene.')
    ));
    return root;
  }

  day.exercises.forEach((ex, i) => {
    const card = el('div', { class: 'card', style: { marginBottom: '8px' } });
    card.appendChild(el('div', { class: 'card-title' }, `${i+1}. ${ex.name}`));
    const meta = el('div', { class: 'row wrap', style: { marginTop: '4px', gap: '6px' } });
    meta.appendChild(el('span', { class: 'chip' }, `${ex.sets} serie`));
    meta.appendChild(el('span', { class: 'chip' }, ex.reps));
    if (ex.rest) meta.appendChild(el('span', { class: 'chip' }, `🕐 ${ex.rest}s`));
    if (ex.morning) meta.appendChild(el('span', { class: 'chip warning' }, '🌅 mattino'));
    card.appendChild(meta);
    if (ex.pattern) {
      const pat = el('div', { style: { marginTop: '6px' } });
      ex.pattern.forEach(t => pat.appendChild(el('span', { class: `pattern-tag ${t}` }, t)));
      card.appendChild(pat);
    }
    if (ex.notes) card.appendChild(el('div', { class: 'ex-notes' }, ex.notes));
    if (ex.superset) {
      const ss = el('div', { class: 'small muted', style: { marginTop: '4px' } },
        '🔁 ' + ex.superset.map(s => s.name).join(' → '));
      card.appendChild(ss);
    }
    root.appendChild(card);
  });

  root.appendChild(el('a', {
    class: 'btn primary full big',
    href: `#/workout/${programId}/${weekNum}/${dayNum}`,
    style: { marginTop: '16px' }
  }, '▶ Inizia allenamento'));

  return root;
}

// ===== Editor scheda custom =====
function openProgramEditor(programId) {
  const existing = programId ? customPrograms.get(programId) : null;
  const draft = existing
    ? JSON.parse(JSON.stringify(existing))
    : {
        id: 'custom-' + uid(),
        custom: true,
        name: '',
        description: '',
        color: '#3498db',
        weeks: [{ number: 1, title: 'Settimana 1', days: [{ number: 1, title: 'Giorno 1', exercises: [] }] }]
      };

  const body = el('div', { class: 'stack' });
  body.appendChild(el('div', { class: 'label' }, 'Nome scheda'));
  const nm = el('input', { class: 'input', placeholder: 'Es. Push Pull Legs' });
  nm.value = draft.name;
  nm.oninput = () => { draft.name = nm.value; };
  body.appendChild(nm);

  body.appendChild(el('div', { class: 'label' }, 'Descrizione'));
  const desc = el('input', { class: 'input', placeholder: 'Breve descrizione' });
  desc.value = draft.description;
  desc.oninput = () => { draft.description = desc.value; };
  body.appendChild(desc);

  const colorRow = el('div', { class: 'row' });
  colorRow.appendChild(el('div', { class: 'label', style: { margin: 0 } }, 'Colore'));
  const col = el('input', { type: 'color', style: { width: '50px', height: '34px', border: 'none', background: 'transparent' } });
  col.value = draft.color;
  col.oninput = () => { draft.color = col.value; };
  colorRow.appendChild(col);
  body.appendChild(colorRow);

  const weeksWrap = el('div', { class: 'stack' });
  body.appendChild(weeksWrap);
  renderWeeksEditor(weeksWrap, draft);

  const m = modal({
    title: existing ? 'Modifica scheda' : 'Nuova scheda',
    body,
    actions: [
      { label: 'Annulla', class: 'ghost' },
      { label: 'Salva', class: 'primary', onClick: () => {
        if (!draft.name.trim()) { toast('Nome obbligatorio', 'error'); return false; }
        // pulizia: rimuovi esercizi vuoti
        draft.weeks.forEach(w => w.days.forEach(d => {
          d.exercises = d.exercises.filter(ex => ex.name && ex.name.trim());
        }));
        customPrograms.save(draft);
        toast('Scheda salvata', 'success');
        location.hash = '#/schede';
      }}
    ]
  });
}

function renderWeeksEditor(wrap, draft) {
  wrap.innerHTML = '';
  wrap.appendChild(el('div', { class: 'section-title', style: { margin: '8px 0 4px' } }, 'Settimane'));
  draft.weeks.forEach((w, wi) => {
    const wCard = el('div', { class: 'card stack' });
    const wHead = el('div', { class: 'row between' },
      el('strong', {}, w.title || `Settimana ${w.number}`),
      el('button', { class: 'btn small danger', onclick: () => {
        if (draft.weeks.length === 1) { toast('Almeno una settimana', 'error'); return; }
        draft.weeks.splice(wi, 1);
        draft.weeks.forEach((x, i) => x.number = i + 1);
        renderWeeksEditor(wrap, draft);
      }}, '✕')
    );
    wCard.appendChild(wHead);
    const wt = el('input', { class: 'input', placeholder: `Titolo (Settimana ${w.number})` });
    wt.value = w.title || '';
    wt.oninput = () => { w.title = wt.value; };
    wCard.appendChild(wt);

    w.days.forEach((d, di) => {
      const dCard = el('div', { class: 'card compact stack', style: { background: 'var(--bg-3)' } });
      const dHead = el('div', { class: 'row between' },
        el('strong', { class: 'small' }, d.title || `Giorno ${d.number}`),
        el('div', { class: 'row' },
          el('label', { class: 'small muted', style: { display: 'flex', gap: '4px', alignItems: 'center' } },
            (() => { const c = el('input', { type: 'checkbox' }); c.checked = !!d.rest; c.onchange = () => { d.rest = c.checked; if (c.checked) d.exercises = []; renderWeeksEditor(wrap, draft); }; return c; })(),
            'Riposo'
          ),
          el('button', { class: 'btn small danger', onclick: () => {
            if (w.days.length === 1) { toast('Almeno un giorno', 'error'); return; }
            w.days.splice(di, 1);
            w.days.forEach((x, i) => x.number = i + 1);
            renderWeeksEditor(wrap, draft);
          }}, '✕')
        )
      );
      dCard.appendChild(dHead);
      const dt = el('input', { class: 'input', placeholder: `Titolo (Giorno ${d.number})` });
      dt.value = d.title || '';
      dt.oninput = () => { d.title = dt.value; };
      dCard.appendChild(dt);

      if (!d.rest) {
        d.exercises.forEach((ex, ei) => {
          const exRow = el('div', { class: 'stack', style: { padding: '6px', background: 'var(--surface)', borderRadius: '6px' } });
          const nameRow = el('div', { class: 'row' });
          const exName = el('input', { class: 'input', placeholder: 'Nome esercizio', style: { flex: 1 } });
          exName.value = ex.name || '';
          exName.oninput = () => { ex.name = exName.value; };
          nameRow.appendChild(exName);
          nameRow.appendChild(el('button', { class: 'btn small danger', onclick: () => { d.exercises.splice(ei, 1); renderWeeksEditor(wrap, draft); } }, '✕'));
          exRow.appendChild(nameRow);

          const meta = el('div', { class: 'row' });
          const setsI = el('input', { class: 'input', type: 'number', placeholder: 'serie', min: '1' });
          setsI.value = ex.sets || '';
          setsI.oninput = () => { ex.sets = parseInt(setsI.value, 10) || 1; };
          const repsI = el('input', { class: 'input', placeholder: 'reps (es. 8-10)' });
          repsI.value = ex.reps || '';
          repsI.oninput = () => { ex.reps = repsI.value; };
          const restI = el('input', { class: 'input', type: 'number', placeholder: 'rec. sec' });
          restI.value = ex.rest || '';
          restI.oninput = () => { ex.rest = parseInt(restI.value, 10) || 0; };
          meta.append(setsI, repsI, restI);
          exRow.appendChild(meta);
          dCard.appendChild(exRow);
        });

        dCard.appendChild(el('button', {
          class: 'btn small ghost full',
          onclick: () => { d.exercises.push({ name: '', sets: 3, reps: '10', rest: 60 }); renderWeeksEditor(wrap, draft); }
        }, '+ Esercizio'));
      }
      wCard.appendChild(dCard);
    });

    wCard.appendChild(el('button', {
      class: 'btn small ghost full',
      onclick: () => {
        const n = w.days.length + 1;
        w.days.push({ number: n, title: `Giorno ${n}`, exercises: [] });
        renderWeeksEditor(wrap, draft);
      }
    }, '+ Giorno'));

    wrap.appendChild(wCard);
  });

  wrap.appendChild(el('button', {
    class: 'btn ghost full',
    onclick: () => {
      const n = draft.weeks.length + 1;
      draft.weeks.push({ number: n, title: `Settimana ${n}`, days: [{ number: 1, title: 'Giorno 1', exercises: [] }] });
      renderWeeksEditor(wrap, draft);
    }
  }, '+ Settimana'));
}
