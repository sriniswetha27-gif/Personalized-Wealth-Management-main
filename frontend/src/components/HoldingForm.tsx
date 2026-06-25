import { FormEvent } from "react";
import { Plus } from "lucide-react";

export function HoldingForm({ onAdd }: { onAdd: (payload: Record<string, unknown>) => Promise<void> }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await onAdd({
      symbol: String(form.get("symbol")).toUpperCase(),
      name: String(form.get("name")),
      quantity: Number(form.get("quantity")),
      average_cost: Number(form.get("average_cost")),
      asset_class: String(form.get("asset_class"))
    });
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="panel grid gap-3 p-4 md:grid-cols-5">
      <input className="field" name="symbol" placeholder="Symbol" required />
      <input className="field" name="name" placeholder="Name" />
      <input className="field" name="quantity" type="number" min="0.01" step="0.01" placeholder="Qty" required />
      <input className="field" name="average_cost" type="number" min="0" step="0.01" placeholder="Avg cost" required />
      <div className="flex gap-2">
        <select className="field" name="asset_class" defaultValue="equity">
          <option value="equity">Equity</option>
          <option value="bond">Bond</option>
          <option value="cash">Cash</option>
          <option value="fund">Fund</option>
        </select>
        <button className="btn-primary shrink-0" title="Add holding">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
