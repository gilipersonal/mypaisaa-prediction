import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  createContext,
  useContext,
  useSyncExternalStore,
  Component,
} from "react";
import { createRoot } from "react-dom/client";
import { motion, MotionConfig, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Database,
  FileCheck2,
  GitBranch,
  BrainCircuit,
  MessageCircle,
  Wallet,
  Layers,
  Globe2,
  Check,
  Plus,
  Minus,
  BookOpen,
  Radio,
  LockKeyhole,
  ExternalLink,
} from "lucide-react";
import "@fontsource-variable/manrope";
import "@fontsource-variable/instrument-sans";
import {
  NODES,
  EDGES,
  PATHS,
  JOURNEY,
  INTEGRATIONS,
  PHASES,
  OPEN_CHOICES,
  LINKS,
  FILM_SCENES,
} from "./content";
import "./style.css";

const Film = lazy(() => import("./StoryFilm"));
const Context = createContext({ moving: false, technical: false });
const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const subscribeReduced = (callback) => {
  reducedQuery.addEventListener("change", callback);
  return () => reducedQuery.removeEventListener("change", callback);
};
function useSystemReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => reducedQuery.matches,
    () => true,
  );
}
const colors = {
  experience: "#c8f36a",
  platform: "#abb9ef",
  records: "#80d9b0",
  data: "#efb487",
  science: "#c8f36a",
  research: "#d2acf0",
  operations: "#efb487",
};
const iconMap = {
  experience: Radio,
  platform: Layers,
  records: Database,
  data: Globe2,
  science: GitBranch,
  research: BrainCircuit,
  operations: Wallet,
};
function Icon({ name, size = 20, ...props }) {
  const I = iconMap[name] || Layers;
  return <I size={size} strokeWidth={1.5} aria-hidden="true" {...props} />;
}
function External({ href, children, className = "" }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}
function Technical({ title = "Under the surface", children }) {
  const { technical } = useContext(Context);
  return (
    <details className="technical" open={technical}>
      <summary>
        {title}
        <Plus size={17} aria-hidden="true" />
      </summary>
      <div>{children}</div>
    </details>
  );
}
function Heading({ title, children, id }) {
  return (
    <div className="section-head" id={id}>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

function HeroMap() {
  const { moving } = useContext(Context);
  const small = [
    {
      x: 45,
      y: 50,
      t: "Your evidence",
      s: "Files · prices · history",
      color: "#80d9b0",
    },
    {
      x: 330,
      y: 50,
      t: "Your holdings",
      s: "Ledger · rules · XIRR",
      color: "#abb9ef",
    },
    {
      x: 190,
      y: 220,
      t: "An accountable view",
      s: "Forecasts + uncertainty",
      color: "#c8f36a",
    },
    {
      x: 45,
      y: 390,
      t: "Quantitative models",
      s: "Test · calibrate · compare",
      color: "#efb487",
    },
    {
      x: 330,
      y: 390,
      t: "Bounded research",
      s: "Claude · tools · citations",
      color: "#d2acf0",
    },
  ];
  return (
    <div
      className="hero-map"
      aria-label="Illustrative flow: source evidence and holdings feed an accountable view, supported by tested models and bounded research."
    >
      <svg viewBox="0 0 570 530" className="hero-lines" aria-hidden="true">
        <defs>
          <marker
            id="hero-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#819a6e" />
          </marker>
        </defs>
        {[
          "M145 143 C145 210 285 160 285 222",
          "M430 143 C430 210 285 160 285 222",
          "M145 390 C145 330 285 365 285 315",
          "M430 390 C430 330 285 365 285 315",
        ].map((d, i) => (
          <g key={d}>
            <path d={d} className="hero-path" markerEnd="url(#hero-arrow)" />
            {moving && (
              <motion.path
                d={d}
                stroke="#c8f36a"
                strokeWidth="2"
                fill="none"
                strokeDasharray="9 90"
                animate={{ strokeDashoffset: [99, 0] }}
                transition={{
                  duration: 3 + i * 0.3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}
          </g>
        ))}
      </svg>
      {small.map((n, i) => (
        <motion.div
          key={n.t}
          className={"hero-node " + (i === 2 ? "hero-node-core" : "")}
          style={{
            left: (n.x / 570) * 100 + "%",
            top: (n.y / 530) * 100 + "%",
            "--node-color": n.color,
          }}
          animate={
            moving && i === 2
              ? {
                  boxShadow: [
                    "0 14px 40px #0003",
                    "0 20px 50px #0006",
                    "0 14px 40px #0003",
                  ],
                }
              : {}
          }
          transition={{ duration: 4, repeat: Infinity }}
        >
          <span className="node-dot" />
          <strong>{n.t}</strong>
          <span>{n.s}</span>
        </motion.div>
      ))}
      <div className="map-caption">
        <span className="tiny-dot" />
        Illustrative paths. No live traffic.
      </div>
    </div>
  );
}

function Journey() {
  const [step, setStep] = useState(0);
  const j = JOURNEY[step];
  const { moving } = useContext(Context);
  return (
    <section className="section journey" id="journey">
      <Heading title="Follow one holding. See the whole story.">
        The same thread connects a source document, a financial calculation, a
        model, a conversation and the outcome that eventually arrives.
      </Heading>
      <div className="journey-layout">
        <div
          className="journey-steps"
          role="tablist"
          aria-label="Holding journey"
        >
          {JOURNEY.map((s, i) => (
            <button
              id={"journey-tab-" + i}
              role="tab"
              tabIndex={step === i ? 0 : -1}
              onKeyDown={(e) => {
                const keys = {
                  ArrowRight: (i + 1) % 7,
                  ArrowDown: (i + 1) % 7,
                  ArrowLeft: (i + 6) % 7,
                  ArrowUp: (i + 6) % 7,
                  Home: 0,
                  End: 6,
                };
                if (e.key in keys) {
                  e.preventDefault();
                  const next = keys[e.key];
                  setStep(next);
                  document.getElementById("journey-tab-" + next)?.focus();
                }
              }}
              aria-selected={step === i}
              aria-controls="journey-panel"
              onClick={() => setStep(i)}
              key={s.short}
              className={step === i ? "active" : ""}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {s.short}
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div
          className="journey-stage"
          id="journey-panel"
          role="tabpanel"
          aria-labelledby={"journey-tab-" + step}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={moving ? { opacity: 0.5, x: 12 } : false}
              animate={{ opacity: 1, x: 0 }}
              exit={moving ? { opacity: 0, x: -8 } : {}}
              transition={{ duration: 0.25 }}
            >
              <div className="stage-count">Step {step + 1} / 7</div>
              <h3>{j.title}</h3>
              <p className="lead">{j.text}</p>
              <div className="stage-chain">
                {j.nodes.map((id, i) => {
                  const n = NODES.find((n) => n.id === id);
                  return (
                    <React.Fragment key={id}>
                      {i > 0 && <ArrowRight size={18} aria-hidden="true" />}
                      <span>
                        <Icon name={n.group} />
                        {n.name}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="evidence-line">
                <FileCheck2 size={18} aria-hidden="true" />
                <p>{j.proof}</p>
              </div>
              <Technical>
                <p>{j.technical}</p>
              </Technical>
            </motion.div>
          </AnimatePresence>
          <div className="stage-controls">
            <button
              className="text-button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Previous
            </button>
            <button
              className="text-button"
              disabled={step === 6}
              onClick={() => setStep((s) => s + 1)}
            >
              Next step
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SystemMap() {
  const [selected, setSelected] = useState("api");
  const [path, setPath] = useState("all");
  const current = NODES.find((n) => n.id === selected);
  const active = PATHS.find((p) => p.id === path);
  const { moving } = useContext(Context);
  return (
    <section className="section system-section" id="system">
      <Heading title="Every connection has a reason.">
        Choose a journey, then select a component. The overview shows logical
        integrations; the native Lucid drawings below hold the detailed
        technical architecture.
      </Heading>
      <div
        className="path-controls"
        role="group"
        aria-label="Highlight a system journey"
      >
        {PATHS.map((p) => (
          <button
            aria-pressed={path === p.id}
            className={path === p.id ? "active" : ""}
            onClick={() => setPath(p.id)}
            key={p.id}
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className="path-description" aria-live="polite">
        {active.description}
      </p>
      <div className="system-layout">
        <div className="diagram-column">
          <div className="system-graph">
            <svg
              viewBox="0 0 1216 700"
              className="graph-edges"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="edge-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="4"
                  markerHeight="4"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#799582" />
                </marker>
              </defs>
              {EDGES.map((e, i) => {
                const a = NODES.find((n) => n.id === e.from),
                  b = NODES.find((n) => n.id === e.to);
                const visible =
                  active.nodes.includes(a.id) && active.nodes.includes(b.id);
                const chosen = e.from === selected || e.to === selected;
                const dx = b.x - a.x,
                  dy = b.y - a.y;
                const sx =
                    a.x +
                    (Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) * 98 : 0),
                  sy =
                    a.y +
                    (Math.abs(dx) > Math.abs(dy) ? 0 : Math.sign(dy) * 46),
                  ex =
                    b.x -
                    (Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) * 98 : 0),
                  ey =
                    b.y -
                    (Math.abs(dx) > Math.abs(dy) ? 0 : Math.sign(dy) * 46);
                const d =
                  Math.abs(dx) > Math.abs(dy)
                    ? `M${sx} ${sy} C${(sx + ex) / 2} ${sy},${(sx + ex) / 2} ${ey},${ex} ${ey}`
                    : `M${sx} ${sy} C${sx} ${(sy + ey) / 2},${ex} ${(sy + ey) / 2},${ex} ${ey}`;
                return (
                  <g key={i} opacity={visible ? (chosen ? 1 : 0.45) : 0.08}>
                    <path
                      d={d}
                      fill="none"
                      stroke={chosen ? "#c8f36a" : "#799582"}
                      strokeWidth={chosen ? 1.6 : 1}
                      markerEnd="url(#edge-arrow)"
                    />
                    {moving && visible && chosen && (
                      <motion.path
                        d={d}
                        fill="none"
                        stroke="#e7f8cc"
                        strokeWidth="2"
                        strokeDasharray="8 70"
                        animate={{ strokeDashoffset: [78, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
            {NODES.map((n) => (
              <button
                key={n.id}
                onClick={() => setSelected(n.id)}
                aria-pressed={selected === n.id}
                className={
                  "system-node " +
                  (selected === n.id ? "selected " : "") +
                  (!active.nodes.includes(n.id) ? "muted" : "")
                }
                style={{
                  left: (n.x / 1216) * 100 + "%",
                  top: (n.y / 700) * 100 + "%",
                  "--node-color": colors[n.group],
                }}
              >
                <Icon name={n.group} size={17} />
                <span>
                  <strong>{n.name}</strong>
                  <small>{n.tech}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="diagram-legend">
            {Object.entries(colors)
              .filter(([k]) => k !== "data")
              .map(([k, c]) => (
                <span key={k}>
                  <i style={{ background: c }} />
                  {k}
                </span>
              ))}
          </div>
          <p className="caption">
            Planned logical components. Arrows show interfaces, not deployed
            resources or measured activity. Managed AWS services are not all
            inside a customer VPC.
          </p>
        </div>
        <aside className="component-detail" aria-label="Selected component">
          <div
            className="component-icon"
            style={{ color: colors[current.group] }}
          >
            <Icon name={current.group} size={28} />
          </div>
          <h3>{current.name}</h3>
          <p className="component-tech">{current.tech}</p>
          <p>{current.plain}</p>
          <dl>
            <dt>Receives</dt>
            <dd>{current.input}</dd>
            <dt>Produces</dt>
            <dd>{current.output}</dd>
            <dt>Authority boundary</dt>
            <dd>{current.trust}</dd>
            <dt>When something fails</dt>
            <dd>{current.failure}</dd>
          </dl>
          <details className="component-joins">
            <summary>
              Connected interfaces
              <ChevronDown size={16} aria-hidden="true" />
            </summary>
            <ul>
              {EDGES.filter(
                (e) => e.from === selected || e.to === selected,
              ).map((e, i) => (
                <li key={i}>
                  {NODES.find((n) => n.id === e.from).name} →{" "}
                  {NODES.find((n) => n.id === e.to).name}
                  <small>{e.label}</small>
                </li>
              ))}
            </ul>
          </details>
        </aside>
      </div>
      <Technical title="Read the full integration register">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Contract</th>
                <th>Guardrail / open decision</th>
              </tr>
            </thead>
            <tbody>
              {INTEGRATIONS.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Technical>
    </section>
  );
}

function Science() {
  const [scenario, setScenario] = useState("disagree");
  const examples = {
    aligned: {
      title: "The evidence supports a view.",
      rules:
        "The financial inputs are eligible and the approved risk rules are satisfied.",
      ml: "The evaluated forecast has usable coverage and calibrated uncertainty.",
      llm: "Research cites relevant sources and explains the same evidence.",
      result:
        "Show a ranked suggestion with uncertainty and portfolio impact. It remains a suggestion.",
    },
    disagree: {
      title: "The systems disagree. You should see that.",
      rules: "A configured drawdown warning is active for the holding.",
      ml: "The model sees potential longer-term upside, with a wide range.",
      llm: "The research view is optimistic, but the sources do not resolve the near-term risk.",
      result:
        "Show all three views and explain the disagreement. Do not turn fluent optimism into a confident action.",
    },
    missing: {
      title: "The right answer can be “not enough evidence”.",
      rules: "The import lacks cash-flow history needed for a supported XIRR.",
      ml: "The source history does not meet the agreed eligibility gate.",
      llm: "Research can describe the business, but cannot fill missing financial facts.",
      result:
        "Withhold unsupported calculations and forecasts. Ask for missing evidence or use a clearly labelled daily-only view.",
    },
  };
  const ex = examples[scenario];
  return (
    <section className="section science" id="science">
      <Heading title="Intelligence has to earn its confidence.">
        Rules calculate. ML estimates. Claude researches and explains. A common
        evidence and eligibility layer keeps their roles distinct.
      </Heading>
      <div className="science-split">
        <div>
          <h3>A prediction is a promise to keep the score.</h3>
          <p>
            Start with simple baselines. Add numerical ML, then test whether
            structured LLM-derived factors actually improve the result. Compare
            each step on the same point-in-time evidence.
          </p>
          <div className="science-ladder">
            {[
              "Rules / statistical baseline",
              "Numerical ML challenger",
              "ML + versioned LLM factors",
              "Shadow → your promotion approval",
            ].map((s, i) => (
              <div key={s}>
                <span>{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
          <Technical title="What rigorous validation means">
            <ul>
              <li>
                Use chronological rolling/expanding folds, with
                horizon-appropriate purging and embargo. Never use a random
                time-series split.
              </li>
              <li>
                Fit transformations and calibration inside training folds. Keep
                source cutoffs, datasets, features, split dates and model
                artefact hashes.
              </li>
              <li>
                Compare calibration, error, coverage, stability and
                benchmark-relative performance; accuracy alone is insufficient.
              </li>
              <li>
                Keep backtest, historical reconstruction, shadow and genuinely
                prospective results separate. Score only after declared
                maturity.
              </li>
              <li>
                Exact sample sizes, promotion thresholds, shadow duration,
                target definitions and rollback policy remain to agree.
              </li>
            </ul>
          </Technical>
        </div>
        <div className="horizon-panel">
          <h3>
            Different horizons.
            <br />
            Different questions.
          </h3>
          <dl>
            <dt>Next day</dt>
            <dd>Near-term evaluated forecast</dd>
            <dt>5–20 trading days</dt>
            <dd>Short-term direction and risk</dd>
            <dt>3 / 6 / 12 months</dt>
            <dd>Longer-term forecast views</dd>
            <dt>3–5 years</dt>
            <dd>Explicit scenarios, not a prematurely scored forecast</dd>
          </dl>
          <p>
            Daily formal forecasts. Supported quote and risk monitoring every 30
            minutes. Refresh frequency is separate from prediction horizon.
          </p>
        </div>
      </div>
      <div className="evidence-example">
        <div className="example-heading">
          <h3>What happens when evidence changes?</h3>
          <span>Illustrative logic · no live holding or forecast</span>
        </div>
        <div
          className="example-options"
          role="group"
          aria-label="Evidence scenario"
        >
          <button
            aria-pressed={scenario === "aligned"}
            onClick={() => setScenario("aligned")}
            className={scenario === "aligned" ? "active" : ""}
          >
            Aligned evidence
          </button>
          <button
            aria-pressed={scenario === "disagree"}
            onClick={() => setScenario("disagree")}
            className={scenario === "disagree" ? "active" : ""}
          >
            Disagreement
          </button>
          <button
            aria-pressed={scenario === "missing"}
            onClick={() => setScenario("missing")}
            className={scenario === "missing" ? "active" : ""}
          >
            Missing evidence
          </button>
        </div>
        <h4 aria-live="polite">{ex.title}</h4>
        <div className="three-views">
          {[
            ["Rules", ex.rules],
            ["ML", ex.ml],
            ["Research", ex.llm],
          ].map(([t, v]) => (
            <div key={t}>
              <strong>{t}</strong>
              <p>{v}</p>
            </div>
          ))}
        </div>
        <p className="example-result">
          <ShieldCheck size={23} aria-hidden="true" />
          {ex.result}
        </p>
      </div>
    </section>
  );
}

function Research() {
  return (
    <section className="section research" id="research">
      <div className="research-intro">
        <h2>A conversation with the evidence.</h2>
        <p>
          “Why is this recommended?” should open the reasoning, the sources and
          the uncertainty behind it. The agents share context; they do not share
          unlimited authority.
        </p>
      </div>
      <div
        className="chat-illustration"
        aria-label="Illustrative conversation contract"
      >
        <div className="chat-question">
          <MessageCircle size={24} aria-hidden="true" />
          <p>
            Why does the model’s outlook differ from the risk warning on this
            holding?
          </p>
          <span>Example question</span>
        </div>
        <div className="tool-loop">
          <span>Question + scoped context</span>
          <ArrowRight size={18} aria-hidden="true" />
          <strong>Server checks tools and budget</strong>
          <ArrowRight size={18} aria-hidden="true" />
          <span>Claude on Anthropic</span>
          <ArrowRight size={18} aria-hidden="true" />
          <strong>Typed evidence tools</strong>
          <ArrowRight size={18} aria-hidden="true" />
          <span>Cited, recorded answer</span>
        </div>
        <div className="answer-contract">
          <p>
            The answer must distinguish the model’s horizon from the risk rule,
            use deterministic numbers, cite the evidence versions and explain
            the disagreement.
          </p>
          <span>No generated portfolio figures are presented here.</span>
        </div>
      </div>
      <div className="research-columns">
        <div>
          <h3>Specialists, with a brief.</h3>
          <p>
            Proposed roles cover market/data health, performance, risk/exposure,
            filings and news, bull/bear research, daily briefing, model
            experiments, evaluation and orchestration. Their exact number
            remains a design choice.
          </p>
          <Technical title="The explicit client-SDK loop">
            <ol>
              <li>
                Admit a request under a versioned budget; bound iterations,
                time, tokens and concurrency.
              </li>
              <li>
                Send minimised context and typed tool schemas through the
                official Anthropic client SDK.
              </li>
              <li>
                Treat model-requested tools as proposals. Validate and execute
                only allowlisted read-only server tools.
              </li>
              <li>
                Return structured evidence to Claude; repeat within limits, or
                stop.
              </li>
              <li>
                Persist the final answer, sources,
                conversation/tool/model/prompt versions and actual usage.
                Reconnect does not cause another paid run.
              </li>
            </ol>
          </Technical>
        </div>
        <div>
          <h3>Three evaluations. Three jobs.</h3>
          <ul className="evaluation-list">
            <li>
              <ShieldCheck aria-hidden="true" />
              <div>
                <strong>Guardrails</strong>
                <p>
                  Prompt injection, tool authority, sensitive data and approved
                  actions.
                </p>
              </div>
            </li>
            <li>
              <BookOpen aria-hidden="true" />
              <div>
                <strong>Answer quality</strong>
                <p>
                  T0/T1/T2 cases, groundedness, citations, numerical
                  faithfulness and bounded online sampling.
                </p>
              </div>
            </li>
            <li>
              <GitBranch aria-hidden="true" />
              <div>
                <strong>Predictive validity</strong>
                <p>
                  Chronological numerical evaluation, calibration and mature
                  outcomes. A language judge cannot certify returns.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="boundary-note">
        <LockKeyhole size={22} aria-hidden="true" />
        <p>
          Selected context leaves AWS when sent to Anthropic. Agents cannot
          trade, alter your financial ledger, promote a model or bypass a
          protected-action confirmation. Memory is scoped, versioned and
          correctable.
        </p>
      </div>
    </section>
  );
}

function Cloud() {
  const [network, setNetwork] = useState("N0");
  const options = {
    N0: {
      name: "Customer-VPC-unattached Lambda",
      text: "A baseline candidate for the public HTTPS integrations. The Lambda service provides outbound networking; no customer NAT Gateway is assumed. This does not remove authentication, encryption or IAM requirements.",
      path: "Lambda worker → HTTPS → Anthropic / data providers",
      limit:
        "Cheapest suitable region, service availability, auth/streaming compatibility and total costs still require evidence.",
    },
    N1: {
      name: "Split justified private work",
      text: "Use two-AZ private isolated subnets only for work that needs them. Keep external-provider workers unattached. S3 and DynamoDB gateway endpoints can support allowed private AWS data paths.",
      path: "Private job → scoped gateway endpoint → S3 / DynamoDB",
      limit:
        "Actual bootstrap/runtime access and any paid interface endpoints need proof. Managed services remain outside customer subnets.",
    },
    "N1-E": {
      name: "Conditional paid egress",
      text: "If all relevant workers must attach to the VPC, separately cost a public NAT/IGW route for external HTTPS. This is an unselected alternative, not a default in the budget.",
      path: "Private ENI → route table → NAT → IGW → external HTTPS",
      limit:
        "A public subnet does not give Lambda a public IP. Security groups do not filter DNS hostnames; gateway endpoints cannot reach Anthropic.",
    },
  };
  const n = options[network];
  return (
    <section className="section cloud" id="cloud">
      <Heading title="Cloud infrastructure, with the boundaries drawn.">
        AWS hosts the proposed application and records. Anthropic hosts Claude.
        The presentation you are reading is a private ChatGPT Site, not evidence
        that the AWS application has been deployed.
      </Heading>
      <div className="cloud-rail">
        <span>Browser / Apple device</span>
        <ChevronRight size={20} aria-hidden="true" />
        <span>Route 53 + CloudFront</span>
        <ChevronRight size={20} aria-hidden="true" />
        <span>Cognito + API Gateway</span>
        <ChevronRight size={20} aria-hidden="true" />
        <strong>FastAPI / Lambda</strong>
        <ChevronRight size={20} aria-hidden="true" />
        <span>Private stores + bounded jobs</span>
      </div>
      <div className="native-diagrams">
        <figure>
          <a href="assets/system.png" target="_blank" rel="noreferrer">
            <img
              src="assets/system.png"
              alt="Native Lucid diagram of the proposed full MP system, with client, authentication, import, ledger, ML, research, cost and trust boundaries"
              loading="lazy"
              width="2565"
              height="4932"
            />
          </a>
          <figcaption>
            <strong>The full system</strong>
            <span>Native Lucid page 4 · source version 2703</span>
            <a href="assets/system.png" target="_blank" rel="noreferrer">
              Open full-resolution diagram
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </figcaption>
        </figure>
        <figure>
          <a href="assets/network.png" target="_blank" rel="noreferrer">
            <img
              src="assets/network.png"
              alt="Native Lucid technical network options: unattached Lambda, optional two-AZ isolated private jobs and conditional NAT egress, with route/SG/ENI boundaries"
              loading="lazy"
              width="2416"
              height="4714"
            />
          </a>
          <figcaption>
            <strong>The network options</strong>
            <span>Native Lucid page 5 · source version 4333</span>
            <a href="assets/network.png" target="_blank" rel="noreferrer">
              Open full-resolution diagram
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </figcaption>
        </figure>
      </div>
      <div className="network-explorer">
        <div>
          <h3>
            A VPC is a network choice.
            <br />
            Owner authorisation is still required.
          </h3>
          <p>
            These are documented alternatives. None has been selected or
            provisioned.
          </p>
          <div
            className="network-tabs"
            role="group"
            aria-label="Network alternative"
          >
            {Object.keys(options).map((k) => (
              <button
                key={k}
                aria-pressed={network === k}
                onClick={() => setNetwork(k)}
                className={network === k ? "active" : ""}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
        <div className="network-detail" aria-live="polite">
          <h4>{n.name}</h4>
          <p>{n.text}</p>
          <code>{n.path}</code>
          <p className="caption">{n.limit}</p>
        </div>
      </div>
      <div className="architecture-choices">
        <Technical title="Streaming, durable work and long training jobs">
          <p>
            The intended SSE path is a bounded authenticated API Gateway REST
            streaming integration plus a compatible Python Lambda streaming
            adapter. Ordinary buffered ASGI handling is insufficient.
            Authorisation, CORS, heartbeat, disconnect billing and
            reconnect/replay need a real compatibility test; the sample
            process-local SSE route proves none of those controls.
          </p>
          <p>
            Durable work and delivery are separate: admit the job, record state,
            execute bounded stages and reconcile uncertain side effects.
            Workflow choice is open. Large ML training jobs do not automatically
            fit inside Lambda: compare portable job execution with selectively
            bounded SageMaker training. Both keep the same science and
            owner-promotion gate. No continuous ML endpoint is assumed.
          </p>
        </Technical>
        <External href={LINKS.lucid} className="text-link">
          Open the editable native Lucid architecture
        </External>
      </div>
    </section>
  );
}

function Operations() {
  return (
    <section className="section operations" id="operations">
      <Heading title="You should see the bill and the trail.">
        Cost visibility, guardrails and recovery belong to the first useful
        layer. They do not wait for a future admin portal.
      </Heading>
      <div className="operations-layout">
        <div className="budget-pane">
          <h3>
            £100<span>all-in monthly cash planning ceiling</span>
          </h3>
          <div
            className="budget-bar"
            role="img"
            aria-label="Planning allocation: 70 pounds operation and 30 pounds reserve, not actual spend"
          >
            <div>£70 operation</div>
            <div>£30 reserve</div>
          </div>
          <p className="caption">
            Planning allocation, not a quoted bill or measured spend. Includes
            dev + production AWS, data and Claude/evaluations; other relevant
            operating costs still need full-scope validation.
          </p>
          <ol className="cost-stops">
            <li>
              <strong>£60</strong>
              <span>Warn on forecast monthly cash spend</span>
            </li>
            <li>
              <strong>£75</strong>
              <span>Reduce optional work</span>
            </li>
            <li>
              <strong>£85</strong>
              <span>Pause new optional paid jobs</span>
            </li>
          </ol>
          <p>
            These controls preserve headroom. They cannot instantly stop every
            AWS charge.
          </p>
        </div>
        <div className="operations-copy">
          <h3>
            One charge.
            <br />
            Many useful views.
          </h3>
          <p>
            Show costs by local/dev/prod/shared, agent, model, feature and
            service. Those are views of the same usage, not extra bills.
          </p>
          <dl className="billing-times">
            <dt>During work</dt>
            <dd>Internal usage estimates and reserved maximum liability</dd>
            <dt>Every 6 hours</dt>
            <dd>
              Collect Anthropic billing reports, subject to account access
            </dd>
            <dt>Daily</dt>
            <dd>Collect AWS billing; source reports can still lag</dd>
          </dl>
          <p>
            The reported{" "}
            <strong>
              $200 monthly Anthropic organisation credit is unverified
            </strong>{" "}
            and shared. Show gross usage, applied credit and cash liability
            separately. Refuse uncovered calls when coverage cannot be
            established; no automatic paid fallback.
          </p>
          <Technical title="Budget admission and reconciliation">
            <p>
              Reserve a conservative maximum atomically before dispatch. Count
              concurrent reservations and ambiguous responses as liabilities.
              Dedupe retries and billing rows. Provider reports reconcile or
              replace estimates rather than being added again. Dashboard refresh
              uses cached aggregates instead of making a billing API call on
              every visit.
            </p>
          </Technical>
        </div>
      </div>
      <div className="audit-strip">
        <div>
          <h3>A trail you can investigate.</h3>
          <p>
            Carry business, request, run, trace and span IDs across UI, APIs,
            jobs, tools, records and notifications. Link retries, replays,
            source versions and approvals.
          </p>
        </div>
        <div>
          <h3>Retention with purpose.</h3>
          <p>
            Operational logs: 14 days. Rich traces: 30 days. Run summaries: 90
            days. Durable ledger, forecast and approval evidence has a separate
            policy. Originals: a 24-month renewable archive with owner controls.
          </p>
        </div>
        <div>
          <h3>Recovery that is proved.</h3>
          <p>
            Monthly focused exercises and change-triggered checks. Restore
            records, object versions, model lineage, outbox and costs together;
            verify deletion tombstones so recovery does not resurrect deleted
            data. RPO/RTO remain open.
          </p>
        </div>
      </div>
    </section>
  );
}

function DailyExperience() {
  return (
    <section className="section daily" id="experience">
      <div>
        <h2>
          Discovery first.
          <br />
          Your holdings, always in context.
        </h2>
        <p>
          The proposed app opens with a market/discovery dashboard. Holdings
          have a dedicated section; chat is close by. A short daily briefing
          focuses on priorities, changes, risks and upcoming events, with the
          evidence one level deeper.
        </p>
        <p>
          Use GBP for the portfolio overview and local currency for detail. Keep
          forecast horizons balanced. Loss views include decline from a prior
          peak and loss versus cost basis, with portfolio risk weighted more
          heavily.
        </p>
      </div>
      <div className="daily-timeline">
        <div>
          <span>07:30</span>
          <h3>Your UK-morning briefing</h3>
          <p>
            Europe/London, configurable and daylight-saving aware. Each market
            retains its own data timestamp.
          </p>
        </div>
        <div>
          <span>30 min</span>
          <h3>Supported risk monitoring</h3>
          <p>
            Refresh quotes and risk where permitted data supports it. Formal
            forecasts refresh daily.
          </p>
        </div>
        <div>
          <span>22–07</span>
          <h3>Quiet hours</h3>
          <p>
            22:00–07:00 Europe/London. Only separately defined, approved
            critical conditions can bypass them.
          </p>
        </div>
      </div>
      <Technical title="First-version experience and configurable inputs">
        <p>
          Planned channels: app/chat, native push and PWA push. Starting
          balanced warning/severe thresholds: portfolio 10%/20%, holding
          15%/25%. These are configurable policy inputs, not automatic buy/sell
          triggers. The combined ranking uses growth/protection/opportunity
          weights of 35%/40%/25%; exact scoring, windows, materiality,
          cooldowns, weekend policy and protected overrides remain to agree.
        </p>
        <p>
          Swift/SwiftUI owns the Apple product surfaces, secure cache and device
          integrations; React Native owns shell navigation and bridge contracts.
          Exact device coverage, including the earlier “Duo” reference, is
          unresolved. The architecture Site itself is neither a SvelteKit
          product PWA nor a native app.
        </p>
      </Technical>
    </section>
  );
}

function Delivery() {
  return (
    <section className="section delivery" id="delivery">
      <Heading title="Build in layers. Keep the evidence together.">
        The phase map is a planning sequence, not a claim that the system is
        already built. Ledger specification can come before platform planning;
        ledger implementation still depends on the platform.
      </Heading>
      <div className="phase-list">
        {PHASES.map(([id, title, text]) => (
          <details key={id}>
            <summary>
              <span>{id}</span>
              <strong>{title}</strong>
              <Plus size={19} aria-hidden="true" />
            </summary>
            <p>{text}</p>
          </details>
        ))}
      </div>
      <div className="delivery-two">
        <div>
          <h3>What exists today</h3>
          <p>
            A FastAPI starter with health/sample SSE, a static concept preview,
            synthetic market/import fixtures and this architecture presentation.
            They do not establish live authentication, durable business jobs,
            predictive performance or AWS readiness.
          </p>
          <p>
            Current GitHub checks cover backend, Codex tooling, static preview,
            workflow lint and Jira traceability. Future product gates must add
            the real web/native builds, regression/UI/security checks and
            deployment/recovery evidence as those components become executable.
          </p>
        </div>
        <div>
          <h3>What still needs agreement</h3>
          <ul>
            {OPEN_CHOICES.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
      <Technical title="CI/CD, environment and extension contracts">
        <p>
          Use issue-linked branches and PRs to main, required checks, reviewed
          IaC plans and separately authorised changes. The stored
          branch-protection policy is a desired configuration; the recorded
          GitHub-plan restriction means server enforcement is not certified. No
          deployment is performed by this presentation.
        </p>
        <p>
          Dev/prod require separate write authority, identity configuration,
          stores, queues and roles; separate accounts versus independently
          scoped resources remains an ADR. Local/dev fixtures are synthetic and
          currently local only. Never import MA account names or permissions.
        </p>
        <p>
          Future China, Taiwan, Hong Kong, continental Europe and themes such as
          solar/clean energy plug into versioned
          instrument/provider/feature/model/agent contracts. Expansion still
          needs rights, compatible evidence, incremental cost and owner
          approval. Mypaisa-agent is reference material, not a shared ledger or
          required runtime dependency.
        </p>
      </Technical>
    </section>
  );
}

class FilmBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="status">
        The story player could not load. Read the complete transcript below, or
        reload this page to try again.
      </p>
    ) : (
      this.props.children
    );
  }
}
function Story() {
  const { moving } = useContext(Context);
  const [loaded, setLoaded] = useState(false);
  return (
    <section className="section film" id="film">
      <div className="film-heading">
        <Heading title="The architecture, in 72 seconds.">
          A captioned Remotion story follows the same seven steps. Play it when
          you want the overview; use the transcript when you want to read at
          your own pace.
        </Heading>
      </div>
      {moving ? (
        <>
          {!loaded ? (
            <button className="film-cover" onClick={() => setLoaded(true)}>
              <span className="play-circle">
                <Play size={28} aria-hidden="true" />
              </span>
              <strong>Load the architecture story</strong>
              <span>
                72 seconds · captions in every scene · no audio or autoplay
              </span>
              <div className="film-cover-path">
                Evidence <ArrowRight size={18} /> Intelligence{" "}
                <ArrowRight size={18} /> Your decision
              </div>
            </button>
          ) : (
            <FilmBoundary>
              <Suspense
                fallback={
                  <p role="status">
                    Loading the story player… The transcript remains available
                    below.
                  </p>
                }
              >
                <Film motionEnabled={moving} />
              </Suspense>
            </FilmBoundary>
          )}
        </>
      ) : (
        <div className="film-static">
          <BookOpen size={25} aria-hidden="true" />
          <p>
            Motion is off. The complete story is available below. Enable motion
            in the header to load the optional player.
          </p>
        </div>
      )}
      <details className="transcript">
        <summary>
          Read the complete story transcript
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        <ol>
          {FILM_SCENES.map((s) => (
            <li key={s.number}>
              <h3>{s.title}</h3>
              <p>{s.caption}</p>
              <p className="caption">Evidence retained: {s.technical}</p>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}

function Sources() {
  return (
    <section className="section sources" id="sources">
      <Heading title="Follow the source, not just the story.">
        This atlas is a manually prepared snapshot of the MP plans on 1 November
        2026. Its interactive flows are explanatory companions to the native
        Lucid architecture. No live sync, cloud activity or model performance is
        implied.
      </Heading>
      <div className="source-links">
        {[
          ["Planning hub", LINKS.hub],
          ["Architecture blueprint", LINKS.architecture],
          ["Portfolio / import specification", LINKS.imports],
          ["Phased delivery plan", LINKS.phases],
          ["Technology decision matrix", LINKS.stack],
          ["Editable native Lucid diagrams", LINKS.lucid],
          ["Versioned source repository", LINKS.repo],
        ].map(([t, url]) => (
          <External href={url} key={t}>
            {t}
          </External>
        ))}
      </div>
      <p className="caption">
        Source pages may require their own sign-in. These links do not create
        connected-app integrations or grant access. Source hashes and
        native-export versions are recorded in the{" "}
        <a href="assets/provenance.json">atlas provenance manifest</a>.
      </p>
      <div className="source-footer">
        <p>
          Personal decision support.
          <br />
          No orders. No execution. Your decision.
        </p>
        <a href="/">
          Return to the original concept preview
          <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function App() {
  const reduced = useSystemReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [technical, setTechnical] = useState(false);
  const [active, setActive] = useState("journey");
  const moving = enabled && !reduced;
  useEffect(() => {
    const o = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-18% 0px -65% 0px" },
    );
    document.querySelectorAll("section[id]").forEach((s) => o.observe(s));
    return () => o.disconnect();
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = moving ? "on" : "off";
  }, [moving]);
  return (
    <Context.Provider value={{ moving, technical }}>
      <MotionConfig reducedMotion={moving ? "user" : "always"}>
        <a className="skip-link" href="#main">
          Skip to architecture
        </a>
        <header className="site-header">
          <a
            className="wordmark"
            href="/"
            aria-label="Mypaisaa original concept preview"
          >
            <span className="brand-glyph">m</span>
            <span>
              mypaisaa
              <span className="brand-subtitle">the architecture atlas</span>
            </span>
          </a>
          <nav aria-label="Architecture chapters">
            {[
              ["journey", "The story"],
              ["system", "The system"],
              ["science", "The science"],
              ["operations", "The controls"],
              ["sources", "Sources"],
            ].map(([id, t]) => (
              <a
                href={"#" + id}
                key={id}
                className={active === id ? "active" : ""}
              >
                {t}
              </a>
            ))}
          </nav>
          <div className="header-controls">
            <button
              aria-pressed={technical}
              onClick={() => setTechnical((v) => !v)}
              className={"mode-toggle " + (technical ? "active" : "")}
            >
              <Layers size={16} aria-hidden="true" />
              <span>{technical ? "Technical view" : "Story view"}</span>
            </button>
            <button
              className="motion-toggle"
              aria-pressed={moving}
              disabled={!!reduced}
              title={
                reduced
                  ? "Your system requests reduced motion"
                  : "Toggle explanatory motion"
              }
              onClick={() => setEnabled((v) => !v)}
            >
              {moving ? (
                <Pause size={16} aria-hidden="true" />
              ) : (
                <Play size={16} aria-hidden="true" />
              )}
              <span>
                {reduced
                  ? "Reduced motion"
                  : moving
                    ? "Pause motion"
                    : "Enable motion"}
              </span>
            </button>
          </div>
        </header>
        <main id="main">
          <section className="hero">
            <div className="hero-copy">
              <h1>
                From scattered data
                <br />
                to{" "}
                <span>
                  considered
                  <br />
                  decisions.
                </span>
              </h1>
              <p>
                Follow the architecture of an investment system that keeps the
                evidence, questions its own predictions and leaves the decision
                with you.
              </p>
              <div className="hero-actions">
                <a href="#journey" className="primary-button">
                  Take the journey
                  <ArrowRight size={19} aria-hidden="true" />
                </a>
                <a href="#system" className="text-button">
                  Explore the system
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </div>
              <div className="hero-status">
                <span>Proposed architecture</span>
                <span>Personal use</span>
                <span>No trading</span>
              </div>
            </div>
            <HeroMap />
            <div className="hero-bottom">
              <p>A rules + ML + LLM intelligence system</p>
              <span>US · UK · India first</span>
              <a href="#journey">
                Scroll to follow the evidence
                <ChevronDown size={16} aria-hidden="true" />
              </a>
            </div>
          </section>
          <div className="authority-strip">
            <ShieldCheck size={21} aria-hidden="true" />
            <p>
              Architecture proposal, not a deployed application. Detailed
              requirements, UX, cost validation and key technical choices remain
              open. All motion is illustrative.
            </p>
            <a href="#delivery">
              See what is agreed
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
          <Journey />
          <SystemMap />
          <Science />
          <Research />
          <Cloud />
          <DailyExperience />
          <Operations />
          <Story />
          <Delivery />
          <Sources />
        </main>
        <footer className="site-footer">
          <span>Mypaisaa Prediction</span>
          <span>Built to make evidence easier to understand.</span>
          <a href="#main">
            Back to the beginning
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </footer>
      </MotionConfig>
    </Context.Provider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
