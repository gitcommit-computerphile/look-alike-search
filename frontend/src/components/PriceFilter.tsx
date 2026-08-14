interface Props {
  minPrice: string;
  maxPrice: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}

export function PriceFilter({ minPrice, maxPrice, onMinChange, onMaxChange }: Props) {
  return (
    <div className="price-filter">
      <div className="price-input">
        <span>$</span>
        <input
          type="number"
          min={0}
          placeholder="Min"
          value={minPrice}
          onChange={(e) => onMinChange(e.target.value)}
        />
      </div>
      <span className="sep">to</span>
      <div className="price-input">
        <span>$</span>
        <input
          type="number"
          min={0}
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => onMaxChange(e.target.value)}
        />
      </div>
    </div>
  );
}
