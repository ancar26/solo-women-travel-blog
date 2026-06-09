"""
Extract clean voiceover text from each article for ElevenLabs.
Captures: article title + chapter headings + story paragraphs only.
Skips: photo captions, social strips, related posts, footer — everything outside article-body.
Output: elevenlabs-scripts.txt (gitignored)
"""

import os
import re
from html.parser import HTMLParser

SITE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT   = os.path.join(SITE_DIR, "elevenlabs-scripts.txt")

ARTICLE_ORDER = [
    "azores-arrival.html",
    "azores-furnas.html",
    "azores-hike.html",
    "azores-no-licence.html",
    "bali-feet-wet.html",
    "bali-temples-flowers.html",
    "biking-in-tenerife.html",
    "caorle-italy.html",
    "chiang-mai-temples.html",
    "cluj-trails.html",
    "croatia-cycling.html",
    "dolomites-cortina.html",
    "el-teide-earned-it.html",
    "el-teide.html",
    "hiking-tenerife-trails.html",
    "horse-riding-azores.html",
    "ice-climbing-bride-waterfall.html",
    "learning-to-dive.html",
    "madeira-bush-hike.html",
    "madeira-hikes.html",
    "madeira-march.html",
    "madeira-waterfall.html",
    "mango-sticky-rice.html",
    "mountain-bike-01.html",
    "mtb-downhill-marisel.html",
    "new-year-ski.html",
    "nice-france.html",
    "orbea-four-seasons.html",
    "paragliding-tenerife.html",
    "porto-santo.html",
    "scooter-asia.html",
    "sibiu-city-break.html",
    "skiing-trial-and-error.html",
    "tenerife-explorer.html",
    "tenerife-explorer-02.html",
    "tenerife-explorer-03.html",
    "tenerife-explorer-04.html",
    "tenerife-explorer-05.html",
    "tenerife-trails-landscapes.html",
    "veneto-gravel-1.html",
    "veneto-gravel-2.html",
    "vladeasa-peak.html",
    "winter-hikes.html",
    "vietnam-remote-work.html",
    "retezat-run-your-age.html",
    "stay-safe-solo-woman.html",
    "tenerife-hiking-with-friends.html",
    "bali-coconut-workshop.html",
    "road-bike-how-it-started.html",
]


def get_h1(html):
    m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    if not m:
        return ""
    return re.sub(r'<[^>]+>', '', m.group(1)).strip()


def get_article_body_html(html):
    """Slice out just the content of <div class="article-body">...</div>"""
    start = re.search(r'<div[^>]*class="article-body"[^>]*>', html)
    if not start:
        return ""
    body_start = start.end()
    # Walk forward counting div depth to find the matching closing tag
    pos   = body_start
    depth = 1
    while pos < len(html) and depth > 0:
        open_  = html.find('<div', pos)
        close_ = html.find('</div>', pos)
        if close_ == -1:
            break
        if open_ != -1 and open_ < close_:
            depth += 1
            pos = open_ + 4
        else:
            depth -= 1
            if depth > 0:
                pos = close_ + 6
            else:
                return html[body_start:close_]
    return html[body_start:pos]


class BodyParser(HTMLParser):
    """Parse only article-body HTML and collect title + story text."""

    def __init__(self):
        super().__init__()
        self.lines      = []
        self._tag       = None
        self._buf       = []
        self._skip      = False   # inside a tag we want to ignore
        self._skip_tag  = None

    def _flush(self):
        text = re.sub(r'\s+', ' ', ''.join(self._buf)).strip()
        self._buf = []
        return text

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get('class', '')

        # Skip: photo captions, social strip, pullquote attribution
        if (tag == 'p' and 'article-caption' in cls) or \
           (tag == 'div' and 'article-social' in cls):
            self._skip     = True
            self._skip_tag = tag
            return

        if self._skip:
            return

        if tag in ('p', 'h2', 'h3', 'li'):
            self._tag = tag
            self._buf = []

    def handle_endtag(self, tag):
        # End skip zone
        if self._skip and tag == self._skip_tag:
            self._skip     = False
            self._skip_tag = None
            return

        if self._skip:
            return

        if tag == self._tag:
            text = self._flush()
            if text:
                self.lines.append((tag, text))
            self._tag = None

    def handle_data(self, data):
        if not self._skip and self._tag:
            self._buf.append(data)


def extract(filepath):
    with open(filepath, encoding='utf-8') as f:
        html = f.read()

    title      = get_h1(html)
    body_html  = get_article_body_html(html)

    parser = BodyParser()
    parser.feed(body_html)
    return title, parser.lines


def format_for_tts(title, lines):
    parts = [title] if title else []
    for tag, text in lines:
        if tag in ('h2', 'h3'):
            parts.append(f'\n{text}')
        else:
            parts.append(text)
    return '\n\n'.join(parts)


def main():
    sections = []
    for i, filename in enumerate(ARTICLE_ORDER, 1):
        path = os.path.join(SITE_DIR, filename)
        if not os.path.exists(path):
            print(f'  MISSING: {filename}')
            continue
        title, lines = extract(path)
        tts_text = format_for_tts(title, lines)
        slug = filename.replace('.html', '')
        header = (
            f"{'='*60}\n"
            f"[{i:02d}] {slug}\n"
            f"Audio file: audio/{slug}.mp3\n"
            f"{'='*60}"
        )
        sections.append(f"{header}\n\n{tts_text}\n")
        print(f"  [{i:02d}] {slug} — {len(tts_text):,} chars")

    with open(OUTPUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sections))

    total = sum(len(s) for s in sections)
    print(f"\nDone. {len(sections)} articles, ~{total:,} chars total.")
    print(f"Written to: {OUTPUT}")


if __name__ == '__main__':
    print("Extracting article text for ElevenLabs...\n")
    main()
