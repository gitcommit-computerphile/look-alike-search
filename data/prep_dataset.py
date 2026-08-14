"""Download and normalize a subset of a public fashion-product-images dataset
into data/catalog.json + data/images/, for indexing into the hybrid search demo.

Dataset: Kaggle "paramaggarwal/fashion-product-images-small"
(images + styles.csv with productDisplayName/category metadata, no price field
-- this script synthesizes a plausible price per item, seeded for reproducibility).

Usage:
    python prep_dataset.py [--count 600] [--seed 42]

If Kaggle credentials (KAGGLE_USERNAME/KAGGLE_KEY) aren't set, download manually
from https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-small,
unzip it into data/raw/, and re-run this script -- it will skip the download step
if data/raw/styles.csv and data/raw/images/ already exist.
"""

import argparse
import json
import os
import random
import subprocess
import sys
from pathlib import Path

import pandas as pd
from PIL import Image
from tqdm import tqdm

DATA_DIR = Path(__file__).resolve().parent
RAW_DIR = DATA_DIR / "raw"
IMAGES_OUT_DIR = DATA_DIR / "images"
CATALOG_OUT = DATA_DIR / "catalog.json"

KAGGLE_DATASET = "paramaggarwal/fashion-product-images-small"
MAX_IMAGE_SIZE = 512

BASE_PRICE_RANGES = {
    "Apparel": (20, 120),
    "Footwear": (30, 150),
    "Accessories": (10, 80),
    "Personal Care": (5, 40),
    "Sporting Goods": (15, 100),
    "Free Items": (0, 10),
    "Home": (10, 60),
}
DEFAULT_PRICE_RANGE = (10, 100)


def ensure_raw_dataset() -> None:
    styles_csv = RAW_DIR / "styles.csv"
    images_dir = RAW_DIR / "images"
    if styles_csv.exists() and images_dir.exists():
        return

    if not (os.environ.get("KAGGLE_USERNAME") and os.environ.get("KAGGLE_KEY")):
        sys.exit(
            "data/raw/styles.csv or data/raw/images/ not found, and KAGGLE_USERNAME/"
            "KAGGLE_KEY aren't set. Either set Kaggle API credentials in .env, or "
            "manually download the dataset from "
            f"https://www.kaggle.com/datasets/{KAGGLE_DATASET} and unzip it into data/raw/."
        )

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "kaggle",
            "datasets",
            "download",
            "-d",
            KAGGLE_DATASET,
            "-p",
            str(RAW_DIR),
            "--unzip",
        ],
        check=True,
    )


def synth_price(item_id: str, category: str, seed: int) -> float:
    low, high = BASE_PRICE_RANGES.get(category, DEFAULT_PRICE_RANGE)
    rng = random.Random(f"{seed}:{item_id}")
    return round(rng.uniform(low, high), 2)


def resize_and_save(src: Path, dst: Path) -> bool:
    try:
        with Image.open(src) as img:
            img = img.convert("RGB")
            img.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE))
            dst.parent.mkdir(parents=True, exist_ok=True)
            img.save(dst, "JPEG", quality=85)
        return True
    except Exception:
        return False


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=600)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    ensure_raw_dataset()

    df = pd.read_csv(RAW_DIR / "styles.csv", on_bad_lines="skip")
    df["id"] = df["id"].astype(str)

    raw_images_dir = RAW_DIR / "images"
    df = df[df["id"].apply(lambda i: (raw_images_dir / f"{i}.jpg").exists())]
    df = df.dropna(subset=["productDisplayName", "masterCategory"])

    # Stratified sample across masterCategory, seeded for reproducibility.
    frac = min(1.0, args.count / max(len(df), 1))
    sampled = (
        df.groupby("masterCategory", group_keys=False)
        .apply(lambda g: g.sample(frac=frac, random_state=args.seed))
        .head(args.count)
    )

    catalog = []
    for _, row in tqdm(list(sampled.iterrows()), desc="Preparing items"):
        item_id = row["id"]
        src = raw_images_dir / f"{item_id}.jpg"
        dst = IMAGES_OUT_DIR / f"{item_id}.jpg"
        if not dst.exists() and not resize_and_save(src, dst):
            continue

        category = str(row["masterCategory"])
        description_parts = [
            str(row.get(field, "")).strip()
            for field in ("articleType", "baseColour", "season", "usage")
            if pd.notna(row.get(field))
        ]
        catalog.append(
            {
                "id": item_id,
                "image_path": f"{item_id}.jpg",
                "title": str(row["productDisplayName"]),
                "description": ", ".join(p for p in description_parts if p),
                "price": synth_price(item_id, category, args.seed),
                "category": category,
            }
        )

    CATALOG_OUT.write_text(json.dumps(catalog, indent=2), encoding="utf-8")
    print(f"Wrote {len(catalog)} items to {CATALOG_OUT}")


if __name__ == "__main__":
    main()
