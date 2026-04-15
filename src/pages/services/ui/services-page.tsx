import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ServerCrash, Image as ImageIcon, Activity, RefreshCw } from "lucide-react";

export function ServicesPage() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">External Services & API</h1>
        <p className="text-muted-foreground mt-2">
          Monitor national animal shelter API integration and photo analysis queue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Status Panel */}
        <div className="border rounded-xl bg-card shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Shelter API Status</h2>
            </div>
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">Connected</Badge>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Endpoint</span>
              <span className="font-mono">openapi.animal.go.kr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Sync</span>
              <span>10 mins ago</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sync Rate</span>
              <span>Every 1 hour</span>
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2">
            <RefreshCw className="w-4 h-4" /> Force Sync Now
          </Button>
        </div>

        {/* Media Analysis Queue */}
        <div className="border rounded-xl bg-card shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Photo Analysis Queue</h2>
            </div>
            <Badge variant="secondary">3 Pending</Badge>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Job #102{i}</p>
                    <p className="text-xs text-muted-foreground">Failed 5 mins ago</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary">Retry</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Error Logs */}
        <div className="md:col-span-2 border rounded-xl bg-card shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <ServerCrash className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-semibold">Recent API Failures</h2>
          </div>
          <div className="rounded-md border">
            <div className="p-4 flex items-center justify-center text-sm text-muted-foreground h-32">
              No recent errors logged. Network is healthy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
