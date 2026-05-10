import { ServicesOverview } from "@/widgets/services-overview/ui/services-overview";
import { TrafficConsole } from "@/widgets/traffic-console/ui/traffic-console";

export function ServicesPage() {
  return (
    <div className="space-y-8">
      <ServicesOverview />
      <TrafficConsole />
    </div>
  );
}
