// Decks are frozen to the pack version they were made with (deck.json "pack"; see
// docs/presentations.md). The site bundles every release (presentation-pack/releases/<n>/, plus
// "dev", the unreleased pack) and loads the one a deck asks for; the page reloads between decks,
// so a page only ever runs one version. `virtual:packs` comes from vite.config.js.
import PACKS from 'virtual:packs'

export let pack = null // that version's site-entry.js, once loaded

export async function loadPack(version) {
	// A deck with no (or an unknown) version, e.g. from an index saved before versions existed:
	// the newest release is the best guess.
	const newest = Object.keys(PACKS).filter((v) => /^\d+$/.test(v)).sort((a, b) => a - b).at(-1)
	const load = PACKS[String(version)] ?? PACKS[newest]
	if (!load) throw new Error(`this site has no pack version ${version}`)
	pack = await load()
	return pack
}
