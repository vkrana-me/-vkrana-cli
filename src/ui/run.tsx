import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import type { Profile } from "../profile.js";
import { App } from "./App.js";

/** Launch the interactive OpenTUI profile view; resolves after the terminal is restored. */
export async function runTui(profile: Profile): Promise<void> {
  const renderer = await createCliRenderer({ exitOnCtrlC: true });
  try {
    createRoot(renderer).render(<App profile={profile} onExit={() => renderer.destroy()} />);
  } catch (err) {
    renderer.destroy();
    throw err;
  }
  await renderer.closed;
}
