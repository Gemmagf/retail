"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = {
  week: number;
  actual?: number;
  forecast?: number;
  low?: number;
  high?: number;
  spend?: number;
};

type Props = {
  data: Point[];
  labels: { actual: string; forecast: string; band: string; spend: string; week: string };
  primaryColor: string;
};

export function ForecastChart({ data, labels, primaryColor }: Props) {
  const merged = data.map((d) => ({
    ...d,
    band: d.high !== undefined && d.low !== undefined ? [d.low, d.high] : undefined,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={merged} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eaeae6" />
          <XAxis
            dataKey="week"
            tickFormatter={(w) => `${labels.week} ${w}`}
            tick={{ fontSize: 11, fill: "#5b5b58" }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: "#5b5b58" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "#5b5b58" }}
            axisLine={false}
            tickLine={false}
            width={50}
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
          <Bar
            yAxisId="right"
            dataKey="spend"
            name={labels.spend}
            fill="#ff5b04"
            opacity={0.25}
            barSize={10}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="band"
            name={labels.band}
            stroke="none"
            fill={primaryColor}
            fillOpacity={0.15}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="actual"
            name={labels.actual}
            stroke={primaryColor}
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="forecast"
            name={labels.forecast}
            stroke={primaryColor}
            strokeWidth={2.5}
            strokeDasharray="6 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
