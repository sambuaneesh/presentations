// The page's address, and the downloads index.html starts before any script has loaded.
// Kept free of tldraw, so the gallery (App.jsx, Gallery.jsx) never has to load it.

export const roomId = new URLSearchParams(location.search).get('room')?.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48) || null
// The page being shown: #/<path>, a folder or a deck (e.g. mono2micro/agentic-workflow).
export const hashPath = () => decodeURIComponent(location.hash.replace(/^#\/?/, '').split('?')[0]).replace(/[^a-z0-9/-]/g, '').replace(/^\/+|\/+$/g, '')

// no-cache: GitHub Pages lets browsers keep files for 10 minutes; after a publish, ask again
// (a quick "not modified" when nothing changed).
const OPTS = { cache: 'no-cache' }
const json = (r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))

// decks/index.json: the one index.html already asked for, else a new request.
export function loadIndex() {
	const early = window.__ppIndex
	window.__ppIndex = null
	return early ?? fetch('decks/index.json', OPTS).then(json)
}

// A deck's snapshot: index.html starts the download for the deck in the address, in parallel
// with the scripts; use it when it's this deck.
export function loadDeck(path) {
	const early = window.__ppDeck
	window.__ppDeck = null
	if (early && early.path === path) return early.json
	return fetch(`decks/${path}.json`, OPTS).then(json)
}
