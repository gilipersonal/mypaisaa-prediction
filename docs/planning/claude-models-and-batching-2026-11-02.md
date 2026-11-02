# ARC-06b: Claude models, effort, caching and batching

**Status: Proposed, awaiting the owner's answer (MP-32, 2 November 2026).** This card follows ARC-06, which fixed *how*
Claude is called and left *which model* and *which pricing tier* open. Answering it activates nothing: under the
credit policy MP makes zero Claude calls until the shared credit is verified, and no paid fallback is allowed.

## The question

For each Claude task route, which model runs it, at what effort, and does it run live or through the Message Batches
API? And how is prompt caching used?

## Already fixed, not reopened here

- Claude runs on Anthropic through the official Python client SDK, in an explicit server-controlled loop. One
  Lambda worker per task route, sharing one bounded runner (ARC-06).
- Claude never produces a forecast number, writes the ledger, promotes a model or trades.
- The 07:30 briefing and immediate risk alerts must never depend on a newly submitted batch.
- Claude and evaluations share a proposed £10 of the £70 monthly operating plan.

## The facts that decide it

Checked 2 November 2026 against Anthropic's model and pricing reference. Prices are per million tokens, first-party API.

| Model | ID | Input | Output | Cache read | Notes |
| --- | --- | --- | --- | --- | --- |
| Claude Haiku 5.5 | `claude-haiku-5-5` | $0.10 | $0.50 | about 0.1× input | Prompts up to 100K tokens; $0.50 / $2.50 beyond. Effort defaults to `medium`. A safety refusal has no server-side fallback. |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | $2.00 | $10.00 | $0.20 | 1M context. Thinking cannot be switched off with `disabled`; `between_tools` or low effort instead. |
| Claude Opus 5.5 | `claude-opus-5-5` | $4.00 | $20.00 | $0.20 | 1M context. Effort defaults to `medium`. |

**Message Batches.** Half price on every token, including cache reads and writes, so batching and caching stack.
Up to 100,000 requests or 256 MB a batch. Most finish within an hour, but the only promise is 24 hours: after that a
request expires. Results stay for 29 days and come back in any order, matched by `custom_id`. Each request is a
single shot, so a route that needs a tool loop can batch only if its inputs are fetched first.

**Prompt caching.** A cache write costs 1.25× input for the 5-minute TTL or 2× for the 1-hour TTL; a read costs about
0.1× (0.05× on Opus 5.5). A read refreshes the timer for free. Prefixes shorter than 512 tokens on these models do not
cache at all. Caching pays off from the second request that shares a prefix within the TTL.

## The routes

| Route | Volume | Can it wait? | Notes |
| --- | --- | --- | --- |
| News and filing tagging | Many small items a day | Yes, overnight | Bounded structured output; code scores relevance |
| Structured factors for the models | One set per listing a day | Yes: the forecast at +75 min uses factors frozen by the last batch | Must be point-in-time |
| Statement and screenshot extraction | A few a month | Partly: the owner waits for a preview | Tool-free; the result is only a draft |
| Explanations and the 07:30 briefing | Daily | No | Must cite versioned tool results |
| Chat ("ask why") | On demand | No | Multi-turn with read-only tools |
| Evaluation judges | Per change and sampled runs | Yes | Inspect AI organises them |

## Options

Costs below run each option over the token volumes in [`costs/model.json`](foundation-specifications-2026-11-02/costs/model.json)
(dev and prod together), at £0.80 to the dollar and 20% tax. They count the batch discount but **no caching
saving**, so caching only improves on them. The model does not split its economy-class volume by route, so all of it
is treated as batchable; live extraction is a few documents a month and barely moves the totals.

| Option | Models | Live or batch | Baseline month | Stress month |
| --- | --- | --- | --- | --- |
| Today's model (no decision) | Haiku-class economy, Sonnet-class standard | All live | $4.78 (£4.58) | $91.75 (£88.08) |
| **A. Haiku for bounded work, Sonnet for conversation, batch what can wait (Recommended)** | Haiku 5.5: tagging, factors, extraction. Sonnet 5.5: chat, explanations, briefing, eval judges. Opus 5.5: none. | Tagging, factors and eval judges batched; the rest live | $3.59 (£3.44) | $69.88 (£67.08) |
| B. Sonnet everywhere, batch what can wait | Sonnet 5.5 on every route | As A | $7.15 (£6.86) | $105.50 (£101.28) |
| C. Haiku everywhere, batch what can wait | Haiku 5.5 on every route, chat included | As A | $0.36 (£0.34) | $5.28 (£5.06) |
| D. A's models, no batching | As A | All live | $4.78 (£4.58) | $91.75 (£88.08) |

**A (Recommended).** Bounded, high-volume work goes to the cheapest model that is good enough. Live Sonnet is kept
for the two places quality shows: answering "why" and the morning explanation. The overnight lane halves tagging,
factors and eval-judge cost. The risk is two models to evaluate, prompt for and keep current, and two cache
namespaces.

**B.** One model, one set of prompts, one cache namespace, at about twice A's baseline. It goes over the £10
Claude allocation once usage rises.

**C.** The cheapest by far, and the stress case fits easily. But chat and explanations are where a weaker answer
costs trust, and Haiku has no server-side refusal fallback. It is worth testing, not adopting untested.

**D.** Simplest to operate, and it pays full price for work no one is waiting on.

Whichever option is chosen, live Sonnet chat drives the stress case: $48 of A's $69.88. The caps on chat turns, tokens
and tools per day matter more than the model choice.

## What the recommendation includes

- **No Opus** on any route until an evaluation shows a route needs it.
- **Effort by route,** tuned against the evals: `low` or `medium` for Haiku routes, `low` for chat, `medium` for
  explanations, set explicitly rather than left at each model's default.
- **Caching on.** A 5-minute TTL on the stable system prompt and tool list of every route, checked in
  `cache_read_input_tokens` rather than assumed. No cache warming.
- **Batch lane rules.** The submit worker reserves the batch's maximum cost first. Results are keyed by `custom_id`.
  An expired or failed request leaves the last dated evidence in place, marks the update pending and never falls back
  to a paid live call by itself.
- **Proof before activation.** Each route runs its Inspect AI suite on the chosen model and effort before it is
  switched on, and the exact model ID is pinned per environment.

## Still open after this card

- Whether to enable the server-side refusal fallback on Sonnet 5.5 routes. It reroutes a refused request to
  another model, which changes cost and behaviour, so it needs its own yes.
- Per-route daily caps on turns, tokens and tool calls.
- Exact prompts and tool lists per route, and the evaluation cases that qualify them.

## Recording the answer

Reply with A, B, C or D, or a change to one of them, and its scope (all routes, or named routes). The answer is
recorded here with the date and exact wording, and ARCHITECTURE.md and TECH-STACK.md are updated to match.

| Date | Answer | Scope |
| --- | --- | --- |
| | Pending | |
