"use client";

import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react";
import { createRenderer } from "@json-render/react";
import { z } from "zod";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the component catalog spec
export const catalog = defineCatalog(schema, {
  components: {
    DataTable: {
      props: z.object({
        columns: z.array(z.string()),
        rows: z.array(z.array(z.any())),
      }),
    },
    MetricCard: {
      props: z.object({
        title: z.string(),
        value: z.union([z.string(), z.number()]),
      }),
    },
    BarChart: {
      props: z.object({
        data: z.array(z.record(z.any())),
        xAxisKey: z.string(),
        barKey: z.string(),
      }),
    },
  },
  actions: {},
});

// Create the renderer with actual React components
export const JsonUIRenderer = createRenderer(catalog, {
  DataTable: ({ element }) => {
    const { columns, rows } = element.props as {
      columns: string[];
      rows: any[][];
    };
    if (!rows || rows.length === 0) return null;

    const displayRows = rows.slice(0, 10);

    return (
      <div className="mt-4 overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns?.map((col: string, i: number) => (
                <TableHead key={i} className="text-xs font-semibold h-9 px-3">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows?.map((row: any[], i: number) => (
              <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                {row.map((cell: any, j: number) => (
                  <TableCell key={j} className="text-xs py-2 px-3">
                    {String(cell ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length > 10 && (
          <div className="text-xs text-muted-foreground py-2 px-3 border-t bg-muted/20">
            Showing 10 of {rows.length} rows
          </div>
        )}
      </div>
    );
  },
  MetricCard: ({ element }) => {
    const { title, value } = element.props as {
      title: string;
      value: string | number;
    };
    return (
      <Card className="mt-4 shadow-sm border-primary/20 bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-primary">
            {value}
          </div>
        </CardContent>
      </Card>
    );
  },
  BarChart: ({ element }) => {
    const { data, xAxisKey, barKey } = element.props as {
      data: any[];
      xAxisKey: string;
      barKey: string;
    };
    if (!data || data.length === 0) return null;

    // Calculate max value for relative bar widths
    const maxValue = Math.max(...data.map((d: any) => Number(d[barKey]) || 0));

    return (
      <Card className="mt-4 shadow-sm border bg-card/50">
        <CardHeader className="pb-2 bg-muted/30 border-b">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {barKey} by {xAxisKey}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {data.map((d: any, i: number) => {
              const val = Number(d[barKey]) || 0;
              const percentage = maxValue > 0 ? (val / maxValue) * 100 : 0;

              return (
                <div key={i} className="flex items-center gap-3 group">
                  <div
                    className="w-24 truncate text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors"
                    title={String(d[xAxisKey])}
                  >
                    {d[xAxisKey]}
                  </div>
                  <div className="flex-1 h-5 bg-secondary/50 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-primary/80 group-hover:bg-primary transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${Math.max(2, percentage)}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-bold tabular-nums">
                    {val}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  },
});
