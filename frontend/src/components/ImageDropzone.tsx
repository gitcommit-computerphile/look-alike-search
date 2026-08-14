import { useRef, useState } from "react";
import { UploadIcon, XIcon } from "../icons";

interface Props {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function ImageDropzone({ file, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div
      className={`dropzone ${dragging ? "dragging" : ""}`}
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) onFileChange(dropped);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      {previewUrl ? (
        <div className="dropzone-preview">
          <img src={previewUrl} alt="Selected" />
          <button
            type="button"
            className="clear-image"
            onClick={(e) => {
              e.stopPropagation();
              onFileChange(null);
            }}
            aria-label="Remove image"
          >
            <XIcon />
          </button>
        </div>
      ) : (
        <div className="dropzone-empty">
          <UploadIcon />
          <p className="primary">Drop an image, or click to upload</p>
          <p className="secondary">PNG or JPG</p>
        </div>
      )}
    </div>
  );
}
