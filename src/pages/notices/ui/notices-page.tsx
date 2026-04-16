import { useTranslation } from "react-i18next";
import { useState } from "react";
import { NoticesTableSection } from "@/pages/notices/ui/sections/notices-table-section";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/shared/ui/input";

export function NoticesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("notices.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("notices.description")}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:flex sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="lost">{t("notices.status.lost")}</TabsTrigger>
            <TabsTrigger value="found">{t("notices.status.found")}</TabsTrigger>
            <TabsTrigger value="resolved">{t("notices.status.resolved")}</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Search by title or reporter..." 
            className="pl-9 bg-card"
          />
        </div>
      </div>

      <NoticesTableSection />
    </div>
  );
}
