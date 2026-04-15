import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MoreHorizontal, Image as ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { NOTICE_STATUS, type NoticeStatus } from "@/shared/config/constants";

interface Notice {
  id: string;
  title: string;
  animalType: string;
  status: NoticeStatus;
  reporter: string;
  date: string;
}

const mockNotices: Notice[] = [
  { id: "N001", title: "Looking for my golden retriever", animalType: "Dog", status: NOTICE_STATUS.LOST, reporter: "Alice Smith", date: "2026-04-10" },
  { id: "N002", title: "Found a black cat near the park", animalType: "Cat", status: NOTICE_STATUS.FOUND, reporter: "Bob Jones", date: "2026-04-12" },
  { id: "N003", title: "Dog returned to owner!", animalType: "Dog", status: NOTICE_STATUS.RESOLVED, reporter: "Charlie Brown", date: "2026-04-14" },
  { id: "N004", title: "Spam notice", animalType: "Other", status: NOTICE_STATUS.HIDDEN, reporter: "Spammer123", date: "2026-04-14" },
  { id: "N005", title: "Inappropriate picture", animalType: "Cat", status: NOTICE_STATUS.REPORTED, reporter: "BadUser", date: "2026-04-15" },
];

export function NoticesPage() {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<Notice>[]>(
    () => [
      {
        accessorKey: "title",
        header: t("notices.table.title"),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="font-medium">{row.getValue("title")}</span>
          </div>
        ),
      },
      {
        accessorKey: "animalType",
        header: t("notices.table.type"),
      },
      {
        accessorKey: "status",
        header: t("notices.table.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as NoticeStatus;
          const variant = 
            status === NOTICE_STATUS.FOUND || status === NOTICE_STATUS.RESOLVED ? "default" : 
            status === NOTICE_STATUS.LOST ? "destructive" : 
            status === NOTICE_STATUS.REPORTED ? "warning" : "secondary";
          
          const label = String(status);

          return <Badge variant={variant}>{label}</Badge>;
        },
      },
      {
        accessorKey: "reporter",
        header: t("notices.table.reporter"),
      },
      {
        accessorKey: "date",
        header: t("notices.table.reportedDate"),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const notice = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("notices.table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("notices.menu.actions")}</DropdownMenuLabel>
                <DropdownMenuItem>{t("notices.menu.viewDetails")}</DropdownMenuItem>
                <DropdownMenuItem>{t("notices.menu.editNotice")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                {notice.status !== NOTICE_STATUS.HIDDEN ? (
                  <DropdownMenuItem className="text-destructive">{t("notices.menu.hideDelete")}</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>{t("notices.menu.restore")}</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t]
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("notices.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("notices.description")}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl">
        <DataTable columns={columns} data={mockNotices} />
      </div>
    </div>
  );
}
