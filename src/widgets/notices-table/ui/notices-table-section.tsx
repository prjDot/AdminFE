import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Calendar, Image as ImageIcon, LayoutGrid, List, MapPin, MoreHorizontal, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NOTICE_STATUS, type NoticeStatus } from "@/shared/config/constants";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { DataTable } from "@/widgets/data-table/ui/data-table";

interface Notice {
  id: string;
  title: string;
  animalType: string;
  status: NoticeStatus;
  reporter: string;
  date: string;
}

const NOTICE_STATUS_LABEL_KEY: Record<NoticeStatus, string> = {
  [NOTICE_STATUS.LOST]: "notices.status.lost",
  [NOTICE_STATUS.FOUND]: "notices.status.found",
  [NOTICE_STATUS.RESOLVED]: "notices.status.resolved",
  [NOTICE_STATUS.HIDDEN]: "notices.status.hidden",
  [NOTICE_STATUS.REPORTED]: "notices.status.reported",
};

const mockNotices: Notice[] = [
  { id: "N001", title: "Looking for my golden retriever", animalType: "Dog", status: NOTICE_STATUS.LOST, reporter: "Alice Smith", date: "2026-04-10" },
  { id: "N002", title: "Found a black cat near the park", animalType: "Cat", status: NOTICE_STATUS.FOUND, reporter: "Bob Jones", date: "2026-04-12" },
  { id: "N003", title: "Dog returned to owner", animalType: "Dog", status: NOTICE_STATUS.RESOLVED, reporter: "Charlie Brown", date: "2026-04-14" },
  { id: "N004", title: "Spam notice", animalType: "Other", status: NOTICE_STATUS.HIDDEN, reporter: "Spammer123", date: "2026-04-14" },
  { id: "N005", title: "Inappropriate picture", animalType: "Cat", status: NOTICE_STATUS.REPORTED, reporter: "BadUser", date: "2026-04-15" },
];

export function NoticesTableSection() {
  const { t } = useTranslation();
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const openNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDetailOpen(true);
  };

  const columns = useMemo<ColumnDef<Notice>[]>(
    () => [
      {
        accessorKey: "title",
        header: t("notices.table.title"),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>
            <span className="font-medium">{String(row.getValue("title"))}</span>
          </div>
        ),
      },
      { accessorKey: "animalType", header: t("notices.table.type") },
      {
        accessorKey: "status",
        header: t("notices.table.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as NoticeStatus;
          const variant = status === NOTICE_STATUS.FOUND || status === NOTICE_STATUS.RESOLVED ? "default" : status === NOTICE_STATUS.LOST ? "destructive" : status === NOTICE_STATUS.REPORTED ? "warning" : "secondary";
          return <Badge variant={variant}>{t(NOTICE_STATUS_LABEL_KEY[status])}</Badge>;
        },
      },
      { accessorKey: "reporter", header: t("notices.table.reporter") },
      { accessorKey: "date", header: t("notices.table.reportedDate") },
      {
        id: "actions",
        cell: ({ row }) => {
          const notice = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(event) => event.stopPropagation()}>
                  <span className="sr-only">{t("notices.table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                <DropdownMenuLabel>{t("notices.menu.actions")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openNotice(notice)}>{t("notices.menu.viewDetails")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(t("notices.feedback.editOpen"))}>{t("notices.menu.editNotice")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                {notice.status !== NOTICE_STATUS.HIDDEN ? (
                  <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => toast.warning(t("notices.feedback.hidden"))}>
                    {t("notices.menu.hideDelete")}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => toast.success(t("notices.feedback.restored"))}>{t("notices.menu.restore")}</DropdownMenuItem>
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <ToggleGroup type="single" value={viewMode} onValueChange={(value: string) => value && setViewMode(value as "list" | "grid")} className="rounded-md border bg-card">
          <ToggleGroupItem value="list" aria-label={t("common.view.list")}><List className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label={t("common.view.grid")}><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === "list" ? (
        <DataTable columns={columns} data={mockNotices} onRowClick={openNotice} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockNotices.map((notice) => (
            <Card key={notice.id} className="cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md" onClick={() => openNotice(notice)}>
              <div className="flex h-32 items-center justify-center border-b bg-muted"><ImageIcon className="h-8 w-8 text-muted-foreground/50" /></div>
              <CardHeader className="py-3">
                <div className="line-clamp-2 text-sm font-semibold">{notice.title}</div>
                <div className="mt-2 flex gap-1">
                  <Badge variant="outline" className="h-5 text-[10px]">{notice.animalType}</Badge>
                  <Badge variant={notice.status === NOTICE_STATUS.FOUND || notice.status === NOTICE_STATUS.RESOLVED ? "default" : notice.status === NOTICE_STATUS.LOST ? "destructive" : "secondary"} className="h-5 text-[10px]">
                    {t(NOTICE_STATUS_LABEL_KEY[notice.status])}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 pt-0 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><UserIcon className="h-3 w-3" />{notice.reporter}</div>
                <div className="flex items-center gap-2"><Calendar className="h-3 w-3" />{notice.date}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("notices.detail.title")}</DialogTitle>
            <DialogDescription>{t("notices.detail.description")}</DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-6 py-4">
              <div className="flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40">
                <ImageIcon className="mb-2 h-12 w-12 text-muted-foreground/40" />
                <span className="text-sm text-muted-foreground">{t("notices.detail.imagePlaceholder")}</span>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold">{selectedNotice.title}</h3>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">{selectedNotice.animalType}</Badge>
                  <Badge>{t(NOTICE_STATUS_LABEL_KEY[selectedNotice.status])}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/20 p-4">
                <div className="space-y-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><UserIcon className="h-3 w-3" />{t("notices.table.reporter")}</span>
                  <p className="text-sm font-medium">{selectedNotice.reporter}</p>
                </div>
                <div className="space-y-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{t("notices.table.reportedDate")}</span>
                  <p className="text-sm font-medium">{selectedNotice.date}</p>
                </div>
                <div className="col-span-2 mt-2 space-y-1 border-t pt-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{t("notices.detail.locationLabel")}</span>
                  <p className="text-sm font-medium">{t("notices.detail.locationValue")}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
