export type ComposerDraft = Record<string, any>;

export interface DraftStore {
  load(viewerId: string): Promise<ComposerDraft | null>;
  save(viewerId: string, draft: ComposerDraft): Promise<void>;
  clear(viewerId: string): Promise<void>;
}
