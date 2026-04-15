import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Users, AlertTriangle, PawPrint, CheckCircle2, UserPlus, Bell } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

type Timeframe = "TODAY" | "WEEKLY" | "MONTHLY";

const generateMockData = (timeframe: Timeframe) => {
  const points = timeframe === "TODAY" ? 24 : timeframe === "WEEKLY" ? 7 : 30;
  return Array.from({ length: points }).map((_, i) => ({
    name: timeframe === "TODAY" ? `${i}h` : timeframe === "WEEKLY" ? `Day ${i + 1}` : `D${i + 1}`,
    notices: Math.floor(Math.random() * (timeframe === "MONTHLY" ? 50 : 10)) + 1,
    reports: Math.floor(Math.random() * (timeframe === "MONTHLY" ? 20 : 5)),
  }));
};

export function DashboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("WEEKLY");
  const chartData = useMemo(() => generateMockData(timeframe), [timeframe]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">
            Monitor real-time service operations.
          </p>
        </div>
        <select 
          className="p-2 border rounded-md bg-transparent"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as Timeframe)}
        >
          <option value="TODAY">Today</option>
          <option value="WEEKLY">This Week</option>
          <option value="MONTHLY">This Month</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <SummaryCard
          title="Reported Notices"
          value={timeframe === "TODAY" ? "12" : "56"}
          icon={AlertTriangle}
          alert
        />
        <SummaryCard
          title="Resolved Notices"
          value={timeframe === "TODAY" ? "4" : "120"}
          icon={CheckCircle2}
        />
        <SummaryCard
          title="User Reports"
          value={timeframe === "TODAY" ? "3" : "45"}
          icon={Bell}
        />
        <SummaryCard
          title="Total Users"
          value="12,450"
          icon={Users}
        />
        <SummaryCard
          title="New Signups"
          value={timeframe === "TODAY" ? "21" : "345"}
          icon={UserPlus}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border rounded-xl bg-card shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Chart: Reported & Resolved (Timeline)</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="notices"
                  name="Notices"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 border rounded-xl bg-card shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Recent Priority Items</h2>
          <div className="flex-1 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border rounded-lg flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">Target: Notice #10{i}</p>
                    {i === 1 && <Badge variant="destructive" className="text-[10px] h-4">Priority (10+)</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Reported for spam. Needs immediate attention.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, alert }: { title: string; value: string; icon: React.ElementType; alert?: boolean; }) {
  return (
    <div className={`p-5 border rounded-xl bg-card shadow-sm flex flex-col ${alert ? 'border-destructive/20' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <div className={`p-2 rounded-full ${alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
