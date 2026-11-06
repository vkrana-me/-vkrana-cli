import { expect, test } from "bun:test";
import { testRender } from "@opentui/react/test-utils";
import { parseBlogPage, renderBlogsPlain, type BlogPost } from "../src/blogs.js";
import { BlogsApp } from "../src/ui/BlogsApp.js";

const fixture = await Bun.file(new URL("./fixtures/blog-page.html", import.meta.url)).text();

test("parseBlogPage extracts posts from a listing page", async () => {
  const posts = await parseBlogPage(fixture);
  expect(posts.length).toBe(1);
  expect(posts[0]).toEqual({
    title: "What is Islands Architecture in JavaScript and How to Create Your Own Custom Island",
    url: "https://www.vkrana.me/blog/what-is-islands-architecture",
    date: "March 8, 2025",
    category: "Web Architecture Patterns",
    tags: ["JavaScript", "HTML", "CSS", "Web Performance"],
  });
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
  const setup = await testRender(
    <BlogsApp load={async () => sample} onOpen={() => {}} onExit={() => {}} />,
    { width: 80, height: 16 },
  );
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
    <BlogsApp load={async () => Promise.reject(new Error("offline"))} onOpen={() => {}} onExit={() => {}} />,
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
