import { ImageIcon, LayersIcon, SearchIcon } from "../icons";
import type { SearchMode } from "../types";

interface Props {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

const MODES: { value: SearchMode; label: string; Icon: typeof SearchIcon }[] = [
  { value: "text", label: "Text", Icon: SearchIcon },
  { value: "image", label: "Image", Icon: ImageIcon },
  { value: "hybrid", label: "Both", Icon: LayersIcon },
];

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="mode-toggle">
      {MODES.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          className={value === mode ? "active" : ""}
          onClick={() => onChange(value)}
        >
          <Icon />
          {label}
        </button>
      ))}
    </div>
  );
}
