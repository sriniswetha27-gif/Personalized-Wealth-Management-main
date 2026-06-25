import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  DollarSign,
  LineChart,
  LogOut,
  RefreshCcw,
  Search,
  Target,
  TrendingUp
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { HoldingForm } from "../components/HoldingForm";
import { MetricCard } from "../components/MetricCard";
import { PortfolioTable } from "../components/PortfolioTable";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { Goal, PortfolioSummary, Recommendation, SimulationPoint } from "../types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type QuoteState = {
  symbol: string;
  price: number;
  source: string;
} | null;

export function Dashboard() {
  const { token, user, signOut } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [simulation, setSimulation] = useState<SimulationPoint[]>([]);
  const [quote, setQuote] = useState<QuoteState>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      const [portfolioResult, goalsResult, recommendationResult] = await Promise.all([
        api.portfolio(token),
        api.goals(token),
        api.recommendations(token)
      ]);
      setPortfolio(portfolioResult);
      setGoals(goalsResult);
      setRecommendations(recommendationResult.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [token]);

  useEffect(() => {
    api
      .simulate({
        initial_amount: 10000,
        monthly_contribution: 750,
        annual_return_pct: 8,
        annual_volatility_pct: 12,
        years: 15
      })
      .then((response) => setSimulation(response.points))
      .catch(() => setSimulation([]));
  }, []);

  const allocation = useMemo(() => {
    const holdings = portfolio?.holdings ?? [];
    const totals = holdings.reduce<Record<string, number>>((acc, holding) => {
      acc[holding.asset_class] = (acc[holding.asset_class] ?? 0) + holding.market_value;
      return acc;
    }, {});
    return Object.entries(totals).map(([assetClass, value]) => ({ assetClass, value: Math.round(Number(value)) }));
  }, [portfolio]);

  async function addHolding(payload: Record<string, unknown>) {
    if (!token) return;
    await api.addHolding(token, payload);
    await refresh();
  }

  async function addGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    await api.addGoal(token, {
      name: String(form.get("name")),
      target_amount: Number(form.get("target_amount")),
      current_amount: Number(form.get("current_amount")),
      target_date: String(form.get("target_date")),
      priority: String(form.get("priority"))
    });
    event.currentTarget.reset();
    await refresh();
  }

  async function runSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await api.simulate({
      initial_amount: Number(form.get("initial_amount")),
      monthly_contribution: Number(form.get("monthly_contribution")),
      annual_return_pct: Number(form.get("annual_return_pct")),
      annual_volatility_pct: Number(form.get("annual_volatility_pct")),
      years: Number(form.get("years"))
    });
    setSimulation(response.points);
  }

  async function lookupQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const symbol = String(form.get("symbol")).trim();
    if (!symbol) return;
    setQuote(await api.quote(symbol));
  }

  return (
    <main className="min-h-screen bg-[#f6f8f9] text-ink">
      <header className="border-b border-slateLine bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ocean">PWMA</p>
            <h1 className="text-2xl font-bold">Personalized Wealth Management</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-slateLine bg-slate-50 px-3 py-2 text-sm">
              {user?.full_name} - {user?.risk_profile}
            </span>
            <button className="btn-secondary" onClick={refresh} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button className="btn-secondary" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6">
        {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard
            label="Market value"
            value={money.format(portfolio?.total_market_value ?? 0)}
            tone="ocean"
            icon={DollarSign}
          />
          <MetricCard
            label="Cost basis"
            value={money.format(portfolio?.total_cost_basis ?? 0)}
            tone="amber"
            icon={BarChart3}
          />
          <MetricCard
            label="Unrealized gain"
            value={money.format(portfolio?.total_unrealized_gain ?? 0)}
            tone={(portfolio?.total_unrealized_gain ?? 0) >= 0 ? "mint" : "coral"}
            icon={TrendingUp}
          />
          <MetricCard label="Active goals" value={String(goals.length)} tone="mint" icon={Target} />
        </section>

        <HoldingForm onAdd={addHolding} />
        <PortfolioTable holdings={portfolio?.holdings ?? []} />

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Wealth Forecast</h2>
              <LineChart className="h-5 w-5 text-ocean" />
            </div>
            <form onSubmit={runSimulation} className="mb-4 grid gap-3 md:grid-cols-5">
              <input className="field" name="initial_amount" type="number" defaultValue="10000" min="0" />
              <input className="field" name="monthly_contribution" type="number" defaultValue="750" min="0" />
              <input className="field" name="annual_return_pct" type="number" defaultValue="8" step="0.1" />
              <input className="field" name="annual_volatility_pct" type="number" defaultValue="12" min="0" step="0.1" />
              <button className="btn-primary">
                <Activity className="h-4 w-4" />
                Simulate
              </button>
              <input className="field md:col-span-1" name="years" type="number" defaultValue="15" min="1" max="60" />
            </form>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={simulation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9e0e6" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`} />
                  <Tooltip formatter={(value) => money.format(Number(value))} />
                  <Line type="monotone" dataKey="conservative_value" stroke="#ee6c4d" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="projected_value" stroke="#247ba0" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="optimistic_value" stroke="#2fbf71" strokeWidth={2} dot={false} />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel p-4">
            <h2 className="mb-4 text-lg font-bold">Allocation</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={allocation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9e0e6" />
                  <XAxis dataKey="assetClass" />
                  <YAxis tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`} />
                  <Tooltip formatter={(value) => money.format(Number(value))} />
                  <Area dataKey="value" stroke="#247ba0" fill="#247ba0" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="panel p-4">
            <h2 className="mb-4 text-lg font-bold">Goals</h2>
            <form onSubmit={addGoal} className="mb-4 grid gap-3 md:grid-cols-2">
              <input className="field" name="name" placeholder="Goal name" required />
              <input className="field" name="target_amount" type="number" placeholder="Target amount" min="1" required />
              <input className="field" name="current_amount" type="number" placeholder="Current amount" min="0" defaultValue="0" />
              <input className="field" name="target_date" type="date" required />
              <select className="field" name="priority" defaultValue="medium">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button className="btn-primary">Add goal</button>
            </form>
            <div className="grid gap-3">
              {goals.map((goal) => (
                <div key={goal.id} className="rounded-md border border-slateLine p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{goal.name}</p>
                    <span className="text-sm text-slate-500">{goal.progress_pct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-mint" style={{ width: `${Math.min(goal.progress_pct, 100)}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {money.format(goal.current_amount)} of {money.format(goal.target_amount)} by {goal.target_date}
                  </p>
                </div>
              ))}
              {!goals.length && <p className="text-sm text-slate-500">Create goals to track target progress.</p>}
            </div>
          </article>

          <article className="panel p-4">
            <h2 className="mb-4 text-lg font-bold">Recommendations</h2>
            <div className="grid gap-3">
              {recommendations.map((item) => (
                <div key={`${item.title}-${item.priority}`} className="rounded-md border border-slateLine p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.title}</p>
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold uppercase">{item.priority}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.rationale}</p>
                  <p className="mt-2 text-sm font-medium text-ink">{item.action}</p>
                </div>
              ))}
            </div>

            <form onSubmit={lookupQuote} className="mt-5 flex gap-2">
              <input className="field" name="symbol" placeholder="Lookup symbol, e.g. AAPL" />
              <button className="btn-secondary" title="Search quote">
                <Search className="h-4 w-4" />
              </button>
            </form>
            {quote && (
              <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm">
                {quote.symbol}: <strong>{money.format(quote.price)}</strong> via {quote.source}
              </p>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
