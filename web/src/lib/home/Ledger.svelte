<script lang="ts">
  import { peek } from '#lib/peek.ts';
  import type { Holding } from '#lib/data/types.ts';
  import Amount from '#lib/components/Amount.svelte';
  import { privacy } from '#lib/privacy.svelte.ts';
  import Badge from './Badge.svelte';
  import Chg from './Chg.svelte';
  import Ic from './Ic.svelte';
  import Range from './Range.svelte';
  import { LATE_RULE, OUT_NOTE, ccyOf, dayWord, flagText, flagWord, moneyParts, pct, stamp, type DesignState } from './home.ts';
  /**
   * The holdings as Home draws them: home.js ledgerDesk from 1024 wide, ledgerPwa on a phone. Each row's name is the real
   * control and reaches across the row (home.css .home-rowbtn); it opens that holding's page. The range, the action and
   * the flags are read, never pressed.
   */
  let { items, st }: { items: Holding[]; st: DesignState } = $props();
  const href = (h: Holding) => `/holdings/${encodeURIComponent(h.ticker)}`;
  const flagged = $derived(items.filter((h) => !!h.staleAt));
</script>

{#snippet flag(h: Holding)}<span class="chip stale"><Ic id="clock" cls="s14" />{flagText(h, st)}</span>{#if st === 'stale'}<span class="home-sub">{OUT_NOTE}</span>{/if}<span class="chip owner"><span class="dot"></span>{LATE_RULE}</span>{/snippet}

<div class="card d-only"><table class="ht dk"><thead><tr><th>Instrument</th><th class="r">Value, {dayWord(st)}</th><th>6-month forecast</th><th>Action</th><th>Data</th></tr></thead><tbody>{#each items as h (h.ticker)}{@const s = stamp(h, st)}<tr><td><a class="home-rowbtn" href={href(h)} style="text-decoration:none"><span class="inst"><span class="logo sm" style="--c:var({h.segColor})" aria-hidden="true">{h.logo}</span><span class="home-nm"><b>{h.name}</b><span>{h.ticker} · {ccyOf(h)}</span></span></span></a></td><td class="r"><div style="font-weight:600"><Amount m={h.value} /></div>{#if h.staleAt}<span class="chg" style="color:var(--warn)"><Ic id="clock" cls="s14" />{s.t}</span>{:else}<Chg v={h.dayPct} />{/if}</td><td><div style="display:flex;align-items:center;gap:6px"><span style="width:40px;color:var(--fc-ink);font-weight:600;text-align:right">{pct(h.med)}</span><span style="width:70px;display:block"><Range {h} w={70} ht={14} /></span></div><div class="small muted" style="padding-left:46px;font-size:12px;line-height:16px">{pct(h.lo)} to {pct(h.hi)}</div></td><td><Badge a={h.action} /></td><td><div class="small" style="font-size:12px;line-height:16px">{s.t}<div class="muted">{s.who}{h.staleAt ? ` · ${st === 'stale' ? 'stale' : 'late'}` : ''}</div></div></td></tr>{/each}</tbody></table>{#each flagged as h (h.ticker)}<div class="t5foot home-flag">{@render flag(h)}</div>{/each}</div>
<div class="card p-only"><table class="ht pwa"><thead><tr><th>Holding</th><th class="r">Value</th><th class="r">6M</th><th>Action</th></tr></thead><tbody>{#each items as h (h.ticker)}{@const s = stamp(h, st)}<tr><td><a class="home-rowbtn" href={href(h)} style="text-decoration:none"><span class="inst"><span class="logo sm" style="--c:var({h.segColor})" aria-hidden="true">{h.logo}</span><span class="home-nm"><b>{h.ticker}</b><span>{#if h.staleAt}<span style="color:var(--warn);font-weight:600">{flagWord(st)}</span>{:else}<Chg v={h.dayPct} />{/if}</span><span class="home-fresh">{ccyOf(h)} · {s.who} {s.t}</span></span></span></a></td><td class="r" style="font-weight:600">{#if privacy.masked}<span aria-label="Amount hidden" use:peek>£••</span>{:else}{moneyParts(h.value).whole}{/if}</td><td class="r"><div style="color:var(--fc-ink);font-weight:600">{pct(h.med)}</div><div style="width:64px;margin-left:auto"><Range {h} w={64} ht={12} /></div></td><td><Badge a={h.action} /></td></tr>{/each}</tbody></table>{#each flagged as h (h.ticker)}<div class="t5foot home-flag">{@render flag(h)}</div>{/each}</div>
