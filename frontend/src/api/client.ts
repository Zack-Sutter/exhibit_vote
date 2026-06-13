import type { PairResponse, StatEntry, VoteCreate } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function assetUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  // Static exhibit images are served from the frontend (Vite public/).
  if (path.startsWith("/images/")) return path;
  return `${API_BASE}${path}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getPair(): Promise<PairResponse> {
  return request<PairResponse>("/api/pair");
}

export function submitVote(vote: VoteCreate): Promise<void> {
  return request<void>("/api/vote", {
    method: "POST",
    body: JSON.stringify(vote),
  });
}

export function getStats(): Promise<StatEntry[]> {
  return request<StatEntry[]>("/api/stats");
}
