import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { BLOG_URL, type BlogPost } from "../blogs.js";

const C = { accent: "#56b6c2", dim: "#7f848e", ok: "#98c379", err: "#e06c75", sel: "#2c313a" };

type State = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready"; posts: BlogPost[] };

export function BlogsApp({
  load,
  onOpen,
  onExit,
}: {
  load: () => Promise<BlogPost[]>;
  onOpen: (url: string) => void;
  onExit: () => void;
}) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    let alive = true;
    load().then(
      (posts) => alive && setState({ kind: "ready", posts }),
      (err: unknown) => alive && setState({ kind: "error", message: err instanceof Error ? err.message : String(err) }),
    );
    return () => {
      alive = false;
    };
  }, [load]);

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape") onExit();
  });

  const count = state.kind === "ready" ? ` (${state.posts.length})` : "";

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      border
      borderStyle="rounded"
      borderColor={C.accent}
      title={` vkrana-me · blogs${count} `}
      titleAlignment="center"
      bottomTitle=" ↑↓ move · enter open · q quit "
      bottomTitleAlignment="center"
    >
      {state.kind === "loading" && <text fg={C.dim}>Fetching posts from {BLOG_URL}…</text>}
      {state.kind === "error" && (
        <text fg={C.err}>
          {state.message}
          <br />
          <span fg={C.dim}>Visit {BLOG_URL}</span>
        </text>
      )}
      {state.kind === "ready" && state.posts.length === 0 && <text fg={C.dim}>No posts found. Visit {BLOG_URL}</text>}
      {state.kind === "ready" && state.posts.length > 0 && (
        <select
          focused
          flexGrow={1}
          showScrollIndicator
          selectedBackgroundColor={C.sel}
          selectedTextColor="#ffffff"
          descriptionColor={C.dim}
          options={state.posts.map((p) => ({
            name: p.title,
            description: [p.date, p.category, p.tags.join(", ")].filter(Boolean).join(" · "),
            value: p.url,
          }))}
          onSelect={(_i, opt) => {
            if (!opt?.value) return;
            try {
              onOpen(String(opt.value));
              setStatus(`Opened ${opt.value}`);
            } catch (err) {
              setStatus(err instanceof Error ? err.message : String(err));
            }
          }}
        />
      )}
      {status ? <text fg={C.ok}>{status}</text> : null}
    </box>
  );
}
