import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { LayoutGrid, List, MessageSquare, MoreHorizontal, ThumbsUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { DataTable } from "@/widgets/data-table/ui/data-table";

export const POST_CATEGORY = { GENERAL: "General", QNA: "QnA", TIP: "Tip" } as const;
export type PostCategory = typeof POST_CATEGORY[keyof typeof POST_CATEGORY];

interface Post {
  id: string;
  title: string;
  category: PostCategory;
  author: string;
  likes: number;
  comments: number;
  createdAt: string;
}

const CATEGORY_LABEL_KEY: Record<PostCategory, string> = {
  [POST_CATEGORY.GENERAL]: "community.categories.general",
  [POST_CATEGORY.QNA]: "community.categories.qna",
  [POST_CATEGORY.TIP]: "community.categories.tip",
};

const mockPosts: Post[] = [
  { id: "P001", title: "How to introduce a new puppy?", category: POST_CATEGORY.QNA, author: "DogLover99", likes: 24, comments: 12, createdAt: "2026-04-14" },
  { id: "P002", title: "Best parks in Seoul", category: POST_CATEGORY.TIP, author: "SeoulWalker", likes: 56, comments: 8, createdAt: "2026-04-13" },
  { id: "P003", title: "Just adopted this little guy!", category: POST_CATEGORY.GENERAL, author: "NewParent", likes: 120, comments: 34, createdAt: "2026-04-12" },
  { id: "P004", title: "What food is best for senior cats?", category: POST_CATEGORY.QNA, author: "CatMom", likes: 15, comments: 22, createdAt: "2026-04-11" },
];

export function CommunityTableSection() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openPost = (post: Post) => {
    setSelectedPost(post);
    setIsSheetOpen(true);
  };

  const columns = useMemo<ColumnDef<Post>[]>(
    () => [
      { accessorKey: "title", header: t("community.table.title"), cell: ({ row }) => <span className="font-medium">{String(row.getValue("title"))}</span> },
      {
        accessorKey: "category",
        header: t("community.table.category"),
        cell: ({ row }) => {
          const category = row.getValue("category") as PostCategory;
          const variant = category === POST_CATEGORY.QNA ? "destructive" : category === POST_CATEGORY.TIP ? "default" : "secondary";
          return <Badge variant={variant}>{t(CATEGORY_LABEL_KEY[category])}</Badge>;
        },
      },
      { accessorKey: "author", header: t("community.table.author") },
      { accessorKey: "likes", header: t("community.table.likes"), cell: ({ row }) => <div className="flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-muted-foreground" />{String(row.getValue("likes"))}</div> },
      { accessorKey: "comments", header: t("community.table.comments"), cell: ({ row }) => <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3 text-muted-foreground" />{String(row.getValue("comments"))}</div> },
      { accessorKey: "createdAt", header: t("community.table.createdAt") },
      {
        id: "actions",
        cell: ({ row }) => {
          const post = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(event) => event.stopPropagation()}>
                  <span className="sr-only">{t("community.table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                <DropdownMenuLabel>{t("community.menu.actions")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openPost(post)}>{t("community.menu.viewPost")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => toast.warning(t("community.feedback.deleted"))}>
                  {t("community.menu.deletePost")}
                </DropdownMenuItem>
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
        <DataTable columns={columns} data={mockPosts} onRowClick={openPost} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockPosts.map((post) => (
            <Card key={post.id} className="cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md" onClick={() => openPost(post)}>
              <CardHeader className="py-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px]">{t(CATEGORY_LABEL_KEY[post.category])}</Badge>
                  <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                </div>
                <div className="line-clamp-2 min-h-[40px] text-sm font-semibold">{post.title}</div>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                <div className="mb-3">{t("community.postedBy", { author: post.author })}</div>
                <div className="flex items-center gap-4 border-t pt-3">
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{post.likes}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.comments}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("community.detail.title")}</SheetTitle>
            <SheetDescription>{t("community.detail.description")}</SheetDescription>
          </SheetHeader>
          {selectedPost && (
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Badge>{t(CATEGORY_LABEL_KEY[selectedPost.category])}</Badge>
                <h3 className="text-xl font-bold">{selectedPost.title}</h3>
                <p className="pt-1 text-sm text-muted-foreground">{t("community.detail.meta", { author: selectedPost.author, date: selectedPost.createdAt })}</p>
              </div>
              <div className="min-h-[150px] rounded-lg border bg-muted/30 p-4 text-sm">{t("community.detail.mockBody")}</div>
              <div className="flex gap-4 rounded-lg border bg-card p-4">
                <div className="flex flex-1 flex-col items-center"><span className="text-2xl font-bold">{selectedPost.likes}</span><span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{t("community.table.likes")}</span></div>
                <div className="w-px bg-border" />
                <div className="flex flex-1 flex-col items-center"><span className="text-2xl font-bold">{selectedPost.comments}</span><span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{t("community.table.comments")}</span></div>
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="destructive" onClick={() => { toast.warning(t("community.feedback.forceDeleted")); setIsSheetOpen(false); }}>
                  {t("community.menu.deletePost")}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
