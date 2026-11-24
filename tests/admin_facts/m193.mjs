// MP-193 on Prism Admin: every drawn control says what kind it is (the audit's UX-02), and Admin's nine places link to their
// journeys and back. Proved on the page's own classifier and its own links.
import { classes } from '../journey_facts/m193.mjs';

const PLACES = ['files', 'audit', 'runs', 'agents', 'models', 'approvals', 'costs', 'incidents', 'identity'];
const go = (html, id) => new RegExp(`data-go="${id}"`).test(html);

export default {
  'MP193-admin-every-control-classed': ({ each, mark, must }) => {
    const total = { work: 0, illus: 0, policy: 0 };
    each({}, (v, at) => {
      const c = classes(mark(v.html, at.journey), at.journey, {});
      must(!c.bad.length, `${at.journey}.${at.option}.${at.screen} ${at.surface} ${at.state}: ${c.bad[0]}`);
      for (const k of Object.keys(total)) total[k] += c[k];
    });
    must(total.work > 0 && total.illus > 0 && total.policy > 0, `every kind is drawn: ${JSON.stringify(total)}`);
  },
  // Admin home, in either option, on every device, draws a way into each of the nine places
  'MP193-admin-home-links-all-nine': ({ view, must }) => {
    for (const [o, s] of [['a', 'a-home'], ['b', 'b-home']]) for (const surface of ['iphone', 'ipad', 'web', 'pwa']) {
      const html = view('home', o, s, surface).html;
      for (const p of PLACES) must(go(html, p), `Admin home ${o.toUpperCase()} on ${surface} has no way into ${p}`);
    }
  },
  // every Back to Admin goes home, and every journey's first screen, on every device, offers a way home
  'MP193-admin-back-home': ({ each, view, options, screens, must }) => {
    each({}, (v, at) => {
      for (const m of v.html.matchAll(/<button class="jback"([^>]*)aria-label="Back to Admin"/g)) must(/data-go="home"/.test(m[1]), `${at.journey}.${at.screen} ${at.surface}: Back to Admin leads nowhere`);
    });
    for (const j of PLACES) for (const o of options(j)) for (const surface of ['iphone', 'ipad', 'web', 'pwa']) {
      const first = screens(j, o)[0];
      must(go(view(j, o, first, surface).html, 'home'), `${j}.${o}.${first} on ${surface} has no way back to Admin home`);
    }
  },
  // on iPad and desktop the sidebar's ten places all open, and the one you are in is marked as current
  'MP193-admin-sidebar': ({ each, must }) => {
    each({ surface: ['ipad', 'web'], state: 'default' }, (v, at) => {
      const side = v.html.match(/<div class="si[^"]*"[^>]*>/g) || [];
      if (!side.length) return;
      for (const p of ['home', ...PLACES]) must(side.some((t) => t.includes(`data-go="${p}"`)), `${at.journey}.${at.screen} ${at.surface}: the sidebar cannot open ${p}`);
      const cur = side.filter((t) => /aria-current="page"/.test(t));
      must(cur.length === 1 && cur[0].includes(`data-go="${at.journey}"`), `${at.journey}.${at.screen} ${at.surface}: the sidebar marks ${cur.length} current places`);
    });
  },
};
