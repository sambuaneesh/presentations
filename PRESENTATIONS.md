# Making a presentation (for any agent, in any project)

This is the one guide for making Aneesh's presentations: hand-drawn tldraw decks, published on one
website. It works the same for any coding agent (Claude Code, Codex, Cursor, Gemini, …) and for
Aneesh by hand. Print it anywhere with `pres guide`; `pres guide --full` adds the whole slide-kit
reference.

**People: just type `pres`** in any folder. A friendly screen opens with your presentations
(this project's first) and everything you can do with them, with folder suggestions and search, so
there's nothing to remember. **Agents: use the commands below.** In a shell without a terminal,
plain `pres` only prints the help.

Everything goes through one command, `pres` (it lives in `{{REPO}}/bin/pres.mjs`; `pres setup`
puts it on the PATH). If `pres` isn't found, use `node {{REPO}}/bin/pres.mjs` instead.

## Where a deck lives

- **Inside the project you're working in** (the usual case when a talk is about that project):
  `pres new "<Title>" --here` makes `./presentations/<name>/`. Only that folder is yours; publishing
  copies it to the website.
- **In the presentations repo** (`{{REPO}}/decks/<folder>/<name>/`): `pres new "<Title>" --in <folder>`.

A deck folder:

```
<name>/
  <name>.tldraw     the deck (tldraw Desktop document; never edit it as a file)
  deck.json         { "title", "description", "listed", "pack" } (+ "publish": { "folder" } for project decks)
  slides/           the slides as code: manifest.json (the order) + one .js file per slide
  cover.jpg         the website card (made when publishing)
  ext/              optional: the deck's own actions/scenes (see {{REPO}}/docs/extending.md)
  AGENTS.md         (project decks) a pointer back to this guide
```

Name a deck by its folder path, its name (`scratch-talk`), or any unique part of it.

## The workflow

1. **Read the source first.** The talk is usually about a paper, a codebase or a result. Collect the
   facts you'll use, with where they come from (§, Fig., Table, file). See *Facts* below.
2. **Make the deck.** `pres new "<Title>" --here` (or `--in <folder>`). It starts with three
   slides (title, one idea, thank you) and needs no tldraw.
3. **Outline.** One idea per slide: title → the problem → the idea → how it works → results →
   limits and questions → closing → thank you. Write the order as `slides/manifest.json`
   (`["01-title", "02-the-problem", …]`).
4. **Draw.** Write one file per slide in `slides/` (the format is below). Keep the starter's
   title and thank-you slides.
5. **Build.** `pres build <deck>` draws them into the deck (it opens tldraw Desktop and saves).
   Use `--only 02-the-problem,03-x` to rebuild some.
6. **Look.** `pres shot <deck> --all` prints one image per slide. **Open and look at every one**:
   overlaps, clipping, text running off the slide, too much on one slide. For the build-up, use
   `pres shot <deck> --slide 4 --steps` to get one picture per click (or `--step k` for one).
   Fix, rebuild with `--only`, look again.
7. **Check.** `pres check <deck>` validates the files and notes.
8. **Publish** only when Aneesh asks: `pres publish <deck>` (a project deck needs `--to <folder>` the
   first time, e.g. `--to mono2micro`; ask which folder). It commits and pushes **only that deck** to
   the website repo, from a clean temporary checkout, so nothing else can come along. The site
   updates in about a minute, at `…/#/<folder>/<name>`.

To change a deck later, edit its `slides/*.js`, then `pres build <deck> --only <file>`, look, and
publish again.

## House style (Aneesh's standing preferences; don't drift from them)

- **Hand-made with tldraw's own tools**: real shapes drawn by code (sketchy boxes, pen strokes, bound
  arrows, sticky notes, handwriting). Not polished HTML infographics or screenshots of charts.
- **One idea per slide.** If it needs two ideas, make two slides; more slides are fine.
- **Minimal**: ink on paper, lots of empty space, a short handwritten title (or none), one drawing,
  maybe one line of text. Bullet lists go in the notes, not on the slide.
- **One accent colour, red**, for emphasis and marks. Green only for "fixed / works". Grey for
  anything secondary.
- **Build up on clicks** with small stepped entrances (`beat`, `anim`), like indie animation.
- **Slide changes are instant cuts.** Never add transitions between slides unless asked.
- A creative visual metaphor per talk is welcome, but it must stay legible from the back of a room.

## Facts

**Every number, name, quote and claim must come from the source material.** Read the source fully
(PDF → text; look at the figures). Put the location in the slide's `source` line and its notes
(`§3.2 · Table I`). Label anything illustrative or schematic as such. If you're unsure, leave it out.

## A slide file

```js
// slides/02-the-problem.js — slide-local coordinates, 1920 × 1080, origin top left
export default {
	name: 'The problem',             // shown in the slide panel
	kicker: 'I · the problem',       // optional: small red line above the title
	title: 'Words are not enough',   // optional: short
	source: 'Table II · §4',         // optional: small grey citation, bottom right
	notes: 'COVER\n• the point\n• the one number\nCLICKS\n1 · the arrow appears\nREF · §4',
	draw(k) {
		k.note(300, 380, 'a bug report\nin words', { color: 'yellow', id: 'words' })
		k.box(1100, 330, 520, 360, { dash: 'dotted', id: 'picture' })
		k.arrow('words', 'picture', { text: 'can you picture it?', color: 'red', bend: -30, beat: 1, anim: 'fade' })
		k.text(1300, 470, '?', { size: 'xl', scale: 3, color: 'red', beat: 2, anim: 'wiggle' })
	},
}
```

Keep content between y ≈ 230 and 990 (the title sits above, the footer below). Slide files can't
`import` anything; local helper functions inside the file are fine.

**The kit `k`:** `text(x, y, str)`, `box(x, y, w, h, { geo, text })` (rectangle, ellipse, cloud, star,
diamond, oval, heart, …), `circle(cx, cy, r)`, `note(x, y, str, { color })`, `pen([[x, y], …], { wob })`,
`loop(cx, cy, rx, ry)` (the red ring round something), `underline(x, y, w)`, `cross(x, y, s)`,
`tick(x, y, s)`, `arrow(fromTag, toTag, { text, bend })` (a real arrow bound to both shapes; `[x, y]`
points for a free one), `grid(x, y, cols, count, pitch, size, { each(i) })`.

**Options on every call:** `id` (a tag, for arrows and stable rebuilds), `color` (black grey red green
blue yellow orange violet, light-…, white), `size` (s m l xl, plus `scale` for big text), `font`
(draw mono sans serif), `fill` (none semi solid pattern), `dash` (draw solid dashed dotted), `rot`
(degrees), **`beat`** (the click that reveals it; omit to show it with the slide), **`anim`** (its
entrance: `pop`, `wipe` (looks drawn: good for pen strokes), `drop`, `wiggle`, `fade`, `zoom`, `none`),
`origin` (`[x, y]`, a shared centre so several shapes animate as one drawing).

Interactive slides (press, drag and drop while presenting) and the details of every call:
`pres guide --full`. Forty-three real slides to learn from:
`{{REPO}}/decks/weekly-presentations/seeing-is-fixing/slides/`.

## Speaker notes

Every slide gets short checklist notes, not a script:

```
COVER
• the point of this slide
• the one number that matters
CLICKS
1 · what appears · 2 · what appears
REF · §3.2 · Table I
```

Interactive slides use `DO` (what to press or drag) instead of `CLICKS`.

## All commands

```
pres                                         (people, in a terminal) the all-in-one screen
pres guide [--full]                          this guide (+ the full kit reference)
pres new "<title>" --here | --in <folder>    make a deck [--name <name>] [--description "…"]
pres list                                    this project's decks and the website's tree
pres build <deck> [--only a,b]               draw slides/*.js into the deck
pres shot <deck> [--slide n|name] [--step k | --steps] [--all] [--out dir]   screenshots; prints the paths
pres check [<deck>]                          validate
pres publish <deck> [--to <folder>] [-m "…"] put just this deck on the website
pres open <deck> · cover <deck> · install <deck>
pres pack · pres upgrade <deck>              template versions (below)
pres folder <path> · move <deck> <folder>    organise the website's tree
pres setup [--claude]                        put pres on the PATH (--claude: Claude Code skill too)
```

## Template versions

A deck is frozen to the version of the template (the "pack": slide panel, presenting, reveals) it was
made with, `"pack"` in deck.json, so template changes never break old talks, on the desktop or on the
website. `pres pack` shows the versions and which decks use them. Changes to the template are made in
`{{REPO}}/presentation-pack/script/` and become a version with `pres pack release`. A deck moves to a
newer version only with `pres upgrade <deck>` (look at it afterwards).

## Rules

- **Never edit a `.tldraw` file directly** or while it's open in tldraw; go through `pres` or the app.
- Commit, push or publish only when Aneesh asks. Never deploy the live-room server or change the
  GitHub repo without asking.
- Don't `pkill -f` a pattern that also matches your own command line (it kills your shell); kill by PID.
- If tldraw's API stops answering after the app was launched a second time, `~/.config/tldraw/server.json`
  was overwritten; `pres` repairs this itself, otherwise restart tldraw Desktop.
- Big decks: slide files are independent, so helpers can write different slides in parallel, but
  only one may `pres build` a given deck at a time.
