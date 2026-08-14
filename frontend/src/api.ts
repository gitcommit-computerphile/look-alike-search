import type { SearchResult } from "./types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

interface PriceRange {
  minPrice?: number;
  maxPrice?: number;
}

async function handle(response: Response): Promise<SearchResult[]> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Search failed (${response.status}): ${body}`);
  }
  const data = await response.json();
  return data.results;
}

export async function searchText(query: string, range: PriceRange): Promise<SearchResult[]> {
  const response = await fetch(`${BACKEND_URL}/search/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      min_price: range.minPrice,
      max_price: range.maxPrice,
    }),
  });
  return handle(response);
}

export async function searchImage(file: File, range: PriceRange): Promise<SearchResult[]> {
  const form = new FormData();
  form.append("file", file);
  if (range.minPrice !== undefined) form.append("min_price", String(range.minPrice));
  if (range.maxPrice !== undefined) form.append("max_price", String(range.maxPrice));

  const response = await fetch(`${BACKEND_URL}/search/image`, { method: "POST", body: form });
  return handle(response);
}

export async function searchHybrid(
  query: string,
  file: File | null,
  range: PriceRange,
): Promise<SearchResult[]> {
  const form = new FormData();
  if (query) form.append("query", query);
  if (file) form.append("file", file);
  if (range.minPrice !== undefined) form.append("min_price", String(range.minPrice));
  if (range.maxPrice !== undefined) form.append("max_price", String(range.maxPrice));

  const response = await fetch(`${BACKEND_URL}/search/hybrid`, { method: "POST", body: form });
  return handle(response);
}

export { BACKEND_URL };
