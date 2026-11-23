// MP-191: the owner's answer to OWN-18, "Mask units too": Hide amounts masks money and units, and percentages stay.
// What it holds on the rendered screens, on every device and in every state, in both options of Holdings and Privacy.
const ALL = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
// a unit count as a reader or a screen reader meets it: "60 units", "4,200 units", "60 → 64 units", in the text or in an attribute
const COUNT = /\d[\d,]*(?:\s*→\s*[\d,]+)?\s*units\b/g;
// a unit count masked the way money is: a name for a screen reader, and bullets hidden from it, with the word kept
const UNIT_MASK = /<span class="sr">Units hidden<\/span><span aria-hidden="true">••••(?: → ••••)? units<\/span>/g;
const count = (t, re) => (t.match(re) || []).length;
// the import card a masked view draws, from its heading on
const importCard = (html) => (html.includes('What will change') ? html.slice(html.lastIndexOf('What will change')) : '');
const COST = /Unit counts show when you show amounts\./;
// the same screen with amounts showing, which draws the counts the masked one must hide
const SHOWN = { 'a-private': ['a', 'a-list'], 'b-private': ['b', 'b-accounts'] };

export default {
  // Holdings, both options: no unit count shows, each one the unmasked screen draws is masked instead, and the import card says when counts show.
  'MP191-own18-holdings': ({ each, view, has, lacks, must }) => {
    for (const s of ['a-private', 'b-private']) {
      const [option, plain] = SHOWN[s];
      each({ journey: 'holdings', screen: s, surface: ALL, state: STATES }, (v, at) => {
        const where = `${s} ${at.surface} ${at.state}`;
        lacks(v.text, COUNT, `${where}: a unit count shows`);
        lacks(v.html.replace(/<span class="sr">[^<]*<\/span>/g, ''), COUNT, `${where}: a unit count is left in the markup`);
        lacks(v.text, /Proposed · MP-84/, `${where}: units are still labelled as an open question`);
        if (at.state === 'error') return lacks(v.text, /••••|Units hidden/, `${where}: a figure from a refused read`);
        has(v.text, /Money and units are masked, and percentages stay, here and in Imports\./, `${where}: the banner does not say units are masked`);
        if (!['loading', 'empty'].includes(at.state)) has(v.text, /\d%/, `${where}: percentages must stay`);
        const card = at.state === 'empty' ? '' : importCard(v.html);
        if (at.state !== 'empty') {
          must(card, `${where}: no import card`);
          has(card, COST, `${where}: the import card does not say when unit counts show`);
          // a change reads "from → to": neither side may show a figure, so half a mask is caught too
          lacks(v.text.slice(v.text.lastIndexOf('What will change')), /\d\s*→|→\s*[+−]?£?\d/, `${where}: one side of a change shows its figure`);
        }
        // every count the same screen draws with amounts showing, plus the import card's, is drawn here as a mask
        const want = count(view('holdings', option, plain, at.surface, at.state).text, COUNT) + (card ? 1 : 0);
        const got = count(v.html, UNIT_MASK);
        must(got === want, `${where}: ${got} unit counts masked, of ${want}`);
      });
      // the masked account view really has counts to hide, so the count above proves something: 8 account rows (Apple sits in two) and the import card
      if (s === 'b-private') each({ journey: 'holdings', screen: s, surface: ALL, state: 'default' }, (v, at) => must(count(v.html, UNIT_MASK) === 9, `${s} ${at.surface}: ${count(v.html, UNIT_MASK)} unit masks, of 8 account rows and the import card`));
      // the note gives the owner's pick in the owner's words, with nothing left open
      const { note } = view('holdings', option, s);
      has(note, /The owner picked "Mask units too" \(OWN-18\), which reads: Hide amounts masks money and units, and percentages stay\./, `${s}: the note does not give the owner's pick`);
      has(note, /you cannot check unit counts on an import while amounts are hidden/, `${s}: the note drops the stated cost`);
      lacks(note, /Proposed · MP-84|Units stay in view|count as amounts is open/, `${s}: the note still calls units open`);
    }
  },
  // Privacy, both options: privacy mode says money and units are masked, shows no unit count, and keeps percentages.
  'MP191-own18-privacy': ({ each, view, has, lacks, must }) => {
    const SAY = /Money and units are masked\. Percentages and ranges stay visible\. Tap to show for 30 seconds\./;
    for (const [option, s] of [['a', 'privacy-a-centre'], ['b', 'privacy-b-home']]) {
      let masked = 0;
      each({ journey: 'privacy', option, screen: s, surface: ALL, state: STATES }, (v, at) => {
        const where = `${s} ${at.surface} ${at.state}`;
        lacks(v.text, COUNT, `${where}: a unit count shows`);
        lacks(v.html.replace(/<span class="sr">[^<]*<\/span>/g, ''), COUNT, `${where}: a unit count is left in the markup`);
        lacks(v.text, /Proposed · MP-84/, `${where}: units are still labelled as an open question`);
        if (!/••••/.test(v.text)) return;
        masked++;
        has(v.text, /\d%/, `${where}: percentages must stay`);
        // the centre explains privacy mode in every state it draws masked rows; home explains it when no state banner takes its place
        if (s === 'privacy-a-centre' || at.state === 'default') has(v.text, SAY, `${where}: privacy mode does not say units are masked`);
      });
      must(masked >= 20, `${s}: only ${masked} masked views, so nothing was proved`);
      const { note } = view('privacy', option, s);
      has(note, /The owner picked "Mask units too" \(OWN-18\): money and units are masked, and percentages stay\./, `${s}: the note does not give the owner's pick`);
    }
  },
};
