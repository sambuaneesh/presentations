import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PACK = path.resolve(import.meta.dirname, '../presentation-pack')
const RELEASES = path.join(PACK, 'releases')
const DECKS = path.resolve(import.meta.dirname, '../decks')

// Pack versions: frozen releases (releases/<n>/) and "dev" (script/, the unreleased pack).
const releases = () => fs.readdirSync(RELEASES).filter((n) => /^\d+$/.test(n)).sort((a, b) => a - b)
const latest = () => releases().at(-1)
const versionDir = (v) => (v === 'dev' ? path.join(PACK, 'script') : path.join(RELEASES, v))
const inside = (file, dir) => file.startsWith(dir + path.sep)

// The deck folder a file belongs to (the nearest folder up from it with a deck.json), and its pack.
function deckOf(file) {
	for (let dir = path.dirname(file); inside(dir, DECKS); dir = path.dirname(dir)) if (fs.existsSync(path.join(dir, 'deck.json'))) return dir
	return null
}
const deckVersion = (dir) => String(JSON.parse(fs.readFileSync(path.join(dir, 'deck.json'), 'utf8')).pack ?? latest())
function decks(dir = DECKS) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
		if (!e.isDirectory() || /^[._]/.test(e.name)) return []
		const p = path.join(dir, e.name)
		return fs.existsSync(path.join(p, 'deck.json')) ? [p] : decks(p)
	})
}
// Which version a module belongs to: a pack file its own; a deck's extension file its deck's.
function versionOf(importer) {
	const file = importer?.split('?')[0]
	if (!file) return latest()
	if (inside(file, path.join(PACK, 'script'))) return 'dev'
	if (inside(file, RELEASES)) return path.relative(RELEASES, file).split(path.sep)[0]
	const deck = deckOf(file)
	return deck ? deckVersion(deck) : latest()
}

// Each deck runs the pack version it's frozen to (deck.json "pack"):
//   virtual:packs          { versions: { <version>: () => import(its site-entry.js) },
//                            decks: { <deck path>: () => import(…) } } for site/src/pack.js
//   @pack/…                the importing file's version (a deck's ext/ files: their deck's)
//   <pack>/extensions.js   the deck's extensions (the pack's placeholder, filled in)
//
// A deck with extensions (ext/) gets a copy of its pack version's code of its own, holding only its
// own extensions: the pack reads them as its modules start (e.g. scenes/registry.js), so they can't
// be added later, and bundling every deck's extensions into the version's code would make each deck
// download all the others' (images and all). The copy is the same files with "?deck=<key>" on their
// module ids, passed on to everything they import from the pack. Decks without extensions share
// one plain copy per version.
const DECK_Q = '?deck='
const keyOf = (deckDir) => path.relative(DECKS, deckDir).split(path.sep).join('~')
const dirOfKey = (key) => path.join(DECKS, ...key.split('~'))
const hasExt = (deckDir) => fs.existsSync(path.join(deckDir, 'ext', 'index.js'))
const splitId = (id) => {
	const i = id.indexOf(DECK_Q)
	return i < 0 ? [id, null] : [id.slice(0, i), id.slice(i + DECK_Q.length)]
}

function packVersions() {
	return {
		name: 'pack-versions',
		enforce: 'pre',
		resolveId(source, importer) {
			if (source === 'virtual:packs') return '\0virtual:packs'
			const [importerFile, importerKey] = splitId(importer ?? '')
			if (source === '@pack' || source.startsWith('@pack/')) {
				const target = path.join(versionDir(versionOf(importerFile)), source.slice(6))
				// from a deck's own files (or its pack copy): that deck's copy
				const deck = importerKey ? dirOfKey(importerKey) : deckOf(importerFile)
				return deck && hasExt(deck) ? target + DECK_Q + keyOf(deck) : target
			}
			if (!importer || importer.startsWith('\0')) return null
			// only plain JavaScript imports: others (JSON?url, CSS, …) are shared, and keep their own queries
			if (!source.startsWith('.') || source.includes('?')) return null
			const file = path.resolve(path.dirname(importerFile), source)
			const v = versionOf(file)
			if (/(^|\/)extensions\.js$/.test(source) && file === path.join(versionDir(v), 'extensions.js'))
				return `\0virtual:pack-ext/${v}` + (importerKey ? `/${importerKey}` : '')
			// a pack file inside a deck's copy: stay in that copy
			if (importerKey && inside(file, versionDir(v)) && /\.m?jsx?$/.test(file)) return file + DECK_Q + importerKey
			return null
		},
		load(id) {
			if (id === '\0virtual:packs') {
				const versions = [...releases(), 'dev'].map((v) => `${JSON.stringify(v)}: () => import(${JSON.stringify(path.join(versionDir(v), 'site-entry.js'))})`)
				const decksWithExt = decks().filter(hasExt)
				const own = decksWithExt.map((d) => `${JSON.stringify(path.relative(DECKS, d).split(path.sep).join('/'))}: () => import(${JSON.stringify(path.join(versionDir(deckVersion(d)), 'site-entry.js') + DECK_Q + keyOf(d))})`)
				return `export default {\nversions: {\n${versions.join(',\n')}\n},\ndecks: {\n${own.join(',\n')}\n}\n}\n`
			}
			if (id.startsWith('\0virtual:pack-ext/')) {
				const [, key] = id.slice('\0virtual:pack-ext/'.length).split(/\/(.*)/s)
				const mine = key ? [dirOfKey(key)] : []
				return [
					...mine.map((d, i) => `import ext${i} from ${JSON.stringify(path.join(d, 'ext', 'index.js'))}`),
					`export const EXTENSIONS = [${mine.map((_, i) => `ext${i}`).join(', ')}]`,
					'export const fromExtensions = (key) => Object.assign({}, ...EXTENSIONS.map((e) => e?.[key] ?? {}))',
				].join('\n')
			}
			// a pack file in a deck's copy: the same file
			const [file, key] = splitId(id)
			if (key && !id.startsWith('\0') && fs.existsSync(file)) return fs.readFileSync(file, 'utf8')
			return null
		},
	}
}

export default defineConfig({
	plugins: [packVersions(), react()],
	// Relative asset paths, so the build works at https://<user>.github.io/<repo>/ without knowing the repo name.
	base: './',
	resolve: {
		// The pack and decks live outside this folder; resolve their bare imports from this site's node_modules.
		dedupe: ['react', 'react-dom', 'tldraw'],
	},
	server: { fs: { allow: [import.meta.dirname, PACK, DECKS] } },
})
