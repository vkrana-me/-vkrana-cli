import { expect, test } from "bun:test";
import { testRender } from "@opentui/react/test-utils";
import { Shell, COMMANDS } from "../src/ui/Shell.js";
import { filterCommands } from "../src/ui/CommandPalette.js";
import { profile } from "../src/profile.js";
import type { BlogPost } from "../src/blogs.js";

const posts: BlogPost[] = [
  { title: "Post One", url: "https://www.vkrana.me/blog/one", date: "Aug 1, 2025", category: "AI", tags: [] },
];

async function setupShell(opts: { initialView?: "info" | "blogs" } = {}) {
  let exited = 0;
  let loads = 0;
  const setup = await testRender(
    <Shell
      profile={profile}
      initialView={opts.initialView}
      loadPosts={async () => (loads++, posts)}
      onOpen={() => {}}
      onExit={() => exited++}
    />,
    { width: 80, height: 24 },
  );
  const frame = async () => {
    await setup.renderOnce();
    await Bun.sleep(20);
    await setup.renderOnce();
    return setup.captureCharFrame();
  };
  return { setup, frame, exited: () => exited, loads: () => loads };
}

test("filterCommands matches by substring, prefix first, ignores leading slash", () => {
  expect(filterCommands(COMMANDS, "").map((c) => c.name)).toEqual(["blog", "info", "quit"]);
  expect(filterCommands(COMMANDS, "/bl").map((c) => c.name)).toEqual(["blog"]);
  expect(filterCommands(COMMANDS, "i").map((c) => c.name)).toEqual(["info", "quit"]);
  expect(filterCommands(COMMANDS, "zzz")).toEqual([]);
});

test("'/' opens the command menu, typing filters, enter switches to blogs, esc returns to info", async () => {
  const s = await setupShell();
  try {
    expect(await s.frame()).toContain("/ commands");

    s.setup.mockInput.typeText("/");
    let frame = await s.frame();
    expect(frame).toContain("/blog");
    expect(frame).toContain("/quit");

    s.setup.mockInput.typeText("bl");
    frame = await s.frame();
    expect(frame).toContain("/blog");
    expect(frame).not.toContain("/quit");

    s.setup.mockInput.pressEnter();
    frame = await s.frame();
    expect(frame).toContain("blogs (1)");
    expect(frame).toContain("Post One");

    s.setup.mockInput.pressEscape();
    frame = await s.frame();
    expect(frame).not.toContain("blogs (");
    expect(frame).toContain("SKILLS");
    expect(s.exited()).toBe(0);
  } finally {
    s.setup.renderer.destroy();
  }
});

test("posts are fetched once across view switches", async () => {
  const s = await setupShell({ initialView: "blogs" });
  try {
    await s.frame();
    s.setup.mockInput.pressBackspace(); // back to info
    await s.frame();
    s.setup.mockInput.typeText("/blog");
    s.setup.mockInput.pressEnter();
    expect(await s.frame()).toContain("Post One");
    expect(s.loads()).toBe(1);
  } finally {
    s.setup.renderer.destroy();
  }
});

test("esc closes the menu without leaving the view; q quits; /quit quits", async () => {
  const s = await setupShell();
  try {
    s.setup.mockInput.typeText("/");
    await s.frame();
    s.setup.mockInput.pressEscape();
    const frame = await s.frame();
    expect(frame).not.toContain("/quit");
    expect(s.exited()).toBe(0);

    s.setup.mockInput.typeText("/quit");
    s.setup.mockInput.pressEnter();
    await s.frame();
    expect(s.exited()).toBe(1);

    s.setup.mockInput.typeText("q");
    await s.frame();
    expect(s.exited()).toBe(2);
  } finally {
    s.setup.renderer.destroy();
  }
});
