import { SearchIcon } from "../icons";

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export function SearchBar({ query, onQueryChange, onSubmit, placeholder }: Props) {
  return (
    <div className="search-input-wrap">
      <SearchIcon />
      <input
        className="search-bar"
        type="text"
        value={query}
        placeholder={placeholder ?? 'e.g. "red leather jacket under $200"'}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
      />
    </div>
  );
}
