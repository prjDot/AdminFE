import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, MessageSquare, ThumbsUp, LayoutGrid, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
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

  const handleRowClick = (post: Post) => {
    setSelectedPost(post);
    setIsSheetOpen(true);
  };

  const columns = useMemo<ColumnDef<Post>[]>(
    () => [
      {
        accessorKey: "title",
        header: t("community.table.title"),
        cell: ({ row }) => <span className="font-medium">{row.getValue("title")}</span>,
      },
      {
        accessorKey: "category",
        header: t("community.table.category"),
        cell: ({ row }) => {
          const category = row.getValue("category") as PostCategory;
          const variant =
            category === POST_CATEGORY.QNA ? "destructive" :
            category === POST_CATEGORY.TIP ? "default" : "secondary";

          return <Badge variant={variant}>{t(CATEGORY_LABEL_KEY[category] as string)}</Badge>;
        },
      },
      {
        accessorKey: "author",
        header: t("community.table.author"),
      },
      {
        accessorKey: "likes",
        header: t("community.table.likes"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3 text-muted-foreground" />
            <span>{row.getValue("likes")}</span>
          </div>
        ),
      },
      {
        accessorKey: "comments",
        header: t("community.table.comments"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-muted-foreground" />
            <span>{row.getValue("comments")}</span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("community.table.createdAt"),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const post = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                  <span className="sr-only">{t("community.table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>{t("community.menu.actions")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => {
                  setSelectedPost(post);
                  setIsSheetOpen(true);
                }}>
                  {t("community.menu.viewPost")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => toast.error("Post flagged")}>{t("community.menu.deletePost")}</DropdownMenuItem>
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
        <ToggleGroup type="single" value={viewMode} onValueChange={(v: string) => v && setViewMode(v as "list" | "grid")} className="bg-card border rounded-md">
          <ToggleGroupItem value="list" aria-label="List View">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid View">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === "list" ? (
        <DataTable columns={columns} data={mockPosts} onRowClick={handleRowClick} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mockPosts.map((post) => (
            <Card key={post.id} className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/50" onClick={() => handleRowClick(post)}>
              <CardHeader className="py-3">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px]">{t(CATEGORY_LABEL_KEY[post.category] as string)}</Badge>
                  <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                </div>
                <div className="font-semibold text-sm line-clamp-2 min-h-[40px]">{post.title}</div>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                <div className="mb-3">By <span className="font-medium text-foreground">{post.author}</span></div>
                <div className="flex items-center gap-4 border-t pt-3">
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.likes}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.comments}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Community Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Community Post Details</SheetTitle>
            <SheetDescription>Review content and metadata of this post.</SheetDescription>
          </SheetHeader>
          
          {selectedPost && (
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <Badge>{t(CATEGORY_LABEL_KEY[selectedPost.category] as string)}</Badge>
                <h3 className="text-xl font-bold">{selectedPost.title}</h3>
                <p className="text-sm text-muted-foreground pt-1">
                  Posted by <span className="font-semibold">{selectedPost.author}</span> on {selectedPost.createdAt}
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border text-sm min-h-[150px]">
                This is a mock payload for the community post body. The actual content will be rendered here, potentially containing html or markdown snippets depending on the editor.
              </div>
              
              <div className="flex gap-4 p-4 border rounded-lg bg-card">
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-2xl font-bold">{selectedPost.likes}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Likes</span>
                </div>
                <div className="w-px bg-border" />
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-2xl font-bold">{selectedPost.comments}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Replies</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="destructive" onClick={() => {
                  toast.error("Post force deleted");
                  setIsSheetOpen(false);
                }}>Delete Post</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
