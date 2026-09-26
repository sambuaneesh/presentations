# Making and organising presentations

`decks/` is a tree of folders, like a file browser. Any folder can hold presentations and more
folders. The website shows the same tree: `…/#/mono2micro` is a folder, and
`…/#/mono2micro/agentic-workflow` is a presentation in it.

```
decks/
  mono2micro/                      a folder (folder.json: its title)
    folder.json
    agentic-workflow/              a presentation
      agentic-workflow.tldraw      the deck: open it in tldraw Desktop
      deck.json                    { "title", "description", "listed" }
      cover.jpg                    the picture on its card (optional)
      slides/                      optional: slides drawn from code
      ext/                         optional: its own scenes/actions (docs/extending.md)
  weekly-presentations/
    folder.json
    seeing-is-fixing/
      …
```

Names in paths (folders and presentations) are lowercase letters, digits and dashes; titles can be
anything.

## The studio (the easy way)

```bash
npm run studio          # http://localhost:4321/ (only this machine can reach it)
```

Browse the folders; the trail at the top goes back up.

| To… | In the studio |
|---|---|
| make a presentation | **+ presentation**: a title (and a description if you like). It is made in the folder you're in, already drawn with three hand-drawn starter slides. tldraw doesn't need to be open. |
| draw it | open the `.tldraw` file shown on its card in tldraw Desktop (**copy** gives the path) |
| make a folder | **+ folder** |
| change the title or description, hide it from the website, or rename its link | **edit** |
| set the card picture | **cover**, or drop an image onto the card |
| see it as the website will | **view** (starts the website preview on :5173) |
| move it into another folder | **move** |
| delete it | **delete** (type its name to confirm) |
| rename, move or delete a folder | the buttons on the folder |
| publish | **Save to GitHub**: commit, then push |

Moving, renaming or deleting refuses while that presentation is open in tldraw: close it first
(tldraw would keep saving to the old place).

## The command line

Everything the studio does is also a command, `pres` (`node bin/pres.mjs setup` puts it on your PATH;
`npm run pres -- …` works too):

```bash
pres list                                   # the tree
pres new "Title" --in mono2micro            # make a presentation in a folder (tldraw not needed)
pres new "Title" --in talks --description "one line" --name short-name
pres folder weekly-presentations --title "Weekly presentations"
pres move weekly-presentations/seeing-is-fixing talks     # "." is the top
pres open seeing-is-fixing                  # open it in tldraw
pres build seeing-is-fixing                 # redraw its code slides (slides/)
pres cover seeing-is-fixing                 # save slide 1 as its cover (needs tldraw)
pres check                                  # validate everything
```

A presentation can be named by its path or any unique part of it (`pres build seeing` works).

## From another project

A talk about a project can live in that project while you make it, so you and its agent work on just
that one deck:

```bash
cd ~/some/project
pres new "What we built" --here            # ./presentations/what-we-built/ (+ an AGENTS.md pointing to the guide)
pres build what-we-built                   # after writing slides/*.js (or ask your agent: "run pres guide")
pres shot what-we-built --all              # screenshots to check
pres publish what-we-built --to talks      # onto the website, in decks/talks/
```

The first publish asks which folder (`--to`); it's remembered in its `deck.json`. Commit the
`presentations/` folder in that project if you like; the website gets its own copy on each publish.
[PRESENTATIONS.md](../PRESENTATIONS.md) is the full guide an agent follows.

## Editing a presentation

- **Draw by hand**: open its `.tldraw` in tldraw Desktop and draw. The slide panel, **+ New slide**
  and layouts all work; **Appears: …** in the top bar makes a selection appear on a click.
- **Draw with code** (the hand-drawn house style, or when an agent builds the slides): edit
  `slides/*.js`, list them in `slides/manifest.json`, run `pres build <deck>` (tldraw opens it).
  Rebuilding replaces only the code-drawn slides. See [drawing-slides.md](drawing-slides.md).
- **Speaker notes**: **Notes** in tldraw's top bar, or the `notes` of a slide file.
- Save in tldraw before you commit: the website is built from the saved file (`pres build` and
  `pres publish` save for you).

## Present

In tldraw Desktop or on the website: **▶ Present**. → / Space / click step through each slide's
reveals, then the next slide; ← goes back; Esc exits; drag for a laser pointer.

## The files

`deck.json`:

```json
{ "title": "Seeing is Fixing", "description": "One line for the card (optional).", "listed": true, "pack": 1 }
```

`"pack"` is the template version the deck is frozen to (see [extending.md](extending.md#versions-old-decks-are-frozen));
a deck from another project also records `"publish": { "folder": "talks" }`.

`"listed": false` hides it from the website's folders (its link still works; `?all` shows it).
`pres new` also records a `date`, used only to sort newest first.

`folder.json`: `{ "title": "Weekly presentations", "description": "" }`. It also keeps an empty
folder in git.

## Publish

`pres publish <deck>` commits and pushes just that deck, from a clean temporary checkout, so other
decks and unfinished work in your checkout never come along. Or commit and push to `main` yourself
(the studio's **Save to GitHub**, or git). GitHub Actions exports the whole tree and rebuilds the site
in about a minute; a deck that fails to export is left off with a warning instead of breaking the
site. See [website.md](website.md).
