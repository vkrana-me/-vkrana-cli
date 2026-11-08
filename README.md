# vkrana-me

Personal CLI for Vijendra Rana, built with [OpenTUI](https://opentui.com) + React.

Requires [Bun](https://bun.sh) ≥ 1.3.14.

## Usage

```bash
bunx vkrana-me           # interactive profile view
vkrana-me --json         # raw JSON for scripting
vkrana-me blog           # browse posts (alias: blogs) from vkrana.me/blog (enter opens in browser)
vkrana-me blogs --json   # blog posts as JSON
vkrana-me | cat          # plain text when piped / NO_COLOR / TERM=dumb
vkrana-me --version
```

In the interactive view:

| Key | Action |
|---|---|
| `/` | Open the command menu: `/blog`, `/info`, `/quit` (type to filter, ↑↓ choose, Enter run, Esc close) |
| `↑` `↓` | Scroll the profile / move through posts |
| `Enter` | Open the selected post in your browser |
| `Esc` / `Backspace` | Back from blog posts to the profile |
| `q` | Quit |

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
- UI: `src/ui/Shell.tsx` (views + `/` command menu) switches between `src/ui/App.tsx` (profile) and `src/ui/BlogsApp.tsx` (posts); launched by `src/ui/run.tsx`
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
