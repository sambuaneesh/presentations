// A deck page: the deck, run by its own pack version (the same code the desktop app runs), alone
// or shared live (live.jsx), with the editor UI or, on a phone, phone.jsx. Loaded only when a deck
// is opened (App.jsx), so the gallery never downloads tldraw.
import { useEffect, useMemo, useState } from 'react'
import { Tldraw, inlineBase64AssetStore, defaultShapeUtils, useValue } from 'tldraw'
import { useSync } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import { getAssetUrlsByImport } from '@tldraw/assets/imports.vite'
import { loadPack } from './pack.js'
import { SYNC_URL, roomId, hashPath, seedFromDeck, useLiveRoom, LiveBar, slideCount, roomStatus, connectUri, RoomClosed, roomUrl, ROOM_ENDED } from './live.jsx'
import { ensureJoinSlide, hasJoinSlide } from './joinSlide.js'
import { LoadFailed, Loading } from './Gallery.jsx'
import { PhoneDeck, phoneComponents, usePhone, PhoneViewLink } from './phone.jsx'
import { shapeVisibilityFor, watchSlideWindow } from './slideWindow.js'
import { loadDeck } from './routes.js'

// The deck's pack version (see pack.js), set up once it has loaded.
let P = null // its site-entry
let pack = null // its tldraw config: tools, shapeUtils, components
let syncShapeUtils = null // a live room's store needs every shape type up front, including the pack's scenes
let shapeVisibility = null // the pack's, plus rendering only nearby slides while presenting (slideWindow.js)
async function setUpPack(version, deckPath) {
	P = await loadPack(version, deckPath)
	pack = P.configure({
		config: { shapeUtils: [], bindingUtils: [], assetUtils: [], overlayUtils: [], tools: [], components: {}, options: {} },
	})
	syncShapeUtils = [...defaultShapeUtils, ...pack.shapeUtils]
	shapeVisibility = shapeVisibilityFor(P)
}
const licenseKey = import.meta.env.VITE_TLDRAW_LICENSE_KEY
// tldraw's fonts, icons and translations from this site rather than its CDN: no extra connection to
// another host, and they're cached with the rest of the site.
const assetUrls = getAssetUrlsByImport()

// After mounting, tldraw downloads every default font face in the background (16 files, ~1.4 MB) so
// that text can switch fonts instantly while editing. A deck only needs the fonts its slides use,
// which tldraw loads anyway; drop the rest. (Our onMount runs right after tldraw queues them, before
// they start.)
function skipFontPreload(editor) {
	editor.fonts?.fontsToLoad?.clear?.()
}

// "← back" to the deck's folder, out of the way while presenting.
function BackLink() {
	const presenting = useValue(P.presentIndex) >= 0
	if (presenting) return null
	const folder = hashPath().split('/').slice(0, -1).join('/')
	return (
		<a href={`#/${folder}`} className="pp-back" onPointerDown={(e) => e.stopPropagation()}>
			← {folder ? folder.split('/').pop().replace(/-/g, ' ') : 'all presentations'}
		</a>
	)
}
const BACK_CSS = `.pp-back { position: absolute; left: 104px; bottom: 10px; z-index: 400; pointer-events: all; font: 13px 'Shantell Sans', system-ui, sans-serif;
	color: #2b2621; background: #f9f0e6; border: 1.5px solid #2b2621; border-radius: 10px 14px 9px 12px; padding: 5px 11px; text-decoration: none; box-shadow: 2px 2px 0 rgba(43,38,33,.15); }
	.pp-back:hover { background: #fff; }`

function zoomToFirstSlide(editor) {
	const first = editor
		.getCurrentPageShapes()
		.filter((s) => s.type === 'frame' && s.parentId === editor.getCurrentPageId())
		.sort((a, b) => a.x - b.x || a.y - b.y)[0]
	if (first) editor.zoomToBounds(editor.getShapePageBounds(first.id), { inset: 120 })
	if (import.meta.env.DEV) window.editor = editor
}

function mountPack(editor) {
	const controller = new AbortController()
	const stopWindow = watchSlideWindow(P, editor)
	controller.signal.addEventListener('abort', stopWindow)
	// Keeps slide numbers and footers in step; only run by someone who can edit.
	P.runMain({ editor, signal: controller.signal, app: { board: { isHost: true } } })
	zoomToFirstSlide(editor)
	return () => controller.abort()
}

function useComponents(deck) {
	return useMemo(() => {
		// Editors (solo visitors and live-room presenters): the full pack UI.
		const editor = { ...pack.components, InFrontOfTheCanvas: () => (<><pack.components.InFrontOfTheCanvas /><style>{BACK_CSS}</style><BackLink /><LiveBar deck={deck} isPresenter /><PhoneViewLink /></>) }
		// Live-room viewers: no editing UI, just the presenting overlay and the room bar.
		const viewer = { InFrontOfTheCanvas: () => (<><style>{P.DECK_CSS + BACK_CSS}</style><P.BeatStyles /><P.PresentOverlay /><BackLink /><LiveBar deck={deck} isPresenter={false} /><PhoneViewLink /></>) }
		return { editor, viewer }
	}, [deck])
}

function Solo({ deck, entry, phone, landscape }) {
	const { editor } = useComponents(deck)
	const [ed, setEd] = useState(null)
	const phoneUi = useMemo(() => phoneComponents(P), [])
	const canvas = (
		<Tldraw
			snapshot={deck}
			tools={pack.tools}
			shapeUtils={pack.shapeUtils}
			getShapeVisibility={shapeVisibility}
			components={phone ? phoneUi : editor}
			hideUi={phone}
			licenseKey={licenseKey}
			assetUrls={assetUrls}
			onMount={(e) => (skipFontPreload(e), setEd(e), mountPack(e))}
		/>
	)
	if (!phone) return canvas
	return <PhoneDeck editor={ed} role="solo" deck={deck} entry={entry} landscape={landscape}>{canvas}</PhoneDeck>
}

function Live({ deck, isPresenter, entry, phone, landscape }) {
	const store = useSync({ uri: connectUri(isPresenter), assets: inlineBase64AssetStore, shapeUtils: syncShapeUtils })
	const [editor, setEditor] = useState(null)
	const components = useComponents(deck)
	useLiveRoom(editor, isPresenter, { shareScreen: !phone })
	const ended = useRoomEnded(store)
	const phoneUi = useMemo(() => phoneComponents(P), [])
	if (ended) return <RoomClosed ended />
	const canvas = (
		<Tldraw
			store={store}
			tools={pack.tools}
			shapeUtils={pack.shapeUtils}
			getShapeVisibility={shapeVisibility}
			components={phone ? phoneUi : isPresenter ? components.editor : components.viewer}
			hideUi={phone}
			licenseKey={licenseKey}
			assetUrls={assetUrls}
			onMount={(editor) => {
				skipFontPreload(editor)
				setEditor(editor)
				if (!isPresenter) {
					if (!phone) zoomToFirstSlide(editor)
					return watchSlideWindow(P, editor)
				}
				// A new room starts empty: the presenter fills it from the published deck, then puts the
				// join slide (a QR code of this room's link) in front of it.
				if (slideCount(editor) === 0) seedFromDeck(editor, deck)
				if (!hasJoinSlide(editor)) ensureJoinSlide(editor, roomUrl(roomId))
				return mountPack(editor)
			}}
		/>
	)
	if (!phone) return canvas
	return <PhoneDeck editor={editor} role={isPresenter ? 'presenter' : 'viewer'} deck={deck} entry={entry} landscape={landscape}>{canvas}</PhoneDeck>
}

// Has the room been ended for everyone? The server closes every connection with ROOM_ENDED; a
// device that was offline at that moment (a sleeping phone) finds out when it can't reconnect.
function useRoomEnded(store) {
	const [ended, setEnded] = useState(false)
	const fatal = store.status === 'error' && store.error?.reason
	const offline = store.status === 'synced-remote' && store.connectionStatus === 'offline'
	useEffect(() => {
		if (fatal === ROOM_ENDED || fatal === 'NOT_FOUND') return void setEnded(true)
		if (!offline) return
		let gone = false
		const check = () => roomStatus(roomId).then((s) => !gone && !s.exists && setEnded(true), () => {})
		const timer = setTimeout(check, 1500)
		const again = setInterval(check, 15000)
		return () => ((gone = true), clearTimeout(timer), clearInterval(again))
	}, [fatal, offline])
	return ended
}

// Only connect to rooms that are open (started with the room password and not yet abandoned).
function LiveGate(props) {
	const [status, setStatus] = useState(null)
	useEffect(() => {
		roomStatus(roomId).then(setStatus, () => setStatus({ exists: false }))
	}, [])
	if (!status) return <Loading />
	return status.exists ? <Live {...props} isPresenter={status.presenter} /> : <RoomClosed />
}

export default function DeckView({ entry, landscape }) {
	const phone = usePhone()
	const [state, setState] = useState({ deck: null, error: null })
	useEffect(() => {
		let gone = false
		document.title = `${entry.title} · presentations`
		const deck = loadDeck(entry.path)
		Promise.all([deck, setUpPack(entry.pack, entry.path)])
			.then(([deck]) => !gone && setState({ deck, error: null }), (error) => (console.error(error), !gone && setState({ deck: null, error })))
		return () => void (gone = true)
	}, [entry.path])
	if (state.error) return <LoadFailed path={entry.path} error={state.error} />
	if (!state.deck) return <Loading />
	const props = { deck: state.deck, entry, phone, landscape }
	return (
		<>
			{roomId && SYNC_URL ? <LiveGate {...props} /> : <Solo {...props} />}
			{!phone && landscape.button}
		</>
	)
}
