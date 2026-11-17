// The results, as presented on 10 November and revised: click 0 shows the workflow-vs-baselines plot from that deck;
// click 1 brings the earlier text summary of the results in beside it; click 2 merges both into the revised one-table
// scorecard (they glide together and fade as it grows out of the same spot). Click 3 sets the scorecard (option A)
// beside the alternative leaderboard version (option B) for the advisor's choice; click 4 adds, under each, the caption
// it would carry (without its table number). Clicking an option zooms it to the whole slide; clicking again, clicking
// beside it, or pressing Space or Esc puts it back (pointer events and those keys are kept from the canvas, which would
// otherwise take them as "next step"; the zoom is this viewer's own). Images: ext/results-images.js, crops without
// captions or numbers (the paper is internal to us).
import { useState, useEffect } from 'react'
import { html, C, F, EASE, box } from '@pack/scenes/kit.js'
import { useArrival } from './arrive.js'
import { FOREST, OLD_GLANCE, NEW_GLANCE, LEADERBOARD, CAPTION_A, CAPTION_B } from './results-images.js'

const BESIDE = 1, MERGE = 2, OPTIONS = 3, CAPTIONS = 4
export const RESULTS_BEATS = CAPTIONS
// The two options side by side (click 3), each card holding its tag, its caption as the paper would set it (click 4,
// above the table), and the table, as wide as half the slide allows and vertically centred. Zoomed, a card takes the
// whole slide, without its caption: as wide as fits both the slide's width and its height.
// pad: side and bottom margin; tag: the option title's band; gap: between caption and table; capW: the caption's width
// as a share of the table's (it is set at single-column width, so it wraps into a narrower block)
const OPT = { w: 946, pad: 24, tag: 74, gap: 22, capW: 0.8 }
const ratio = (img) => img.h / img.w
const capH = (inner, cap) => inner * OPT.capW * ratio(cap)
const heightFor = (inner, table, cap, withCap) => OPT.tag + (withCap ? capH(inner, cap) + OPT.gap : 0) + inner * ratio(table) + OPT.pad
const SIDE_INNER = OPT.w - 2 * OPT.pad
const LEFT_X = 8, RIGHT_X = 966
function geometry({ table, cap, x, withCap, zoom }) {
	if (!zoom) {
		const tallest = Math.max(heightFor(SIDE_INNER, NEW_GLANCE, CAPTION_A, withCap), heightFor(SIDE_INNER, LEADERBOARD, CAPTION_B, withCap))
		return { x, y: (1080 - tallest) / 2, w: OPT.w, h: heightFor(SIDE_INNER, table, cap, withCap), inner: SIDE_INNER }
	}
	const fit = (1050 - OPT.tag - OPT.pad - (withCap ? OPT.gap : 0)) / ((withCap ? OPT.capW * ratio(cap) : 0) + ratio(table))
	const inner = Math.min(1880 - 2 * OPT.pad, fit), w = inner + 2 * OPT.pad, h = heightFor(inner, table, cap, withCap) // card ≤ 1880 wide
	return { x: (1920 - w) / 2, y: (1080 - h) / 2, w, h, inner }
}
const stop = (e) => e.stopPropagation()
const SHIELD = { onPointerDown: stop, onPointerUp: stop, onPointerMove: stop, onDoubleClick: stop, onTouchStart: stop, onTouchEnd: stop }

const MEET = { x: 610, y: 400, w: 700, h: 300 } // where the two old cards merge
const R = {
	forest: [{ x: 410, y: 60, w: 1100, h: 960 }, { x: 40, y: 190, w: 650, h: 700 }, MEET],
	old: [{ x: 1300, y: 380, w: 560, h: 320 }, { x: 710, y: 330, w: 1170, h: 420 }, MEET],
	fresh: { x: 60, y: 80, w: 1800, h: 920 },
}

function Card({ img, tag, r, style, quiet }) {
	return html`<div style=${{ ...box(r.x, r.y, r.w, r.h), background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', padding: '58px 20px 18px', boxSizing: 'border-box',
			display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
		<img src=${img.src} draggable=${false} style=${{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
		<div style=${{ position: 'absolute', left: 18, top: 10, fontFamily: F.hand, fontSize: 30, color: C.red, whiteSpace: 'nowrap' }}>${tag}</div>
	</div>`
}

function OptionCard({ table, cap, tag, x, withCap: captioned, zoom, live, onToggle, quiet, style }) {
	const withCap = captioned && !zoom // zoomed, a card shows its table alone
	const g = geometry({ table, cap, x, withCap, zoom })
	const t = quiet ? 'none' : `all 700ms ${EASE}`
	return html`<div ...${live ? SHIELD : {}} onClick=${live ? (e) => { e.stopPropagation(); onToggle() } : undefined}
		style=${{ ...box(g.x, g.y, g.w, g.h), background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflow: 'hidden', transition: t,
			pointerEvents: live ? 'all' : 'none', cursor: zoom ? 'zoom-out' : 'zoom-in', ...style }}>
		<div style=${{ position: 'absolute', left: OPT.pad, top: 16, fontFamily: F.hand, fontSize: zoom ? 36 : 32, color: C.red, whiteSpace: 'nowrap', transition: t }}>${tag}</div>
		<img src=${cap.src} draggable=${false} style=${{ position: 'absolute', left: OPT.pad + (g.inner * (1 - OPT.capW)) / 2, top: OPT.tag, width: g.inner * OPT.capW, opacity: withCap ? 1 : 0, pointerEvents: 'none', transition: quiet ? 'none' : `all 700ms ${EASE}, opacity 600ms ${EASE} 200ms` }} />
		<img src=${table.src} draggable=${false} style=${{ position: 'absolute', left: OPT.pad, top: OPT.tag + (withCap ? capH(g.inner, cap) + OPT.gap : 0), width: g.inner, pointerEvents: 'none', transition: t }} />
	</div>`
}

export function ResultsScene({ b, still }) {
	const B = still ? CAPTIONS : Math.max(0, Math.min(CAPTIONS, b))
	const early = Math.min(B, MERGE) // the plot and the old summary only take part in clicks 0–2
	const arrived = useArrival(still) // a hook: always called, never behind ||
	const quiet = still || !arrived // no transitions on the first live frame (see arrive.js)
	const move = (ms, delay = 0) => (quiet ? 'none' : `left ${ms}ms ${EASE} ${delay}ms, top ${ms}ms ${EASE} ${delay}ms, width ${ms}ms ${EASE} ${delay}ms, height ${ms}ms ${EASE} ${delay}ms, opacity ${ms}ms ${EASE} ${delay}ms, transform ${ms}ms ${EASE} ${delay}ms`)
	const merged = B >= MERGE
	const [zoom, setZoom] = useState(null) // 'A' or 'B'
	useEffect(() => { if (still || B < OPTIONS) setZoom(null) }, [still, B])
	useEffect(() => {
		if (zoom === null) return
		const onKey = (e) => {
			if (e.key !== ' ' && e.key !== 'Escape') return
			e.stopPropagation(); e.preventDefault(); setZoom(null)
		}
		window.addEventListener('keydown', onKey, true)
		return () => window.removeEventListener('keydown', onKey, true)
	}, [zoom])
	const live = !still && B >= OPTIONS
	const toggle = (k) => () => setZoom((z) => (z === k ? null : k))
	const dim = (k) => (zoom !== null && zoom !== k ? 0.1 : 1)
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		${zoom !== null && html`<div ...${SHIELD} onClick=${(e) => { e.stopPropagation(); setZoom(null) }} style=${{ ...box(0, 0, 1920, 1080), zIndex: 4, pointerEvents: 'all', cursor: 'zoom-out' }} />`}
		<${Card} img=${FOREST} tag="Workflow vs. baselines" r=${R.forest[early]} quiet=${quiet}
			style=${{ opacity: merged ? 0 : 1, transition: move(800) }} />
		<${Card} img=${OLD_GLANCE} tag="Results at a glance" r=${R.old[early]} quiet=${quiet}
			style=${{ opacity: B >= BESIDE && !merged ? 1 : 0, transform: B >= BESIDE ? 'none' : 'translateX(60px)', transition: move(800) }} />
		<${Card} img=${NEW_GLANCE} tag="Results at a glance, revised" r=${merged ? R.fresh : MEET} quiet=${quiet}
			style=${{ opacity: B === MERGE ? 1 : 0, zIndex: 2, transition: move(900, B >= OPTIONS ? 0 : 450) }} />
		<${OptionCard} table=${NEW_GLANCE} cap=${CAPTION_A} tag="Option A · differences per baseline" x=${LEFT_X} withCap=${B >= CAPTIONS} quiet=${quiet}
			zoom=${zoom === 'A'} live=${live} onToggle=${toggle('A')} style=${{ opacity: B >= OPTIONS ? dim('A') : 0, zIndex: zoom === 'A' ? 5 : 3 }} />
		<${OptionCard} table=${LEADERBOARD} cap=${CAPTION_B} tag="Option B · values per approach" x=${RIGHT_X} withCap=${B >= CAPTIONS} quiet=${quiet}
			zoom=${zoom === 'B'} live=${live} onToggle=${toggle('B')} style=${{ opacity: B >= OPTIONS ? dim('B') : 0, zIndex: zoom === 'B' ? 5 : 3, transform: B >= OPTIONS ? 'none' : 'translateX(80px)' }} />
	</div>`
}
