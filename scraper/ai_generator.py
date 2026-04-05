"""
Sends video descriptions to OpenRouter and returns structured SEO content.
Completely decoupled from fetching or saving logic.
"""

import json
import os
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemini-2.5-flash-lite"


def generate_seo_content(description: str) -> Optional[dict]:
    """
    Analyze a video description and return:
        product_name, seo_title, seo_description

    All output is in English.
    Returns None on failure.
    """
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY is not set in .env")

    prompt = f"""You are a product analyst for an Amazon affiliate website. Your job is to identify ONLY physical, buyable products from viral social media videos.

Analyze the video description below.
Respond ONLY with valid JSON — no markdown, no explanation.

Video description:
\"\"\"
{description[:1500]}
\"\"\"

STEP 1 — Is this a PHYSICAL product someone can buy on Amazon?
- YES examples: gadget, phone, charger, kitchen tool, clothing, furniture, beauty product, sports gear
- NO examples: mobile app, website, SaaS tool, AI software, online service, personal vlog, entertainment, news, prank, dancing

STEP 2 — If YES, write the product_name as a clean Amazon search query:
- Use the generic product category name, not the brand slogan
- Must return real search results on Amazon (e.g. "Portable Power Bank 20000mAh", not "charging treasure")
- Keep it short: 2-5 words max

Return exactly this JSON structure:
{{
  "is_product": true or false,
  "product_name": "Clean Amazon-searchable product name (e.g. 'Portable Power Bank', 'Wireless Earbuds', 'Phone Stand Holder')",
  "seo_title": "Click-worthy Google title in English, include year 2026, max 60 chars",
  "seo_description": "Keyword-rich meta description in English, strictly under 150 chars"
}}"""

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://viral-scraper.local",
        "X-Title": "Viral Product Scraper",
    }

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "response_format": {"type": "json_object"},
    }

    try:
        with httpx.Client(timeout=60) as client:
            resp = client.post(OPENROUTER_URL, headers=headers, json=payload)
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]

            # Strip markdown code fences if model ignores json_object instruction
            content = content.strip()
            if content.startswith("```"):
                content = content.split("```", 2)[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.rsplit("```", 1)[0].strip()

            data = json.loads(content)
            if data.get("seo_description"):
                data["seo_description"] = data["seo_description"][:150]
            return data
    except httpx.HTTPStatusError as e:
        print(f"[!] OpenRouter HTTP {e.response.status_code}: {e.response.text}")
    except (json.JSONDecodeError, KeyError) as e:
        print(f"[!] Failed to parse AI response: {e}")
    return None
