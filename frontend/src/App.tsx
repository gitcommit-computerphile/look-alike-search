import { useState } from "react";
import { searchHybrid, searchImage, searchText } from "./api";
import { ImageDropzone } from "./components/ImageDropzone";
import { ModeToggle } from "./components/ModeToggle";
import { PriceFilter } from "./components/PriceFilter";
import { ResultsGrid } from "./components/ResultsGrid";
import { SearchBar } from "./components/SearchBar";
import { AlertIcon, LayersIcon, SearchIcon } from "./icons";
import type { SearchMode, SearchResult } from "./types";

const EXAMPLE_QUERIES = [
  "black bag under $50",
  "running shoes",
  "blue jacket",
  "watch over $50",
];

export default function App() {
  const [mode, setMode] = useState<SearchMode>("text");
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = {
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };

  async function runSearch(overrideQuery?: string) {
    const activeQuery = overrideQuery ?? query;
    setError(null);
    if (mode === "text" && !activeQuery) return setError("Enter a text query.");
    if (mode === "image" && !file) return setError("Upload an image.");
    if (mode === "hybrid" && !activeQuery && !file)
      return setError("Enter a query, upload an image, or both.");

    setLoading(true);
    setHasSearched(true);
    try {
      let data: SearchResult[];
      if (mode === "text") {
        data = await searchText(activeQuery, range);
      } else if (mode === "image" && file) {
        data = await searchImage(file, range);
      } else {
        data = await searchHybrid(activeQuery, file, range);
      }
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  function runExample(example: string) {
    setMode("text");
    setQuery(example);
    runSearch(example);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <LayersIcon />
          </div>
          <div className="brand-text">
            <h1>Hybrid Catalog Search</h1>
            <p>Text, image, or both, one embedding space</p>
          </div>
        </div>
        <div className="topbar-badge">
          <span className="dot" />
          Live catalog
        </div>
      </header>

      <div className="layout">
        <aside className="search-panel">
          <div>
            <p className="panel-label">Search mode</p>
            <ModeToggle mode={mode} onChange={setMode} />
          </div>

          {(mode === "text" || mode === "hybrid") && (
            <div className="field-group">
              <p className="panel-label">Query</p>
              <SearchBar query={query} onQueryChange={setQuery} onSubmit={() => runSearch()} />
              <div className="example-chips">
                {EXAMPLE_QUERIES.map((ex) => (
                  <button key={ex} type="button" className="example-chip" onClick={() => runExample(ex)}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(mode === "image" || mode === "hybrid") && (
            <div className="field-group">
              <p className="panel-label">Reference image</p>
              <ImageDropzone file={file} onFileChange={setFile} />
            </div>
          )}

          <div className="field-group">
            <p className="panel-label">Price range</p>
            <PriceFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={setMinPrice}
              onMaxChange={setMaxPrice}
            />
          </div>

          <button type="button" className="search-button" onClick={() => runSearch()} disabled={loading}>
            <SearchIcon />
            {loading ? "Searching..." : "Search"}
          </button>

          {error && (
            <div className="error-banner">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}
        </aside>

        <main>
          <div className="results-header">
            <h2>Results</h2>
            {hasSearched && !loading && <span className="count">{results.length} items</span>}
          </div>
          <ResultsGrid results={results} loading={loading} hasSearched={hasSearched} />
        </main>
      </div>
    </div>
  );
}
