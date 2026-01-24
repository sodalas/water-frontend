// HomeFeedContainer.tsx
import { HomeFeedList } from "./HomeFeedList";
import { FeedSkeletonList } from "./feed/FeedSkeletonList";
import { FeedErrorState } from "./feed/FeedErrorState";
import type { FeedItem } from "../domain/feed/HomeFeedAdapter";
import type { FeedItemView } from "./feed/types";
import type { ComposerDraft } from "../domain/composer/useComposer";
import type { UserRole } from "../domain/permissions/UserRole";

type FeedStatus = "idle" | "loading" | "ready" | "error";

// 🟥 MEDIUM PRIORITY FIX: Type the composer properly (no `any`)
// Textbook: "TypeScript helps catch bugs during development"
export type ComposerHandle = {
  draft: ComposerDraft;
  status: "idle" | "publishing" | "error" | "success";
  error: string | null;
  saveStatus: "idle" | "saving" | "saved" | "error";
  isRestored: boolean;
  setTitle: (title: string) => void;
  setText: (text: string) => void;
  addMedia: (item: { type: "image" | "link"; src: string }) => void;
  removeMedia: (id: string) => void;
  replaceDraft: (draft: ComposerDraft) => Promise<void>;
  save: () => Promise<void>;
  load: () => Promise<void>;
  clear: () => Promise<void>;
  publish: (
    viewer?: {
      id: string;
      displayName?: string | null;
      handle?: string | null;
    },
    options?: {
      replyTo?: string;
      clearDraft?: boolean;
      articleTitle?: string;
    }
  ) => Promise<any>;
};

type HomeFeedContainerProps = {
  status: FeedStatus;
  items: FeedItem[];
  viewerId?: string;
  viewerRole: UserRole;
  error: Error | null;
  onRetry: () => void;
  onItemPress?: (assertionId: string) => void;
  onAuthorPress?: (authorId: string) => void;
  activeReplyId?: string | null;
  onActiveReplyIdChange?: (id: string | null) => void;
  replyComposer?: ComposerHandle;
  onEdit?: (assertionId: string) => void;
  onDelete?: (assertionId: string) => void;
};

// Recursive conversion for FeedItem -> FeedItemView
function toFeedItemView(item: FeedItem): FeedItemView {
  return {
    assertionId: item.assertionId,
    assertionType: item.assertionType,
    author: item.author,
    createdAt: item.createdAt,
    text: item.text,
    media: item.media,
    responses: item.responses?.map(toFeedItemView),
    reactionCounts: item.reactionCounts,
    isPending: item.isPending,
    responseCount: item.responseCount,
  };
}

export function HomeFeedContainer(props: HomeFeedContainerProps) {
  const {
    status,
    items,
    viewerId,
    viewerRole,
    onRetry,
    onItemPress,
    onAuthorPress,
    activeReplyId,
    onActiveReplyIdChange,
    replyComposer,
    onEdit,
    onDelete,
  } = props;

  // 🟥 Feed auto-load invariant:
  // "idle" is transient and rendered as loading
  if (status === "idle" || status === "loading") {
    return <FeedSkeletonList />;
  }

  if (status === "error") {
    return <FeedErrorState onRetry={onRetry} />;
  }

  // status === "ready"
  return (
    <HomeFeedList
      items={items.map(toFeedItemView)}
      viewerId={viewerId}
      viewerRole={viewerRole}
      onItemPress={onItemPress}
      onAuthorPress={onAuthorPress}
      activeReplyId={activeReplyId}
      onActiveReplyIdChange={onActiveReplyIdChange}
      replyComposer={replyComposer}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
