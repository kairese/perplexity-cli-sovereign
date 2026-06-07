/**
 * Mesh Context Enrichment
 * Queries the QNAP Intelligence API (Qdrant-backed) before dispatch
 * to inject relevant sovereign mesh context into the prompt.
 */

const INTELLIGENCE_API =
  process.env['SOVEREIGN_INTELLIGENCE_API'] ||
  'http://localhost:8900';

const ENRICHMENT_TIMEOUT_MS = 3000;

export interface MeshContextResult {
  contextText: string;
  sourceCount: number;
  reachable: boolean;
}

export async function fetchMeshContext(
  query: string,
  topK = 3,
): Promise<MeshContextResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ENRICHMENT_TIMEOUT_MS);

  try {
    const response = await fetch(`${INTELLIGENCE_API}/memory/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k: topK }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      return { contextText: '', sourceCount: 0, reachable: false };
    }

    const data = (await response.json()) as {
      results?: Array<{ text?: string; content?: string; summary?: string }>;
    };

    const results = data.results ?? [];
    if (results.length === 0) {
      return { contextText: '', sourceCount: 0, reachable: true };
    }

    const snippets = results
      .slice(0, topK)
      .map((r, i) => {
        const text = r.text ?? r.content ?? r.summary ?? '';
        return text ? `[Context ${i + 1}] ${text.slice(0, 400)}` : null;
      })
      .filter(Boolean);

    if (snippets.length === 0) {
      return { contextText: '', sourceCount: 0, reachable: true };
    }

    const contextText = `\n\nSovereign Mesh Context (from local intelligence store):\n${snippets.join('\n\n')}`;
    return { contextText, sourceCount: snippets.length, reachable: true };
  } catch {
    clearTimeout(timer);
    return { contextText: '', sourceCount: 0, reachable: false };
  }
}
