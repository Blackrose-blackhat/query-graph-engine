import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatValue(val: unknown): string {
  if (typeof val === "string") {
    // Check if it's an ISO date string (e.g., "2023-01-01" or "2025-04-02T00:00:00.000Z")
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/;
    if (isoDateRegex.test(val)) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toISOString().replace("T", " ").substring(0, 19) + " UTC";
      }
    }
  }
  return String(val ?? "");
}
