// Simple API helper for backend calls. The base URL can be changed for deployed backend.
// NOTE: In the browser `process` is not defined. Use Vite's import.meta.env (VITE_*) or
// define a window-level var. We check multiple places safely so this module can run
// both in Node (SSR) and the browser.
function resolveBaseUrl() {
  // 1) process.env if running under Node (SSR / tests)
  if (typeof process !== 'undefined' && process && (process as any).env && (process as any).env.REACT_APP_BACKEND_URL) {
    return (process as any).env.REACT_APP_BACKEND_URL as string;
  }

  // 2) Vite environment (preferred in this project). Vite exposes import.meta.env
  try {
    const v = (import.meta as any)?.env?.VITE_BACKEND_URL;
    if (v) return v as string;
  } catch (e) {
    // import.meta may not exist in some runtimes — ignore
  }

  // 3) window.__env__ or other runtime-injected global (optional)
  if (typeof window !== 'undefined' && (window as any).__env__ && (window as any).__env__.REACT_APP_BACKEND_URL) {
    return (window as any).__env__.REACT_APP_BACKEND_URL as string;
  }

  // Fallback to localhost for development
  return 'http://localhost:3001';
}

const BASE_URL = resolveBaseUrl();

export async function generateChallenges(query: string) {
  const res = await fetch(`${BASE_URL}/generate-challenges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`generateChallenges failed: ${res.status}`);
  return res.json();
}

export async function chat(message: string) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`chat failed: ${res.status}`);
  return res.json();
}

export default { generateChallenges, chat };
