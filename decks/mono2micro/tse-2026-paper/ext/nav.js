// The compass: quick navigation while presenting. Every slide carries a small "13 / 43 ⌖" button in its
// bottom-left corner (and G opens it): the deck's six parts as columns with every slide, the current
// one in red; type a slide number or a word to filter, ↑ ↓ to pick, Enter to jump; glossary terms that
// match open their definition in place; "back" returns to where the last jump started.
import { useState, useEffect, useRef } from 'react'
import { useMaybeEditor } from 'tldraw'
import { html, C, F, box, EASE, SHIELD, Term, useStage, useShared, useSharedScroll } from './ui.js'
import { PARTS, SLIDES } from './deck.js'
import { GLOSSARY } from './glossary.js'

// Shared by every slide's compass (one module): where the last jump came from.
let lastFrom = null

function useJump() {
	const editor = useMaybeEditor?.()
	return (from, to) => {
		if (to < 0 || to >= SLIDES.length) return
		lastFrom = from
		const tool = editor?.getCurrentTool?.()
		if (tool && typeof tool.go === 'function') return tool.go(to)
		// Not presenting: bring that slide's frame into view instead.
		const frames = editor?.getCurrentPageShapes?.().filter((s) => s.type === 'frame').sort((a, b) => a.x - b.x)
		const f = frames?.[to]
		if (f) editor.zoomToBounds(editor.getShapePageBounds(f.id), { animation: { duration: 400 }, inset: 40 })
	}
}

const norm = (s) => String(s ?? '').toLowerCase()
function matches(q) {
	const n = Number(q)
	if (q && Number.isInteger(n) && n >= 1 && n <= SLIDES.length) return { slides: [n - 1], terms: [] }
	const words = norm(q).split(/\s+/).filter(Boolean)
	const hit = (t) => words.every((w) => norm(t).includes(w))
	const slides = SLIDES.map((s, i) => i).filter((i) => !words.length || hit(`${SLIDES[i].name} ${SLIDES[i].kicker ?? ''} ${SLIDES[i].title ?? ''}`))
	const terms = words.length ? Object.entries(GLOSSARY).filter(([k, g]) => hit(`${g.term} ${k}`)).map(([k]) => k).slice(0, 8) : []
	return { slides, terms }
}

// A slim dock on the left edge (in the slide margin): the map, one icon per part, and progress.
const ICON = { front: '⌂', p1: 'I', p2: 'III', p3: 'IV', p4: 'V', p5: 'VI', p6: 'A' }
function Dock({ index, onMap }) {
	const jump = useJump()
	const [near, setNear] = useShared('dock:near', false)
	const [tip, setTip] = useShared('dock:tip', null)
	const here = SLIDES[index].part
	const parts = PARTS.map((p) => ({ ...p, idx: SLIDES.map((s, i) => i).filter((i) => SLIDES[i].part === p.id) }))
	const X = 18, W = 58, Y = 210, H = 660
	const trackTop = 78 + parts.length * 54 + 6, trackH = H - 96 - trackTop
	const btn = (key, y, label, active, onClick, tipText) => html`<div key=${key} ...${SHIELD} onClick=${(e) => { e.stopPropagation(); onClick() }}
		onPointerEnter=${() => setTip({ y, text: tipText })} onPointerLeave=${() => setTip(null)}
		style=${{ position: 'absolute', left: (W - 42) / 2, top: y, width: 42, height: 42, borderRadius: 21, pointerEvents: 'all', cursor: 'pointer',
			display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.hand, fontSize: label.length > 2 ? 17 : 21, color: active ? '#fff' : C.ink,
			background: active ? C.red : 'transparent', border: `2px solid ${active ? C.red : 'rgba(43,38,33,0.22)'}`, transition: 'all 140ms ease' }}>${label}</div>`
	return html`<div ...${SHIELD} onPointerEnter=${() => setNear(true)} onPointerLeave=${() => { setNear(false); setTip(null) }}
		style=${{ ...box(X, Y, W, H), pointerEvents: 'all', zIndex: 40, borderRadius: W / 2, background: 'rgba(255,253,248,0.72)', border: '1.5px solid rgba(43,38,33,0.14)',
			boxShadow: near ? '0 10px 30px rgba(43,38,33,0.16)' : 'none', opacity: near ? 1 : 0.5, transition: 'opacity 220ms ease, box-shadow 220ms ease', backdropFilter: 'blur(2px)' }}>
		${btn('map', 12, '⌖', false, onMap, 'the map · Ctrl+K')}
		<div style=${{ position: 'absolute', left: 14, right: 14, top: 64, height: 1.5, background: 'rgba(43,38,33,0.15)' }} />
		${parts.map((p, k) => btn(p.id, 78 + k * 54, ICON[p.id], p.id === here, () => jump(index, p.idx[0]), `${p.label.replace('Appendix: ', '')} · ${p.idx[0] + 1}–${p.idx.at(-1) + 1}`))}
		<div style=${{ position: 'absolute', left: W / 2 - 2, top: trackTop, width: 4, height: trackH, borderRadius: 2, background: 'rgba(43,38,33,0.12)' }}>
			<div style=${{ width: 4, height: `${((index + 1) / SLIDES.length) * 100}%`, borderRadius: 2, background: C.red, transition: 'height 400ms ease' }} /></div>
		<div style=${{ position: 'absolute', left: 0, width: W, top: H - 84, textAlign: 'center', fontFamily: F.hand, lineHeight: 1 }}>
			<div style=${{ fontSize: 26, color: C.ink }}>${index + 1}</div>
			<div style=${{ fontSize: 16, color: C.dim, marginTop: 4 }}>/ ${SLIDES.length}</div></div>
		${tip && html`<div style=${{ position: 'absolute', left: W + 10, top: tip.y + 6, pointerEvents: 'none', whiteSpace: 'nowrap', padding: '5px 12px', borderRadius: 10,
			background: C.ink, color: '#fff', fontFamily: F.sans, fontSize: 15, boxShadow: '0 6px 16px rgba(0,0,0,0.18)' }}>${tip.text}</div>`}
	</div>`
}

export function Compass({ index }) {
	const [open, setOpen] = useShared('map:open', false)
	const host = useRef(null)
	// G opens the compass of the slide that is on screen (the one whose area holds the window centre).
	useEffect(() => {
		const onKey = (e) => {
			const hot = (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'g' || e.key === 'G' || e.key === '/')) || ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K'))
			if (open || !hot) return
			if (/^(input|textarea)$/i.test(e.target?.tagName ?? '') || e.target?.isContentEditable) return
			const r = host.current?.parentElement?.getBoundingClientRect()
			if (!r || r.width < window.innerWidth * 0.5) return
			const cx = window.innerWidth / 2, cy = window.innerHeight / 2
			if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return
			e.preventDefault(); e.stopPropagation(); setOpen(true)
		}
		window.addEventListener('keydown', onKey, true)
		return () => window.removeEventListener('keydown', onKey, true)
	}, [open])
	return html`<div ref=${host}>
		<${Dock} index=${index} onMap=${() => setOpen(true)} />
		${open && html`<${Panel} index=${index} close=${() => setOpen(false)} />`}
	</div>`
}

const SEC = { front: 'start', p1: '§I–II', p2: '§III', p3: '§IV', p4: '§V', p5: '§VI–VIII', p6: 'appendix' }

// The map: every part is a region on one sheet, joined by a road in reading order.
// Row 1 runs left to right, row 2 right to left (a boustrophedon), so the road never crosses itself.
const REGIONS = {
	front: { x: 40, y: 150, w: 330, h: 380, cols: 1 },
	p1: { x: 400, y: 150, w: 690, h: 380, cols: 2 },
	p2: { x: 1120, y: 150, w: 640, h: 380, cols: 2 },
	p3: { x: 1390, y: 570, w: 370, h: 360, cols: 1 },
	p4: { x: 830, y: 570, w: 530, h: 360, cols: 2 },
	p5: { x: 440, y: 570, w: 360, h: 360, cols: 1 },
	p6: { x: 40, y: 570, w: 370, h: 360, cols: 1 },
}
const MAP_LABEL = { front: 'Start', p1: 'The problem & background', p2: 'The workflow & the study', p3: 'How it evolved', p4: 'Results', p5: 'What it means', p6: 'The research record' }
const TINT = { front: '#f3ece2', p1: '#efe7f6', p2: '#e6f1ea', p3: '#fbeee2', p4: '#fbe7e4', p5: '#e7eef8', p6: '#efece6' }

export function Panel({ index, close }) {
	const jump = useJump()
	const { open: openSheet } = useStage()
	const [q, setQ, viewer] = useShared('map:q', '')
	const [pick, setPick] = useShared('map:pick', null)
	const scroller = useSharedScroll('map')
	const { slides, terms } = matches(q)
	const searching = q.trim().length > 0
	const list = searching ? slides : SLIDES.map((s, i) => i)
	// Every choosable thing, in the order Tab walks: matching slides, then matching terms.
	const options = [...list.map((i) => 's:' + i), ...terms.map((k) => 't:' + k)]
	const current = pick != null && options.includes(pick) ? pick : searching ? options[0] : 's:' + index
	const root = useRef(null), input = useRef(null)
	const go = (to) => { close(); jump(index, to) }
	const choose = (opt) => {
		if (!opt) return
		if (opt.startsWith('s:')) go(Number(opt.slice(2)))
		else { close(); openSheet({ id: 'term:' + opt.slice(2), kind: 'term', key: opt.slice(2) }) } // the definition opens on the slide itself
	}
	useEffect(() => { const f = () => input.current?.focus(); f(); const t = setTimeout(f, 60); return () => clearTimeout(t) }, [])
	useEffect(() => setPick(null), [q])
	useEffect(() => {
		const el = root.current
		const onWheel = (e) => e.stopPropagation()
		el?.addEventListener('wheel', onWheel, { passive: true })
		const onKey = (e) => {
			if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.stopPropagation(); e.preventDefault(); return close() }
			if (e.ctrlKey || e.metaKey) return
			const at = options.indexOf(current)
			const step = (d) => setPick(options[(Math.max(0, at) + d + options.length) % options.length])
			if (e.key === 'Escape') close()
			else if (e.key === 'Enter') choose(current)
			else if (e.key === 'Tab') step(e.shiftKey ? -1 : 1)
			else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') step(1)
			else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') step(-1)
			else if (e.key.length === 1 && document.activeElement !== input.current) { input.current?.focus(); setQ((v) => v + e.key) } // typing always lands in the search
			else { e.stopPropagation(); return } // typing goes to the search field, not to tldraw
			e.stopPropagation(); e.preventDefault()
		}
		window.addEventListener('keydown', onKey, true)
		return () => { el?.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey, true) }
	}, [options.join('|'), current])

	const shown = new Set(slides)
	const parts = PARTS.map((p) => ({ ...p, r: REGIONS[p.id], idx: SLIDES.map((s, i) => i).filter((i) => SLIDES[i].part === p.id) }))
	// The road: through each region's heading anchor, in order.
	const pts = parts.map((p) => [p.r.x + p.r.w / 2, p.r.y + p.r.h / 2])
	const road = pts.map(([x, y], k) => {
		if (!k) return `M ${x} ${y}`
		const [px, py] = pts[k - 1]
		return Math.abs(py - y) < 5 ? `L ${x} ${y}` : `C ${px} ${py + 160}, ${x} ${y - 160}, ${x} ${y}`
	}).join(' ')
	const hereRegion = SLIDES[index].part

	return html`<div ref=${root} ...${SHIELD} onClick=${(e) => { e.stopPropagation(); if (e.target === e.currentTarget) close() }}
		style=${{ ...box(0, 0, 1920, 1080), pointerEvents: 'all', zIndex: 300, background: 'rgba(43,38,33,0.42)', animation: 'tp-fade 200ms ease both' }}>
		<div style=${{ ...box(60, 40, 1800, 1000), background: C.paper, borderRadius: 30, boxShadow: '0 40px 90px rgba(40,25,10,0.4)', overflow: 'hidden', animation: `tp-in 260ms ${EASE} both` }}>
			<div style=${{ ...box(40, 30, 1720, 70), display: 'flex', alignItems: 'flex-end', gap: 30 }}>
				<div style=${{ fontFamily: F.hand, fontSize: 44, color: C.ink, whiteSpace: 'nowrap', lineHeight: 1 }}>the map <span style=${{ color: C.red }}>⌖</span></div>
				<input ref=${input} value=${q} readOnly=${viewer} placeholder=${viewer ? 'the presenter is searching…' : 'search a slide, a word, a number, or a term'} onInput=${(e) => setQ(e.target.value)} onPointerDown=${(e) => e.stopPropagation()}
					style=${{ flex: 1, height: 52, boxSizing: 'border-box', padding: '0 6px', border: 'none', borderBottom: `2.5px solid ${C.ink}`, background: 'transparent', fontFamily: F.hand, fontSize: 30, color: C.ink, outline: 'none', pointerEvents: 'all' }} />
				<button type="button" ...${SHIELD} onClick=${(e) => { e.stopPropagation(); close() }} title="Close (Ctrl+K)"
					style=${{ pointerEvents: 'all', flex: 'none', width: 52, height: 52, borderRadius: 26, border: `2.5px solid ${C.ink}`, background: '#fffdf8', fontSize: 26, cursor: 'pointer', padding: 0 }}>×</button>
			</div>
			${terms.length > 0 && html`<div style=${{ ...box(40, 108, 1720, 34), display: 'flex', gap: 8, alignItems: 'center', fontFamily: F.sans, fontSize: 16 }}>
				<span style=${{ color: C.dim }}>terms:</span>
				${terms.map((k) => html`<span key=${k} ...${SHIELD} onClick=${(e) => { e.stopPropagation(); choose('t:' + k) }} onPointerEnter=${() => setPick('t:' + k)}
					style=${{ pointerEvents: 'all', cursor: 'pointer', padding: '2px 12px', borderRadius: 999, border: `2px ${current === 't:' + k ? 'solid' : 'dotted'} ${C.red}`,
						background: current === 't:' + k ? C.red : '#fffdf8', color: current === 't:' + k ? '#fff' : C.ink, transition: 'all 120ms ease' }}>${GLOSSARY[k].term}</span>`)}</div>`}

			<svg width="1800" height="1000" style=${{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
				<path d=${road} fill="none" stroke=${C.red} strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" opacity="0.55" />
			</svg>

			${parts.map((p, k) => {
				const r = p.r, perCol = Math.ceil(p.idx.length / r.cols), here = p.id === hereRegion
				const nMatch = p.idx.filter((i) => shown.has(i)).length
				return html`<div key=${p.id} style=${{ ...box(r.x, r.y, r.w, r.h), background: TINT[p.id], borderRadius: 24, border: `2.5px ${here ? 'solid' : 'dashed'} ${here ? C.red : 'rgba(43,38,33,0.28)'}`,
						opacity: searching && !nMatch ? 0.4 : 1, transition: 'opacity 150ms ease' }}>
					<div ...${SHIELD} onClick=${(e) => { e.stopPropagation(); go(p.idx[0]) }} title="go to the start of this part"
						style=${{ position: 'absolute', left: 22, top: 14, right: 18, pointerEvents: 'all', cursor: 'pointer' }}>
						<div style=${{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
							<span style=${{ fontFamily: F.sans, fontSize: 14, fontWeight: 700, letterSpacing: 0.6, color: C.red, textTransform: 'uppercase' }}>${SEC[p.id]}</span>
							<span style=${{ fontFamily: F.sans, fontSize: 13, color: C.dim }}>${searching ? `${nMatch} of ${p.idx.length}` : `${p.idx.length} slides`}</span></div>
						<div style=${{ fontFamily: F.hand, fontSize: 29, lineHeight: 1.1, marginTop: 2, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>${MAP_LABEL[p.id]}</div>
					</div>
					<div style=${{ position: 'absolute', left: 16, right: 14, top: 88, bottom: 14, display: 'grid', gridTemplateColumns: `repeat(${r.cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${perCol}, 44px)`, gridAutoFlow: 'column', columnGap: 10, rowGap: 6, alignContent: 'start' }}>
						${p.idx.map((i) => {
							const s = SLIDES[i], on = 's:' + i === current, isHere = i === index, dim = searching && !shown.has(i)
							return html`<div key=${s.scene} ...${SHIELD} onClick=${(e) => { e.stopPropagation(); go(i) }} onPointerEnter=${() => setPick('s:' + i)} title=${`${i + 1} · ${s.name}${s.kicker ? ' — ' + s.kicker : ''}`}
								style=${{ pointerEvents: 'all', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, height: 44, minWidth: 0, overflow: 'hidden', padding: '0 8px', borderRadius: 12,
									background: on ? 'rgba(255,253,248,0.95)' : 'transparent', boxShadow: on ? '0 4px 12px rgba(43,38,33,0.10)' : 'none', opacity: dim ? 0.25 : 1, transition: 'all 120ms ease' }}>
								<span style=${{ flex: 'none', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.hand, fontSize: 19,
									background: isHere ? C.red : '#fffdf8', color: isHere ? '#fff' : on ? C.red : C.ink, border: `2px solid ${isHere || on ? C.red : 'rgba(43,38,33,0.35)'}` }}>${i + 1}</span>
								<span style=${{ flex: 1, minWidth: 0, fontFamily: F.sans, fontSize: 17, lineHeight: 1.2, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>${s.name}</span>
								${isHere && html`<span style=${{ flex: 'none', fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: C.red }}>here</span>`}
							</div>`
						})}
					</div>
				</div>`
			})}

			<div style=${{ ...box(40, 952, 1720, 30), display: 'flex', alignItems: 'center', fontFamily: F.sans, fontSize: 15, color: C.dim }}>
				${lastFrom != null && lastFrom !== index && html`<span ...${SHIELD} onClick=${(e) => { e.stopPropagation(); go(lastFrom) }}
					style=${{ pointerEvents: 'all', cursor: 'pointer', color: C.red, fontSize: 17, fontWeight: 600 }}>↩ back to ${lastFrom + 1} · ${SLIDES[lastFrom].name}</span>`}
				<span style=${{ marginLeft: 'auto' }}>type to search · Enter opens the highlighted match · Tab / ↑ ↓ move between matches · Ctrl+K closes</span>
			</div>
		</div>
		<style>${`@keyframes tp-fade { from { opacity: 0 } to { opacity: 1 } } @keyframes tp-in { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } } input::placeholder { color: ${C.faint} }`}</style>
	</div>`
}
