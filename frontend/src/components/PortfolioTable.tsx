import type { HoldingValuation } from "../types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function PortfolioTable({ holdings }: { holdings: HoldingValuation[] }) {
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slateLine px-4 py-3">
        <h2 className="text-lg font-bold">Portfolio</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["Symbol", "Quantity", "Avg Cost", "Latest", "Market Value", "Gain"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={holding.id} className="border-t border-slateLine">
                <td className="px-4 py-3">
                  <span className="font-bold">{holding.symbol}</span>
                  <span className="ml-2 text-slate-500">{holding.name}</span>
                </td>
                <td className="px-4 py-3">{holding.quantity}</td>
                <td className="px-4 py-3">{money.format(holding.average_cost)}</td>
                <td className="px-4 py-3">{money.format(holding.latest_price)}</td>
                <td className="px-4 py-3 font-semibold">{money.format(holding.market_value)}</td>
                <td className={`px-4 py-3 font-semibold ${holding.unrealized_gain >= 0 ? "text-mint" : "text-coral"}`}>
                  {money.format(holding.unrealized_gain)} ({holding.unrealized_gain_pct}%)
                </td>
              </tr>
            ))}
            {!holdings.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  Add holdings to start live portfolio valuation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
