# vkrana-me

Personal CLI for Vijendra Rana, built with [OpenTUI](https://opentui.com) + React.

Requires [Bun](https://bun.sh) ≥ 1.3.14.

## Usage

```bash
bunx vkrana-me           # interactive profile view (↑↓ scroll, q/esc quit)
vkrana-me --json         # raw JSON for scripting
vkrana-me blog           # browse posts (alias: blogs) from vkrana.me/blog (enter opens in browser)
vkrana-me blogs --json   # blog posts as JSON
vkrana-me | cat          # plain text when piped / NO_COLOR / TERM=dumb
vkrana-me --version
```

Image protocol is auto-detected; force with `OPENTUI_IMAGE_PROTOCOL=kitty|sixel|blocks vkrana-me`.

## Install (local dev)

```bash
bun install
bun run build
bun link
vkrana-me --help
```

## Development

- Entry: `src/vkrana-me.ts` (commander)
- UI: `src/ui/App.tsx`, `src/ui/BlogsApp.tsx` (OpenTUI React), launched by `src/ui/run.tsx`
- Avatar: `assets/github_pic.png` shown with OpenTUI `<image>` (Kitty graphics / Sixel, Unicode-block fallback). Embedded into `src/ui/avatar-data.ts` — rerun `bun run gen:avatar` after replacing the image
- Blogs: `src/blogs.ts` fetches and parses https://www.vkrana.me/blog/ (all pages) at runtime
- Build: `bun build` → `dist/vkrana-me.js` (dependencies external, so the native OpenTUI package resolves at install)

```bash
bun run dev        # run from source
bun run typecheck  # tsc --noEmit
bun run lint
bun test           # OpenTUI testRender snapshots + plain/json output
```

## License

MIT
