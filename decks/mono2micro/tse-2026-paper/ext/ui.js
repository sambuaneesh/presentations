// Shared interactive parts for every slide of this deck.
//
//   <Stage>        wraps a scene; owns a stack of open overlays (sheets and drawers) for this viewer only
//   <Term k>       an inline technical term: click → a sheet with its definition, example and sources
//   <Cite k>       a citation chip [n]: click → the full reference, where the paper cites it, a link
//   <Inside>       a button that opens a drawer: tabs on the left, nested sub-tabs inside a tab
//   rich(text)     turns "[6]" / "[42, 43]" inside exported paper text into clickable citation chips
//
// A slide sits on a tldraw canvas where a click means "next step", the wheel pans and keys navigate.
// Everything clickable here stops pointer events in React (the canvas handlers are React handlers),
// the wheel natively at the overlay (tldraw listens natively), and keys in the capture phase on window
// while an overlay is open. Overlays are local UI state: live-room followers do not see them.
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { SlideCtx, useShared, useSharedScroll, registerDrawer, drawerFor } from './shared.js'
import { html, C, F, box, EASE } from '@pack/scenes/kit.js'
import { REFS, ORDER } from './data/refs.js'
import { GLOSSARY } from './glossary.js'

export { html, C, F, box, EASE }
export { SlideCtx, useShared, useSharedScroll, registerDrawer } from './shared.js'
export const INK = C.ink
const stop = (e) => e.stopPropagation()
export const SHIELD = { onPointerDown: stop, onPointerUp: stop, onPointerMove: stop, onDoubleClick: stop, onTouchStart: stop, onTouchEnd: stop }
const BY_NUMBER = Object.fromEntries(ORDER.map((k, i) => [i + 1, k]))

// ------------------------------------------------------------------ the overlay stack
const Ctx = createContext({ open: () => {}, still: true })
export const useStage = () => useContext(Ctx)

export function Stage({ still, children, name = 'main' }) {
	const slide = useContext(SlideCtx)
	// The stack holds only serializable descriptors (drawers by id), so a live room can share it.
	const [stack, setStack] = useShared(`stack:${name}`, [])
	const open = useCallback((item) => {
		if (item.kind === 'drawer') registerDrawer(slide, item)
		const d = item.kind === 'drawer' ? { id: item.id, kind: 'drawer', tab: item.tab ?? null } : item.kind === 'cite' ? { id: item.id, kind: 'cite', keys: item.keys } : { id: item.id, kind: 'term', key: item.key }
		setStack((s) => (s.some((x) => x.id === d.id) ? s : [...s, d]))
	}, [slide, setStack])
	const close = useCallback(() => setStack((s) => s.slice(0, -1)), [setStack])
	const closeOne = useCallback((id) => setStack((s) => s.filter((x) => x.id !== id)), [setStack])
	const closeAll = useCallback(() => setStack([]), [setStack])
	return html`<${Ctx.Provider} value=${{ open, close, closeAll, still, depth: stack.length }}>
		${children}
		${stack.length > 0 && html`<${Layer} stack=${stack} close=${close} closeOne=${closeOne} closeAll=${closeAll} />`}
	</${Ctx.Provider}>`
}

function Layer({ stack, close, closeOne, closeAll }) {
	const root = useRef(null)
	useEffect(() => {
		const el = root.current
		const onWheel = (e) => e.stopPropagation()
		el?.addEventListener('wheel', onWheel, { passive: true })
		const onKey = (e) => {
			if (e.ctrlKey || e.metaKey) return
			const scrollers = el?.querySelectorAll('[data-scroll]')
			const top = scrollers?.[scrollers.length - 1]
			const page = top ? top.clientHeight * 0.85 : 0
			const by = { ArrowDown: 90, ArrowUp: -90, PageDown: page, ' ': page, PageUp: -page }[e.key]
			if (e.key === 'Escape') close()
			else if (top && by) top.scrollBy({ top: by, behavior: 'smooth' })
			else if (top && e.key === 'Home') top.scrollTop = 0
			else if (top && e.key === 'End') top.scrollTop = top.scrollHeight
			e.stopPropagation()
			e.preventDefault()
		}
		window.addEventListener('keydown', onKey, true)
		return () => {
			el?.removeEventListener('wheel', onWheel)
			window.removeEventListener('keydown', onKey, true)
		}
	}, [close])
	return html`<div ref=${root} data-tp-layer ...${SHIELD} style=${{ ...box(0, 0, 1920, 1080), pointerEvents: 'all', zIndex: 100 }}>
		<div onClick=${(e) => { e.stopPropagation(); closeAll() }} style=${{ ...box(0, 0, 1920, 1080), background: 'rgba(43,38,33,0.36)', animation: 'tp-fade 220ms ease both' }} />
		${stack.map((item, i) => html`<${Overlay} key=${item.id} item=${item} depth=${i} top=${i === stack.length - 1} close=${() => closeOne(item.id)} />`)}
		<style>${CSS}</style>
	</div>`
}

const CSS = `
@keyframes tp-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes tp-in { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
@keyframes tp-side { from { opacity: 0; transform: translateX(40px) } to { opacity: 1; transform: none } }
.tp-scroll::-webkit-scrollbar { width: 12px } .tp-scroll::-webkit-scrollbar-thumb { background: rgba(43,38,33,0.25); border-radius: 6px }
.tp-term { cursor: pointer; border-bottom: 2.5px dotted ${C.red}; transition: background 160ms ease } .tp-term:hover { background: ${C.redGlow} }
.tp-chip:hover, .tp-btn:hover { filter: brightness(0.96); transform: translateY(-1px) }
`

function Overlay({ item, depth, top, close }) {
	const slide = useContext(SlideCtx)
	if (item.kind === 'drawer') {
		const d = item.tabs ? item : { ...(drawerFor(slide, item.id) ?? {}), id: item.id, tab: item.tab }
		return d.tabs ? html`<${Drawer} item=${d} depth=${depth} top=${top} close=${close} />` : null
	}
	return html`<${Sheet} item=${item} depth=${depth} top=${top} close=${close} />`
}

function CloseButton({ onClose }) {
	return html`<button type="button" title="Close" onClick=${(e) => { e.stopPropagation(); onClose() }}
		style=${{ position: 'absolute', right: 22, top: 20, width: 54, height: 54, borderRadius: 27, border: `2.5px solid ${C.ink}`, background: '#fffdf8', fontSize: 30, lineHeight: '48px', cursor: 'pointer', color: C.ink, padding: 0, zIndex: 3 }}>×</button>`
}

// A drawer: header, tab list on the left, scrollable content; a tab can hold sub-tabs.
function Drawer({ item, depth, top, close }) {
	const tabs = item.tabs
	const [active, setActive] = useShared(`tab:${item.id}`, item.tab ?? tabs[0].id)
	const scroller = useSharedScroll(`drawer:${item.id}:${active}`)
	const tab = tabs.find((t) => t.id === active) ?? tabs[0]
	const inset = 60 + depth * 26
	const accent = item.color ?? C.ink
	return html`<div style=${{ ...box(inset, 40 + depth * 18, 1920 - 2 * inset, 1000 - depth * 18), background: C.paper, borderRadius: 24, border: `3px solid ${accent}`,
			boxShadow: '0 40px 80px rgba(40,25,10,0.35)', overflow: 'hidden', animation: 'tp-in 300ms ease both', filter: top ? 'none' : 'brightness(0.97)' }}>
		<div style=${{ ...box(0, 0, 1920 - 2 * inset, 100), background: item.fill ?? C.paper2, borderBottom: `2px solid ${C.line}` }}>
			${item.kicker && html`<div style=${{ position: 'absolute', left: 36, top: 14, fontFamily: F.sans, fontSize: 17, fontWeight: 700, letterSpacing: 0.6, color: accent === C.ink ? C.red : accent }}>${item.kicker.toUpperCase()}</div>`}
			<div style=${{ position: 'absolute', left: 34, top: item.kicker ? 34 : 22, right: 110, fontFamily: F.hand, fontSize: 44, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>${item.title}</div>
			<${CloseButton} onClose=${close} />
		</div>
		${tabs.length > 1 && html`<div data-scroll="nav" class="tp-scroll" style=${{ ...box(0, 100, 320, 900 - depth * 18), borderRight: `2px solid ${C.line}`, padding: '18px 12px', boxSizing: 'border-box', overflowY: 'auto' }}>
			${tabs.map((t) => html`<button key=${t.id} type="button" onClick=${(e) => { e.stopPropagation(); setActive(t.id) }}
				style=${{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 6, padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
					border: `2px solid ${t.id === tab.id ? accent : 'transparent'}`, background: t.id === tab.id ? '#fffdf8' : 'transparent',
					fontFamily: F.sans, fontSize: 20, fontWeight: t.id === tab.id ? 700 : 500, color: C.ink }}>${t.label}</button>`)}
			${item.source && html`<div style=${{ margin: '16px 8px 0', fontFamily: F.sans, fontSize: 15, lineHeight: 1.45, color: C.dim }}>${item.source}</div>`}
		</div>`}
		<div key=${tab.id} ref=${scroller} data-scroll="body" class="tp-scroll" style=${{ ...box(tabs.length > 1 ? 320 : 0, 100, 1920 - 2 * inset - (tabs.length > 1 ? 320 : 0), 900 - depth * 18),
			overflowY: 'auto', padding: '26px 44px 70px', boxSizing: 'border-box', userSelect: 'text', overscrollBehavior: 'contain' }}>
			${tab.tabs ? html`<${SubTabs} tabs=${tab.tabs} accent=${accent} intro=${tab.render} />` : tab.render()}
			${tabs.length === 1 && item.source && html`<div style=${{ marginTop: 24, fontFamily: F.sans, fontSize: 15, color: C.dim }}>${item.source}</div>`}
		</div>
	</div>`
}

// Nested tabs inside one drawer tab (a row of pills).
export function SubTabs({ tabs, accent = C.ink, intro }) {
	const [active, setActive] = useShared(`sub:${tabs.map((t) => t.id).join(',')}`, tabs[0].id)
	const tab = tabs.find((t) => t.id === active) ?? tabs[0]
	return html`<div>
		${intro && intro()}
		<div style=${{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '6px 0 18px', paddingBottom: 12, borderBottom: `2px dashed ${C.line}` }}>
			${tabs.map((t) => html`<button key=${t.id} type="button" onClick=${(e) => { e.stopPropagation(); setActive(t.id) }}
				style=${{ padding: '8px 16px', borderRadius: 999, cursor: 'pointer', border: `2px solid ${t.id === tab.id ? accent : C.line}`,
					background: t.id === tab.id ? (accent === C.ink ? C.ink : accent) : '#fffdf8', color: t.id === tab.id ? '#fff' : C.ink,
					fontFamily: F.sans, fontSize: 18, fontWeight: 600 }}>${t.label}</button>`)}
		</div>
		<div key=${tab.id} style=${{ animation: 'tp-fade 200ms ease both' }}>${tab.tabs ? html`<${SubTabs} tabs=${tab.tabs} accent=${accent} intro=${tab.render} />` : tab.render()}</div>
	</div>`
}

// A side sheet for a term or a citation (stacks over drawers). Drag it by its top bar.
function Sheet({ item, depth, top, close }) {
	const w = 760, h = 1000 - depth * 14
	const x0 = 1920 - w - 40 - depth * 18, y0 = 40 + depth * 14
	const [off, setOff] = useShared(`off:${item.id}`, { x: 0, y: 0 })
	const scroller = useSharedScroll(`sheet:${item.id}`)
	const drag = useRef(null)
	const clamp = (o) => ({ x: Math.max(-x0 + 10, Math.min(1920 - w - 10 - x0, o.x)), y: Math.max(-y0 + 10, Math.min(1080 - 80 - y0, o.y)) })
	const onDown = (e) => {
		e.stopPropagation()
		// Screen pixels per slide pixel: the slide is scaled by tldraw's camera and the scene shape.
		const root = e.currentTarget.closest('[data-tp-layer]')
		const scale = root ? root.getBoundingClientRect().width / 1920 : 1
		drag.current = { x: e.clientX, y: e.clientY, start: off, scale }
		e.currentTarget.setPointerCapture?.(e.pointerId)
	}
	const onMove = (e) => {
		e.stopPropagation()
		const d = drag.current
		if (!d) return
		setOff(clamp({ x: d.start.x + (e.clientX - d.x) / d.scale, y: d.start.y + (e.clientY - d.y) / d.scale }))
	}
	const onUp = (e) => { e.stopPropagation(); drag.current = null; e.currentTarget.releasePointerCapture?.(e.pointerId) }
	return html`<div style=${{ ...box(x0 + off.x, y0 + off.y, w, h), background: '#fffdf8', borderRadius: 22, border: `3px solid ${item.kind === 'cite' ? C.blue : C.red}`,
			boxShadow: '0 30px 70px rgba(40,25,10,0.32)', overflow: 'hidden', animation: 'tp-side 260ms ease both', filter: top ? 'none' : 'brightness(0.97)' }}>
		<div onPointerDown=${onDown} onPointerMove=${onMove} onPointerUp=${onUp} onPointerCancel=${onUp} title="Drag to move"
			style=${{ ...box(0, 0, w, 60), cursor: drag.current ? 'grabbing' : 'grab', background: C.paper2 + 'aa', borderBottom: `1.5px solid ${C.line}`, touchAction: 'none', zIndex: 2 }}>
			<div style=${{ position: 'absolute', left: '50%', top: 16, transform: 'translateX(-50%)', width: 70, height: 6, borderRadius: 3, background: C.faint }} />
			<div style=${{ position: 'absolute', left: 50, right: 100, top: 30, textAlign: 'center', fontFamily: F.sans, fontSize: 14, color: C.dim }}>drag to move</div>
		</div>
		<button type="button" title="Close" onPointerDown=${stop} onClick=${(e) => { e.stopPropagation(); close() }}
			style=${{ position: 'absolute', right: 14, top: 8, width: 44, height: 44, borderRadius: 22, border: `2.5px solid ${C.ink}`, background: '#fffdf8', fontSize: 26, lineHeight: '38px', cursor: 'pointer', color: C.ink, padding: 0, zIndex: 3 }}>×</button>
		<div ref=${scroller} data-scroll="sheet" class="tp-scroll" style=${{ ...box(0, 60, w, h - 60), overflowY: 'auto', padding: '20px 36px 60px', boxSizing: 'border-box', userSelect: 'text' }}>
			${item.kind === 'cite' ? html`<${CiteBody} keys=${item.keys} />` : html`<${TermBody} k=${item.key} />`}
		</div>
	</div>`
}

// ------------------------------------------------------------------ terms
export function Term({ k, children }) {
	const { open } = useStage()
	const g = GLOSSARY[k]
	if (!g) return html`<span style=${{ color: C.red }}>${children}</span>`
	return html`<span class="tp-term" ...${SHIELD} title=${`${g.term}: click for the definition`}
		onClick=${(e) => { e.stopPropagation(); open({ id: 'term:' + k, kind: 'term', key: k }) }}
		style=${{ pointerEvents: 'all' }}>${children ?? g.term}</span>`
}

function TermBody({ k }) {
	const g = GLOSSARY[k]
	return html`<div>
		<div style=${{ fontFamily: F.sans, fontSize: 16, fontWeight: 700, letterSpacing: 0.6, color: C.red, marginBottom: 4 }}>TERM${g.family ? ' · ' + g.family.toUpperCase() : ''}</div>
		<div style=${{ fontFamily: F.hand, fontSize: 46, lineHeight: 1.1, marginBottom: 14 }}>${g.term}</div>
		${P(g.short, { fontSize: 23, fontWeight: 500 })}
		${g.formula && html`<div style=${{ margin: '6px 0 16px', padding: '14px 18px', background: C.paper2, borderRadius: 12, fontFamily: F.mono, fontSize: 19, lineHeight: 1.5 }}>${g.formula}</div>`}
		${g.body && g.body()}
		${g.example && html`<div>${H('Example')}${g.example()}</div>`}
		${g.see?.length > 0 && html`<div>${H('Related terms')}<div style=${{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
			${g.see.filter((s) => GLOSSARY[s]).map((s) => html`<span key=${s} style=${{ fontFamily: F.sans, fontSize: 20 }}><${Term} k=${s} /></span>`)}</div></div>`}
		${g.source && html`<div style=${{ marginTop: 22, paddingTop: 12, borderTop: `1px solid ${C.line}`, fontFamily: F.sans, fontSize: 16, color: C.dim, lineHeight: 1.45 }}>Source: ${g.source}</div>`}
	</div>`
}

// ------------------------------------------------------------------ citations
export function Cite({ k, keys }) {
	const { open } = useStage()
	const ks = keys ?? String(k).split(',').map((s) => s.trim())
	const nums = ks.map((x) => REFS[x]?.n ?? '?')
	return html`<span class="tp-chip" ...${SHIELD} title=${ks.map((x) => REFS[x]?.title).join(' · ')}
		onClick=${(e) => { e.stopPropagation(); open({ id: 'cite:' + ks.join(','), kind: 'cite', keys: ks }) }}
		style=${{ pointerEvents: 'all', cursor: 'pointer', display: 'inline-block', padding: '0 7px', margin: '0 2px', borderRadius: 7, border: `2px solid ${C.blue}`,
			color: C.blue, background: '#fffdf8', fontFamily: F.sans, fontSize: '0.72em', fontWeight: 700, lineHeight: 1.35, verticalAlign: '0.12em', transition: 'all 150ms ease' }}>${nums.join(', ')}</span>`
}

function CiteBody({ keys }) {
	return html`<div>${keys.map((key, i) => {
		const r = REFS[key]
		if (!r) return null
		return html`<div key=${key} style=${{ marginBottom: 30, paddingBottom: 20, borderBottom: i < keys.length - 1 ? `2px dashed ${C.line}` : 'none' }}>
			<div style=${{ fontFamily: F.sans, fontSize: 16, fontWeight: 700, letterSpacing: 0.6, color: C.blue }}>REFERENCE [${r.n}]</div>
			<div style=${{ fontFamily: F.serif, fontSize: 27, lineHeight: 1.3, margin: '6px 0 10px', fontWeight: 600 }}>${r.title}</div>
			${P(r.authors, { fontSize: 19, color: C.dim, margin: '0 0 4px' })}
			${P([r.venue, r.pages && `pp. ${r.pages}`, r.year].filter(Boolean).join(' · '), { fontSize: 19, margin: '0 0 12px' })}
			${r.note && P(r.note, { fontSize: 17, color: C.dim })}
			${(r.url || r.search) && html`<a href=${r.url ?? r.search} target="_blank" rel="noopener noreferrer" ...${SHIELD} onClick=${stop}
				style=${{ pointerEvents: 'all', display: 'inline-block', padding: '8px 16px', borderRadius: 999, border: `2px solid ${C.blue}`, color: C.blue, fontFamily: F.sans, fontSize: 18, fontWeight: 600, textDecoration: 'none' }}>
				${r.url ? (r.doi ? `DOI ${r.doi} ↗` : 'Open ↗') : 'Search on Google Scholar ↗ (no DOI or URL in the bibliography)'}</a>`}
			${r.contexts.length > 0 && html`<div>${H('Where the current write-up cites it')}
				${r.contexts.map((c, j) => html`<div key=${j} style=${{ margin: '0 0 12px', padding: '10px 14px', borderLeft: `4px solid ${C.blue}55`, background: C.paper2 + '88', borderRadius: 6 }}>
					<div style=${{ fontFamily: F.sans, fontSize: 15, fontWeight: 700, color: C.dim, marginBottom: 4 }}>§${c.sec}</div>
					<div style=${{ fontFamily: F.serif, fontSize: 18, lineHeight: 1.45 }}>${c.text}</div></div>`)}</div>`}
		</div>`
	})}</div>`
}

// "[6]" or "[42, 43]" inside exported text → citation chips.
export function rich(text) {
	const out = []
	let last = 0
	for (const m of String(text).matchAll(/\s?\[(\d+(?:,\s*\d+)*)\]/g)) {
		out.push(text.slice(last, m.index))
		const keys = m[1].split(',').map((n) => BY_NUMBER[Number(n.trim())]).filter(Boolean)
		out.push(html`<${Cite} key=${m.index} keys=${keys} />`)
		last = m.index + m[0].length
	}
	out.push(text.slice(last))
	return out
}

// ------------------------------------------------------------------ the "Inside" button
export function Inside({ x, y, w = 300, label = 'Inside', drawer, color = C.red, still, delay = 0, style }) {
	const { open } = useStage()
	registerDrawer(useContext(SlideCtx), { ...drawer, id: 'drawer:' + drawer.title })
	globalThis.__TP_COLLECT?.push(drawer)
	return html`<button type="button" class="tp-btn" ...${SHIELD} onClick=${(e) => { e.stopPropagation(); open({ ...drawer, id: 'drawer:' + drawer.title, kind: 'drawer' }) }}
		style=${{ ...(x != null ? box(x, y, w, 50) : { position: 'relative', height: 50, padding: '0 22px' }), pointerEvents: 'all', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
			fontFamily: F.sans, fontSize: 20, fontWeight: 600, color, background: '#fffdf8', border: `2.5px solid ${color}`, borderRadius: 999,
			boxShadow: '0 4px 12px rgba(43,38,33,0.12)', transition: 'all 150ms ease', animation: still ? 'none' : `tp-in 500ms ${EASE} ${delay}ms both`, ...style }}>
		<span style=${{ fontSize: 22 }}>⌕</span>${label}</button>`
}

// A card that opens a drawer when clicked (for maps, timelines, grids of items).
export function Card({ drawer, children, style, still, delay = 0, color = C.ink }) {
	const { open } = useStage()
	const slide = useContext(SlideCtx)
	if (drawer) { registerDrawer(slide, { ...drawer, id: 'drawer:' + drawer.title }); globalThis.__TP_COLLECT?.push(drawer) }
	return html`<div class="tp-btn" ...${SHIELD} onClick=${(e) => { e.stopPropagation(); if (drawer) open({ ...drawer, id: 'drawer:' + drawer.title, kind: 'drawer' }) }}
		style=${{ pointerEvents: drawer ? 'all' : 'none', cursor: drawer ? 'pointer' : 'default', position: 'absolute', background: '#fffdf8', border: `2.5px solid ${color}`, borderRadius: 16,
			boxShadow: '0 3px 0 rgba(43,38,33,0.08)', transition: 'all 150ms ease', animation: still ? 'none' : `tp-in 550ms ${EASE} ${delay}ms both`, boxSizing: 'border-box', ...style }}>${children}</div>`
}

// ------------------------------------------------------------------ content blocks (drawers and sheets)
export const P = (s, extra) => html`<p style=${{ fontFamily: F.sans, fontSize: 21, lineHeight: 1.5, margin: '0 0 14px', color: C.ink, ...extra }}>${s}</p>`
export const H = (s) => html`<div style=${{ fontFamily: F.sans, fontSize: 18, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: C.dim, margin: '24px 0 10px' }}>${s}</div>`
export const Code = (s) => html`<code style=${{ fontFamily: F.mono, fontSize: '0.9em', background: C.paper2, padding: '1px 6px', borderRadius: 5 }}>${s}</code>`
export const Formula = (s) => html`<div style=${{ margin: '8px 0 16px', padding: '14px 18px', background: C.paper2, borderRadius: 12, fontFamily: F.mono, fontSize: 19, lineHeight: 1.55 }}>${s}</div>`
export const Quote = (s, where) => html`<blockquote style=${{ margin: '6px 0 16px', padding: '12px 18px', borderLeft: `4px solid ${C.red}66`, background: C.paper2 + '99', fontFamily: F.serif, fontSize: 20, lineHeight: 1.5 }}>${s}${where && html`<div style=${{ fontFamily: F.sans, fontSize: 15, color: C.dim, marginTop: 6 }}>${where}</div>`}</blockquote>`
export const Note = (s, color = C.amber) => html`<div style=${{ margin: '12px 0 16px', padding: '12px 16px', border: `2px dashed ${color}`, borderRadius: 12, fontFamily: F.sans, fontSize: 19, lineHeight: 1.5, color: C.ink }}>${s}</div>`
export function List(items, { ordered = false, size = 21 } = {}) {
	const tag = ordered ? 'ol' : 'ul'
	return html`<${tag} style=${{ margin: '0 0 12px', paddingLeft: 30, fontFamily: F.sans, fontSize: size, lineHeight: 1.5, color: C.ink }}>
		${items.map((it, i) => html`<li key=${i} style=${{ marginBottom: 8 }}>${it}</li>`)}</${tag}>`
}
export function Table(head, rows, { hi, align, size = 19 } = {}) {
	return html`<table style=${{ borderCollapse: 'collapse', fontFamily: F.sans, fontSize: size, width: '100%', margin: '4px 0 14px' }}>
		<thead><tr>${head.map((h, i) => html`<th key=${i} style=${{ textAlign: (align?.[i] ?? (i ? 'right' : 'left')), color: C.dim, fontWeight: 600, padding: '7px 10px', borderBottom: `2px solid ${C.line}`, verticalAlign: 'bottom' }}>${h}</th>`)}</tr></thead>
		<tbody>${rows.map((r, j) => html`<tr key=${j} style=${{ background: hi && hi(j) ? C.redGlow : 'transparent' }}>
			${r.map((c, i) => html`<td key=${i} style=${{ textAlign: (align?.[i] ?? (i ? 'right' : 'left')), padding: '7px 10px', borderBottom: `1px solid ${C.line}`, verticalAlign: 'top' }}>${c}</td>`)}</tr>`)}</tbody>
	</table>`
}
// The line under a slide or panel that says where its content comes from.
export const Src = (s) => html`<div style=${{ marginTop: 18, fontFamily: F.sans, fontSize: 15, color: C.dim }}>Source: ${s}</div>`

// A slide's own source line (bottom right, like the house style's `source`).
export function SlideSource({ children }) {
	return html`<div style=${{ ...box(860, 1008, 960, 30), textAlign: 'right', fontFamily: F.hand, fontSize: 22, color: C.dim }}>${children}</div>`
}

// Smooth reveal on a beat.
export function reveal(on, still, { delay = 0, dy = 16 } = {}) {
	return {
		opacity: on ? 1 : 0,
		transform: on ? 'none' : `translateY(${dy}px)`,
		transition: still ? 'none' : `opacity 600ms ${EASE} ${delay}ms, transform 700ms ${EASE} ${delay}ms`,
		pointerEvents: on ? undefined : 'none',
	}
}

// Test hook: render an overlay stack without clicking (scripts/render-test only).
export function Preview({ items }) {
	return html`<${Ctx.Provider} value=${{ open: () => {}, close: () => {}, closeAll: () => {}, still: true, depth: items.length }}>
		${items.map((item, i) => html`<${Overlay} key=${i} item=${item} depth=${i} top=${i === items.length - 1} close=${() => {}} />`)}
	</${Ctx.Provider}>`
}
