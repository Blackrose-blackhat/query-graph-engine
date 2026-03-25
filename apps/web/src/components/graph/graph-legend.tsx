"use client";

const LEGEND_ITEMS = [
  { label: "Customer", color: "#6366f1" },
  { label: "Order", color: "#f59e0b" },
  { label: "Product", color: "#10b981" },
  { label: "Delivery", color: "#3b82f6" },
  { label: "Invoice", color: "#ef4444" },
  { label: "Payment", color: "#14b8a6" },
  { label: "Address", color: "#f97316" },
  { label: "Order Item", color: "#8b5cf6" },
];

export function GraphLegend() {
  return (
    <div className="flex flex-wrap gap-3 px-4 py-2">
      {LEGEND_ITEMS.map(({ label, color }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          {label}
        </div>
      ))}
    </div>
  );
}
