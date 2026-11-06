import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import type { ReactNode } from "react";
import type { Profile } from "../profile.js";
import { fetchBlogPosts, openInBrowser } from "../blogs.js";
import { App } from "./App.js";
import { BlogsApp } from "./BlogsApp.js";

/** Mount a full-screen OpenTUI React view; resolves after the terminal is restored. */
async function mount(view: (exit: () => void) => ReactNode): Promise<void> {
  const renderer = await createCliRenderer({ exitOnCtrlC: true });
  try {
    createRoot(renderer).render(view(() => renderer.destroy()));
  } catch (err) {
    renderer.destroy();
    throw err;
  }
  await renderer.closed;
}

export function runTui(profile: Profile): Promise<void> {
  return mount((exit) => <App profile={profile} onExit={exit} />);
}

export function runBlogsTui(): Promise<void> {
  return mount((exit) => <BlogsApp load={() => fetchBlogPosts()} onOpen={openInBrowser} onExit={exit} />);
}
