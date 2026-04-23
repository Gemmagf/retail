"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Region } from "@/data/locations";

type Point = Record<string, number | string>;

type Props = {
  data: Point[];
  regions: Region[];
  colors: Record<Region, string>;
  weekLabel: string;
};

export function SalesByRegionChart({ data, regions, colors, weekLabel }: Props) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            {regions.map((r) => (
              <linearGradient key={r} id={`fill-${r}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[r]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={colors[r]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eaeae6" />
          <XAxis
            dataKey="week"
            tickFormatter={(w) => `${weekLabel} ${w}`}
            tick={{ fontSize: 11, fill: "#5b5b58" }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#5b5b58" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              border: "1px solid #e6e6e3",
              borderRadius: 8,
              background: "white",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
          {regions.map((r) => (
            <Area
              key={r}
              type="monotone"
              dataKey={r}
              stroke={colors[r]}
              strokeWidth={2}
              fill={`url(#fill-${r})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
