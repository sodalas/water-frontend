import { ComposerDraft, DraftStore } from '../../domain/composer/DraftStore';

// Transport Envelope (Private to Infrastructure)
interface DraftEnvelope {
  clientId: string;
  draft: ComposerDraft;
  schemaVersion?: number;
}

const CLIENT_ID = 'water-web-client-v1';

export const Draft: DraftStore = {
  async load(viewerId: string): Promise<ComposerDraft | null> {
    if (!viewerId) return null;
    try {
      const response = await fetch('/api/composer', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 204) return null;
      if (!response.ok) throw new Error(`Draft Load Failed: ${response.status}`);

      const envelope: DraftEnvelope = await response.json();
      // Unwrap: Domain only sees the draft content
      return envelope.draft;
    } catch (e) {
      console.error('Draft Load Error:', e);
      return null;
    }
  },

  async save(viewerId: string, draft: ComposerDraft): Promise<void> {
    if (!viewerId) return;
    
    // Wrap: Create Envelope
    const envelope: DraftEnvelope = {
        clientId: CLIENT_ID,
        draft: draft
    };

    try {
        const response = await fetch('/api/composer', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(envelope)
        });

        if (!response.ok) throw new Error(`Draft Save Failed: ${response.status}`);
    } catch (e) {
        console.error('Draft Save Error:', e);
        throw e;
    }
  },

  async clear(viewerId: string): Promise<void> {
    if (!viewerId) return;
    try {
        await fetch('/api/composer', { method: 'DELETE' });
    } catch (e) {
        console.error('Draft Clear Error:', e);
    }
  }
};
