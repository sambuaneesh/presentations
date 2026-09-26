#!/usr/bin/env node
// pres: make, check and publish presentations in the house style, from any project, with any agent.
// (`deck` is an alias.) Run `pres guide` for the full instructions an agent (or you) should follow.
//
// Where decks live:
//   • centrally, in this repo's decks/ tree (folders; a folder with deck.json is a deck), e.g.
//     decks/mono2micro/agentic-workflow → website link …/#/mono2micro/agentic-workflow
//   • inside another project, in ./presentations/<name>/ (pres new --here); `pres publish` copies it
//     into the tree when it's ready
// A deck can be named by its folder path, its path in the tree, or any unique part of its name.
//
//   pres                                     (in a terminal) the friendly all-in-one screen
//   pres help                                this list
//   pres guide [--full]                      the instructions: style, workflow, the slide kit
//   pres list [--json]                       the central tree (and ./presentations/ decks here)
//   pres new "<title>" [--in <folder>] [--here] [--name <name>] [--description "…"]
//                                            make a deck from the starter (tldraw not needed)
//   pres build <deck> [--only a,b]           draw the deck's code slides (slides/*.js) into it
//   pres shot <deck> [--slide n|name] [--step k | --steps] [--all] [--out dir]
//                                            screenshot slides (prints image paths) to check them;
//                                            --steps: one image per click
//   pres check [<deck>]                      validate deck(s) before publishing
//   pres publish <deck> [--to <folder>] [-m "…"]
//                                            commit and push just this deck to the website
//   pres open <deck> · install <deck> · cover <deck>
//   pres pack [release]                      pack versions and which decks use them; freeze script/ as a new one
//   pres upgrade <deck> [--to <n>|dev]       move a deck to the newest (or another) pack version
//   pres folder <path> [--title "…"] · move <deck|folder> <to-folder> · export
//   pres setup [--claude]                    put `pres` on your PATH (~/.local/bin); --claude: the skill too
//
// build/shot/open/cover need tldraw Desktop (they open the deck in it); the rest don't.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { stampFile, readScript, writeScript } from './lib/tldraw-file.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DECKS = path.join(ROOT, 'decks')
const PACK = path.join(ROOT, 'presentation-pack')
const STARTER = path.join(PACK, 'paper', 'starter.tldraw')
const STARTER_SLIDES = path.join(PACK, 'paper', 'starter')
const GUIDE = path.join(ROOT, 'PRESENTATIONS.md')
const RELEASES = path.join(PACK, 'releases')
const LOCAL_DIR = 'presentations' // decks inside another project: ./presentations/<name>/
const PRESENTER = process.env.DECK_PRESENTER || 'Aneesh S'
const run = (script, args) =>
	new Promise((resolve) => {
		const p = spawn(process.execPath, [script, ...args], { stdio: 'inherit' })
		p.on('exit', (code) => resolve(code ?? 1))
	})

// ---------- args ----------
function parseArgs(argv) {
	const out = { _: [] }
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i]
		if (a.startsWith('--') || a === '-m') {
			const key = a === '-m' ? 'message' : a.slice(2)
			const next = argv[i + 1]
			if (next === undefined || next.startsWith('--')) out[key] = true
			else out[key] = argv[++i]
		} else out._.push(a)
	}
	return out
}
// As a command (`pres`, or its alias `deck`, also through a symlink on PATH), a problem prints and
// exits; imported (by the studio), it throws.
const AS_CLI = (() => {
	try {
		const bin = fs.realpathSync(process.argv[1] ?? '')
		return [fileURLToPath(import.meta.url), path.join(path.dirname(fileURLToPath(import.meta.url)), 'deck.mjs')].includes(bin)
	} catch {
		return false
	}
})()
const die = (msg) => {
	if (!AS_CLI) throw new Error(msg)
	console.error(msg)
	process.exit(1)
}

// ---------- decks ----------
export const slugify = (s) =>
	String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'untitled'
const NAME = /^[a-z0-9][a-z0-9-]*$/
const skip = (name) => name.startsWith('.') || name.startsWith('_')
const titleFromName = (name) => name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())
const readJson = (f) => {
	try {
		return JSON.parse(fs.readFileSync(f, 'utf8'))
	} catch {
		return null
	}
}
const isDeckDir = (dir) => fs.existsSync(path.join(dir, 'deck.json')) || fs.existsSync(path.join(dir, `${path.basename(dir)}.tldraw`))
const inTree = (dir) => (path.resolve(dir) + path.sep).startsWith(DECKS + path.sep) && path.resolve(dir) !== DECKS

// Everything about the deck in folder `dir`. `path` is its place in the central tree (null for a
// deck that lives in another project); `label` is how to name it in messages.
function deckAt(dir) {
	dir = path.resolve(dir)
	const name = path.basename(dir)
	const rel = inTree(dir) ? path.relative(DECKS, dir).split(path.sep).join('/') : null
	const jsonFile = path.join(dir, 'deck.json')
	const meta = readJson(jsonFile)
	return {
		kind: 'deck',
		path: rel,
		label: rel ?? path.relative(process.cwd(), dir) ?? dir,
		local: !rel,
		name,
		folder: rel ? (path.dirname(rel) === '.' ? '' : path.dirname(rel)) : null,
		dir,
		file: path.join(dir, `${name}.tldraw`),
		meta: meta ?? {},
		metaError: meta ? null : fs.existsSync(jsonFile) ? 'deck.json is not valid JSON' : 'deck.json missing',
		hasFile: fs.existsSync(path.join(dir, `${name}.tldraw`)),
		hasSlides: fs.existsSync(path.join(dir, 'slides', 'manifest.json')),
		hasExt: fs.existsSync(path.join(dir, 'ext', 'index.js')),
		cover: ['cover.jpg', 'cover.png'].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f)) ?? null,
	}
}

function folderInfo(rel) {
	const meta = readJson(path.join(DECKS, rel, 'folder.json')) ?? {}
	return { kind: 'folder', path: rel, name: path.basename(rel), folder: path.dirname(rel) === '.' ? '' : path.dirname(rel), title: meta.title || titleFromName(path.basename(rel)), description: meta.description ?? '' }
}

// The central tree: every folder and deck, parents before children.
export function walk() {
	const folders = []
	const decks = []
	const visit = (rel) => {
		const dir = path.join(DECKS, rel)
		for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
			if (!e.isDirectory() || skip(e.name)) continue
			const child = rel ? `${rel}/${e.name}` : e.name
			if (isDeckDir(path.join(DECKS, child))) decks.push(deckAt(path.join(DECKS, child)))
			else {
				folders.push(folderInfo(child))
				visit(child)
			}
		}
	}
	if (fs.existsSync(DECKS)) visit('')
	decks.sort((a, b) => (b.meta.date ?? '').localeCompare(a.meta.date ?? '') || a.path.localeCompare(b.path))
	return { folders, decks }
}

// Decks in ./presentations/ of the project you're in (not the central repo itself).
function localDecks(cwd = process.cwd()) {
	const dir = path.join(cwd, LOCAL_DIR)
	if (path.resolve(cwd) === ROOT || !fs.existsSync(dir)) return []
	return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && !skip(e.name) && isDeckDir(path.join(dir, e.name))).map((e) => deckAt(path.join(dir, e.name)))
}

export function findDeck(q) {
	if (!q) die('Which deck? (pres list shows them)')
	// 1. a folder path
	const abs = path.resolve(String(q))
	if (fs.existsSync(abs) && fs.statSync(abs).isDirectory() && isDeckDir(abs)) return deckAt(abs)
	// 2. by name or path: decks of this project first, then the central tree
	const s = String(q).toLowerCase()
	for (const pool of [localDecks(), walk().decks]) {
		const exact = pool.filter((d) => d.path === q || d.name === q)
		if (exact.length === 1) return exact[0]
		const hits = pool.filter((d) => (d.path ?? d.name).includes(s) || (d.meta.title ?? '').toLowerCase().includes(s))
		if (hits.length === 1) return hits[0]
		if (hits.length > 1) die(`"${q}" matches several decks: ${hits.map((d) => d.label).join(', ')}`)
	}
	die(`No deck matches "${q}". Try pres list, or give the deck's folder path.`)
}

function checkFolderPath(p) {
	const clean = String(p ?? '').replace(/^\/+|\/+$/g, '')
	if (clean === '' || clean === '.') return ''
	for (const part of clean.split('/')) if (!NAME.test(part)) die(`"${part}": folder names are lowercase letters, digits and dashes`)
	if (isDeckDir(path.join(DECKS, clean))) die(`${clean} is a deck, not a folder`)
	return clean
}

// ---------- operations (also used by the studio) ----------
export function makeFolder(rel, title) {
	rel = checkFolderPath(rel)
	if (!rel) die('give the folder a name')
	const dir = path.join(DECKS, rel)
	fs.mkdirSync(dir, { recursive: true })
	// folder.json keeps the folder in git even while it's empty, and holds its title.
	const file = path.join(dir, 'folder.json')
	const meta = readJson(file) ?? {}
	fs.writeFileSync(file, JSON.stringify({ ...meta, title: title || meta.title || titleFromName(path.basename(rel)) }, null, '\t') + '\n')
	return rel
}

// Pointer files for agents working inside a deck that lives in another project.
function writeAgentPointers(dir) {
	const text = `# This folder is a presentation

It was made with \`pres\` (${ROOT}) and is drawn in its hand-made house style.
Before changing it, **run \`pres guide\`** and follow it: the style, the facts rules, the slide kit,
and how to check your work.

- slides: \`slides/*.js\` (order in \`slides/manifest.json\`), drawn with \`pres build ${path.basename(dir)}\`
- check: \`pres shot ${path.basename(dir)} --all\` (look at the images), \`pres check ${path.basename(dir)}\`
- publish to the website: \`pres publish ${path.basename(dir)}\` (asks for \`--to <folder>\` the first time)
`
	fs.writeFileSync(path.join(dir, 'AGENTS.md'), text)
	fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '@AGENTS.md\n')
}

export async function newDeck({ title, folder = '', name, description = '', here = false, cwd = process.cwd() }) {
	title = String(title ?? '').trim()
	if (!title) die('a new deck needs a title')
	name = name ? String(name) : slugify(title)
	if (!NAME.test(name)) die(`"${name}": deck names are lowercase letters, digits and dashes`)
	let dir
	if (here) {
		if (path.resolve(cwd) === ROOT) die('--here is for other projects; in this repo use --in <folder>')
		dir = path.join(cwd, LOCAL_DIR, name)
	} else {
		folder = checkFolderPath(folder)
		dir = path.join(DECKS, folder, name)
		if (folder && !fs.existsSync(path.join(DECKS, folder))) makeFolder(folder)
	}
	if (fs.existsSync(dir)) die(`${path.relative(cwd, dir) || dir} already exists`)
	fs.mkdirSync(path.join(dir, 'slides'), { recursive: true })
	const meta = { title, description: String(description ?? '').trim(), date: new Date().toISOString().slice(0, 10), listed: true, pack: latestPack() }
	fs.writeFileSync(path.join(dir, 'deck.json'), JSON.stringify(meta, null, '\t') + '\n')
	// The slides as code (so they can be rebuilt or extended with `pres build`)…
	const files = fs.readdirSync(STARTER_SLIDES).filter((f) => f.endsWith('.js')).sort()
	for (const f of files) {
		const src = fs.readFileSync(path.join(STARTER_SLIDES, f), 'utf8').replaceAll('{{TITLE_JSON}}', JSON.stringify(title)).replaceAll('{{PRESENTER_JSON}}', JSON.stringify(PRESENTER))
		fs.writeFileSync(path.join(dir, 'slides', f), src)
	}
	fs.writeFileSync(path.join(dir, 'slides', 'manifest.json'), JSON.stringify(files.map((f) => f.replace(/\.js$/, '')), null, '\t') + '\n')
	// …and the deck itself, already drawn: the starter with this title filled in.
	stampFile(STARTER, path.join(dir, `${name}.tldraw`), { TITLE: title, PRESENTER }, name)
	// …running the pack version it's pinned to.
	writeScript(path.join(dir, `${name}.tldraw`), await packFilesFor(deckAt(dir)))
	if (here) writeAgentPointers(dir)
	return here ? dir : path.relative(DECKS, dir).split(path.sep).join('/')
}

export function moveEntry(from, toFolder) {
	const src = path.join(DECKS, from)
	if (!from || !fs.existsSync(src)) die(`no "${from}" in decks/`)
	const to = checkFolderPath(toFolder)
	const dest = path.join(DECKS, to, path.basename(from))
	if (path.resolve(dest) === path.resolve(src)) return from
	if (path.resolve(dest).startsWith(path.resolve(src) + path.sep)) die("can't move a folder into itself")
	if (fs.existsSync(dest)) die(`decks/${path.relative(DECKS, dest)} already exists`)
	if (to && !fs.existsSync(path.join(DECKS, to))) makeFolder(to)
	fs.renameSync(src, dest)
	return path.relative(DECKS, dest).split(path.sep).join('/')
}

// ---------- pack versions ----------
// Decks are frozen to a pack version (deck.json "pack"): a release in presentation-pack/releases/<n>/,
// which never changes, or "dev" (presentation-pack/script/, where the pack is worked on). Changing the
// pack changes no deck until it's released (pres pack release) and a deck is upgraded to it.
export const packVersions = () => (fs.existsSync(RELEASES) ? fs.readdirSync(RELEASES).filter((n) => /^\d+$/.test(n)).map(Number).sort((a, b) => a - b) : [])
export const latestPack = () => packVersions().at(-1) ?? 'dev'
const packDir = (v) => (v === 'dev' ? path.join(PACK, 'script') : path.join(RELEASES, String(v)))
const deckPack = (deck) => deck.meta.pack ?? latestPack()
function checkPack(v) {
	if (v === 'dev' || packVersions().includes(Number(v))) return v === 'dev' ? 'dev' : Number(v)
	die(`there is no pack version ${v} (have: ${[...packVersions(), 'dev'].join(', ')})`)
}
async function packFilesFor(deck) {
	const { packFiles } = await import(path.join(PACK, 'bin', 'install.mjs'))
	return packFiles({ script: packDir(checkPack(deckPack(deck))), ext: deck.hasExt ? path.join(deck.dir, 'ext') : undefined })
}
const sameFiles = (a, b) => a.size === b.size && [...a].every(([k, v]) => b.get(k)?.equals(v))

// ---------- tldraw Desktop ----------
async function tl() {
	return import(path.join(PACK, 'bin', 'tl.mjs'))
}

export async function openDocs() {
	try {
		return await (await tl()).search('return await api.getDocs()')
	} catch {
		return null
	}
}

async function openDocFor(deck, { wait = 40 } = {}) {
	const match = (list) => list?.find((d) => d.filePath && path.resolve(d.filePath) === path.resolve(deck.file))
	let list = await openDocs()
	let doc = match(list)
	if (doc) return ready(doc)
	if (!deck.hasFile) die(`${deck.label} has no ${path.basename(deck.file)} yet.`)
	// Launching the app while it runs hands the file to the running app, but the short-lived second
	// process rewrites server.json with its own (soon dead) port, even after the hand-off. Keep the
	// running app's details and put them back whenever server.json names a process that isn't alive.
	const { serverJsonPath } = await tl()
	const serverJson = serverJsonPath()
	const before = list && fs.existsSync(serverJson) ? fs.readFileSync(serverJson, 'utf8') : null
	const alive = (text) => {
		try {
			return process.kill(JSON.parse(text).pid, 0)
		} catch (e) {
			return e.code === 'EPERM'
		}
	}
	const restore = () => {
		if (!before || !fs.existsSync(serverJson)) return
		const now = fs.readFileSync(serverJson, 'utf8')
		if (now !== before && !alive(now) && alive(before)) fs.writeFileSync(serverJson, before, { mode: 0o600 })
	}
	const app = process.env.TLDRAW_APP ?? 'tldraw-offline'
	const child = spawn(app, [deck.file], { detached: true, stdio: 'ignore' })
	let exited = !before
	child.on('error', () => die(`Could not start "${app}". Open ${deck.file} in tldraw Desktop (or set TLDRAW_APP).`))
	child.on('exit', () => (exited = true))
	child.unref()
	for (let i = 0; i < wait * 2; i++) {
		await new Promise((r) => setTimeout(r, 500))
		restore()
		doc ??= match(await openDocs())
		if (doc && exited) {
			await new Promise((r) => setTimeout(r, 300))
			restore()
			return ready(doc)
		}
	}
	die(`${deck.label} did not open in tldraw Desktop within ${wait}s.`)
}

// A window that just opened lists its document before its editor has mounted.
async function ready(doc) {
	const { exec } = await tl()
	for (let i = 0; i < 60; i++) {
		try {
			if (await exec(doc.id, 'return !!editor')) return doc
		} catch (e) {
			if (!/not mounted|not ready|no editor/i.test(e.message)) throw e
		}
		await new Promise((r) => setTimeout(r, 500))
	}
	die(`${doc.name} opened but its editor never became ready`)
}

// Put the deck's pack version (and its ext/) into it: through the app if the deck is open there,
// else straight into the file (no tldraw needed).
async function installInto(deck) {
	const files = await packFilesFor(deck)
	const docs = await openDocs()
	const doc = docs?.find((d) => d.filePath && path.resolve(d.filePath) === deck.file)
	const what = `pack ${deckPack(deck)}${deck.hasExt ? ' + ext/' : ''}`
	if (doc) {
		const { install } = await import(path.join(PACK, 'bin', 'install.mjs'))
		const r = await install(doc, { script: packDir(checkPack(deckPack(deck))), ext: deck.hasExt ? path.join(deck.dir, 'ext') : undefined })
		return console.log(`installed ${what} into ${deck.label} (open in tldraw; ${r.files} files)`)
	}
	if (sameFiles(readScript(deck.file), files)) return console.log(`${deck.label} already runs ${what}`)
	writeScript(deck.file, files)
	console.log(`installed ${what} into ${deck.label} (${files.size} files)`)
}

async function saveCover(deck, doc) {
	const [shot] = await screenshots(deck, doc, { slides: [1] })
	if (!shot) return console.log(`${deck.label} has no slides yet; no cover saved`)
	for (const f of ['cover.png', 'cover.jpg']) fs.rmSync(path.join(deck.dir, f), { force: true })
	fs.copyFileSync(shot.file, path.join(deck.dir, 'cover.jpg'))
	console.log(`saved ${path.relative(process.cwd(), path.join(deck.dir, 'cover.jpg'))}`)
}

// Screenshot slides of an open deck. `slides`: 1-based numbers or name fragments; `step`: show the
// slide as it looks after that many clicks (default: everything revealed), or 'all' for one image per
// click (0 … its last). Returns [{ n, name, step, file }].
async function screenshots(deck, doc, { slides = null, step = null, size = 'large', out, onShot = () => {} } = {}) {
	const { search, exec } = await tl()
	const frames = await search(`return (await api.getShapes(${JSON.stringify(doc.id)})).shapes.filter(s => s.type === 'frame' && !s.meta?.joinSlide).sort((a, b) => a.x - b.x || a.y - b.y).map(f => ({ id: f.id, name: f.props.name, x: f.x, y: f.y, w: f.props.w, h: f.props.h }))`)
	const pick = slides
		? slides.map((q) => {
				const n = Number(q)
				const f = Number.isInteger(n) && n >= 1 ? frames[n - 1] : frames.find((f) => f.name.toLowerCase().includes(String(q).toLowerCase()))
				if (!f) die(`${deck.label} has no slide "${q}" (it has ${frames.length})`)
				return f
			})
		: frames
	out = out ?? path.join(os.tmpdir(), 'pres-shots', deck.name)
	fs.mkdirSync(out, { recursive: true })
	const results = []
	const jobs = []
	for (const f of pick) {
		const n = frames.indexOf(f) + 1
		if (step !== 'all') jobs.push({ f, n, step })
		else {
			const last = await exec(doc.id, `const id = ${JSON.stringify(f.id)}; return Math.max(0, ...editor.getCurrentPageShapes().filter(s => typeof s.meta?.beat === 'number' && editor.hasAncestor(s, id)).map(s => s.meta.beat))`)
			for (let k = 0; k <= last; k++) jobs.push({ f, n, step: k })
		}
	}
	for (const { f, n, step } of jobs) {
		// A step is shown by pinning the slide (meta.previewBeat), shooting it, and unpinning it again.
		if (step !== null) await exec(doc.id, `editor.run(() => editor.updateShape({ id: ${JSON.stringify(f.id)}, type: 'frame', meta: { ...editor.getShape(${JSON.stringify(f.id)}).meta, previewBeat: ${Number(step)} } }), { history: 'ignore', ignoreShapeLock: true }); await new Promise(r => setTimeout(r, 400)); return true`)
		try {
			const file = await search(`return (await api.getScreenshot(${JSON.stringify(doc.id)}, { size: ${JSON.stringify(size)}, bounds: { x: ${f.x}, y: ${f.y}, w: ${f.w}, h: ${f.h} } })).filePath`)
			const dest = path.join(out, `${String(n).padStart(2, '0')}${step !== null ? `-step${step}` : ''}.jpg`)
			fs.copyFileSync(file, dest)
			results.push({ n, name: f.name, step, file: dest })
			onShot(results.at(-1), jobs.length)
		} finally {
			if (step !== null) await exec(doc.id, `const s = editor.getShape(${JSON.stringify(f.id)}); const { previewBeat, ...meta } = s.meta; editor.run(() => editor.updateShape({ id: s.id, type: 'frame', meta }), { history: 'ignore', ignoreShapeLock: true }); await helpers.saveDoc(); return true`)
		}
	}
	return results
}

// ---------- checking ----------
async function checkDecks(decks) {
	let problems = 0
	const bad = (d, msg) => (problems++, console.log(`✗ ${d.label}: ${msg}`))
	const names = new Map()
	for (const d of decks) {
		if (d.metaError) bad(d, d.metaError)
		else if (!d.meta.title) bad(d, 'deck.json has no title')
		if (!NAME.test(d.name)) bad(d, 'deck names are lowercase letters, digits and dashes')
		if (!d.hasFile) bad(d, `missing ${d.name}.tldraw`)
		if (d.meta.pack === undefined) console.log(`· ${d.label}: no "pack" in deck.json; it follows the newest pack version (pres upgrade ${d.name} pins it)`)
		else if (d.meta.pack !== 'dev' && !packVersions().includes(Number(d.meta.pack))) bad(d, `deck.json asks for pack ${d.meta.pack}, which doesn't exist`)
		else if (d.meta.pack === 'dev') console.log(`· ${d.label}: runs the unreleased pack ("dev"); release it (pres pack release) and upgrade before publishing`)
		if (!d.local && names.has(d.name)) console.log(`· ${d.label}: shares its name with ${names.get(d.name)} (use the full path to name it)`)
		names.set(d.name, d.label)
		if (d.hasSlides) {
			const dir = path.join(d.dir, 'slides')
			const manifest = readJson(path.join(dir, 'manifest.json'))
			if (!Array.isArray(manifest)) bad(d, 'slides/manifest.json should be a list of slide names')
			for (const key of manifest ?? []) {
				const f = path.join(dir, key + '.js')
				if (!fs.existsSync(f)) {
					bad(d, `slides/${key}.js listed in the manifest but missing`)
					continue
				}
				try {
					const s = (await import(`file://${f}?t=${Date.now()}`)).default
					if (!s || typeof s.draw !== 'function') bad(d, `slides/${key}.js must export default { name, draw(k) }`)
					else if (!s.notes) bad(d, `slides/${key}.js has no speaker notes`)
				} catch (e) {
					bad(d, `slides/${key}.js: ${e.message}`)
				}
			}
			for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) if (!(manifest ?? []).includes(f.replace(/\.js$/, ''))) console.log(`· ${d.label}: slides/${f} is not in the manifest (not built)`)
		}
	}
	return problems
}

// ---------- publishing ----------
const git = (args, cwd = ROOT) => spawnSync('git', args, { cwd, encoding: 'utf8' })
const gitOk = (args, cwd) => {
	const r = git(args, cwd)
	if (r.status !== 0) die(`git ${args.join(' ')} failed:\n${(r.stderr || r.stdout).trim()}`)
	return r.stdout.trim()
}
const PUBLISH_SKIP = new Set(['.shots', 'node_modules', '.DS_Store'])

// Commit and push just this deck, from a clean temporary checkout of the repo (a git worktree), so
// nothing else (other decks, half-done work in your checkout) can come along.
async function publishDeck(deck, { to, message }) {
	// Where it goes in the tree: its own place, or (for a deck from another project) --to <folder>.
	let target = deck.path
	if (deck.local) {
		const folder = to ?? deck.meta.publish?.folder
		if (folder === undefined) die(`Where should it go on the website? Run: pres publish ${deck.name} --to <folder>   (e.g. --to mono2micro, or --to . for the top)`)
		target = [checkFolderPath(folder), deck.name].filter(Boolean).join('/')
		if (deck.meta.publish?.folder !== folder) {
			deck.meta.publish = { folder: checkFolderPath(folder) }
			fs.writeFileSync(path.join(deck.dir, 'deck.json'), JSON.stringify(deck.meta, null, '\t') + '\n')
		}
	} else if (to !== undefined) die('--to is for decks from other projects; move a central deck with pres move')
	if (await checkDecks([deck])) die('fix the problems above, then publish again')
	const docs = (await openDocs()) ?? []
	const open = docs.find((d) => d.filePath && path.resolve(d.filePath) === deck.file)
	// Publish what's on screen: save the deck first if it's open with changes.
	if (open?.unsavedChanges) {
		await (await tl()).exec(open.id, 'await helpers.saveDoc(); return true')
		console.log(`saved ${deck.label} (it had unsaved changes in tldraw)`)
	}

	// The gallery shows slide 1 as the card; make it now if the deck is open and has none.
	if (!deck.cover && open) {
		await saveCover(deck, open)
		deck.cover = path.join(deck.dir, 'cover.jpg')
	}

	const branch = gitOk(['rev-parse', '--abbrev-ref', 'HEAD']) === 'HEAD' ? 'main' : gitOk(['rev-parse', '--abbrev-ref', 'HEAD'])
	gitOk(['fetch', '--quiet', 'origin', branch])
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pres-publish-'))
	gitOk(['worktree', 'add', '--quiet', '--detach', tmp, `origin/${branch}`])
	try {
		const dest = path.join(tmp, 'decks', ...target.split('/'))
		fs.rmSync(dest, { recursive: true, force: true })
		fs.cpSync(deck.dir, dest, { recursive: true, filter: (src) => !PUBLISH_SKIP.has(path.basename(src)) && !(deck.local && ['AGENTS.md', 'CLAUDE.md'].includes(path.basename(src)) && path.dirname(src) === deck.dir) })
		// Its folders need a folder.json (a title); take the central checkout's, else make one.
		const parts = target.split('/').slice(0, -1)
		for (let i = 1; i <= parts.length; i++) {
			const rel = parts.slice(0, i).join('/')
			const f = path.join(tmp, 'decks', rel, 'folder.json')
			if (fs.existsSync(f)) continue
			const mine = path.join(DECKS, rel, 'folder.json')
			if (fs.existsSync(mine)) fs.copyFileSync(mine, f)
			else fs.writeFileSync(f, JSON.stringify({ title: titleFromName(parts[i - 1]) }, null, '\t') + '\n')
		}
		gitOk(['add', '-A', '--', 'decks'], tmp)
		if (!git(['diff', '--cached', '--quiet'], tmp).status) {
			console.log(`${target} is already published as it is.`)
		} else {
			const title = deck.meta.title ?? deck.name
			gitOk(['commit', '--quiet', '-m', message ?? `Publish ${target}: ${title}`], tmp)
			let push = git(['push', '--quiet', 'origin', `HEAD:${branch}`], tmp)
			if (push.status !== 0) {
				// Someone (another publish) got there first: replay on top and try once more.
				gitOk(['pull', '--quiet', '--rebase', 'origin', branch], tmp)
				push = git(['push', '--quiet', 'origin', `HEAD:${branch}`], tmp)
				if (push.status !== 0) die(`push failed:\n${(push.stderr || push.stdout).trim()}`)
			}
			console.log(`published ${target} (${gitOk(['rev-parse', '--short', 'HEAD'], tmp)}); the website updates in about a minute`)
		}
	} finally {
		git(['worktree', 'remove', '--force', tmp])
		fs.rmSync(tmp, { recursive: true, force: true })
	}
	catchUpCheckout(deck, target)
	const site = remoteSite()
	if (site) console.log(`link: ${site}#/${target}`)
}

// Bring your own checkout of the repo up to date with what was just pushed, when that is safe.
function catchUpCheckout(deck, target) {
	git(['fetch', '--quiet', 'origin'])
	const paths = deck.local ? [] : [path.join('decks', ...target.split('/'))]
	let stashed = false
	if (paths.length && git(['status', '--porcelain', '--', ...paths]).stdout.trim()) {
		// The published deck's files are in the new commit already; set your copy aside while fast-forwarding.
		stashed = git(['stash', 'push', '--include-untracked', '--quiet', '-m', 'pres publish', '--', ...paths]).status === 0
	}
	const ff = git(['merge', '--ff-only', '--quiet', '@{u}'])
	if (stashed) git(['stash', ff.status === 0 ? 'drop' : 'pop', '--quiet'])
	if (ff.status !== 0) console.log(`(your checkout at ${ROOT} has its own commits; run git pull --rebase there when convenient)`)
}

function remoteSite() {
	const url = git(['remote', 'get-url', 'origin']).stdout.trim()
	const m = /github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/.exec(url)
	return m ? `https://${m[1].toLowerCase()}.github.io/${m[2]}/` : null
}

// ---------- commands ----------
const commands = {
	async guide(args) {
		if (!fs.existsSync(GUIDE)) die(`missing ${GUIDE}`)
		let text = fs.readFileSync(GUIDE, 'utf8').replaceAll('{{REPO}}', ROOT)
		if (args.full) text += '\n\n---\n\n' + fs.readFileSync(path.join(ROOT, 'docs', 'drawing-slides.md'), 'utf8')
		console.log(text)
	},

	async list(args) {
		const { folders, decks } = walk()
		const local = localDecks()
		if (args.json) return console.log(JSON.stringify({ folders, decks: decks.map(({ dir, file, cover, ...d }) => ({ ...d, hasCover: !!cover })), local: local.map(({ file, cover, ...d }) => d) }, null, 2))
		if (local.length) {
			console.log(`in this project (./${LOCAL_DIR}/):`)
			for (const d of local) console.log(`  · ${d.name}  ${d.meta.title ?? ''}${d.meta.publish ? `  → publishes to ${[d.meta.publish.folder, d.name].filter(Boolean).join('/')}` : '  (not published yet)'}`)
			console.log('\non the website:')
		}
		if (!folders.length && !decks.length) return console.log('No decks yet. Make one: pres new "My talk"')
		const print = (parent, depth) => {
			for (const f of folders.filter((f) => f.folder === parent)) {
				console.log(`${'  '.repeat(depth)}${f.name}/  ${f.title !== titleFromName(f.name) ? `(${f.title})` : ''}`)
				print(f.path, depth + 1)
			}
			for (const d of decks.filter((d) => d.folder === parent)) {
				const flags = [d.hasSlides && 'code slides', d.hasExt && 'ext', !d.cover && 'no cover', d.meta.listed === false && 'hidden', d.metaError].filter(Boolean)
				console.log(`${'  '.repeat(depth)}· ${d.name}  ${d.meta.title ?? '(untitled)'}${flags.length ? `  [${flags.join(', ')}]` : ''}`)
			}
		}
		print('', 0)
	},

	async new(args) {
		const title = args._[0]
		if (!title) die('usage: pres new "<title>" [--in <folder>] [--here] [--name <name>] [--description "…"]')
		const where = await newDeck({ title, folder: args.in ?? '', name: args.name ?? args.slug, description: args.description, here: !!args.here })
		const deck = args.here ? deckAt(where) : deckAt(path.join(DECKS, where))
		console.log(`made ${args.here ? path.relative(process.cwd(), deck.dir) : `decks/${where}`}/ (3 starter slides). Next: pres guide, then edit its slides/ and pres build ${deck.name}`)
		if (args.open) await openDocFor(deck)
	},

	async folder(args) {
		console.log(`folder decks/${makeFolder(args._[0], args.title)}/`)
	},

	async move(args) {
		const [from, to] = args._
		if (!from || to === undefined) die('usage: pres move <deck|folder> <to-folder>   ("." is the top)')
		const src = fs.existsSync(path.join(DECKS, from)) ? from : findDeck(from).path
		if (!src) die('pres move is for decks on the website; a project deck publishes with --to <folder>')
		const docs = (await openDocs()) ?? []
		const inside = docs.filter((d) => d.filePath && path.resolve(d.filePath).startsWith(path.resolve(DECKS, src) + path.sep))
		if (inside.length) die(`close ${inside.map((d) => d.name).join(', ')} in tldraw first`)
		console.log(`moved to decks/${moveEntry(src, to)}`)
	},

	async open(args) {
		const deck = findDeck(args._[0])
		const doc = await openDocFor(deck)
		console.log(`${deck.label} is open (${doc.name})`)
	},

	async install(args) {
		await installInto(findDeck(args._[0]))
	},

	async upgrade(args) {
		const deck = findDeck(args._[0])
		if (deck.metaError) die(`${deck.label}: ${deck.metaError}`)
		const to = checkPack(args.to ?? latestPack())
		const from = deck.meta.pack
		deck.meta.pack = to
		fs.writeFileSync(path.join(deck.dir, 'deck.json'), JSON.stringify(deck.meta, null, '\t') + '\n')
		console.log(`${deck.label}: pack ${from ?? '(none)'} → ${to}`)
		await installInto(deck)
		console.log('look it over (pres shot --all), then publish it')
	},

	async pack(args) {
		const sub = args._[0]
		const { packFiles } = await import(path.join(PACK, 'bin', 'install.mjs'))
		const versions = packVersions()
		const latest = versions.at(-1)
		const devSame = latest !== undefined && sameFiles(packFiles({ script: packDir('dev') }), packFiles({ script: packDir(latest) }))
		if (sub === 'release') {
			if (devSame) die(`presentation-pack/script/ is the same as release ${latest}; nothing to release`)
			const n = (latest ?? 0) + 1
			fs.cpSync(packDir('dev'), packDir(n), { recursive: true })
			console.log(`released pack ${n} (presentation-pack/releases/${n}/). New decks use it; move a deck with pres upgrade <deck>.`)
			return
		}
		if (sub) die('usage: pres pack [release]')
		const all = [...walk().decks, ...localDecks()]
		for (const v of [...versions, 'dev']) {
			const users = all.filter((d) => String(deckPack(d)) === String(v)).map((d) => d.label)
			const note = v === 'dev' ? `(presentation-pack/script/, ${devSame ? `same as ${latest}` : 'changed since the last release'})` : v === latest ? '(newest)' : ''
			console.log(`${String(v).padEnd(4)} ${note.padEnd(10)} ${users.length ? users.join(', ') : '-'}`)
		}
		const unpinned = all.filter((d) => d.meta.pack === undefined)
		if (unpinned.length) console.log(`not pinned (follow the newest): ${unpinned.map((d) => d.label).join(', ')}`)
	},

	async build(args) {
		const deck = findDeck(args._[0])
		if (!deck.hasSlides) die(`${deck.label} has no slides/manifest.json (it is drawn by hand, not from code).`)
		const doc = await openDocFor(deck)
		const extra = [args.only && ['--only', String(args.only)], args['clear-scenes'] && ['--clear-scenes']].filter(Boolean).flat()
		const code = await run(path.join(PACK, 'bin', 'paper.mjs'), [deck.file, '--slides', path.join(deck.dir, 'slides'), ...extra])
		// Save, so the file (what check, publish and the website read) matches what's on screen.
		await (await tl()).exec(doc.id, 'await helpers.saveDoc(); return true')
		process.exit(code)
	},

	async shot(args) {
		const deck = findDeck(args._[0])
		const doc = await openDocFor(deck)
		const slides = args.all ? null : args.slide !== undefined ? String(args.slide).split(',') : [1]
		const step = args.steps ? 'all' : args.step !== undefined ? Number(args.step) : null
		const out = args.out ?? path.join(os.tmpdir(), 'pres-shots', deck.name)
		// Old pictures of this deck would be confusing next to the new ones.
		if (!args.out) for (const f of fs.existsSync(out) ? fs.readdirSync(out) : []) if (f.endsWith('.jpg')) fs.rmSync(path.join(out, f))
		await screenshots(deck, doc, { slides, step, out, size: args.size ?? 'large', onShot: (s) => console.log(`${String(s.n).padStart(2)} ${s.name}${s.step !== null ? ` · after ${s.step} click${s.step === 1 ? '' : 's'}` : ''}\n   ${s.file}`) })
	},

	async cover(args) {
		const deck = findDeck(args._[0])
		await saveCover(deck, await openDocFor(deck))
	},

	async check(args) {
		const decks = args._[0] ? [findDeck(args._[0])] : [...walk().decks, ...localDecks()]
		const problems = await checkDecks(decks)
		console.log(problems ? `${problems} problem(s)` : `${decks.length} deck(s) OK`)
		process.exit(problems ? 1 : 0)
	},

	async publish(args) {
		const deck = findDeck(args._[0])
		await publishDeck(deck, { to: args.to === true ? '' : args.to, message: typeof args.message === 'string' ? args.message : undefined })
	},

	async export() {
		process.exit(await run(path.join(ROOT, 'site', 'scripts', 'export-decks.mjs'), []))
	},

	async setup(args) {
		const binDir = path.join(os.homedir(), '.local', 'bin')
		fs.mkdirSync(binDir, { recursive: true })
		const link = path.join(binDir, 'pres')
		fs.rmSync(link, { force: true })
		fs.symlinkSync(fileURLToPath(import.meta.url), link)
		console.log(`pres → ${link}`)
		if (!(process.env.PATH ?? '').split(path.delimiter).includes(binDir)) console.log(`add ${binDir} to your PATH, e.g. in ~/.bashrc:  export PATH="$HOME/.local/bin:$PATH"`)
		else console.log('run pres from any folder; pres guide shows how it works')
		// Optional: Claude Code's skill, for every project (other agents just get told "run pres guide").
		if (args.claude) {
			const skills = path.join(os.homedir(), '.claude', 'skills')
			const to = path.join(skills, 'presentations')
			fs.mkdirSync(skills, { recursive: true })
			if (fs.existsSync(to) && !fs.lstatSync(to).isSymbolicLink()) die(`${to} exists and isn't a link; move it away first`)
			fs.rmSync(to, { force: true })
			fs.symlinkSync(path.join(ROOT, '.claude', 'skills', 'presentations'), to)
			console.log(`Claude Code skill → ${to}`)
		}
	},
}

// What the TUI (lib/app.mjs) uses. Handed over rather than imported: this module is still running
// (top-level await) while the TUI runs, so importing it back would wait forever.
const API = { ROOT, DECKS, PACK, LOCAL_DIR, GUIDE, PRES: fileURLToPath(import.meta.url), NAME, walk, localDecks, deckAt, isDeckDir, slugify, titleFromName, readJson, packVersions, latestPack, openDocs, remoteSite, git }

if (AS_CLI) {
	const [cmd, ...rest] = process.argv.slice(2)
	// Plain `pres` in a terminal opens the TUI; anywhere else (agents, scripts) it prints the help.
	if (!cmd && process.stdin.isTTY && process.stdout.isTTY) {
		await (await import('./lib/app.mjs')).runApp(API)
		process.exit(0)
	}
	if (cmd === 'help' || cmd === '--help' || cmd === '-h') process.argv[2] = undefined
	if (!cmd || !commands[cmd]) {
		console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1).filter((l, i, all) => all.slice(0, i + 1).every((m) => m.startsWith('//'))).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'))
		process.exit(cmd && !['help', '--help', '-h'].includes(cmd) ? 1 : 0)
	}
	try {
		await commands[cmd](parseArgs(rest))
	} catch (e) {
		die(e.message)
	}
}
