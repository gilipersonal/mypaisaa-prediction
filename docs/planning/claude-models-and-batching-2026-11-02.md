# ARC-06b: Claude models, effort, caching and batching

**Status: Owner-selected. Option A, all routes, chosen on 2 November 2026 (MP-32).** This card follows ARC-06, which
fixed *how* Claude is called and left *which model* and *which pricing tier* open. The answer activates nothing: under
the credit policy MP makes zero Claude calls until the shared credit is verified, and no paid fallback is allowed.
Each route still has to pass its evaluation before it is switched on, and Opus keeps event analysis only if it beats
Sonnet there.

**Revision 2, same day:** the owner asked where Opus fits, given the news and events to analyse. The first version
had no route for deep event analysis, only for tagging. This revision adds that route and recomputes every option.

## The question

For each Claude task route, which model runs it, at what effort, and does it run live or through the Message Batches
API? And how is prompt caching used?

## Already fixed, not reopened here

- Claude runs on Anthropic through the official Python client SDK, in an explicit server-controlled loop. One
  Lambda worker per task route, sharing one bounded runner (ARC-06).
- Claude never produces a forecast number, writes the ledger, promotes a model or trades. An event analysis reaches
  a forecast only as a structured, point-in-time input, and only after it has shown it adds accuracy.
- The 07:30 briefing and immediate risk alerts must never depend on a newly submitted batch.
- Claude and evaluations share a proposed £10 of the £70 monthly operating plan.

## The facts that decide it

Checked 2 November 2026 against Anthropic's model and pricing reference. Prices are per million tokens, first-party API.

| Model | ID | Input | Output | Batched | Notes |
| --- | --- | --- | --- | --- | --- |
| Claude Haiku 5.5 | `claude-haiku-5-5` | $0.10 | $0.50 | $0.05 / $0.25 | Prompts up to 100K tokens; $0.50 / $2.50 beyond. Effort defaults to `medium`. A safety refusal has no server-side fallback. |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | $2.00 | $10.00 | $1.00 / $5.00 | 1M context. Cache reads $0.20. |
| Claude Opus 5.5 | `claude-opus-5-5` | $4.00 | $20.00 | $2.00 / $10.00 | 1M context. Thinking cannot be switched off and is billed as output; effort defaults to `medium`. Cache reads $0.20. |

Batched Opus costs the same per token as live Sonnet.

**Message Batches.** Half price on every token, including cache reads and writes, so batching and caching stack.
Up to 100,000 requests or 256 MB a batch. Most finish within an hour, but the only promise is 24 hours: after that a
request expires. Results stay for 29 days and come back in any order, matched by `custom_id`. Each request is a
single shot, so a route that needs a tool loop can batch only if its inputs are fetched first.

**Prompt caching.** A cache write costs 1.25× input for the 5-minute TTL or 2× for the 1-hour TTL; a read costs about
0.1× (0.05× on Opus 5.5). A read refreshes the timer for free. Prefixes shorter than 512 tokens on these models do not
cache at all. Caching pays off from the second request that shares a prefix within the TTL.

## The routes

News and events are handled in two layers: cheap triage of everything, then a careful read of the few items that
matter.

| Route | Volume | Can it wait? | What it does |
| --- | --- | --- | --- |
| **Triage** of news, filings and calendar items | Hundreds of short items a day | Yes, overnight | Tags each item: instruments touched, event type, direction, novelty. Code scores relevance. |
| **Event analysis** | A few material items a day, picked by code | Yes, overnight | Reads the full document against what was already known: what changed, why it matters for the holding, second-order effects, what would prove it wrong. Cited, structured, point-in-time. |
| Structured factors for the models | One set per listing a day | Yes: the forecast at +75 min uses factors frozen by the last batch | Turns triage and analysis into versioned model inputs |
| Statement and screenshot extraction | A few a month | Partly: the owner waits for a preview | Tool-free; the result is only a draft |
| Explanations and the 07:30 briefing | Daily | No | Cites versioned tool results, including stored event analyses |
| Chat ("ask why") | On demand | No | Multi-turn with read-only tools; quotes a stored event analysis instead of redoing it |
| Evaluation judges | Per change and sampled runs | Yes | Inspect AI organises them |

**Which events get analysed.** Code decides, not Claude: an item that triage tagged as material and that touches a
holding or the watchlist, for example earnings and guidance, a central bank decision, a regulatory filing, a rating
action, or an index or corporate action. At most three a day in prod; the rest wait for the next day or are dropped
with a recorded reason.

## Options

Costs below run each option over the token volumes in [`costs/model.json`](foundation-specifications-2026-11-02/costs/model.json)
(dev and prod together), plus an **event-analysis allowance that is this card's own assumption**, not yet in the cost
model: 3 events a day in prod (90 a month) and 10 a month in dev, each about 15K tokens in and 2K out, thinking
included. All figures are at £0.80 to the dollar and 20% tax. They count the batch discount but **no caching
saving**, so caching only improves on them. The model does not split its economy-class volume by route, so all of it
is treated as batchable; live extraction is a few documents a month and barely moves the totals.

| Option | Models | Live or batch | Normal month | Busy month |
| --- | --- | --- | --- | --- |
| Today's model (no event analysis, all live) | Haiku-class economy, Sonnet-class standard | All live | $4.78 (£4.58) | $91.75 (£88.08) |
| **A. Haiku triage, Opus event analysis, Sonnet conversation, batch what can wait (Recommended; selected)** | Haiku 5.5: triage, factors, extraction. Opus 5.5: event analysis. Sonnet 5.5: chat, explanations, briefing, eval judges. | Triage, event analysis, factors and eval judges batched; the rest live | $8.59 (£8.24) | $74.88 (£71.88) |
| A-lite. As A, with Sonnet for event analysis | As A, Sonnet 5.5 in place of Opus | As A | $6.09 (£5.84) | $72.38 (£69.48) |
| B. Sonnet everywhere | Sonnet 5.5 on every route | As A | $9.65 (£9.26) | $108.00 (£103.68) |
| C. Haiku everywhere | Haiku 5.5 on every route, chat included | As A | $0.48 (£0.46) | $5.40 (£5.18) |
| D. A's models, nothing batched | As A | All live | $14.78 (£14.18) | $101.75 (£97.68) |

The busy month is the cost model's stress case. Event analysis stays capped at three a day in it, so its cost does
not grow with usage the way chat does.

**A (Recommended).** Each layer gets the model its job needs. Haiku reads everything cheaply. Opus reads the few
items where judgment matters, at batch price, which equals live Sonnet. Sonnet answers live. At £8.24 it uses most of
the £10 Claude allocation before any caching saving, so the event cap is what keeps it there. The risks are three
models to evaluate, prompt for and keep current, and three cache namespaces.

**A-lite.** The same shape with Sonnet doing event analysis, £2.40 a month cheaper. It is also the comparison A has
to beat: if Sonnet's analyses score as well as Opus's on the evaluation set, A-lite wins.

**B.** One model and one set of prompts, at £9.26 with nothing to spare, and the busy month goes over the ceiling.

**C.** The cheapest by far. But event analysis, chat and explanations are where a weaker answer costs trust, and
Haiku has no server-side refusal fallback. Worth testing, not adopting untested.

**D.** Pays full price for work no one is waiting on, and goes over the £10 allocation on its own.

Under every option, live Sonnet chat drives the busy month: $48 of A's $74.88. The caps on chat turns, tokens and
tools per day matter more than the model choice.

## What the recommendation includes

- **Event analysis on Opus 5.5, batched,** at most three events a day in prod and ten a month in dev, chosen by code.
  Its output is a structured record: the event, the instruments, what changed against prior evidence, the likely
  effect and horizon, the uncertainty, what would invalidate it, and citations. Stored once, reused by the briefing,
  explanations and chat.
- **The evidence before Opus goes live:** Haiku, Sonnet and Opus run on the same labelled set of past events. Opus
  stays only if it beats Sonnet by enough to justify its price; otherwise the route drops to A-lite. A news-derived
  factor enters a forecast only if it shows incremental accuracy over the baseline.
- **No Opus anywhere else** until an evaluation shows another route needs it.
- **Effort by route,** set explicitly and tuned against the evals: `low` or `medium` for Haiku routes, `medium` to
  start for event analysis, `low` for chat, `medium` for explanations.
- **Caching on.** A 5-minute TTL on the stable system prompt and tool list of every route, checked in
  `cache_read_input_tokens` rather than assumed. No cache warming.
- **Batch lane rules.** The submit worker reserves the batch's maximum cost first. Results are keyed by `custom_id`.
  An expired or failed request leaves the last dated evidence in place, marks the update pending and never falls back
  to a paid live call by itself.
- **Proof before activation.** Each route runs its Inspect AI suite on the chosen model and effort before it is
  switched on, and the exact model ID is pinned per environment.

## Still open after this card

- The event-analysis allowance (three a day, 15K in and 2K out) is an assumption; it needs measuring on real filings
  and adding to `costs/model.json`.
- Whether to enable the server-side refusal fallback on Sonnet 5.5 and Opus 5.5 routes. It reroutes a refused
  request to another model, which changes cost and behaviour, so it needs its own yes.
- Per-route daily caps on chat turns, tokens and tool calls.
- Exact prompts and tool lists per route, and the evaluation cases that qualify them.

## Recording the answer

Reply with A, A-lite, B, C or D, or a change to one of them, and its scope (all routes, or named routes). The answer
is recorded here with the date and exact wording, and ARCHITECTURE.md and TECH-STACK.md are updated to match.

| Date | Answer | Scope |
| --- | --- | --- |
| 2 November 2026 | "A, all routes" | Every route in the table above: Haiku 5.5 for triage, factors and extraction; Opus 5.5 for event analysis, batched and capped at three a day in prod; Sonnet 5.5 for chat, explanations, the briefing and eval judges; batching, caching, effort and batch-lane rules as listed under "What the recommendation includes". It does not decide the refusal fallback, the chat caps or the open items above. |
