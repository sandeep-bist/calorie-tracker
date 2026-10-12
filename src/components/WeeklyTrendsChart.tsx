import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Flame, Dumbbell, TrendingUp } from "lucide-react";
import { Meal, DailyTargets } from "../types";

interface WeeklyTrendsChartProps {
  meals: Meal[];
  targets: DailyTargets;
  selectedDate: string;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  dayName: string;
  calories: number;
  protein: number;
  targetCalories: number;
  targetProtein: number;
}

export const WeeklyTrendsChart: React.FC<WeeklyTrendsChartProps> = ({
  meals,
  targets,
  selectedDate,
}) => {
  const [metricView, setMetricView] = useState<"both" | "calories" | "protein">("both");

  // Calculate the 7 days ending at selectedDate
  const chartData = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const endDate = new Date(y, m - 1, d);

    const points: ChartDataPoint[] = [];

    for (let i = 6; i >= 0; i--) {
      const cur = new Date(endDate);
      cur.setDate(endDate.getDate() - i);

      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, "0");
      const day = String(cur.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const dayMeals = meals.filter((m) => m.date === dateStr);
      const totalCalories = dayMeals.reduce((sum, item) => sum + (item.calories || 0), 0);
      const totalProtein = dayMeals.reduce((sum, item) => sum + (item.protein || 0), 0);

      const dayName = cur.toLocaleDateString("en-US", { weekday: "narrow" }); // e.g. M, T, W, T, F, S, S
      const displayDate = cur.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });

      points.push({
        date: dateStr,
        displayDate,
        dayName,
        calories: totalCalories,
        protein: totalProtein,
        targetCalories: targets.calories,
        targetProtein: targets.protein,
      });
    }

    return points;
  }, [meals, targets, selectedDate]);

  // Averages over the 7 days
  const averages = useMemo(() => {
    const totalCal = chartData.reduce((acc, p) => acc + p.calories, 0);
    const totalPro = chartData.reduce((acc, p) => acc + p.protein, 0);
    return {
      calories: Math.round(totalCal / 7),
      protein: Math.round(totalPro / 7),
    };
  }, [chartData]);

  // Custom high-contrast Dark Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartDataPoint = payload[0].payload;
      return (
        <div className="bg-neutral-950/95 border border-neutral-800 rounded-xl p-2.5 shadow-2xl backdrop-blur-md font-mono text-xs space-y-1">
          <div className="text-neutral-400 text-[10px] pb-1 border-b border-neutral-800 flex justify-between gap-3">
            <span>{data.date}</span>
            <span className="font-semibold text-white">{data.dayName}</span>
          </div>

          {(metricView === "both" || metricView === "calories") && (
            <div className="flex items-center justify-between gap-4 text-emerald-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Flame className="w-3 h-3" /> Calories
              </span>
              <span className="font-bold">
                {data.calories}{" "}
                <span className="text-[10px] text-neutral-400 font-normal">
                  / {targets.calories}
                </span>
              </span>
            </div>
          )}

          {(metricView === "both" || metricView === "protein") && (
            <div className="flex items-center justify-between gap-4 text-sky-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Dumbbell className="w-3 h-3" /> Protein
              </span>
              <span className="font-bold">
                {data.protein}g{" "}
                <span className="text-[10px] text-neutral-400 font-normal">
                  / {targets.protein}g
                </span>
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-neutral-950 border border-neutral-900 rounded-2xl p-3.5 space-y-3 overflow-hidden shadow-lg">
      {/* Top Header: Title, Averages & Toggles */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider flex items-center gap-1.5">
              <span>7-Day Trends</span>
            </h3>
            <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-2">
              <span>
                Avg: <strong className="text-emerald-400">{averages.calories} kcal</strong>
              </span>
              <span>•</span>
              <span>
                <strong className="text-sky-400">{averages.protein}g P</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Metric Pill Toggle */}
        <div className="flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setMetricView("both")}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              metricView === "both"
                ? "bg-black text-white font-bold border border-neutral-700"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setMetricView("calories")}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              metricView === "calories"
                ? "bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-800/80"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            kcal
          </button>
          <button
            type="button"
            onClick={() => setMetricView("protein")}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              metricView === "protein"
                ? "bg-sky-950/80 text-sky-400 font-bold border border-sky-800/80"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Protein
          </button>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div className="w-full h-44 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1f2937"
              vertical={false}
              opacity={0.6}
            />
            <XAxis
              dataKey="dayName"
              stroke="#525252"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "#262626" }}
              fontFamily="monospace"
            />

            {/* Left Y-Axis for Calories */}
            {(metricView === "both" || metricView === "calories") && (
              <YAxis
                yAxisId="calories"
                stroke="#059669"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                fontFamily="monospace"
                domain={[0, (dataMax: number) => Math.max(dataMax, targets.calories) * 1.15]}
                tickFormatter={(val) => `${val}`}
              />
            )}

            {/* Right Y-Axis for Protein */}
            {(metricView === "both" || metricView === "protein") && (
              <YAxis
                yAxisId="protein"
                orientation="right"
                stroke="#0284c7"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                fontFamily="monospace"
                domain={[0, (dataMax: number) => Math.max(dataMax, targets.protein) * 1.2]}
                tickFormatter={(val) => `${val}g`}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            {/* Target Baseline Reference Lines */}
            {(metricView === "both" || metricView === "calories") && (
              <ReferenceLine
                yAxisId="calories"
                y={targets.calories}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
            )}

            {(metricView === "both" || metricView === "protein") && (
              <ReferenceLine
                yAxisId="protein"
                y={targets.protein}
                stroke="#38bdf8"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
            )}

            {/* Calories Line */}
            {(metricView === "both" || metricView === "calories") && (
              <Line
                yAxisId="calories"
                type="monotone"
                dataKey="calories"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#10b981", stroke: "#000", strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                name="Calories"
              />
            )}

            {/* Protein Line */}
            {(metricView === "both" || metricView === "protein") && (
              <Line
                yAxisId="protein"
                type="monotone"
                dataKey="protein"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#38bdf8", stroke: "#000", strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: "#38bdf8", stroke: "#fff", strokeWidth: 2 }}
                name="Protein"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1 pt-0.5 border-t border-neutral-900/60">
        <div className="flex items-center gap-3">
          {(metricView === "both" || metricView === "calories") && (
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Calories ({targets.calories} kcal goal)
            </span>
          )}
          {(metricView === "both" || metricView === "protein") && (
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Protein ({targets.protein}g goal)
            </span>
          )}
        </div>
        <span className="text-neutral-400">Past 7 Days</span>
      </div>
    </div>
  );
};
