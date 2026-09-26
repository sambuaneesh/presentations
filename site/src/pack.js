// Decks are frozen to the pack version they were made with (deck.json "pack"; see
// docs/presentations.md). The site bundles every release (presentation-pack/releases/<n>/, plus
// "dev", the unreleased pack) and loads the one a deck asks for; the page reloads between decks,
// so a page only ever runs one version. `virtual:packs` comes from vite.config.js.
import PACKS from 'virtual:packs'

export let pack = null // that version's site-entry.js, once loaded

export async function loadPack(version) {
	const load = PACKS[String(version)]
	if (!load) throw new Error(`this site has no pack version ${version}`)
	pack = await load()
	return pack
}
