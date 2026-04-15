import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MoreHorizontal, MessageSquare } from "lucide-react";
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
  const columns = useMemo<ColumnDef<CommunityPost>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground mr-1" />
            <span className="font-medium">{row.getValue("title")}</span>
          </div>
        ),
      },
      {
        accessorKey: "author",
        header: "Author",
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
      },
      {
        accessorKey: "replies",
        header: "Replies",
      },
      {
        accessorKey: "date",
        header: "Posted Date",
      },
      {
        id: "actions",
        cell: () => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>View Post & Replies</DropdownMenuItem>
                <DropdownMenuItem>View Poll Results (if any)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Delete Post</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Management</h1>
          <p className="text-muted-foreground mt-2">
            Moderate community discussions, categories, and tags.
          </p>
        </div>
        <Button variant="outline">Manage Categories</Button>
      </div>

      <div className="bg-card rounded-xl">
        <DataTable columns={columns} data={mockPosts} />
      </div>
    </div>
  );
}
