import type { DraftStore } from "@/domain/composer/DraftStore";
import type { ComposerDraft } from "@/domain/composer/ComposerDraft";
import { DRAFT_SCHEMA_VERSION } from "@/domain/composer/DraftSchema";

export const RemoteDraftStore: DraftStore = {
  async load() {
    const res = await fetch("/api/drafts/composer", {
      credentials: "include",
    });

    if (res.status === 204) return null;
    if (!res.ok) throw new Error("Failed to load draft");

    const data = await res.json();

    if (data.schemaVersion !== DRAFT_SCHEMA_VERSION) {
      console.warn("Unsupported draft schema", data.schemaVersion);
      return null;
    }

    return data.draft as ComposerDraft;
  },

  async save(_, draft) {
    await fetch("/api/drafts/composer", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schemaVersion: DRAFT_SCHEMA_VERSION,
        clientId: getClientId(),
        draft,
      }),
    });
  },

  async clear() {
    await fetch("/api/drafts/composer", {
      method: "DELETE",
      credentials: "include",
    });
  },
};

function getClientId(): string {
  const key = "water:client-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
