# Extending

Two places to put new things:

- **A deck's `ext/` folder**: code only that deck needs (an animated scene, actions for its
  interactive slides, a template). It travels with the deck and never touches the others.
- **The pack (`presentation-pack/`)**: things every deck should get (a new kit call, a new entrance
  animation, a theme, a UI feature). Change it in `script/`, release it as a new version, and upgrade
  the decks that should have it (below). Decks you don't upgrade keep working exactly as they were.

## A deck's extension (`decks/…/<deck>/ext/`)

`ext/index.js` default-exports any of:

```js
import { MyScene } from './my-scene.js'
import { myActions } from './actions.js'

export default {
	scenes: { 'my-scene': { name: 'My scene', beats: 4, render: MyScene } },   // animated `scene` shapes
	actions: myActions,                                                       // { name: (editor, ctx) => void }
	templates: { 'my-template': { name: 'My template', theme: 'ink', slides: [/* layout entries */] } },
	shapeUtils: [],                                                           // extra shape types (see below)
}
```

- **Import the pack as `@pack/…`**, e.g. `import { html, C, F, box } from '@pack/scenes/kit.js'`.
  They mean the pack version the deck is pinned to: the desktop installer rewrites them to relative
  paths inside the deck's board script, and the website resolves them per deck (`site/vite.config.js`).
- **Other imports**: `tldraw` and `react` work everywhere. Files are plain ES modules (no JSX, no
  npm packages beyond those two).
- **Put it into the deck**: `pres install <deck>` (straight into the file when the deck is closed,
  through tldraw when it's open). The website picks up every deck's `ext/` automatically.

### Scenes

A scene is an animated drawing written as a React component (with `htm`), rendered inside one
`scene` shape. It gets `{ b, still, frozen }`: the build step being shown (Infinity while editing),
whether to skip entrance animation, and whether to skip ambient motion (thumbnails). Its `beats` count
is how many clicks it animates through. The kit is `presentation-pack/script/scenes/kit.js`. Example:
`decks/mono2micro/agentic-workflow/ext/agentic.js`, laid out by the `agentic-workflow` template in its
`agenticDeck.js`.

Prefer native, code-drawn slides ([drawing-slides.md](drawing-slides.md)) for the hand-made look.
Use a scene when a slide needs motion native shapes can't do, such as elements travelling between
places across many steps.

### Actions

The functions interactive slides call (see [drawing-slides.md](drawing-slides.md#interactive-slides)).
They run inside one `editor.run` with shape locks ignored. They change shapes (props, x/y, meta), so
live-room viewers see the result. Example: `decks/weekly-presentations/seeing-is-fixing/ext/ablation.js`.

### Templates

A template seeds slides from layouts: in an empty deck the slide panel offers every template, and
**Layouts ▾** lists them too. Slides are `{ layout, overrides }`; the `scene` layout places a scene under an editable kicker and
title (see `presentation-pack/script/lib/layouts.js`).

### New shape types

`shapeUtils` register extra tldraw shape types. Live rooms validate every record against the sync
server's schema, so also add the type's props to `sync-worker/src/TldrawDurableObject.ts` (like
`scene`) and redeploy the worker.

## A deck's colours (pack 7 on)

Slides use tldraw's colour names (`black`, `grey`, `red`, `green`, `yellow`, …). A deck repaints them
with a palette in its document meta, `pp.palette` (`presentation-pack/script/lib/palette.js` applies it
through `editor.updateThemes`, per editor, so other decks keep their colours). Set it in tldraw (or with
`exec` through the local API) with `updateDeck(editor, { palette })` semantics:

```js
{
  paper: '#ffffff',      // what light tints are mixed towards
  solid: '#ffffff',      // tldraw's base fill: the slide paper (fill 'semi' uses it)
  background: '#f3f5f8', // the canvas around the slides
  black: '#364f6b',      // a plain hex: its semi/pattern/note tints are mixed from it
  red: { solid: '#e8436f', pattern: '#fc5185', semi: '#fde0e7', noteFill: '#fdc9d6' }, // or set variants
}
```

Note tldraw's fill names: `fill: 'solid'` paints a colour's `semi` tint, `fill: 'semi'` paints the
theme's `solid`. Only light mode is repainted. Seeing is Fixing has the full example.

## The pack (`presentation-pack/`)

| Want | Where |
|---|---|
| a new kit call for code-drawn slides | `paper/kit.exec.js` (runs inside tldraw; no imports) |
| a new entrance animation | `ANIMS` + `BEAT_CSS` in `script/ui/Overlays.js` |
| a theme | `script/lib/themes.js` (roles → tldraw colours and fonts) |
| a canvas layout | `script/lib/layouts.js` |
| presenting behaviour (steps, interactions) | `script/ui/presentTool.js` |
| built-in actions | `script/lib/actions/index.js` |
| starter slides for `pres new` | `paper/starter/` (`{{TITLE_JSON}}` etc. are filled in) |

### Versions: old decks are frozen

Each deck runs the pack version in its `deck.json` (`"pack": 1`), on the desktop and on the website.
`releases/<n>/` are frozen copies of `script/`; never edit them.

```bash
pres pack                          # versions, and which decks use each
pres upgrade my-deck --to dev      # try the unreleased script/ on one deck (desktop and site preview)
pres pack release                  # freeze script/ as the next version; new decks get it
pres upgrade my-deck               # move a deck to the newest version, then look at it (pres shot --all)
```

The website bundles every version and loads the one a deck asks for. A version must keep exporting
what `script/site-entry.js` lists. `paper/kit.exec.js` (the slide builder) isn't versioned: it only
matters when you rebuild slides.

The [pack README](../presentation-pack/README.md) describes its internals.
