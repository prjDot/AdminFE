import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Image as ImageIcon, MapPin, Calendar, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { NOTICE_STATUS, type NoticeStatus } from "@/shared/config/constants";

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
  { id: "N003", title: "Dog returned to owner!", animalType: "Dog", status: NOTICE_STATUS.RESOLVED, reporter: "Charlie Brown", date: "2026-04-14" },
  { id: "N004", title: "Spam notice", animalType: "Other", status: NOTICE_STATUS.HIDDEN, reporter: "Spammer123", date: "2026-04-14" },
  { id: "N005", title: "Inappropriate picture", animalType: "Cat", status: NOTICE_STATUS.REPORTED, reporter: "BadUser", date: "2026-04-15" },
];

export function NoticesTableSection() {
  const { t } = useTranslation();
  
  // Dialog State
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const columns = useMemo<ColumnDef<Notice>[]>(
    () => [
      {
        accessorKey: "title",
        header: t("notices.table.title"),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
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

          return <Badge variant={variant}>{t(NOTICE_STATUS_LABEL_KEY[status])}</Badge>;
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
                <DropdownMenuItem onClick={() => {
                  setSelectedNotice(notice);
                  setIsDetailOpen(true);
                }}>
                  {t("notices.menu.viewDetails")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Opening edit form")}>{t("notices.menu.editNotice")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                {notice.status !== NOTICE_STATUS.HIDDEN ? (
                  <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => toast.error("Notice hidden")}>{t("notices.menu.hideDelete")}</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => toast.success("Notice restored")}>{t("notices.menu.restore")}</DropdownMenuItem>
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
    <div className="bg-card rounded-xl">
      <DataTable columns={columns} data={mockNotices} />

      {/* Notice Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Notice Details</DialogTitle>
            <DialogDescription>
              Detailed view of the reported notice and metadata.
            </DialogDescription>
          </DialogHeader>
          
          {selectedNotice && (
            <div className="space-y-6 py-4">
              <div className="h-48 w-full bg-muted/40 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20">
                <ImageIcon className="h-12 w-12 text-muted-foreground/40 mb-2" />
                <span className="text-sm text-muted-foreground">Original Image Placeholder</span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {selectedNotice.title}
                </h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{selectedNotice.animalType}</Badge>
                  <Badge>{selectedNotice.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><UserIcon className="h-3 w-3"/> Reporter</span>
                  <p className="text-sm font-medium">{selectedNotice.reporter}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3"/> Date</span>
                  <p className="text-sm font-medium">{selectedNotice.date}</p>
                </div>
                <div className="space-y-1 col-span-2 mt-2 border-t pt-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/> Location</span>
                  <p className="text-sm font-medium">Near Central Park, 5th Avenue</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
                {selectedNotice.status !== NOTICE_STATUS.HIDDEN && (
                  <Button variant="destructive" onClick={() => {
                    toast.error("Notice hidden from public API");
                    setIsDetailOpen(false);
                  }}>Hide Notice</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
