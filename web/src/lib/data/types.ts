/** What the screens read. Every figure from the fake source is synthetic and says so. */
export interface Money {
  /** Exact pence as an integer; never a float (FIN contracts: exact money). */
  pence: number;
  currency: 'GBP';
}

export interface PortfolioTotal {
  total: Money;
  holdings: Money;
  cash: Money;
  /** When the figures were true, as the owner reads it. */
  asOf: string;
  /** Every figure from the fake source says so, and the screen labels it. */
  synthetic: true;
}

/** One holding, as Prism's sample draws it (docs/design/prism/index.html, const H). */
export interface Holding {
  name: string;
  ticker: string;
  /** Exchange MIC: XNAS, ARCX, XLON, XNSE. */
  venue: string;
  value: Money;
  /** Today's move, per cent. */
  dayPct: number;
  /** The illustrative forecast range, per cent: median, 80% (lo, hi) and 50% (lo50, hi50). */
  med: number;
  lo: number;
  hi: number;
  lo50: number;
  hi50: number;
  /** The ranked action as drawn; decision support, never an order. */
  action: 'Add' | 'Hold' | 'Pause' | 'Trim' | string;
  /** A Prism token naming the segment colour, e.g. --seg-ustech. */
  segColor: string;
  logo: string;
  /** Set when the price is late: the time of the last price, London. */
  staleAt?: string;
}

export interface Segment {
  name: string;
  mk: string;
  c: string;
  note: string;
  lead?: [string, string];
  gold?: boolean;
}

export interface AllocationSlice {
  name: string;
  /** A Prism token. */
  color: string;
  /** A percentage kept as text, so 17.0 prints as 17.0 (lesson 64). */
  pct: string;
}

export interface Portfolio extends PortfolioTotal {
  items: Holding[];
  segments: Record<string, Segment>;
  topFives: Record<string, [string, string, number, string, string][]>;
  allocation: AllocationSlice[];
}

export interface DataSource {
  readonly name: string;
  portfolioTotal(): Promise<PortfolioTotal>;
  portfolio(): Promise<Portfolio>;
}
