import { useState, useCallback } from 'react';
import { ComposerDraft } from './DraftStore';
import { Draft } from '../../infrastructure/draft/Draft';

export function useComposer(viewerId: string) {
  const [draft, setDraft] = useState<ComposerDraft>({});

  const update = useCallback((partial: ComposerDraft) => {
    setDraft(prev => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setDraft({});
  }, []);

  const save = useCallback(async () => {
    if (!viewerId) return;
    await Draft.save(viewerId, draft);
  }, [viewerId, draft]);

  const load = useCallback(async () => {
      if (!viewerId) return;
      const loaded = await Draft.load(viewerId);
      if (loaded) {
          setDraft(loaded);
      }
  }, [viewerId]);

  const clear = useCallback(async () => {
      if(!viewerId) return;
      await Draft.clear(viewerId);
      reset();
  }, [viewerId, reset]);

  return {
    draft,
    update,
    reset,
    save,
    load,
    clear
  };
}
