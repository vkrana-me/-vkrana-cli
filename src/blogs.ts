import pkg from "../package.json" with { type: "json" };

export const BLOG_URL = "https://www.vkrana.me/blog/";
const MAX_PAGES = 20;

export interface BlogPost {
  title: string;
  url: string;
  date: string;
  category: string;
  tags: string[];
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });

/** "Aug 16, 2025", "August 16, 2025", "16 Aug 2025" or "2025-08-16". */
const DATE_RE = /^(?:[A-Z][a-z]{2,8}\.? \d{1,2},? \d{4}|\d{1,2} [A-Z][a-z]{2,8}\.? \d{4}|\d{4}-\d{2}-\d{2})$/;
const NOISE = new Set(["read article", "read more", "continue reading"]);

/** Absolute URL of a blog post (…/blog/<slug>), or null for anything else (pagination, other pages, other sites). */
function postUrl(href: string, baseUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(decode(href), baseUrl);
  } catch {
    return null;
  }
  const base = new URL(baseUrl);
  if (url.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")) return null;
  const slug = url.pathname.match(/^\/blog\/([^/]+)\/?$/)?.[1];
  if (!slug || /^\d+$/.test(slug)) return null; // /blog/2 is a listing page, not a post
  return new URL(`/blog/${slug}`, base).href;
}

/**
 * Parse one blog listing page (https://www.vkrana.me/blog/<n>) into posts.
 *
 * Markup-agnostic on purpose (the site has moved from Astro to TanStack Start): every link to
 * /blog/<slug> is a post, and its text pieces are classified as date (looks like a date), tags
 * (start with "#"), title (longest remaining piece) and category (next remaining piece).
 */
export async function parseBlogPage(html: string, baseUrl = BLOG_URL): Promise<BlogPost[]> {
  const body = html.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, "");
  const posts = new Map<string, BlogPost>();

  for (const [, attrs, inner] of body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = attrs!.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    const url = href && postUrl(href[1] ?? href[2] ?? "", baseUrl);
    if (!url) continue;

    const parts = inner!
      .split(/<[^>]+>/)
      .map((t) => clean(decode(t)))
      .filter((t) => t && !NOISE.has(t.toLowerCase()));
    const date = parts.find((t) => DATE_RE.test(t)) ?? "";
    const tags = parts
      .filter((t) => t.startsWith("#"))
      .flatMap((t) => t.split(/\s+/))
      .map((t) => t.replace(/^#/, ""))
      .filter(Boolean);
    const rest = parts.filter((t) => t !== date && !t.startsWith("#"));
    const title = rest.reduce((a, b) => (b.length > a.length ? b : a), "");
    if (!title) continue; // e.g. an image-only link to the post

    // Old Astro cards listed tags as separate plain spans after the title; keep them as tags.
    const others = rest.filter((t) => t !== title);
    const category = others[0] ?? "";
    const extraTags = tags.length ? [] : others.slice(1);

    if (!posts.has(url)) posts.set(url, { title, url, date, category, tags: [...tags, ...extraTags] });
  }
  return [...posts.values()];
}

/** Fetch every page of the blog listing and return all posts (newest first, de-duplicated). */
export async function fetchBlogPosts(baseUrl = BLOG_URL): Promise<BlogPost[]> {
  const posts = new Map<string, BlogPost>();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1 ? baseUrl : new URL(`${page}/`, baseUrl).href;
    const res = await fetch(url, {
      headers: { "User-Agent": `vkrana-me-cli/${pkg.version}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 404 && page > 1) break;
    if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);

    const found = await parseBlogPage(await res.text(), baseUrl);
    const before = posts.size;
    for (const p of found) if (!posts.has(p.url)) posts.set(p.url, p);
    if (posts.size === before) break; // empty or repeated page => end of list
  }
  return [...posts.values()];
}

/** Plain-text listing for pipes / NO_COLOR. */
export function renderBlogsPlain(posts: BlogPost[]): string {
  if (!posts.length) return `No posts found. See ${BLOG_URL}`;
  return posts.map((p) => `${p.date}  ${p.title}\n  ${p.url}`).join("\n\n");
}

/** Open a blog post in the default browser. Only URLs on the blog's own origin are allowed. */
export function openInBrowser(url: string): void {
  if (new URL(url).origin !== new URL(BLOG_URL).origin) {
    throw new Error(`Refusing to open non-blog URL: ${url}`);
  }
  const cmd =
    process.platform === "darwin"
      ? ["open", url]
      : process.platform === "win32"
        ? ["cmd", "/c", "start", "", url]
        : ["xdg-open", url];
  Bun.spawn(cmd, { stdout: "ignore", stderr: "ignore" }).unref();
}
