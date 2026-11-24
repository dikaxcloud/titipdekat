"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency, formatCurrency, formatNumber } from "@/lib/utils";
import type { SalesPoint } from "@/lib/calculations";

interface SalesChartProps {
  data: SalesPoint[];
  height?: number;
}

export function SalesChart({ data, height = 260 }: SalesChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22a173" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#22a173" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e1e9e4"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={22}
            tick={{ fontSize: 11, fill: "#5b7067" }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={66}
            tick={{ fontSize: 11, fill: "#5b7067" }}
            tickFormatter={(value) => formatCompactCurrency(Number(value))}
          />
          <Tooltip
            cursor={{ stroke: "#b0e9cf", strokeWidth: 1.5 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e1e9e4",
              boxShadow: "0 8px 24px rgba(16,35,28,0.08)",
              fontSize: 12,
              fontFamily: "var(--font-inter), sans-serif",
            }}
            formatter={(value, _name, item) => {
              const units = item?.payload?.units ?? 0;
              return [
                `${formatCurrency(Number(value))} · ${formatNumber(units)} pcs`,
                "Penjualan",
              ];
            }}
            labelFormatter={(label) => `Tanggal ${label}`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#12855f"
            strokeWidth={2.5}
            fill="url(#salesFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
