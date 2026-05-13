import { useTranslation } from "react-i18next";
import { useState, type ReactNode } from "react";
import type {
  AdminCommunityComment,
  AdminCommunityPollOption,
  AdminCommunityPostDetail,
} from "@/features/community/api/community-api";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ConfirmAction } from "@/shared/ui/confirm-action";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import {
  formatDate,
  getCategoryVariant,
  getCommentsCount,
} from "./community-table-utils";

interface CommunityDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postDetail?: AdminCommunityPostDetail;
  isLoading: boolean;
  selectedPostId: string | null;
  onHide: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export function CommunityDetailSheet({
  open,
  onOpenChange,
  postDetail,
  isLoading,
  selectedPostId,
  onHide,
  onDelete,
}: CommunityDetailSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{t("community.detail.title")}</SheetTitle>
          <SheetDescription>{t("community.detail.description")}</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {t("common.loading", "불러오는 중...")}
          </div>
        ) : postDetail ? (
          <div className="space-y-6 py-6">
            <PostOverview postDetail={postDetail} />
            <PostEngagement postDetail={postDetail} />
            <PostComments
              comments={resolveCommentDetails(postDetail)}
            />
            <DetailActions
              postId={selectedPostId}
              onDelete={onDelete}
              onHide={onHide}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function PostOverview({ postDetail }: { postDetail: AdminCommunityPostDetail }) {
  const { t } = useTranslation();
  const imageUrls = normalizeImageUrls(postDetail.images);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant={getCategoryVariant(postDetail.category)}>
            {postDetail.category}
          </Badge>
          {postDetail.tags?.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <h3 className="text-xl font-bold">{postDetail.title}</h3>
        <p className="pt-1 text-sm text-muted-foreground">
          {t("community.detail.meta", {
            author: postDetail.author,
            date: formatDate(postDetail.createdAt),
          })}
        </p>
      </div>

      <div className="min-h-[150px] whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
        {postDetail.content ?? t("community.detail.noContent", "내용 없음")}
      </div>

      {imageUrls.length ? (
        <Section title={t("community.detail.images", "이미지")}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {imageUrls.map((imageUrl, index) => (
              <ImagePreview key={`${imageUrl}-${index}`} src={imageUrl} index={index} />
            ))}
          </div>
        </Section>
      ) : null}

      <div className="grid grid-cols-3 gap-3 rounded-lg border bg-card p-4">
        <Stat label={t("community.table.likes")} value={postDetail.likes ?? 0} />
        <Stat
          label={t("community.table.comments")}
          value={getCommentsCount(postDetail.comments)}
        />
        <Stat
          label={t("community.detail.reports", "신고")}
          value={postDetail.reportCount ?? 0}
        />
      </div>
    </div>
  );
}

function PostEngagement({ postDetail }: { postDetail: AdminCommunityPostDetail }) {
  const { t } = useTranslation();
  const pollOptions = normalizePollOptions(postDetail.poll?.options);
  const voteItems = postDetail.votes?.items ?? postDetail.votes?.voters ?? [];
  const reactionCounts =
    postDetail.reactions?.counts ?? postDetail.reactions?.countByType ?? {};
  const reactionItems = postDetail.reactions?.reactors ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {postDetail.poll && (
        <Section title={t("community.detail.poll", "투표")}>
          <p className="text-sm font-medium">{postDetail.poll.question}</p>
          <div className="mt-3 space-y-2">
            {pollOptions.map((option) => (
              <KeyValue
                key={option.option}
                label={option.option}
                value={option.voteCount}
              />
            ))}
          </div>
        </Section>
      )}
      {postDetail.votes && (
        <Section title={t("community.detail.votes", "투표자")}>
          <KeyValue label="total" value={postDetail.votes.total ?? voteItems.length} />
          <PersonList
            items={voteItems.map((voter) => ({
              id: voter.voteId,
              name: voter.userName,
              meta: voter.selectedOption,
            }))}
          />
        </Section>
      )}
      {postDetail.reactions && (
        <Section title={t("community.detail.reactions", "반응")}>
          <div className="mb-3 flex flex-wrap gap-2">
            {Object.entries(reactionCounts).map(([type, count]) => (
              <Badge key={type} variant="secondary">
                {type} {count}
              </Badge>
            ))}
          </div>
          <PersonList
            items={reactionItems.map((reactor) => ({
              id: reactor.reactionId,
              name: reactor.userName,
              meta: reactor.reactionType,
            }))}
          />
        </Section>
      )}
    </div>
  );
}

function PostComments({ comments }: { comments: AdminCommunityComment[] }) {
  const { t } = useTranslation();
  if (comments.length === 0) return null;

  return (
    <Section title={t("community.detail.commentDetails", "댓글 상세")}>
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </Section>
  );
}

function resolveCommentDetails(postDetail: AdminCommunityPostDetail) {
  if (Array.isArray(postDetail.commentsDetail)) return postDetail.commentsDetail;
  if (Array.isArray(postDetail.comments)) return postDetail.comments;
  return [];
}

function normalizePollOptions(
  options?: Array<string | AdminCommunityPollOption>,
) {
  if (!options) return [];
  return options.map((option) => {
    if (typeof option === "string") {
      return { option, voteCount: 0 };
    }
    return option;
  });
}

function CommentItem({ comment }: { comment: AdminCommunityComment }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{comment.authorName}</p>
        <Badge variant="outline">{comment.status}</Badge>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm">{comment.content}</p>
      {comment.replies?.length > 0 && (
        <div className="mt-3 space-y-2 border-l pl-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

function DetailActions({
  postId,
  onHide,
  onDelete,
}: {
  postId: string | null;
  onHide: (postId: string) => void;
  onDelete: (postId: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end gap-2 pt-4">
      <ConfirmAction
        title={t("community.confirm.hideTitle", "게시글 숨김 처리")}
        description={t(
          "community.confirm.hideDescription",
          "이 커뮤니티 게시글을 숨김 처리하시겠습니까?",
        )}
        confirmLabel={t("community.menu.hidePost", "숨김 처리")}
        cancelLabel={t("common.actions.cancel", "취소")}
        onConfirm={() => postId && onHide(postId)}
      >
        <Button variant="outline">{t("community.menu.hidePost", "숨김 처리")}</Button>
      </ConfirmAction>
      <ConfirmAction
        title={t("community.confirm.deleteTitle", "게시글 삭제")}
        description={t(
          "community.confirm.deleteDescription",
          "이 커뮤니티 게시글을 삭제하시겠습니까? 이 작업은 되돌리기 어렵습니다.",
        )}
        confirmLabel={t("community.menu.deletePost")}
        cancelLabel={t("common.actions.cancel", "취소")}
        destructive
        onConfirm={() => postId && onDelete(postId)}
      >
        <Button variant="destructive">{t("community.menu.deletePost")}</Button>
      </ConfirmAction>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="mt-1 block text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="min-w-0 truncate">{label}</span>
      <Badge variant="outline">{value}</Badge>
    </div>
  );
}

function PersonList({ items }: { items: { id: string; name: string; meta: string }[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">
      {items.map((item) => (
        <div key={item.id} className="flex justify-between gap-3 text-sm">
          <span className="min-w-0 truncate">{item.name}</span>
          <span className="shrink-0 text-muted-foreground">{item.meta}</span>
        </div>
      ))}
    </div>
  );
}

function ImagePreview({ src, index }: { src: string; index: number }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      className="overflow-hidden rounded-lg border bg-muted/20"
    >
      {failed ? (
        <div className="flex h-44 flex-col items-center justify-center gap-2 px-3 text-center text-xs text-muted-foreground">
          <span>{t("community.detail.imageLoadFailed", "이미지를 불러오지 못했습니다.")}</span>
          <span className="line-clamp-2 break-all">{src}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={`community-image-${index + 1}`}
          className="h-44 w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </a>
  );
}

function normalizeImageUrls(images: unknown): string[] {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images
      .filter((image): image is string => typeof image === "string")
      .map((image) => image.trim())
      .filter(Boolean);
  }
  if (typeof images === "string") {
    const trimmed = images.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .filter((image): image is string => typeof image === "string")
          .map((image) => image.trim())
          .filter(Boolean);
      }
    } catch {
      return [trimmed];
    }
    return [];
  }
  return [];
}
