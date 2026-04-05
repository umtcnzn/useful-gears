"""
Viral Product Scraper & SEO Content Generator
Usage:
    uv run main.py                        # uses usernames.txt
    uv run main.py --url https://...      # single profile
    uv run main.py --max 5                # limit videos per profile
"""

import argparse
import io
import json
import os
import sys
import time
from datetime import date
from pathlib import Path

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from dotenv import load_dotenv

load_dotenv()

from ai_generator import generate_seo_content
from db import fetch_existing_products, upsert_products
from fetcher import fetch_videos
from utils import amazon_search_url, slugify

OUTPUT_DIR = Path("output")
USERNAMES_FILE = Path("usernames.txt")
AMAZON_TAG = os.getenv("AMAZON_AFFILIATE_TAG", "")
MIN_VIEW_COUNT = int(os.getenv("MIN_VIEW_COUNT", "10000"))

# Stop words ignored during duplicate word-overlap check
_STOP_WORDS = {
    "the", "a", "an", "and", "or", "for", "with", "best", "top",
    "new", "pro", "max", "plus", "ultra", "mini", "review", "2026",
}


def load_profile_urls() -> list[str]:
    if not USERNAMES_FILE.exists():
        print(f"[!] {USERNAMES_FILE} not found.")
        return []
    urls = []
    for line in USERNAMES_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            urls.append(line)
    return urls


def dated_output_file() -> Path:
    """Returns output/DD-MM-YYYY.json for today."""
    OUTPUT_DIR.mkdir(exist_ok=True)
    return OUTPUT_DIR / f"{date.today().strftime('%d-%m-%Y')}.json"


def load_todays_records(output_file: Path) -> list[dict]:
    """Load records already saved today (if script runs multiple times in a day)."""
    if output_file.exists():
        try:
            return json.loads(output_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return []


def product_keywords(name: str) -> set[str]:
    words = slugify(name).split("-")
    return {w for w in words if w and w not in _STOP_WORDS and len(w) > 2}


def is_duplicate(product_name: str, existing_records: list[dict], threshold: float = 0.6) -> bool:
    """
    Returns True if product_name overlaps too much with any existing product.
    Overlap ratio = shared keywords / min(keywords of either side).
    """
    new_kw = product_keywords(product_name)
    if not new_kw:
        return False
    for record in existing_records:
        existing_kw = product_keywords(record.get("product_name", ""))
        if not existing_kw:
            continue
        shared = new_kw & existing_kw
        ratio = len(shared) / min(len(new_kw), len(existing_kw))
        if ratio >= threshold:
            return True
    return False


def enrich_video(video: dict, index: int, existing_records: list[dict]) -> dict | None:
    title_preview = video["title"][:70] or video["url"]
    view_count = video["view_count"]

    if view_count < MIN_VIEW_COUNT:
        print(f"    [skip] {title_preview}")
        print(f"           -> {view_count:,} views < {MIN_VIEW_COUNT:,} minimum")
        return None

    print(f"    [>] {title_preview}  ({view_count:,} views)")

    description = video["description"] or video["title"]
    ai = generate_seo_content(description)

    if not ai:
        print("        -> AI failed, skipping.")
        return None

    if not ai.get("is_product", True):
        print("        -> Not a product video, skipping.")
        return None

    product_name = ai.get("product_name", "")
    seo_title = ai.get("seo_title", "")
    seo_description = ai.get("seo_description", "")

    if is_duplicate(product_name, existing_records):
        print(f"        -> Duplicate product '{product_name}', skipping.")
        return None

    return {
        "slug": slugify(product_name or seo_title or f"product-{index + 1}"),
        "video_url": video["url"],
        "video_title": video["title"],
        "view_count": view_count,
        "product_name": product_name,
        "seo_title": seo_title,
        "seo_description": seo_description,
        "affiliate_url": amazon_search_url(product_name, AMAZON_TAG) if product_name else "",
    }


def run(profile_urls: list[str], max_videos: int = 10) -> list[dict]:
    output_file = dated_output_file()

    # Dedup source: Supabase (all time) + today's file (current session)
    print("[i] Fetching existing products from Supabase for dedup...")
    existing_records = fetch_existing_products()
    todays_records = load_todays_records(output_file)

    if existing_records:
        print(f"[i] {len(existing_records)} products in Supabase")
    if todays_records:
        print(f"[i] {len(todays_records)} products already saved today")

    new_records: list[dict] = []

    for profile_url in profile_urls:
        print(f"\n[>] Scraping: {profile_url}")
        videos = fetch_videos(profile_url, max_videos)

        if not videos:
            print("    No videos found, skipping.")
            continue

        for i, video in enumerate(videos):
            all_seen = existing_records + todays_records + new_records
            record = enrich_video(video, i, all_seen)
            if record:
                new_records.append(record)
            time.sleep(1)

    if not new_records:
        print("\n[!] No new products found.")
        return todays_records

    # Save to dated JSON (accumulate with today's existing records)
    all_todays = todays_records + new_records
    output_file.write_text(
        json.dumps(all_todays, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\n[+] {len(new_records)} new products saved -> {output_file}")

    # Upload to Supabase
    upsert_products(new_records)

    return all_todays


def main():
    parser = argparse.ArgumentParser(description="Viral Product Scraper & SEO Content Generator")
    parser.add_argument("--url", help="Single profile URL (overrides usernames.txt)")
    parser.add_argument("--max", type=int, default=10, metavar="N",
                        help="Max videos per profile (default: 10)")
    args = parser.parse_args()

    if args.url:
        profile_urls = [args.url]
    else:
        profile_urls = load_profile_urls()
        if not profile_urls:
            print("[!] No URLs found. Add them to usernames.txt or use --url")
            return

    print(f"Profiles to scrape : {len(profile_urls)}")
    print(f"Min view count     : {MIN_VIEW_COUNT:,}")
    results = run(profile_urls, args.max)

    if results:
        print(f"\n{'─' * 50}")
        r = results[-1]
        print("Latest record:")
        print(f"  product_name : {r['product_name']}")
        print(f"  seo_title    : {r['seo_title']}")
        print(f"  slug         : {r['slug']}")
        print(f"  affiliate_url: {r['affiliate_url']}")


if __name__ == "__main__":
    main()
