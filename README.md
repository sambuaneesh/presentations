# Presentations

My personal space for presentations: hand-drawn decks made in [tldraw Desktop](https://tldraw.dev),
kept in one repository, published together on one website.

- **One template.** Every deck uses the same presentation pack (`presentation-pack/`): slide panel,
  build steps, presenting, speaker notes, the hand-drawn "ink & safelight" look. Each deck is frozen
  to the template version it was made with, so changing the template never breaks an old talk.
- **Folders.** `decks/` is a tree of folders; each presentation is a folder in it holding the deck, a
  title and optional description, and (optionally) the code that draws its slides.
- **One website.** The same folders on GitHub Pages; each presentation has its own link
  (`…/#/folder/name`), and any of them can be presented live to other devices.
- **Agent-first, from any project.** One tool, `pres`, does everything, and one guide,
  [PRESENTATIONS.md](PRESENTATIONS.md), tells any agent (Claude Code, Codex, Cursor, …) how. Make a
  talk inside the project it's about, then publish just that deck with one command.

## Quick start

The easiest way in is the **studio**, a local web app for managing everything:

```bash
npm run studio          # opens http://localhost:4321/
```

Browse the folders, make presentations and folders, edit titles and descriptions, set covers, move
things around, preview the website, and commit and push. A new presentation is a `.tldraw` file: open
it in tldraw Desktop to draw it. The same things from the command line:

```bash
pres list                                   # the tree
pres new "My next talk" --in talks          # make decks/talks/my-next-talk/
pres open my-next-talk                      # draw it in tldraw
git add decks && git commit -m "Add my next talk" && git push   # it's on the website
```

(`npm run pres -- <command>` works too.) tldraw Desktop must be installed; the tool opens it when needed.

### From another project

```bash
node ~/path/to/presentations/bin/pres.mjs setup   # once: puts `pres` on your PATH (add --claude for the Claude Code skill)
cd ~/some/project
pres new "What we built" --here             # ./presentations/what-we-built/, only yours to edit
# tell your agent: "make a presentation about X; run `pres guide` first"
pres build what-we-built && pres shot what-we-built --all
pres publish what-we-built --to talks        # commits and pushes just this deck; live in a minute
```

## Where things are

| Path | What it is |
|---|---|
| `decks/…/<name>/` | One presentation: `<name>.tldraw`, `deck.json`, optional `slides/`, `ext/`, `cover.jpg`, in folders (`folder.json`) |
| `PRESENTATIONS.md` | The guide for making a deck, for any agent (`pres guide` prints it) |
| `bin/pres.mjs` | The tool: `guide · list · new · build · shot · check · publish · open · install · cover · pack · upgrade · folder · move · export · setup` |
| `studio/` | The local studio (`npm run studio`): the same operations in a web page, plus git |
| `presentation-pack/` | The shared template (a tldraw board script), its frozen versions (`releases/`) and builders. [README](presentation-pack/README.md) |
| `site/` | The website: the gallery and a player for every deck |
| `sync-worker/` | The live-room server (Cloudflare Worker), shared by all decks |
| `docs/` | The guides below |
| `AGENTS.md` | Pointers for agents working on the tooling itself |

## Guides

- [Making and organising presentations](docs/presentations.md): the studio, folders, new decks, editing, moving, deleting
- [Drawing slides with code](docs/drawing-slides.md): the hand-drawn kit, build steps, interactive slides, speaker notes
- [Extending](docs/extending.md): a deck's own scenes and actions, templates, themes, the pack
- [The website](docs/website.md): links, publishing on GitHub Pages, live rooms, running it locally

## Decks

| Deck | What |
|---|---|
| [`weekly-presentations/seeing-is-fixing`](decks/weekly-presentations/seeing-is-fixing) | Huang et al., *Seeing is Fixing* (arXiv 2506.16136), 43 hand-drawn slides, two interactive |
| [`mono2micro/agentic-workflow`](decks/mono2micro/agentic-workflow) | An agentic monolith-to-microservice workflow, traced live on one real run |
