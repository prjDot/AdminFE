import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MoreHorizontal, Image as ImageIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface Notice {
  id: string;
  title: string;
  animalType: string;
  status: "Lost" | "Found" | "Hidden";
  reporter: string;
  date: string;
}

const mockNotices: Notice[] = [
  { id: "N001", title: "Looking for my golden retriever", animalType: "Dog", status: "Lost", reporter: "Alice Smith", date: "2026-04-10" },
  { id: "N002", title: "Found a black cat near the park", animalType: "Cat", status: "Found", reporter: "Bob Jones", date: "2026-04-12" },
  { id: "N003", title: "Missing parrot", animalType: "Bird", status: "Lost", reporter: "Charlie Brown", date: "2026-04-14" },
  { id: "N004", title: "Spam notice", animalType: "Other", status: "Hidden", reporter: "Spammer123", date: "2026-04-14" },
];

export function NoticesPage() {
  const columns = useMemo<ColumnDef<Notice>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
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
        header: "Type",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const variant = 
            status === "Found" ? "default" : 
            status === "Lost" ? "destructive" : "secondary";
          
          return <Badge variant={variant}>{status}</Badge>;
        },
      },
      {
        accessorKey: "reporter",
        header: "Reporter",
      },
      {
        accessorKey: "date",
        header: "Reported Date",
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const notice = row.original;

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
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit Notice</DropdownMenuItem>
                <DropdownMenuSeparator />
                {notice.status !== "Hidden" ? (
                  <DropdownMenuItem className="text-destructive">Hide/Delete</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>Restore</DropdownMenuItem>
                )}
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
          <h1 className="text-3xl font-bold tracking-tight">Notices Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage missing animal notices.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl">
        <DataTable columns={columns} data={mockNotices} />
      </div>
    </div>
  );
}
