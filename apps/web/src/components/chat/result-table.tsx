"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatValue } from "@/lib/utils";

interface ResultTableProps {
  data: Record<string, unknown>[];
}

export function ResultTable({ data }: ResultTableProps) {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const displayRows = data.slice(0, 10);

  return (
    <div className="mt-2 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col} className="text-xs h-8 px-2">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayRows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col} className="text-xs py-1.5 px-2">
                  {formatValue(row[col])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length > 10 && (
        <p className="text-xs text-muted-foreground py-1.5 px-2 border-t">
          Showing 10 of {data.length} rows
        </p>
      )}
    </div>
  );
}
