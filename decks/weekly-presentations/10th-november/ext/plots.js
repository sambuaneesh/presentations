// The paper's result plots and tables for discussion, in a grid (three or four per row, by research question). Clicking one
// zooms it to the full slide; clicking again, clicking beside it, or pressing Space or Esc puts it back. No slide clicks: pointer events and those
// keys are kept from the canvas (which would otherwise take them as "next step"). The zoom is this viewer's own.
// Images and their tags: ext/plots-paper.js (crops of the compiled paper).
import { useState, useEffect } from 'react'
import { html, C, F, EASE, box } from '@pack/scenes/kit.js'
import { useArrival } from './arrive.js'
import { PLOTS } from './plots-paper.js'

// three per row up to six cards, else four; a shorter last row is centred
const COLS = PLOTS.length > 6 ? 4 : 3
const CW = (1800 - (COLS - 1) * 20) / COLS
const CELL = (i) => {
	const row = Math.floor(i / COLS), inRow = Math.min(COLS, PLOTS.length - row * COLS)
	return { x: 60 + ((COLS - inRow) * (CW + 20)) / 2 + (i % COLS) * (CW + 20), y: 40 + row * 510, w: CW, h: 490 }
}
const FULL = { x: 60, y: 40, w: 1800, h: 1000 }
const stop = (e) => e.stopPropagation()
const SHIELD = { onPointerDown: stop, onPointerUp: stop, onPointerMove: stop, onDoubleClick: stop, onTouchStart: stop, onTouchEnd: stop }

export function PlotsScene({ still }) {
	const [zoom, setZoom] = useState(null) // index of the zoomed plot
	const arrived = useArrival(still) // a hook: always called, never behind ||
	const quiet = still || !arrived
	useEffect(() => { if (still) setZoom(null) }, [still])
	useEffect(() => {
		if (zoom === null) return
		const onKey = (e) => {
			if (e.key !== ' ' && e.key !== 'Escape') return
			e.stopPropagation(); e.preventDefault(); setZoom(null)
		}
		window.addEventListener('keydown', onKey, true)
		return () => window.removeEventListener('keydown', onKey, true)
	}, [zoom])
	const t = quiet ? 'none' : `left 700ms ${EASE}, top 700ms ${EASE}, width 700ms ${EASE}, height 700ms ${EASE}, opacity 400ms ${EASE}, padding 700ms ${EASE}`
	const live = !still
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		${zoom !== null && html`<div ...${SHIELD} onClick=${(e) => { e.stopPropagation(); setZoom(null) }} style=${{ ...box(0, 0, 1920, 1080), zIndex: 2, pointerEvents: 'all', cursor: 'zoom-out' }} />`}
		${PLOTS.map((p, i) => {
			const focus = zoom === i
			const r = focus ? FULL : CELL(i)
			return html`<div key=${p.id} ...${live ? SHIELD : {}} onClick=${live ? (e) => { e.stopPropagation(); setZoom(focus ? null : i) } : undefined}
				style=${{ ...box(r.x, r.y, r.w, r.h), zIndex: focus ? 3 : 1, background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
					padding: focus ? '76px 30px 30px' : '52px 16px 14px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
					pointerEvents: live ? 'all' : 'none', cursor: focus ? 'zoom-out' : 'zoom-in',
					opacity: zoom === null || focus ? 1 : 0.12, transition: t }}>
				<img src=${p.src} draggable=${false} style=${{ maxWidth: '100%', maxHeight: '100%', display: 'block', pointerEvents: 'none' }} />
				<div style=${{ position: 'absolute', left: 14, top: 8, fontFamily: F.hand, fontSize: focus ? 34 : 26, color: C.red, whiteSpace: 'nowrap' }}>${p.name}</div>
			</div>`
		})}
	</div>`
}
