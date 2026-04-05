import re
import unicodedata


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug (handles Turkish characters)."""
    tr_map = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")
    text = text.translate(tr_map)
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text


def amazon_search_url(product_name: str, tag: str = "") -> str:
    query = product_name.strip().replace(" ", "+")
    url = f"https://www.amazon.com/s?k={query}"
    if tag:
        url += f"&tag={tag}"
    return url
