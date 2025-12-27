// src/infrastructure/draft/LocalDraftStore.ts
import type { DraftStore } from "@/domain/composer/DraftStore";
import type { ComposerDraft } from "@/domain/composer/ComposerDraft";

const key = (viewerId: string) => `composer:draft:${viewerId}`;

export const LocalDraftStore: DraftStore = {
  async load(viewerId) {
    const raw = localStorage.getItem(key(viewerId));
    if (!raw) return null;

    try {
      return JSON.parse(raw) as ComposerDraft;
    } catch {
      return null;
    }
  },

  async save(viewerId, draft) {
    localStorage.setItem(key(viewerId), JSON.stringify(draft));
  },

  async clear(viewerId) {
    localStorage.removeItem(key(viewerId));
  },
};
