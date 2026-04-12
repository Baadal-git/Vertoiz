"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categoryColors = ["#2563EB", "#d4d4d4", "#a3a3a3", "#737373", "#525252"];
const progressColors = ["#2563EB", "#737373", "#444444"];

export function ViolationsByCategoryChart({
  data,
}: {
  data: Array<{ name: string; total: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Violations by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="name" stroke="#888888" tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "rgba(37,99,235,0.08)" }}
              contentStyle={{
                background: "#111111",
                border: "1px solid #1f1f1f",
                borderRadius: 16,
              }}
            />
            <Bar dataKey="total" radius={[12, 12, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function FixProgressChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fix Progress</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,220px)_1fr] lg:items-center">
        <div className="mx-auto h-56 w-full max-w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={60}
                outerRadius={84}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={progressColors[index % progressColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#111111",
                  border: "1px solid #1f1f1f",
                  borderRadius: 16,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: progressColors[index % progressColors.length] }}
                />
                <span className="text-sm text-white">{entry.name}</span>
              </div>
              <span className="font-mono text-sm text-muted-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
