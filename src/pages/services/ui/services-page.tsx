import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Server, Database, Image as ImageIcon, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { toast } from "sonner";

type StatusVariant = "operational" | "degraded" | "outage" | "maintenance";

interface ServiceBlock {
  id: string;
  name: string;
  status: StatusVariant;
  uptime: string;
  latency: string;
  icon: React.ElementType;
}

const mockServices: ServiceBlock[] = [
  { id: "api", name: "Core API Server", status: "operational", uptime: "99.98%", latency: "42ms", icon: Server },
  { id: "db", name: "Application Database", status: "operational", uptime: "99.99%", latency: "12ms", icon: Database },
  { id: "media", name: "Media Processing Queue", status: "degraded", uptime: "98.50%", latency: "1,200ms", icon: ImageIcon },
];

const mockTimeline = [
  { time: "10:45 AM", event: "Media Processing Queue experienced high latency due to load.", status: "degraded" },
  { time: "09:00 AM", event: "Routine database backup completed.", status: "operational" },
  { time: "Yesterday", event: "Brief API outage resolved (Duration: 4m).", status: "outage" },
];

export function ServicesPage() {
  const { t } = useTranslation();
  const [globalStatus, setGlobalStatus] = useState<StatusVariant>("degraded");
  
  // Sheet drill-down state
  const [selectedService, setSelectedService] = useState<ServiceBlock | null>(null);

  const getStatusColor = (s: StatusVariant) => {
    switch (s) {
      case "operational": return "bg-emerald-500";
      case "degraded": return "bg-amber-500";
      case "outage": return "bg-destructive";
      case "maintenance": return "bg-blue-500";
      default: return "bg-secondary";
    }
  };

  const overrideStatus = () => {
    toast.success("Global status manually overridden to Partial Outage");
    setGlobalStatus("degraded");
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("services.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("services.description")}
          </p>
        </div>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {t("services.manualOverride")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("services.manualOverride")}</DialogTitle>
                <DialogDescription>
                  Force a system status update for testing or manual announcement.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Service</label>
                  <Select defaultValue="global">
                    <SelectTrigger>
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global System</SelectItem>
                      <SelectItem value="api">Core API Server</SelectItem>
                      <SelectItem value="media">Media Processing Queue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <Select defaultValue="degraded">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="degraded">Degraded</SelectItem>
                      <SelectItem value="outage">Major Outage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={overrideStatus}>{t("common.actions.save")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Global Status Banner */}
      <div className={`w-full rounded-xl p-6 border flex items-center justify-between relative overflow-hidden`}>
        <div className={`absolute inset-0 opacity-10 ${globalStatus === 'operational' ? 'bg-emerald-500' : globalStatus === 'degraded' ? 'bg-amber-500' : 'bg-destructive'}`}></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className={`p-3 rounded-full ${globalStatus === 'operational' ? 'bg-emerald-500/20 text-emerald-600' : globalStatus === 'degraded' ? 'bg-amber-500/20 text-amber-600' : 'bg-destructive/20 text-destructive'}`}>
            {globalStatus === 'operational' ? <CheckCircle2 className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {globalStatus === 'operational' ? t("services.status.allOperational") : t("services.status.partialOutage")}
            </h2>
            <p className="text-muted-foreground mt-1">Updates are applied to the monitoring dashboard every 60 seconds.</p>
          </div>
        </div>
      </div>

      {/* Services Grid (Clickable Drilldowns) */}
      <h3 className="text-xl font-semibold tracking-tight">{t("services.coreServices")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockServices.map(service => (
          <div 
            key={service.id} 
            className="rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-4 cursor-pointer hover:-translate-y-1 hover:border-primary transition-all"
            onClick={() => setSelectedService(service)}
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-muted rounded-lg">
                <service.icon className="h-6 w-6 text-foreground" />
              </div>
              <Badge variant="outline" className="gap-2">
                <span className={`h-2 w-2 rounded-full ${getStatusColor(service.status)}`} />
                {t(`services.status.${service.status}`)}
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold">{service.name}</h4>
              <div className="flex gap-4 mt-3">
                <div className="space-y-1 border-r pr-4">
                  <p className="text-xs text-muted-foreground">{t("services.metrics.uptime")}</p>
                  <p className="font-medium">{service.uptime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("services.metrics.latency")}</p>
                  <p className="font-medium text-amber-500">{service.latency}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Sheet Drilldown */}
      <Sheet open={!!selectedService} onOpenChange={(val) => !val && setSelectedService(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Service Telemetry</SheetTitle>
            <SheetDescription>Advanced drilldown metrics and logs for the monitored target.</SheetDescription>
          </SheetHeader>
          
          {selectedService && (
            <div className="py-6 space-y-6">
              <div className="flex justify-between items-start border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <selectedService.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedService.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedService.id}-cluster-us-east</p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${getStatusColor(selectedService.status)}`} />
                  {selectedService.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-xl border space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Memory Usage</p>
                  <p className="text-2xl font-bold">4.2<span className="text-lg text-muted-foreground">gb</span></p>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">CPU Threads</p>
                  <p className="text-2xl font-bold">65<span className="text-lg text-muted-foreground">%</span></p>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Reqs</p>
                  <p className="text-2xl font-bold">12.4<span className="text-lg text-muted-foreground">k/m</span></p>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Drop Rate</p>
                  <p className="text-2xl font-bold text-destructive">0.05<span className="text-lg text-muted-foreground">%</span></p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-semibold">Instance Health Console</h4>
                <div className="bg-black/90 text-green-400 p-4 rounded-lg font-mono text-xs overflow-hidden">
                  <p>[10:45:01] GET /health - 200 OK</p>
                  <p>[10:45:02] WORKER NODE 04 starting process...</p>
                  <p className="text-yellow-400">[10:45:05] WARN: Memory threshold reached 75%</p>
                  <p className="text-red-400">[10:45:06] ERR: Connection timeout to Redis shard 2</p>
                  <p>[10:45:08] Auto-scaling initiated. Provisioning NODE 05.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => toast.success("Instance reboot requested")}>Reboot Process</Button>
                <Button variant="default">View Grafana Logs</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Timeline Section */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold mb-6">{t("services.recentIncidents")}</h3>
        <div className="space-y-6">
          {mockTimeline.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 rounded-full mt-1.5 ${getStatusColor(item.status as StatusVariant)}`} />
                {idx !== mockTimeline.length - 1 && <div className="w-px h-full bg-border my-2" />}
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium">{item.event}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
