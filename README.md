# vkrana-me

Personal CLI for Vijendra Rana.

## Install (local dev)

```bash
npm install
npm run build
npm link
vkrana-me --help
```

## Usage

```bash
vkrana-me --help      # show help
vkrana-me --version   # print version
```

## Development

- Source: `src/vkrana-me.ts`
- Build: `tsup` → `dist/vkrana-me.js` (ESM, Node 18+)

```bash
npm run dev        # watch build
npm run typecheck  # tsc --noEmit
```

## License

MIT
