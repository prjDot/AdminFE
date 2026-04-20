import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Moon, Sun, Monitor, Bell } from "lucide-react";
import { Checkbox } from "@/shared/ui/checkbox";

export function SettingsPreferencesSection() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted px-6 py-4">
        <h2 className="text-lg font-semibold">{t("common.theme.label")} & Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage UI layout preferences and admin alerts.</p>
      </div>
      <div className="space-y-8 p-6">
        
        {/* Theme Settings */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="text-sm font-medium md:col-span-1 pt-2">{t("common.theme.label")}</label>
          <div className="col-span-3 flex flex-wrap gap-4">
            <Button
              className="w-32 justify-start gap-2"
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4" />
              {t("common.theme.light")}
            </Button>
            <Button
              className="w-32 justify-start gap-2"
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4" />
              {t("common.theme.dark")}
            </Button>
            <Button
              className="w-32 justify-start gap-2"
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
            >
              <Monitor className="h-4 w-4" />
              {t("common.theme.system")}
            </Button>
          </div>
        </div>

        <hr className="bg-border" />

        {/* Notification Preferences */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-1 pt-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Admin Alerts
            </h3>
          </div>
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/10 hover:bg-muted/30 transition-colors">
              <Checkbox id="alert-incident" defaultChecked className="mt-1" />
              <div className="space-y-1">
                <label htmlFor="alert-incident" className="text-sm font-medium leading-none cursor-pointer">
                  System Incidents & Downtime
                </label>
                <p className="text-xs text-muted-foreground">Receive emails immediately when a service goes down or experiences delays.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/10 hover:bg-muted/30 transition-colors">
              <Checkbox id="alert-report" defaultChecked className="mt-1" />
              <div className="space-y-1">
                <label htmlFor="alert-report" className="text-sm font-medium leading-none cursor-pointer">
                  High Volume Reports
                </label>
                <p className="text-xs text-muted-foreground">Alert when a single post or user receives more than 5 reports within 24 hours.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/10 hover:bg-muted/30 transition-colors">
              <Checkbox id="alert-weekly" className="mt-1" />
              <div className="space-y-1">
                <label htmlFor="alert-weekly" className="text-sm font-medium leading-none cursor-pointer">
                  Weekly Summary Digest
                </label>
                <p className="text-xs text-muted-foreground">Receive a weekly breakdown of new signups, resolutions, and system health.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
