/** What the shell reads. Step 1 reads only the portfolio total; later steps add holdings, the journal and cost. */
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

export interface DataSource {
  readonly name: string;
  portfolioTotal(): Promise<PortfolioTotal>;
}
