# ancaventures.com

Static HTML travel/lifestyle blog (Anca Rada), hosted on GitHub Pages at `https://ancaventures.com` (apex domain — `www` 301-redirects to apex). No build step; pages are plain `.html` files in the repo root.

## Site-wide conventions (already applied to all 56 pages — keep consistent)

Every page's `<head>` follows this order:

1. `<meta charset="UTF-8"/>`
2. `<meta name="google-site-verification" content="tHP4BXyeOLBhVBubUAINekbj_2nQQA-FxkXd7qH137g" />`
3. GA4 snippet (gtag.js, measurement ID `G-0F4V6W1CH2`) — copy verbatim from any existing page
4. Favicons (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`)
5. `<meta name="viewport" .../>`
6. `<title>Page Title — Anca Rada</title>`
7. `<meta name="description" content="...">`
8. Google Fonts preconnect + stylesheet link (Playfair Display + Lato)
9. `<link rel="stylesheet" href="css/style.css"/>`
10. `<link rel="canonical" href="https://ancaventures.com/PAGE.html"/>` — **always apex domain, no `www`**
11. OG tags: `og:type`, `og:site_name` ("Anca Rada"), `og:url` (= canonical), `og:title` (= title), `og:description` (= meta description), `og:image`
12. JSON-LD `<script type="application/ld+json">` block (see below)

**Rule: `canonical`, `og:url`, and the JSON-LD `mainEntityOfPage.@id` must always match and use `https://ancaventures.com/...` (no www, no trailing slash on filenames).**

## JSON-LD by page type

- **Blog posts** (any page with `<div class="article-header">`): `BlogPosting` schema with `headline` (= `<h1>` text), `description` (= meta description), `image` (= og:image), `author` (Person "Anca Rada", `/about.html`, with `sameAs` social links), `publisher` (Organization "Anca Ventures", logo = `favicon-512.png`), `mainEntityOfPage` (canonical URL), `articleSection` (= article-tag text, plain `&` not `&amp;`).
- **about.html**: `Person` schema.
- **index.html**: `WebSite` schema.
- **book.html**: `Book` schema.
- Other utility pages (blog.html, destinations.html, solo-travel.html, contact.html) intentionally have **no** JSON-LD.

## Article header structure (blog posts)

```html
<div class="article-header">
  <div class="container">
    <p class="breadcrumb"><a href="blog.html">Blog</a> / <Category Name></p>
    <span class="article-tag"><Category Name></span>
    <h1>Post Title (plain text, no nested tags)</h1>
    <div class="article-meta">
      <span class="card__meta">Location · X min read</span>
    </div>
  </div>
</div>
```

### Categories in use (article-tag / breadcrumb text)
`Sports & Adventure`, `Travel Stories`, `Solo Female Travel`, `Remote Work`, `Southeast Asia`, `Safety`

### blog.html card → `data-category` mapping
`Sports & Adventure` → `sports`, `Travel Stories`/`Southeast Asia` → `travel`, `Solo Female Travel`/`Safety` → `solo`, `Remote Work` → `remote`

## Checklist: adding a new blog post

1. **Copy an existing post** (e.g. `el-teide-earned-it.html`) as the starting template — it already has the full head boilerplate (GA4, verification, canonical, OG, JSON-LD pattern) and footer.
2. Update for the new post:
   - `<title>` → `Post Title — Anca Rada`
   - `<meta name="description">` → unique 1–2 sentence summary
   - `<link rel="canonical">`, `og:url` → `https://ancaventures.com/<new-slug>.html`
   - `og:title`, `og:description` → match title/description
   - `og:image` → hero image for this post (path under `images/blog/<slug>/...`)
   - JSON-LD: `headline`, `description`, `image`, `mainEntityOfPage.@id`, `articleSection` — author/publisher blocks stay identical
   - Article header: breadcrumb, `article-tag`, `<h1>`, location/read-time
   - Set `class="active"` on the correct nav link (`Blog` for posts)
   - Body content + images
3. **Add a card to `blog.html`** (and to `index.html`'s "Latest Stories" if it should be featured) with title, excerpt, image, `card__meta`, `data-category`, `data-country`, and link to the new file.
4. **Add an entry to `sitemap.xml`**:
   ```xml
   <url><loc>https://ancaventures.com/<new-slug>.html</loc><priority>0.7</priority></url>
   ```
5. **Internal links**: link to/from related existing posts (same destination/activity) where natural — helps SEO.
6. Spot-check after pushing: view-source for the new page and confirm canonical/og:url/JSON-LD all point to the correct apex URL, and run it through [Google's Rich Results Test](https://search.google.com/test/rich-results).

## Sitemap

`sitemap.xml` must stay in sync 1:1 with the `.html` files in the repo root that should be indexed (currently all 56 are listed). Every new post needs an entry; priority `0.7` is the convention for individual posts.
