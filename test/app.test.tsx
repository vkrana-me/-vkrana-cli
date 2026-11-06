import { expect, test } from "bun:test";
import { testRender } from "@opentui/react/test-utils";
import { App } from "../src/ui/App.js";
import { profile } from "../src/profile.js";
import { renderJson, renderPlain } from "../src/commands/info.js";

test("App renders profile sections", async () => {
  const setup = await testRender(<App profile={profile} onExit={() => {}} />, { width: 80, height: 24 });
  try {
    await setup.renderOnce();
    const frame = setup.captureCharFrame();
    expect(frame).toContain("vkrana-me");
    expect(frame).toContain(profile.name);
    expect(frame).toContain("Skills");
    expect(frame).toContain("TypeScript");
    expect(frame).toContain("Links");
  } finally {
    setup.renderer.destroy();
  }
});

test("plain and json output", () => {
  expect(renderPlain(profile)).toContain(`${profile.name} — ${profile.title}`);
  expect(JSON.parse(renderJson(profile)).name).toBe(profile.name);
});
