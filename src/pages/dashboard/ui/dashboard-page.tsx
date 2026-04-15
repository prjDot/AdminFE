import { useMemo } from "react";
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
import { Users, AlertTriangle, PawPrint, CheckCircle2 } from "lucide-react";

const generateMockData = () => {
  return Array.from({ length: 7 }).map((_, i) => ({
    name: `Day ${i + 1}`,
    notices: Math.floor(Math.random() * 50) + 10,
    reports: Math.floor(Math.random() * 20),
  }));
};

export function DashboardPage() {
  const chartData = useMemo(() => generateMockData(), []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitor key metrics for the PawGen service.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Users"
          value="12,450"
          icon={Users}
          trend="+12%"
          trendLabel="from last month"
        />
        <SummaryCard
          title="Active Notices"
          value="3,210"
          icon={PawPrint}
          trend="+5%"
          trendLabel="from last month"
        />
        <SummaryCard
          title="Unresolved Reports"
          value="45"
          icon={AlertTriangle}
          trend="-2%"
          trendLabel="from last week"
          alert
        />
        <SummaryCard
          title="Resolved Cases"
          value="892"
          icon={CheckCircle2}
          trend="+18%"
          trendLabel="from last month"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="p-6 border rounded-xl bg-card shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4">New Notices (Last 7 Days)</h2>
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
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="p-6 border rounded-xl bg-card shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Reports Received (Last 7 Days)</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar
                  dataKey="reports"
                  fill="hsl(var(--destructive))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  alert,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  trendLabel: string;
  alert?: boolean;
}) {
  return (
    <div className="p-6 border rounded-xl bg-card shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <div className={`p-2 rounded-full ${alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={trend.startsWith("+") ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
            {trend}
          </span>{" "}
          {trendLabel}
        </p>
      </div>
    </div>
  );
}
