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

/** Parse one blog listing page (https://www.vkrana.me/blog/<n>/) into posts. */
export async function parseBlogPage(html: string, baseUrl = BLOG_URL): Promise<BlogPost[]> {
  const raw: { href: string; date: string; title: string; spans: string[] }[] = [];
  const cur = () => raw[raw.length - 1];
  let span: string | null = null;

  const rewriter = new HTMLRewriter()
    .on("article", {
      element() {
        raw.push({ href: "", date: "", title: "", spans: [] });
      },
    })
    .on("article a[href]", {
      element(el) {
        const p = cur();
        if (p && !p.href) p.href = el.getAttribute("href") ?? "";
      },
    })
    .on("article time", {
      text(t) {
        const p = cur();
        if (p) p.date += t.text;
      },
    })
    .on("article h2", {
      text(t) {
        const p = cur();
        if (p) p.title += t.text;
      },
    })
    .on("article span", {
      element(el) {
        span = "";
        el.onEndTag(() => {
          const p = cur();
          const s = clean(span ?? "");
          if (p && s) p.spans.push(s);
          span = null;
        });
      },
      text(t) {
        if (span !== null) span += t.text;
      },
    });

  await rewriter.transform(new Response(html)).text();

  return raw
    .filter((p) => p.href && clean(p.title))
    .map((p) => {
      // Card layout: [category, ...tags, "Read article"]
      const spans = p.spans.filter((s) => s.toLowerCase() !== "read article");
      return {
        title: clean(p.title),
        url: new URL(p.href, baseUrl).href,
        date: clean(p.date),
        category: spans[0] ?? "",
        tags: spans.slice(1),
      };
    });
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
