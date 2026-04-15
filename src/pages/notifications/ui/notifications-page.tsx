import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Send, BellRing } from "lucide-react";
import { useForm } from "react-hook-form";

export function NotificationsPage() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    console.log("Sending push notification:", data);
    alert("Push notification sent! (Mock)");
    reset();
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Push Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Manage Firebase Cloud Messaging history and send manual broadcast notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Notification Form */}
        <div className="lg:col-span-1 border rounded-xl bg-card shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <BellRing className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Send Manual Push</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <select {...register("target")} className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm">
                <option value="all">All Users</option>
                <option value="active">Active App Users Only</option>
                <option value="specific">Specific User IDs</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input {...register("title")} placeholder="e.g. Urgent Missing Report" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Body</label>
              <textarea 
                {...register("body")} 
                placeholder="Enter the push message..." 
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent text-sm resize-none" 
                required
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              <Send className="w-4 h-4" /> Send Notification
            </Button>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 border rounded-xl bg-card shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Broadcasts</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <h3 className="font-semibold text-lg">{i === 1 ? "System Maintenance Alert" : "Found Dog nearby!"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">This is the body of the notification that was sent out.</p>
                  <p className="text-xs text-muted-foreground mt-2">Target: All Users • 2026-04-{15 - i} 14:00</p>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col items-end">
                  <Badge variant="default" className="mb-2">Success</Badge>
                  <span className="text-sm text-muted-foreground">12,30{i} Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
