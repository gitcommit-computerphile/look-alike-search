import { BACKEND_URL } from "../api";
import { InboxIcon } from "../icons";
import type { SearchResult } from "../types";

interface Props {
  results: SearchResult[];
  loading: boolean;
  hasSearched: boolean;
}

function SkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="image-wrap" />
          <div className="lines">
            <div className="line" />
            <div className="line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResultsGrid({ results, loading, hasSearched }: Props) {
  if (loading) return <SkeletonGrid />;

  if (!hasSearched) {
    return (
      <div className="status-panel">
        <InboxIcon />
        <p className="title">Ready when you are</p>
        <p className="subtitle">
          Type a query, drop in a photo, or both — then hit Search to see matching catalog items.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="status-panel">
        <InboxIcon />
        <p className="title">No matches</p>
        <p className="subtitle">Try a broader query or a wider price range.</p>
      </div>
    );
  }

  return (
    <div className="results-grid">
      {results.map((r) => (
        <div key={r.id} className="result-card">
          <div className="image-wrap">
            <img src={`${BACKEND_URL}${r.image_url}`} alt={r.title} loading="lazy" />
            <span className="match-badge">{(r.score * 100).toFixed(0)}% match</span>
          </div>
          <div className="result-info">
            <p className="title">{r.title}</p>
            <div className="meta-row">
              <span className="price">${r.price.toFixed(2)}</span>
              <span className="category">{r.category}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
