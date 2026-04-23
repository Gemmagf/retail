"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { region: string; weeksCover: number; color: string };

type Props = {
  data: Point[];
};

export function StockByRegionChart({ data }: Props) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eaeae6" vertical={false} />
          <XAxis dataKey="region" tick={{ fontSize: 12, fill: "#5b5b58" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#5b5b58" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              border: "1px solid #e6e6e3",
              borderRadius: 8,
              background: "white",
            }}
            formatter={(v) => [`${Number(v).toFixed(1)} w`, "Cover"]}
          />
          <Bar dataKey="weeksCover" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
