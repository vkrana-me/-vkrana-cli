import { expect, test } from "bun:test";
import { testRender } from "@opentui/react/test-utils";
import { parseBlogPage, renderBlogsPlain, type BlogPost } from "../src/blogs.js";
import { BlogsApp } from "../src/ui/BlogsApp.js";

const fixture = (name: string) => Bun.file(new URL(`./fixtures/${name}`, import.meta.url)).text();

test("parseBlogPage reads the current TanStack listing (/blog/1)", async () => {
  const posts = await parseBlogPage(await fixture("blog-page-tanstack.html"));
  expect(posts.map((p) => p.url)).toEqual([
    "https://www.vkrana.me/blog/langsmith-comprehensive-guide",
    "https://www.vkrana.me/blog/mastering-langgraph-python",
    "https://www.vkrana.me/blog/vercel-ai-sdk-complete-guide",
    "https://www.vkrana.me/blog/a2a-protocol-enabling-ai-agent-communication",
  ]); // nav "/blog" and pagination "/blog/1", "/blog/2" … are not posts
  expect(posts[0]).toEqual({
    title: "LangSmith: The Complete Guide to Building Production-Ready LLM Applications",
    url: "https://www.vkrana.me/blog/langsmith-comprehensive-guide",
    date: "Aug 16, 2025",
    category: "AI Development",
    tags: ["python", "typescript", "langsmith", "langchain", "langgraph", "openai", "ai-observability"],
  });
});

test("parseBlogPage still reads the old Astro card layout", async () => {
  const posts = await parseBlogPage(await fixture("blog-page-astro.html"));
  expect(posts).toEqual([
    {
      title: "What is Islands Architecture in JavaScript and How to Create Your Own Custom Island",
      url: "https://www.vkrana.me/blog/what-is-islands-architecture",
      date: "March 8, 2025",
      category: "Web Architecture Patterns",
      tags: ["JavaScript", "HTML", "CSS", "Web Performance"],
    },
  ]);
});

test("parseBlogPage decodes entities, ignores other sites and image-only links", async () => {
  const html = `
    <a href="/blog/x"><img src="cover.png"></a>
    <a href="/blog/x"><span>Jan 2, 2026</span><span>Tips &amp; Tricks for &#8220;TS&#8221;</span></a>
    <a href="https://example.com/blog/y"><span>Elsewhere post title</span></a>`;
  expect(await parseBlogPage(html)).toEqual([
    {
      title: "Tips & Tricks for \u201cTS\u201d",
      url: "https://www.vkrana.me/blog/x",
      date: "Jan 2, 2026",
      category: "",
      tags: [],
    },
  ]);
});

test("parseBlogPage returns [] for a page without articles", async () => {
  expect(await parseBlogPage("<html><body>nothing</body></html>")).toEqual([]);
});

const sample: BlogPost[] = [
  { title: "Post One", url: "https://www.vkrana.me/blog/one", date: "Aug 1, 2025", category: "AI", tags: ["TS"] },
  { title: "Post Two", url: "https://www.vkrana.me/blog/two", date: "Jul 1, 2025", category: "Web", tags: [] },
];

test("renderBlogsPlain lists title and url", () => {
  const out = renderBlogsPlain(sample);
  expect(out).toContain("Aug 1, 2025  Post One");
  expect(out).toContain("https://www.vkrana.me/blog/two");
});

test("BlogsApp shows loaded posts", async () => {
  const setup = await testRender(<BlogsApp load={async () => sample} onOpen={() => {}} />, { width: 80, height: 16 });
  try {
    await setup.renderOnce();
    await Bun.sleep(10);
    await setup.renderOnce();
    const frame = setup.captureCharFrame();
    expect(frame).toContain("blogs (2)");
    expect(frame).toContain("Post One");
    expect(frame).toContain("Post Two");
  } finally {
    setup.renderer.destroy();
  }
});

test("BlogsApp shows fetch errors", async () => {
  const setup = await testRender(
    <BlogsApp load={async () => Promise.reject(new Error("offline"))} onOpen={() => {}} />,
    { width: 80, height: 10 },
  );
  try {
    await setup.renderOnce();
    await Bun.sleep(10);
    await setup.renderOnce();
    expect(setup.captureCharFrame()).toContain("offline");
  } finally {
    setup.renderer.destroy();
  }
});
