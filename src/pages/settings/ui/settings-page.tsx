import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Settings2, Save } from "lucide-react";
import { useForm } from "react-hook-form";

export function SettingsPage() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      siteName: "PawGen",
      supportEmail: "support@pawgen.com",
      fcmServerKey: "AAAAxxxxxxxxxxxxxxxxxxxxxxx",
      apiEndpoint: "https://openapi.animal.go.kr/openapi/service/rest",
    }
  });

  const onSubmit = (data: any) => {
    console.log("Settings saved:", data);
    alert("Settings updated successfully! (Mock)");
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Settings2 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure global parameters, external API keys, and base data.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* General Settings */}
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b">
            <h2 className="font-semibold text-lg">General Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium md:col-span-1">Service Name</label>
              <div className="md:col-span-3">
                <Input {...register("siteName")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium md:col-span-1">Support Email</label>
              <div className="md:col-span-3">
                <Input type="email" {...register("supportEmail")} />
              </div>
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b">
            <h2 className="font-semibold text-lg">Integrations & API Keys</h2>
            <p className="text-xs text-muted-foreground mt-1">Updates to these keys may cause brief downtimes in related services.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium md:col-span-1">FCM Server Key</label>
              <div className="md:col-span-3">
                <Input type="password" {...register("fcmServerKey")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium md:col-span-1">Shelter API URL</label>
              <div className="md:col-span-3">
                <Input {...register("apiEndpoint")} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Code Management (Mock representation) */}
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-lg">Base Data Management</h2>
            <Button variant="outline" size="sm">Edit Mode</Button>
          </div>
          <div className="p-6 space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-muted-foreground">Animal Types / Breeds Dictionary</span>
              <span>1,204 entries</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-muted-foreground">Region Codes Mapping</span>
              <span>256 entries</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium text-muted-foreground">Notice Status Labels</span>
              <span>4 entries</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" className="gap-2"><Save className="w-4 h-4" /> Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
