"""
Supabase operations — upsert products and fetch existing ones for dedup.
"""

import os

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY", "")          # read-only (frontend)
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "") # write (scraper)

_read_client: Client | None = None
_write_client: Client | None = None


def get_read_client() -> Client | None:
    """Anon key — used for fetching existing products (dedup)."""
    global _read_client
    if _read_client:
        return _read_client
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return None
    _read_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return _read_client


def get_write_client() -> Client | None:
    """Service role key — bypasses RLS for inserts/upserts."""
    global _write_client
    if _write_client:
        return _write_client
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    _write_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _write_client


def fetch_existing_products() -> list[dict]:
    """
    Fetch all existing products from Supabase for deduplication.
    Uses anon key — only needs read access.
    """
    client = get_read_client()
    if not client:
        print("[!] Supabase not configured — skipping remote dedup.")
        return []
    try:
        resp = client.table("products").select("slug, product_name").execute()
        return resp.data or []
    except Exception as e:
        print(f"[!] Supabase fetch error: {e}")
        return []


def upsert_products(records: list[dict]) -> bool:
    """
    Upsert product records into Supabase.
    Uses service_role key to bypass RLS.
    """
    client = get_write_client()
    if not client:
        print("[!] SUPABASE_SERVICE_KEY not set — skipping upload.")
        return False
    try:
        client.table("products").upsert(records, on_conflict="slug").execute()
        print(f"[+] {len(records)} products upserted to Supabase.")
        return True
    except Exception as e:
        print(f"[!] Supabase upsert error: {e}")
        return False
