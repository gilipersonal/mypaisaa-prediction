// MP-191: the owner's pick on the journal, proved on the rendered Journal screens.
// OWN-15, "Any time evidence shows": "You can save an entry against the evidence on screen whenever no action is ranked, and the entry records why none was."
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'];
const NONE = { empty: /no label: the thresholds that turn a score into an action are not approved/, noModel: /no approved model covered it/, abstention: /the model abstained at 6 months, so there was no range/, disagreement: /rules and models differ at 3, 6 and 12 months/ };
// every button a screen draws, with whether it can be pressed
const live = (html, label) => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].some((m) => !/\bdisabled\b/.test(m[1]) && m[2].replace(/<[^>]+>/g, ' ').includes(label));
export default {
  'MP191-own15': ({ view, has, lacks, must }) => {
    let seen = 0;
    for (const surface of SURFACES) for (const [state, why] of Object.entries(NONE)) {
      // A: the sheet over the evidence saves, and says why no action was ranked
      const a = view('journal', 'a', 'a-record', surface, state), sheet = a.html.slice(a.html.indexOf('class="sheet"'));
      must(a.html.includes('class="sheet"'), `a-record ${surface} ${state}: no sheet to record with`);
      must(live(sheet, 'Record decision'), `a-record ${surface} ${state}: nothing saves`);
      has(sheet, why, `a-record ${surface} ${state}: the entry does not say why no action was ranked`);
      lacks(sheet, /Saved with the action/, `a-record ${surface} ${state}: saved with an action that does not exist`);
      // B: the full page has its form and its button
      const b = view('journal', 'b', 'b-decide', surface, state);
      has(b.text, /Your decision/, `b-decide ${surface} ${state}: no form`);
      must(live(b.html, 'Record decision'), `b-decide ${surface} ${state}: nothing saves`);
      has(b.text, why, `b-decide ${surface} ${state}: the entry does not say why no action was ranked`);
      // the list of what is open to decide has something to open
      const p = view('journal', 'a', 'a-pick', surface, state);
      has(p.text, /Reliance|AstraZeneca/, `a-pick ${surface} ${state}: nothing open to record`);
      seen += 3;
    }
    // the cost of the pick is said where it bites: an abstained horizon may never score
    for (const surface of SURFACES) has(view('journal', 'a', 'a-record', surface, 'abstention').text, /may never get an outcome/, `a-record ${surface}: the entry on an abstention is not told it may never score`);
    // the question is answered, so no journal screen labels it open
    for (const o of ['a', 'b']) for (const s of ['a-record', 'a-pick', 'a-list', 'a-one', 'a-differ', 'b-board', 'b-decide', 'b-one', 'b-differ'].filter((x) => x.startsWith(o))) for (const surface of SURFACES) for (const state of ['default', 'empty', 'noModel', 'disagreement', 'abstention']) {
      let v; try { v = view('journal', o, s, surface, state); } catch (e) { must(false, `${s}: ${e.message}`); }
      lacks(v.text, /Proposed · MP-158|nothing to record against|An entry needs an action/, `${s} ${surface} ${state}: the old rule`);
    }
    must(seen === SURFACES.length * Object.keys(NONE).length * 3, `walked ${seen} views`);
  },
};
