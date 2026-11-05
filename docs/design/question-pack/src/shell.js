/* The owner's question pack (MP-184). Nothing is picked until the owner presses: no option starts selected. Picks are kept in the
   artifact's database so Claude can read them, in this browser as a convenience, and in the text below as the fallback. */
(() => {
  const PACK = JSON.parse(document.getElementById('qpData').textContent);
  const LISTS = [
    ['approval', 'before_approval', 'Before approval', 'These change what you would be approving. Settle these first.'],
    ['build', 'before_build', 'Before build', 'These leave the screens standing, but each must be settled before that part is built.'],
    ['later', 'later', 'Later', 'Each can wait for the phase that needs it. A labelled default holds until then.'],
  ];
  const KEY = 'mp184-picks', OTHER = 'Something else';
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const decide = PACK.items.filter(i => i.status === 'decide');
  const byId = Object.fromEntries(PACK.items.map(i => [i.id, i]));
  const inList = t => decide.filter(i => i.tier === t);
  let picks = {}, db = null, tab = 'approval', saved = 'local';
  try { picks = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { picks = {}; }
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(picks)); } catch (e) { /* the text below still holds them */ } };
  const saveWord = () => {
    $('#qpSave').textContent = saved === 'db' ? 'Your picks save as you go, and Claude can read them.' : saved === 'failed' ? 'A pick did not save. Copy your picks below and paste them to Claude.' : 'Your picks are saved in this browser only. Copy them below and paste them to Claude.';
  };
  const outText = () => {
    const done = decide.filter(i => picks[i.id]);
    return done.length ? `MP-184 picks. ${done.map(i => `${i.id}: ${picks[i.id].label}${picks[i.id].note ? ` (${picks[i.id].note})` : ''}`).join('. ')}.` : '';
  };
  const progress = () => {
    const done = decide.filter(i => picks[i.id]).length, first = inList('before_approval'), firstDone = first.filter(i => picks[i.id]).length;
    $('#qpBar').style.width = `${(firstDone / first.length) * 100}%`;
    $('#qpCount').textContent = `${firstDone} of ${first.length} before approval. ${done} of ${decide.length} in all.`;
    $('#qpText').value = outText();
    LISTS.forEach(([k, t, name]) => { const b = $(`[data-tab="${k}"]`); if (b) b.textContent = `${name} ${inList(t).filter(i => picks[i.id]).length}/${inList(t).length}`; });
  };
  /* one write at a time per question: a later change waits for the one in flight */
  const queue = {};
  const write = id => {
    queue[id] = (queue[id] || Promise.resolve()).then(() => {
      if (!db) return;
      const ref = db.doc(`picks/${id}`), p = picks[id];
      return (p ? ref.set({ option: p.label, note: p.note || '', recommended: !!p.rec, at: p.at }) : ref.delete()).then(() => { saved = 'db'; saveWord(); });
    }).catch(() => { saved = 'failed'; saveWord(); });
    return queue[id];
  };
  const setPick = (id, label, rec, note) => {
    picks[id] = { label, rec: !!rec, note: note ?? (picks[id] ? picks[id].note : '') ?? '', at: new Date().toISOString() };
    keep(); progress(); return write(id);
  };
  const card = i => {
    const p = picks[i.id];
    const opts = i.options.map((o, n) => `<label class="qp-opt"><input type="radio" name="q-${esc(i.id)}" value="${n}"${p && p.label === o.label ? ' checked' : ''}><span><i class="dot"></i><div><b>${esc(o.label)}${o.rec ? '<span class="chip owner">Recommended</span>' : ''}</b><small>${esc(o.says)}</small><small class="c">Costs: ${esc(o.cost)}</small>${o.rec ? `<small class="c">Why this one: ${esc(o.because)}</small>` : ''}</div></span></label>`).join('');
    const other = `<label class="qp-opt"><input type="radio" name="q-${esc(i.id)}" value="other"${p && p.label === OTHER ? ' checked' : ''}><span><i class="dot"></i><div><b>${OTHER}</b><small>Say what you want in the box below.</small></div></span></label>`;
    const link = i.linked.length ? `<p class="qp-link">Read with: ${i.linked.map(l => esc(byId[l] ? byId[l].title : l)).join(' · ')}</p>` : '';
    return `<article class="qp-card${p ? ' done' : ''}" data-q="${esc(i.id)}"><h3>${esc(i.title)}</h3><p class="qp-why">${esc(i.why)}</p><p class="qp-drawn"><b>Drawn today:</b> ${esc(i.drawn_today)}</p>${link}
      <fieldset class="qp-opts"><legend>${esc(i.title)}</legend>${opts}${other}</fieldset>
      <div class="qp-note"><label class="label" for="n-${esc(i.id)}">In your own words (optional)</label><textarea id="n-${esc(i.id)}" rows="2">${esc(p ? p.note : '')}</textarea></div>
      <button class="qp-clear" type="button" data-clear${p ? '' : ' hidden'}>Clear this pick</button>
      <details><summary>Where this comes from</summary><ul><li>${esc(i.id)}, asked as: ${esc(i.asked.question)}</li>${i.evidence.map(e => `<li>${esc(e)}</li>`).join('')}</ul></details></article>`;
  };
  const list = t => {
    const items = inList(t), left = items.filter(i => !picks[i.id]);
    const all = t === 'before_approval' || !left.length ? '' : `<div class="qp-all"><button class="btn sm btn-tinted" type="button" data-all="${t}">Pick Recommended for the ${left.length} left</button><span class="small muted" data-allnote></span></div>`;
    let html = `<p class="qp-intro">${esc(LISTS.find(l => l[1] === t)[3])}</p>${all}`, group = '';
    items.forEach(i => { if (i.group !== group) { group = i.group; html += `<h2 class="qp-group">${esc(group)}</h2>`; } html += card(i); });
    return html;
  };
  const settled = () => {
    const rows = s => PACK.items.filter(i => i.status === s);
    const a = rows('answered').map(i => `<article class="qp-card"><h3>${esc(i.title)}</h3><p class="qp-why">${esc(i.why)}</p>${i.answered_by ? `<p class="qp-quote">“${esc(i.answered_by.words)}”, ${esc(i.answered_by.who)}, ${esc(i.answered_by.record)}</p>` : ''}</article>`).join('');
    const n = rows('not_owner').map(i => `<article class="qp-card"><h3>${esc(i.title)}</h3><p class="qp-why">${esc(i.why)}</p></article>`).join('');
    const d = rows('duplicate').map(i => `<article class="qp-card"><h3>${esc(i.title)}</h3><p class="qp-why">Asked once, under: ${esc(byId[i.duplicate_of] ? byId[i.duplicate_of].title : i.duplicate_of)}</p></article>`).join('');
    return `<p class="qp-intro">None of these needs a pick. They are here so that no question goes missing.</p><h2 class="qp-group">Already answered</h2>${a}<h2 class="qp-group">Not yours to decide</h2>${n}<h2 class="qp-group">The same question twice</h2>${d}`;
  };
  const draw = () => {
    const l = LISTS.find(x => x[0] === tab);
    $('#qpMain').innerHTML = l ? list(l[1]) : settled();
    document.querySelectorAll('.qp-tab').forEach(b => b.setAttribute('aria-current', String(b.dataset.tab === tab)));
    progress();
  };
  const go = k => { tab = k; draw(); try { history.replaceState(null, '', `#${k}`); } catch (e) { /* the view still shows */ } };
  $('#qpTabs').innerHTML = LISTS.map(([k]) => `<button class="qp-tab" type="button" data-tab="${k}"></button>`).join('') + '<button class="qp-tab" type="button" data-tab="settled">No pick needed</button>';
  $('#qpTabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { go(b.dataset.tab); b.focus({ preventScroll: true }); scrollTo({ top: $('.qp-tabs').offsetTop }); } });
  $('#qpMain').addEventListener('change', e => {
    const c = e.target.closest('[data-q]');
    if (!c || !e.target.matches('input[type=radio]')) return;
    const i = byId[c.dataset.q], o = e.target.value === 'other' ? null : i.options[+e.target.value];
    setPick(i.id, o ? o.label : OTHER, o && o.rec);
    c.classList.add('done'); $('[data-clear]', c).hidden = false;
    if (!o) $('textarea', c).focus({ preventScroll: true });
  });
  $('#qpMain').addEventListener('change', e => {
    if (!e.target.matches('.qp-note textarea')) return;
    const id = e.target.closest('[data-q]').dataset.q, p = picks[id], v = e.target.value.trim();
    if (p) { if (v !== p.note) setPick(id, p.label, p.rec, v); } else if (v) setPick(id, OTHER, false, v), draw();
  });
  $('#qpMain').addEventListener('click', async e => {
    const clr = e.target.closest('[data-clear]');
    if (clr) {
      const c = clr.closest('[data-q]'), id = c.dataset.q;
      delete picks[id]; keep(); write(id);
      draw(); const back = $(`[data-q="${id}"] input`); if (back) back.focus({ preventScroll: true });
      return;
    }
    const all = e.target.closest('[data-all]');
    if (!all) return;
    const items = inList(all.dataset.all).filter(i => !picks[i.id]), note = $('[data-allnote]', all.parentElement);
    if (all.dataset.sure !== 'yes') { all.dataset.sure = 'yes'; all.textContent = `Yes, pick Recommended for these ${items.length}`; note.textContent = 'Press again to confirm. You can change any of them after.'; return; }
    for (const i of items) { const o = i.options.find(x => x.rec); await setPick(i.id, o.label, true); }
    draw();
  });
  $('#qpCopy').addEventListener('click', () => {
    const area = $('#qpText'), said = $('#qpCopied');
    const fall = () => { area.focus(); area.select(); said.textContent = 'Selected. Copy it from the box.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(area.value).then(() => { said.textContent = 'Copied.'; }, fall); else fall();
  });
  const start = location.hash.slice(1);
  if (['approval', 'build', 'later', 'settled'].includes(start)) tab = start;
  saveWord();
  draw();
  /* the database lights up when the viewer can reach it, and the page works without it */
  if (window.claude && window.claude.use) window.claude.use('db').then(d => {
    if (!d) { saveWord(); return; }
    db = d; saved = 'db'; saveWord();
    let first = true;
    db.collection('picks').onSnapshot(snap => {
      const next = {};
      snap.docs.forEach(s => { const b = s.data(); if (b && byId[s.id]) { const o = byId[s.id].options.find(x => x.label === b.option); next[s.id] = { label: b.option, rec: !!(o && o.rec), note: b.note || '', at: b.at }; } });
      if (first && snap.empty && !snap.metadata.fromCache) Object.keys(picks).forEach(write);   // picks made before the store answered
      first = false;
      if (!snap.metadata.fromCache || !snap.empty) { picks = { ...picks, ...next }; keep(); if (!document.activeElement || !document.activeElement.matches('textarea')) draw(); else progress(); }
    }, () => { saved = 'failed'; saveWord(); });
  }, () => { saveWord(); });
})();
