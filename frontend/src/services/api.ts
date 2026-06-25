import type { Goal, PortfolioSummary, Recommendation, SimulationPoint, User } from "../types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:8000" : "")
).replace(/\/$/, "");

type RequestOptions = RequestInit & { token?: string | null };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    const detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    throw new Error(detail || `Request failed (${response.status})`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const api = {
  register(payload: { email: string; full_name: string; password: string; risk_profile: string }) {
    return request<User>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
  },
  async login(email: string, password: string) {
    const form = new FormData();
    form.append("username", email);
    form.append("password", password);
    return request<{ access_token: string; token_type: string }>("/api/auth/login", { method: "POST", body: form });
  },
  me(token: string) {
    return request<User>("/api/auth/me", { token });
  },
  portfolio(token: string) {
    return request<PortfolioSummary>("/api/portfolio/summary", { token });
  },
  holdings(token: string) {
    return request("/api/portfolio/holdings", { token });
  },
  addHolding(token: string, payload: Record<string, unknown>) {
    return request("/api/portfolio/holdings", { method: "POST", token, body: JSON.stringify(payload) });
  },
  goals(token: string) {
    return request<Goal[]>("/api/goals", { token });
  },
  addGoal(token: string, payload: Record<string, unknown>) {
    return request<Goal>("/api/goals", { method: "POST", token, body: JSON.stringify(payload) });
  },
  simulate(payload: Record<string, unknown>) {
    return request<{ points: SimulationPoint[]; final_projected_value: number }>("/api/planning/simulate", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  recommendations(token: string) {
    return request<{ risk_profile: string; recommendations: Recommendation[] }>("/api/planning/recommendations", { token });
  },
  quote(symbol: string) {
    return request<{ symbol: string; price: number; source: string }>(`/api/market/quote/${symbol}`);
  }
};
