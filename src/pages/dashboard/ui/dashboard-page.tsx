export function DashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-xl bg-card shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">Total Users</h2>
          <p className="text-2xl font-bold mt-2">1,234</p>
        </div>
        <div className="p-6 border rounded-xl bg-card shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">Active Reports</h2>
          <p className="text-2xl font-bold mt-2">56</p>
        </div>
        <div className="p-6 border rounded-xl bg-card shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">Server Status</h2>
          <p className="text-2xl font-bold mt-2 text-green-500">Online</p>
        </div>
      </div>
    </div>
  );
}
