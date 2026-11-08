import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import type { Profile } from "../profile.js";
import { fetchBlogPosts, openInBrowser } from "../blogs.js";
import { Shell, type View } from "./Shell.js";

/** Launch the full-screen app on the given view; resolves after the terminal is restored. */
export async function runTui(profile: Profile, view: View = "info"): Promise<void> {
  const renderer = await createCliRenderer({ exitOnCtrlC: true });
  try {
    createRoot(renderer).render(
      <Shell
        profile={profile}
        initialView={view}
        loadPosts={fetchBlogPosts}
        onOpen={openInBrowser}
        onExit={() => renderer.destroy()}
      />,
    );
  } catch (err) {
    renderer.destroy();
    throw err;
  }
  await renderer.closed;
}
