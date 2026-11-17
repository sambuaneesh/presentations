// The presentations website. Routes (hash-based, so it works on GitHub Pages without a server):
//   #/                        the top folder: folders and decks (Gallery.jsx, from decks/index.json)
//   #/<folder>                a folder, e.g. #/mono2micro
//   #/<folder>/<deck>         a deck, running the same presentation pack the desktop app runs (Deck.jsx)
//   ?room=<name>#/<deck path> that deck, shared live through the sync server (live.jsx)
// Decks are exported at build time (scripts/export-decks.mjs) to public/decks/<slug>.json and
// loaded on demand, so adding a deck never makes the others slower. Everything that needs tldraw
// is in Deck.jsx, loaded only when a deck opens: the gallery stays small.
import { Suspense, lazy, useEffect, useState } from 'react'
import { Gallery, NotFound, Loading } from './Gallery.jsx'
import { useLandscape } from './landscape.jsx'
import { hashPath, loadIndex } from './routes.js'

// A deck's address has a folder in it (folder/deck): start loading the deck code right away,
// alongside the deck list, instead of after it.
const deckCode = hashPath().includes('/') ? import('./Deck.jsx') : null
const DeckView = lazy(() => deckCode ?? import('./Deck.jsx'))

export default function App() {
	const [index, setIndex] = useState(null)
	const [route, setRoute] = useState(hashPath)
	useEffect(() => {
		loadIndex().then(setIndex, () => setIndex({ folders: [], decks: [] }))
	}, [])
	const deckAt = (p) => index?.decks.find((d) => d.path === p)
	// Between folders, just re-render. Into or out of a deck, reload: each deck (and room) starts clean.
	useEffect(() => {
		const onHash = () => {
			const next = hashPath()
			if (deckAt(route) || deckAt(next)) location.reload()
			else setRoute(next)
		}
		window.addEventListener('hashchange', onHash)
		return () => window.removeEventListener('hashchange', onHash)
	}, [index, route])
	const landscape = useLandscape()
	if (!index) return <Loading />
	const deck = deckAt(route)
	// On a phone held upright, a button offers landscape (landscape.jsx), live or solo.
	if (deck)
		return (
			<div style={landscape.style}>
				<Suspense fallback={<Loading />}>
					<DeckView entry={deck} landscape={landscape} />
				</Suspense>
			</div>
		)
	if (route && !index.folders.some((f) => f.path === route)) return <NotFound path={route} />
	return <Gallery index={index} folder={route} />
}
