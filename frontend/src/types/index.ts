export type User = {
  id: number;
  email: string;
  full_name: string;
  risk_profile: string;
};

export type Holding = {
  id: number;
  symbol: string;
  name?: string;
  quantity: number;
  average_cost: number;
  asset_class: string;
};

export type HoldingValuation = Holding & {
  latest_price: number;
  market_value: number;
  cost_basis: number;
  unrealized_gain: number;
  unrealized_gain_pct: number;
};

export type PortfolioSummary = {
  total_market_value: number;
  total_cost_basis: number;
  total_unrealized_gain: number;
  total_unrealized_gain_pct: number;
  holdings: HoldingValuation[];
};

export type Goal = {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: string;
  progress_pct: number;
};

export type SimulationPoint = {
  year: number;
  projected_value: number;
  conservative_value: number;
  optimistic_value: number;
};

export type Recommendation = {
  title: string;
  rationale: string;
  action: string;
  priority: string;
};
