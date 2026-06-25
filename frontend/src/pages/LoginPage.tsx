import { FormEvent, useState } from "react";
import { LockKeyhole, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await signIn(String(form.get("email")), String(form.get("password")));
      } else {
        await signUp({
          email: String(form.get("email")),
          full_name: String(form.get("full_name")),
          password: String(form.get("password")),
          risk_profile: String(form.get("risk_profile"))
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8f9] px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slateLine bg-white shadow-soft md:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-ink p-8 text-white md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-mint">DUDE wealth platform</p>
          <h1 className="mt-5 max-w-xl text-4xl font-bold leading-tight md:text-5xl">
            Personalized Wealth Management
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/78">
            Track portfolio value, plan goals, run wealth simulations, and convert market data into focused next actions.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            {["Live valuation", "Goal tracking", "Forecasts", "JWT security"].map((item) => (
              <div key={item} className="rounded-md border border-white/15 bg-white/8 px-3 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 md:p-10">
          <div className="mb-6 inline-flex rounded-md border border-slateLine bg-slate-50 p-1">
            <button type="button" className={`btn px-4 ${mode === "login" ? "bg-white shadow-sm" : ""}`} onClick={() => setMode("login")}>
              <LockKeyhole className="h-4 w-4" /> Login
            </button>
            <button type="button" className={`btn px-4 ${mode === "register" ? "bg-white shadow-sm" : ""}`} onClick={() => setMode("register")}>
              <UserPlus className="h-4 w-4" /> Register
            </button>
          </div>
          <div className="space-y-4">
            {mode === "register" && <input className="field" name="full_name" placeholder="Full name" required />}
            <input className="field" name="email" type="email" placeholder="Email" required />
            <input className="field" name="password" type="password" placeholder="Password" minLength={8} required />
            {mode === "register" && (
              <select className="field" name="risk_profile" defaultValue="moderate">
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            )}
          </div>
          {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="btn-primary mt-6 w-full" disabled={busy}>
            {busy ? "Please wait" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
