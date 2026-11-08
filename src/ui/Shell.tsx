import { useKeyboard } from "@opentui/react";
import { useCallback, useReducer, useRef } from "react";
import type { Profile } from "../profile.js";
import type { BlogPost } from "../blogs.js";
import { App } from "./App.js";
import { BlogsApp } from "./BlogsApp.js";
import { CommandPalette, filterCommands, type Command } from "./CommandPalette.js";

export type View = "info" | "blogs";

export const COMMANDS: Command[] = [
  { name: "blog", description: "Browse blog posts" },
  { name: "info", description: "Profile" },
  { name: "quit", description: "Exit vkrana-me" },
];

type Palette = { open: false } | { open: true; query: string; index: number };
type State = { view: View; palette: Palette };

/**
 * One full-screen app with two views. "/" opens the command menu from any view;
 * Esc/Backspace in the blog view goes back to info; q quits.
 */
export function Shell({
  profile,
  initialView = "info",
  loadPosts,
  onOpen,
  onExit,
}: {
  profile: Profile;
  initialView?: View;
  loadPosts: () => Promise<BlogPost[]>;
  onOpen: (url: string) => void;
  onExit: () => void;
}) {
  // State lives in a ref so key events that arrive faster than React re-renders (fast typing,
  // paste) each see the result of the previous one; `rerender` repaints after every change.
  const state = useRef<State>({ view: initialView, palette: { open: false } });
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const update = (next: Partial<State>) => {
    state.current = { ...state.current, ...next };
    rerender();
  };

  // Fetch posts once per session; switching views reuses the same result.
  const posts = useRef<Promise<BlogPost[]> | null>(null);
  const load = useCallback(() => (posts.current ??= loadPosts()), [loadPosts]);

  const run = (cmd: Command | undefined) => {
    update({ palette: { open: false } });
    if (!cmd) return;
    if (cmd.name === "quit") onExit();
    else update({ view: cmd.name === "blog" ? "blogs" : "info" });
  };

  useKeyboard((key) => {
    const { view, palette } = state.current;
    if (palette.open) {
      const matches = filterCommands(COMMANDS, palette.query);
      if (key.name === "escape") update({ palette: { open: false } });
      else if (key.name === "return" || key.name === "enter") run(matches[palette.index]);
      else if (key.name === "up") update({ palette: { ...palette, index: Math.max(0, palette.index - 1) } });
      else if (key.name === "down")
        update({ palette: { ...palette, index: Math.min(Math.max(matches.length - 1, 0), palette.index + 1) } });
      else if (key.name === "backspace") {
        if (palette.query === "") update({ palette: { open: false } });
        else update({ palette: { open: true, query: palette.query.slice(0, -1), index: 0 } });
      } else if (key.sequence.length === 1 && key.sequence >= " " && !key.ctrl && !key.meta && key.sequence !== "/")
        update({ palette: { open: true, query: palette.query + key.sequence, index: 0 } });
      return;
    }

    if (key.sequence === "/") update({ palette: { open: true, query: "", index: 0 } });
    else if (key.name === "q") onExit();
    else if (view === "blogs" && (key.name === "escape" || key.name === "backspace")) update({ view: "info" });
    else if (view === "info" && key.name === "escape") onExit();
  });

  const { view, palette } = state.current;
  const active = !palette.open;
  return (
    <box flexGrow={1}>
      {view === "info" ? (
        <App profile={profile} active={active} />
      ) : (
        <BlogsApp load={load} onOpen={onOpen} active={active} />
      )}
      {palette.open && (
        <CommandPalette query={palette.query} matches={filterCommands(COMMANDS, palette.query)} index={palette.index} />
      )}
    </box>
  );
}
