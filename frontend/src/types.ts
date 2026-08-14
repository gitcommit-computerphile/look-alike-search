export type SearchMode = "text" | "image" | "hybrid";

export interface SearchResult {
  id: string;
  title: string;
  price: number;
  category: string;
  image_url: string;
  score: number;
}
