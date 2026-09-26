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
//   virtual:packs          { <version>: () => import(<that version's site-entry.js>) } for site/src/pack.js
//   @pack/…                the importing file's version (a deck's ext/ files: their deck's)
//   <pack>/extensions.js   that version's decks' extensions (the pack's placeholder, filled in)
function packVersions() {
	return {
		name: 'pack-versions',
		enforce: 'pre',
		resolveId(source, importer) {
			if (source === 'virtual:packs') return '\0virtual:packs'
			if (source === '@pack' || source.startsWith('@pack/')) return path.join(versionDir(versionOf(importer)), source.slice(6))
			if (importer && /(^|\/)extensions\.js$/.test(source) && !importer.startsWith('\0')) {
				const file = path.resolve(path.dirname(importer.split('?')[0]), source)
				const v = versionOf(file)
				if (file === path.join(versionDir(v), 'extensions.js')) return `\0virtual:pack-ext/${v}`
			}
			return null
		},
		load(id) {
			if (id === '\0virtual:packs') {
				const entries = [...releases(), 'dev'].map((v) => `${JSON.stringify(v)}: () => import(${JSON.stringify(path.join(versionDir(v), 'site-entry.js'))})`)
				return `export default {\n${entries.join(',\n')}\n}\n`
			}
			if (id.startsWith('\0virtual:pack-ext/')) {
				const v = id.slice('\0virtual:pack-ext/'.length)
				const mine = decks().filter((d) => deckVersion(d) === v && fs.existsSync(path.join(d, 'ext', 'index.js')))
				return [
					...mine.map((d, i) => `import ext${i} from ${JSON.stringify(path.join(d, 'ext', 'index.js'))}`),
					`export const EXTENSIONS = [${mine.map((_, i) => `ext${i}`).join(', ')}]`,
					'export const fromExtensions = (key) => Object.assign({}, ...EXTENSIONS.map((e) => e?.[key] ?? {}))',
				].join('\n')
			}
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
