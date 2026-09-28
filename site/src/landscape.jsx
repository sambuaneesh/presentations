// Landscape on small screens: a phone held upright shows a 16:9 deck as a thin strip. A floating
// button switches to landscape: first the real thing (fullscreen + screen.orientation.lock, e.g.
// Android Chrome), and where the browser refuses (iPhone Safari has no orientation lock) the deck is
// rotated 90° on screen, so turning the phone sideways reads it full size. Once in landscape the button
// goes away: the phone's back button returns (it leaves fullscreen, and for the on-screen rotation a
// history entry is added so back undoes it). Turning the phone to landscape by hand also undoes it.
import { useEffect, useState } from 'react'

const small = () => Math.min(window.innerWidth, window.innerHeight) < 700
const portrait = () => window.innerHeight > window.innerWidth

function useViewport() {
	const [, tick] = useState(0)
	useEffect(() => {
		const on = () => tick((n) => n + 1)
		window.addEventListener('resize', on)
		screen.orientation?.addEventListener?.('change', on)
		return () => {
			window.removeEventListener('resize', on)
			screen.orientation?.removeEventListener?.('change', on)
		}
	}, [])
}

// Let tldraw (and the pack's slide fitting) measure the new size.
const refit = () => requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))

export function useLandscape() {
	useViewport()
	const [mode, setMode] = useState(null) // null · 'locked' (real orientation lock) · 'rotated' (CSS)
	useEffect(() => {
		if (mode === 'rotated' && !portrait()) setMode(null) // turned by hand: no need to rotate any more
		if (mode === 'locked' && !document.fullscreenElement) setMode(null) // left fullscreen (e.g. the back gesture)
	})
	useEffect(() => { refit() }, [mode]) // (an effect must not return the frame id: React would call it as a cleanup)
	// Back undoes the on-screen rotation (its history entry changes neither the page nor the hash route).
	useEffect(() => {
		if (mode !== 'rotated') return
		const onBack = () => setMode(null)
		window.addEventListener('popstate', onBack)
		return () => window.removeEventListener('popstate', onBack)
	}, [mode])

	const toLandscape = async () => {
		try {
			await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' })
			await screen.orientation.lock('landscape')
			setMode('locked')
		} catch {
			if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
			history.pushState({ ppLandscape: true }, '')
			setMode('rotated')
		}
	}
	const style =
		mode === 'rotated'
			? { position: 'fixed', top: 0, left: 0, width: '100vh', height: '100vw', transform: 'rotate(90deg) translateY(-100%)', transformOrigin: 'top left' }
			: { position: 'fixed', inset: 0 }
	const offer = mode === null && small() && portrait()
	const button = offer ? (
		<button type="button" className="pp-landscape" onPointerDown={(e) => e.stopPropagation()} onClick={toLandscape} title="View the slides in landscape (back returns)">
			<span aria-hidden="true">⟲</span> Landscape
			<style>{LANDSCAPE_CSS}</style>
		</button>
	) : null
	return { style, button }
}

const LANDSCAPE_CSS = `
.pp-landscape { position: fixed; right: max(12px, env(safe-area-inset-right)); bottom: max(12px, env(safe-area-inset-bottom)); z-index: 1000;
	display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; border: 2px solid #2b2621; background: #f9f0e6; color: #2b2621;
	font: 600 15px 'Shantell Sans', system-ui, sans-serif; box-shadow: 0 6px 18px rgba(43,38,33,.25); cursor: pointer; -webkit-tap-highlight-color: transparent; }
.pp-landscape span { font-size: 18px; color: #d64533; }
.pp-landscape:active { transform: scale(.97); }
`
