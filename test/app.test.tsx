import { expect, test } from "bun:test";
import { testRender } from "@opentui/react/test-utils";
import { App, AVATAR_SIZES } from "../src/ui/App.js";
import { profile } from "../src/profile.js";
import { renderJson, renderPlain } from "../src/commands/info.js";
import { AVATAR_PNG, AVATAR_PX } from "../src/ui/avatar-data.js";
import { imageInfo } from "@opentui/core";

async function frameAt(width: number, height: number) {
  const setup = await testRender(<App profile={profile} />, { width, height });
  try {
    await setup.renderOnce();
    await Bun.sleep(50); // let the embedded PNG decode
    await setup.renderOnce();
    return setup.captureCharFrame();
  } finally {
    setup.renderer.destroy();
  }
}

// Test renderer has no Kitty/Sixel, so the image falls back to Unicode quadrant blocks.
const hasImageBlocks = (frame: string) => /[\u2580-\u259f]/.test(frame);
const nameColumn = (frame: string) =>
  frame
    .split("\n")
    .find((l) => l.includes(profile.name))!
    .indexOf(profile.name);

test("embedded avatar is a valid PNG", () => {
  expect(imageInfo(AVATAR_PNG)).toMatchObject(AVATAR_PX);
});

test("avatar image is left of the profile on 80x24, no divider", async () => {
  const frame = await frameAt(80, 24);
  expect(hasImageBlocks(frame)).toBe(true);
  expect(nameColumn(frame)).toBeGreaterThan(AVATAR_SIZES.small.cols);
  // Only the outer frame uses box-drawing verticals: 2 per inner row, none between image and text.
  const inner = frame.split("\n").slice(1, 20);
  for (const line of inner) expect((line.match(/│/g) ?? []).length).toBeLessThanOrEqual(2);
});

test("name banner in slick font on large terminals", async () => {
  const frame = await frameAt(120, 32);
  expect(frame).toContain("╭╮╱╱╭╮"); // top row of "V" in the slick font
  expect(frame).not.toContain(profile.name); // plain name is replaced by the banner
});

test("plain bold name instead of banner on 80x24", async () => {
  const frame = await frameAt(80, 24);
  expect(frame).not.toContain("╭╮╱╱╭╮");
  expect(frame).toContain(profile.name);
});

test("avatar is hidden on small terminals", async () => {
  expect(hasImageBlocks(await frameAt(70, 30))).toBe(false);
});
test("App renders profile sections", async () => {
  const setup = await testRender(<App profile={profile} />, { width: 80, height: 24 });
  try {
    await setup.renderOnce();
    const frame = setup.captureCharFrame();
    expect(frame).toContain("vkrana-me");
    expect(frame).toContain(profile.name);
    expect(frame).toContain("SKILLS");
    expect(frame).toContain("TypeScript");
    expect(frame).toContain("LINKS");
    expect(frame).toContain("BLOG");
    expect(frame).toMatch(/Read\s+\s\/blog\s\sright here/); // chips pad with non-breaking spaces
    expect(frame).toMatch(/Type\s+\/blog\s+to read my latest posts/);
  } finally {
    setup.renderer.destroy();
  }
});

test("plain and json output", () => {
  expect(renderPlain(profile)).toContain(`${profile.name} — ${profile.title}`);
  expect(renderPlain(profile)).toContain("vkrana-me blog");
  expect(JSON.parse(renderJson(profile)).name).toBe(profile.name);
});
