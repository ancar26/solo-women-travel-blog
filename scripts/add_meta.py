#!/usr/bin/env python3
"""Add favicon link and OG meta tags to all HTML pages."""
import os
import re

BASE_URL = "https://www.ancarada.com"
DEFAULT_IMAGE = f"{BASE_URL}/images/hero/profile-photo.jpeg"
HTML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FAVICON_TAG = '  <link rel="icon" type="image/jpeg" href="images/hero/profile-photo.jpeg"/>'

def build_og_tags(title, description, url):
    return f"""\
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="Anca Rada"/>
  <meta property="og:url" content="{url}"/>
  <meta property="og:title" content="{title}"/>
  <meta property="og:description" content="{description}"/>
  <meta property="og:image" content="{DEFAULT_IMAGE}"/>"""

for fname in os.listdir(HTML_DIR):
    if not fname.endswith(".html"):
        continue
    path = os.path.join(HTML_DIR, fname)
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()

    # Skip if already has OG tags
    if 'og:title' in html:
        print(f"  SKIP (already has OG): {fname}")
        continue

    # Extract title
    title_match = re.search(r'<title>(.*?)</title>', html)
    title = title_match.group(1).strip() if title_match else "Anca Rada"

    # Extract description
    desc_match = re.search(r'<meta name="description" content="([^"]+)"', html)
    description = desc_match.group(1).strip() if desc_match else "Solo female traveller documenting adventures from around the world."

    url = f"{BASE_URL}/{fname}"
    og_block = build_og_tags(title, description, url)

    # Add favicon after charset meta if not present
    if 'rel="icon"' not in html:
        html = html.replace('  <meta charset="UTF-8"/>', f'  <meta charset="UTF-8"/>\n{FAVICON_TAG}', 1)

    # Insert OG tags before </head>
    html = html.replace('</head>', f'{og_block}\n</head>', 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  UPDATED: {fname}")

print("\nDone.")
