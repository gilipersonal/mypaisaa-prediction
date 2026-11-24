// MP-183: no two bottom labels on the Cost burn-up chart overlap, on any device or state, and the day stays readable late in
// the month. A label's width is estimated at 7.2 px a character plus its 3 px outline: wider than 12 px text draws in the
// system font (6.9 px) or Verdana (7.15 px) in Chrome, so the estimate errs towards refusing.
const W = (t) => t.length * 7.2 + 3;
const box = ({ x, a, t }) => (a === 'end' ? [x - W(t), x] : a === 'middle' ? [x - W(t) / 2, x + W(t) / 2] : [x, x + W(t)]);

export function bottomLabels(svg) {
  const vb = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  const h = +vb[2];
  return [...svg.matchAll(/<text( class="[^"]*")? x="([\d.]+)" y="([\d.]+)"( text-anchor="(\w+)")?>([^<]*)<\/text>/g)]
    .map((m) => ({ x: +m[2], y: +m[3], a: m[5] || 'start', t: m[6] }))
    .filter((l) => l.y >= h - 8 && l.t);
}

export default {
  'MP183-burn-labels-apart': ({ each, must }) => {
    let charts = 0;
    each({ journey: 'cost' }, (v, at) => {
      for (const svg of v.html.match(/<svg class="cx"[\s\S]*?<\/svg>/g) || []) {
        if (!/Spend by day this month/.test(svg)) continue;
        charts++;
        const where = `${at.option}.${at.screen} ${at.surface} ${at.state}`;
        const labels = bottomLabels(svg).map((l) => ({ ...l, b: box(l) })).sort((p, q) => p.b[0] - q.b[0]);
        must(labels.length >= 2, `${where}: the chart has ${labels.length} bottom labels`);
        for (let i = 1; i < labels.length; i++) must(labels[i].b[0] >= labels[i - 1].b[1] + 2, `${where}: "${labels[i - 1].t}" and "${labels[i].t}" overlap`);
        const width = +svg.match(/viewBox="0 0 (\d+(?:\.\d+)?)/)[1];
        for (const l of labels) must(l.b[0] >= 0 && l.b[1] <= width, `${where}: "${l.t}" runs off the chart`);
        // the day shown stays readable: a chart past day 1 names its day
        const day = (svg.match(/on day (\d+),/) || [])[1];
        if (day && +day > 1) must(labels.some((l) => new RegExp(`^Day ${day}\\b`).test(l.t)), `${where}: day ${day} is not labelled`);
      }
    });
    must(charts > 0, 'no burn-up chart was drawn');
  },
};
