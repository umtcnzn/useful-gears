"""
Fetches video metadata from TikTok / Instagram profiles using yt-dlp.
Returns raw video dicts — no AI, no enrichment.
"""

import yt_dlp


def fetch_videos(profile_url: str, max_videos: int = 10) -> list[dict]:
    """
    Fetch the last `max_videos` videos from a TikTok or Instagram profile.

    Returns a list of dicts:
        url, title, description, view_count
    """
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": "in_playlist",
        "playlistend": max_videos,
        "ignoreerrors": True,
    }

    videos = []
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(profile_url, download=False)
        if not info:
            print(f"[!] Could not fetch info from: {profile_url}")
            return []

        entries = info.get("entries") or []
        for entry in entries[:max_videos]:
            if not entry:
                continue
            videos.append({
                "url": entry.get("url") or entry.get("webpage_url", ""),
                "title": entry.get("title", ""),
                "description": entry.get("description", "") or entry.get("title", ""),
                "view_count": entry.get("view_count") or 0,
            })

    print(f"[+] Fetched {len(videos)} videos from {profile_url}")
    return videos
