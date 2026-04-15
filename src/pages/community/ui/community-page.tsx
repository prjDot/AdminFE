import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MoreHorizontal, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface CommunityPost {
  id: string;
  title: string;
  author: string;
  category: string;
  replies: number;
  date: string;
}

const mockPosts: CommunityPost[] = [
  { id: "P001", title: "Any tips for adopting a dog?", author: "Alice Smith", category: "Tips & Tricks", replies: 12, date: "2026-04-14" },
  { id: "P002", title: "Found this brand of food to be great", author: "Charlie Brown", category: "Product Review", replies: 5, date: "2026-04-13" },
  { id: "P003", title: "Please vote for the best local vet", author: "Diana Prince", category: "Poll", replies: 42, date: "2026-04-10" },
];

export function CommunityPage() {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<CommunityPost>[]>(
    () => [
      {
        accessorKey: "title",
        header: t("community.table.title"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground mr-1" />
            <span className="font-medium">{row.getValue("title")}</span>
          </div>
        ),
      },
      {
        accessorKey: "author",
        header: t("community.table.author"),
      },
      {
        accessorKey: "category",
        header: t("community.table.category"),
        cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
      },
      {
        accessorKey: "replies",
        header: t("community.table.replies"),
      },
      {
        accessorKey: "date",
        header: t("community.table.postedDate"),
      },
      {
        id: "actions",
        cell: () => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("community.table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("community.menu.actions")}</DropdownMenuLabel>
                <DropdownMenuItem>{t("community.menu.viewPostReplies")}</DropdownMenuItem>
                <DropdownMenuItem>{t("community.menu.viewPollResults")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">{t("community.menu.deletePost")}</DropdownMenuItem>
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
          <h1 className="text-3xl font-bold tracking-tight">{t("community.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("community.description")}
          </p>
        </div>
        <Button variant="outline">{t("common.actions.manageCategories")}</Button>
      </div>

      <div className="bg-card rounded-xl">
        <DataTable columns={columns} data={mockPosts} />
      </div>
    </div>
  );
}
