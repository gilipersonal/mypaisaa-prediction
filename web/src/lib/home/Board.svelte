<script lang="ts">
  import type { Segment } from '#lib/data/types.ts';
  import Ic from './Ic.svelte';
  import Later from './Later.svelte';
  import { LATER, LEGEND, LIST, METALS, ORDER, metalsLine, rankLine, score, tileFoot, type DesignState } from './home.ts';
  import { later } from './later.svelte.ts';
  /**
   * The top 5 board (home.js board, bTile, legendT): eight tiles in Prism's segment colours, four across and small from
   * 1024 wide. A tile opens its segment's list, which is not built in this step, so a press says so after the tile.
   * `held` names what you hold; on Empty it is empty and the legend drops "You hold it".
   */
  let { segments, st, wide, held }: { segments: Record<string, Segment>; st: DesignState; wide: boolean; held: Set<string> } = $props();
  const seg = (k: string): Segment => {
    const s = segments[k];
    if (!s) throw new Error(`no segment ${k}`);
    return s;
  };
</script>

<div class="home-board{wide ? ' w4' : ''}{wide ? ' sm' : ''}">{#each ORDER as k (k)}{@const s = seg(k)}{@const rows = LIST[k] ?? []}<div class="segtile home-tile{st === 'loading' ? ' home-tdim' : ''}" style="--c:var({s.c})" role="button" tabindex="0" onclick={() => later.press(`tile-${k}`)} onkeydown={(e) => later.key(`tile-${k}`, e)}><span class="mk">{s.mk}</span><div class="tn">{s.name}</div>{#if k === 'metals'}<p class="un"><Ic id="ban" cls="s14" />Forecast unavailable</p><ol>{#each METALS as [n, px] (n)}<li><span class="rk">–</span><span class="tk">{n}</span><b class="home-px">{px}</b></li>{/each}</ol><p class="tm">{metalsLine(wide)}</p>{:else}<ol>{#each rows as r, i (r[0])}<li><span class="rk">{i + 1}</span><span class="tk">{r[0]}{#if held.has(r[0])}<span class="sr">, you hold it</span><Ic id="check" cls="s14" />{/if}</span><b>{score(r)}</b></li>{/each}{#if rows.length < 5}<li class="wh"><span class="rk">{rows.length + 1}</span><span class="tk">Withheld</span><b>–</b></li>{/if}</ol>{/if}<p class="tm">{tileFoot(k, st)}</p></div><Later id="tile-{k}" say={LATER.tile} />{/each}</div>
<div class="legend">{#if held.size}<span><Ic id="check" cls="s14" />You hold it</span>{/if}{#each LEGEND as l (l)}<span>{l}</span>{/each}<span>{rankLine(st)}</span><span>Illustrative</span></div>
