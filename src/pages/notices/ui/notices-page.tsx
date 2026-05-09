import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { NoticesTableSection } from "@/widgets/notices-table/ui/notices-table-section";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

export function NoticesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all"); // "all" | "LOST" | "FOUND" | "RESOLVED"
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("notices.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("notices.description")}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-4 sm:flex sm:w-auto">
            <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
            <TabsTrigger value="LOST">{t("notices.status.lost")}</TabsTrigger>
            <TabsTrigger value="FOUND">{t("notices.status.found")}</TabsTrigger>
            <TabsTrigger value="RESOLVED">
              {t("notices.status.resolved")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("notices.searchPlaceholder")}
            className="bg-card pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <NoticesTableSection
        status={activeTab === "all" ? undefined : activeTab}
        search={debouncedSearch}
      />
    </div>
  );
}
