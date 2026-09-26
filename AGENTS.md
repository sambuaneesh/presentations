# AGENTS.md: working in this repository

This is Aneesh S's personal space for presentations: hand-drawn tldraw decks, organised in folders
under `decks/`, published together on one GitHub Pages site.

**Making or changing a presentation? Read [PRESENTATIONS.md](PRESENTATIONS.md)** (or run
`node bin/pres.mjs guide`): the house style, the facts rules, the workflow, the slide kit and every
command. It is the single guide for any agent, here or in another project. This file only adds what
you need to work on the tooling itself.

## The pieces

| Path | Purpose |
|---|---|
| `PRESENTATIONS.md` | the guide (`pres guide` prints it, with `{{REPO}}` filled in) |
| `bin/pres.mjs` | the tool (`bin/deck.mjs` is its old name, kept as an alias) |
| `bin/lib/tldraw-file.mjs` | read/write .tldraw files without the app: records, stamping, the board script |
| `studio/` | the local web UI (`npm run studio`): a JSON API over `decks/` and `bin/pres.mjs`, plus git |
| `decks/…/<name>/` | a central deck (in folders with `folder.json`) |
| `presentation-pack/script/` | the template's board script, being worked on ("dev") |
| `presentation-pack/releases/<n>/` | frozen template versions; decks pin one (`deck.json` `"pack"`) |
| `presentation-pack/paper/kit.exec.js` | the kit code-drawn slides use (`pres build`) |
| `presentation-pack/paper/starter.tldraw`, `starter/` | what `pres new` copies ({{TITLE}}/{{PRESENTER}} filled in) |
| `presentation-pack/bin/` | low-level builders (`install.mjs`, `paper.mjs`, `tl.mjs`) used by `pres` |
| `site/` | the website (gallery + player); `scripts/export-decks.mjs`; `vite.config.js` resolves pack versions |
| `sync-worker/` | the live-room server (Cloudflare Worker) |
| `docs/` | presentations.md · drawing-slides.md · extending.md · website.md |

## Rules for tooling changes

- **Released packs never change.** Edit `presentation-pack/script/`, try it on a deck with
  `pres upgrade <deck> --to dev`, then `pres pack release` and upgrade the decks that should move.
  A new release must still export everything `site-entry.js` lists (the website loads that).
- Keep the CLI and the studio in step: a new command or `deck.json` field should appear in both.
  `deck.json` stays minimal (`title`, optional `description`, `listed`, `pack`, `publish`); don't
  add tags, dates or presenters to the UI.
- A new shape type also needs the live-room schema (`sync-worker/src/TldrawDurableObject.ts`) and a
  worker redeploy (ask first: it's outward-facing).
- tldraw Desktop is reached through its local API (`~/.config/tldraw/server.json`); the
  tldraw-offline skill documents it. Launching the app while it runs overwrites `server.json`
  (`pres` repairs it); kill processes by PID, never with `pkill -f`.
- Commit, push, deploy the worker, or rename the GitHub repo only when the user asks.
- Keep the docs in step: if you change a command, a folder convention or the kit, update
  `PRESENTATIONS.md`, `docs/` and this file in the same change.
