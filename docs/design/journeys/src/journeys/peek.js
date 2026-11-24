/* Tap to show (MP-205): what "Tap to show for 30 seconds" does, the sentence the privacy centre and the hidden Home already
   say. The owner asked for it to be designed on 24 Nov 2026 ("Design tap-to-show"), when the build found the sentence with
   nothing behind it. Two options, drawn on the hidden Home that Privacy option B draws (privacy.js lends it through J.kit),
   with the same figures as Home. Proposed: nothing here is settled until the owner picks. */
{
  const { homeHidden, homeSay, homePage, maskValue, maskedRows, maskSay, supported, box, outsideHead, costPillOf, wide } = J.kit.privacy;
  void maskSay;
  const LEFT = 24;   // the moment each frame is drawn: 6 of the 30 seconds gone
  const amtOf = s => (s === 'stale' ? '84,051.05' : '90,155.25');   // Home's own figures: HSBC out of the known value when stale (OWN-07)
  const MASK_VAL = '<span class="amt priv" style="font-size:30px">£•••••</span>';
  const MASK_ROW = '<span class="priv">£••••</span>';
  const rowsOf = ctx => [byT.AAPL, { noModel: byT.RELIANCE, disagreement: byT.RELIANCE, abstention: byT.AZN }[ctx.state] || byT.NVDA, byT.HSBA];
  /* the same rows the hidden Home draws, with their pounds put back */
  const shownRows = ctx => { const hs = rowsOf(ctx); let i = 0; return maskedRows(ctx).split(MASK_ROW).map((part, k, all) => (k < all.length - 1 ? part + `£${hs[i].val.split('.')[0]}<span class="pp">.${hs[i++].val.split('.')[1]}</span>` : part)).join(''); };
  const shownValue = s => maskValue(s).replace(MASK_VAL, money(amtOf(s), 30));
  const eyeOn = ctx => (wide(ctx) ? `<button class="btn sm btn-primary" type="button" aria-pressed="true">${ic('eye-off', 's18')}Amounts hidden</button>` : `<button class="tbtn glass" type="button" aria-pressed="true" aria-label="Amounts hidden" style="background:var(--btn);color:var(--btn-ink)">${ic('eye-off', 's18')}</button>`);
  /* A: while amounts show, the eye becomes Hide now, with the seconds left */
  const hideNow = ctx => (wide(ctx) ? `<button class="btn sm btn-primary" type="button">${ic('eye-off', 's18')}Hide now · ${LEFT} s</button>` : `<button class="tbtn glass" type="button" aria-label="Hide now, ${LEFT} seconds left" style="background:var(--btn);color:var(--btn-ink)">${ic('eye-off', 's18')}</button>`);
  /* shown: the cost pill's pounds show with the rest while every amount shows (option A); otherwise they stay masked */
  const peekPage = (ctx, eye, body, shown = false) => homePage(ctx, {
    tab: 0, title: 'Portfolio', actions: costPillOf({ ...ctx, hidden: !shown }) + tb('search', 'Search') + eye,
    webActions: costPillOf({ ...ctx, hidden: !shown }) + eye, body, rail: box(outsideHead(ctx))
  });
  const NA_LOAD = 'Nothing is drawn while it loads, so there is no amount to tap';
  const NA_EMPTY = 'With no holdings there is no amount to tap';
  /* the body around one banner: the state's own words first, then the tap's */
  const peekBody = (ctx, say, value, rows) => `${box(value)}${homeSay(ctx.state)}${say}<div class="list card" style="margin:0">${supported(rows)}${rows}</div>`;
  /* hidden: what a tap does stays on screen in every state, after the state's own words */
  const peekHidden = (ctx, tap) => (['loading', 'empty'].includes(ctx.state) ? homeHidden(ctx)
    : peekBody(ctx, banner('', 'Amounts hidden.', `Money and units are masked. Percentages and ranges stay visible. ${tap}`, 'eye-off'), maskValue(ctx.state), maskedRows(ctx)));
  J.add({
    id: 'peek', title: 'Tap to show', stories: ['MP-205', 'MP-84'],
    summary: 'With amounts hidden, a tap shows them for 30 seconds, then they hide again. Privacy mode stays on throughout.',
    options: [{
      id: 'a', name: 'The whole screen', rec: true,
      why: 'One tap answers "how much" for everything in view, so the total and its rows always agree. The eye becomes Hide now with the seconds left, so ending early is one press away.',
      cost: 'It shows every amount on the screen, not only the one you wanted, for those 30 seconds.',
      screens: [{
        id: 'peek-a-hidden', title: 'Amounts hidden',
        note: 'Each masked amount is a button: tap, click, or Enter on a keyboard. A screen reader hears "Show amounts for 30 seconds". The banner says what a tap does.',
        render: ctx => peekPage(ctx, eyeOn(ctx), peekHidden(ctx, 'Tap any amount to show them all for 30 seconds.'))
      }, {
        id: 'peek-a-showing', title: 'Showing, 24 seconds left',
        note: 'Every amount on this screen shows. They hide again after 30 seconds, when you leave the screen, when the app goes to the background, or on Hide now. Privacy mode stays on and nothing is stored. A screen reader hears "Amounts showing for 30 seconds" once, not each second. With reduced motion the seconds change with no animation.',
        na: { loading: NA_LOAD, empty: NA_EMPTY },
        render: ctx => peekPage(ctx, hideNow(ctx), peekBody(ctx, banner('', 'Showing amounts.', `They hide again in ${LEFT} seconds, or when you leave this screen.`, 'clock'), shownValue(ctx.state), shownRows(ctx)), true)
      }, {
        id: 'peek-a-again', title: 'Hidden again',
        note: 'After 30 seconds, or on Hide now, every amount masks at once and the eye is pressed again. A screen reader hears "Amounts hidden again".',
        na: { loading: NA_LOAD, empty: NA_EMPTY },
        render: ctx => peekPage(ctx, eyeOn(ctx), peekBody(ctx, banner('', 'Hidden again.', 'Tap any amount to show them all for 30 seconds.', 'eye-off'), maskValue(ctx.state), maskedRows(ctx)))
      }]
    }, {
      id: 'b', name: 'One figure',
      why: 'Only the figure you tap shows, so the least is ever on screen at once.',
      cost: 'A shown total sits beside masked rows, each figure keeps its own 30 seconds, and comparing two amounts takes two taps.',
      screens: [{
        id: 'peek-b-hidden', title: 'Amounts hidden',
        note: 'Each masked amount is a button: tap, click, or Enter on a keyboard. A screen reader hears "Show this amount for 30 seconds".',
        render: ctx => peekPage(ctx, eyeOn(ctx), peekHidden(ctx, 'Tap an amount to show it for 30 seconds.'))
      }, {
        id: 'peek-b-showing', title: 'One figure showing, 24 seconds left',
        note: 'Only the value tapped shows; every row stays masked. Each figure tapped gets its own 30 seconds, and all hide on leaving the screen or when the app goes to the background.',
        na: { loading: NA_LOAD, empty: NA_EMPTY },
        render: ctx => peekPage(ctx, eyeOn(ctx), peekBody(ctx, banner('', 'Showing this figure.', `It hides again in ${LEFT} seconds. The rest stay hidden.`, 'clock'), shownValue(ctx.state), maskedRows(ctx)))
      }, {
        id: 'peek-b-again', title: 'Hidden again',
        note: 'After its 30 seconds the figure masks again. A screen reader hears "Amount hidden again".',
        na: { loading: NA_LOAD, empty: NA_EMPTY },
        render: ctx => peekPage(ctx, eyeOn(ctx), peekBody(ctx, banner('', 'Hidden again.', 'Tap an amount to show it for 30 seconds.', 'eye-off'), maskValue(ctx.state), maskedRows(ctx)))
      }]
    }]
  });
}
