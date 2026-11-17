// The workflow diagram, revised after the 10 November feedback. Click 0 is where the 10th-November deck's morph
// ended (its final layout; positions, icons and glyphs copied from presentations/10th-november/ext/morph.js), under a
// list of the three changes the feedback asked for (first large in the centre over the dimmed diagram, then moved up into
// a row above it). Each click then takes one bullet: it flies into the diagram, shrinks
// into the spot it is about, and the change appears there under a brief highlight; the bullet leaves the list.
// (1) the Process Controller is connected to the agents it runs, (2) the key explains the partition glyph and the
// control line, (3) the Blinded Evaluator gets its icon. Click 4 shows the revised paper figure
// (papers/tse-2026/manuscript/imgs/agenticFramework.tex).
import { html, C, F, EASE, box } from '@pack/scenes/kit.js'
import { useArrival } from './arrive.js'
import { FIG1 } from './fig1-paper.js'

// INTRO: the changes as large cards in the centre over the dimmed diagram; LIST: they move up into a row above it
const INTRO = 0, LIST = 1, CTRL = 2, KEY = 3, BLIND = 4, PAPER = 5
export const REVISION_BEATS = PAPER
const LAND = 750 // ms: when a flying bullet reaches the diagram and its change starts to appear

// ------------------------------------------------------------------ the figure's symbols (as in the 10th-November deck)
const LLM = '#a24f86', CODE = '#0072B2', DOT = '#8a847a', MARK = '#E69F00'
const Robot = (n) => html`<span style=${{ display: 'inline-flex', alignItems: 'center', gap: 3, color: LLM, fontWeight: 600 }}>
	<svg width="26" height="22" viewBox="0 0 26 22"><rect x="3" y="5" width="20" height="15" rx="4" fill=${LLM} /><rect x="12" y="0" width="2" height="5" fill=${LLM} />
		<circle cx="9.5" cy="12" r="2.3" fill="#fff" /><circle cx="16.5" cy="12" r="2.3" fill="#fff" /><rect x="0" y="10" width="3" height="5" rx="1" fill=${LLM} /><rect x="23" y="10" width="3" height="5" rx="1" fill=${LLM} /></svg>${n}</span>`
const Gear = () => html`<span style=${{ color: CODE, fontSize: 26, lineHeight: 1 }}>⚙</span>`
const SVC = ['#F0E442', '#D55E00', '#7B3294']
const Partition = ({ grey, w = 70, h = 50 }) => html`<div style=${{ width: w, height: h, border: '2px solid #8a847a', borderRadius: 4, background: '#fff', display: 'flex', gap: 4, padding: 4, boxSizing: 'border-box' }}>
	${[0, 1, 2].map((i) => html`<div key=${i} style=${{ flex: 1, borderRadius: 2, background: grey ? '#d6d2cb' : SVC[i] + '59', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
		${[0, 1, 2].map((j) => html`<div key=${j} style=${{ width: 5, height: 5, borderRadius: 3, background: grey ? '#8a847a' : SVC[i] }} />`)}</div>`)}</div>`
const Dotted = ({ w = 52 }) => html`<svg width=${w} height="8"><line x1="3" y1="4" x2=${w - 3} y2="4" stroke=${DOT} strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" /></svg>`

// ------------------------------------------------------------------ the changes: the list, and where each one lands
// target: the world rectangle (Fig. 1's millimetres × 9.6) that the bullet shrinks into and that is highlighted
const CHANGES = [
	{ text: 'connect the Process Controller to its agents', target: { x: 360, y: 290, w: 1258, h: 245 } },
	{ text: 'a legend for the partition icon (and the control line)', target: { x: 1160, y: 788, w: 720, h: 56 } },
	{ text: 'an icon for the Blinded Evaluator', target: { x: 374, y: 537, w: 250, h: 140 } },
]
// card i while the bullets from `first` on are still in the list: they share the row equally
// the three changes as large cards stacked in the centre of the slide (INTRO)
const CENTER = (i) => ({ x: 190, y: 330 + i * 150, w: 1540, h: 120 })
const CARD = (i, first) => {
	const n = CHANGES.length - first, w = (1800 - 20 * (n - 1)) / n
	return { x: 60 + (i - first) * (w + 20), y: 34, w, h: 100 }
}

// ------------------------------------------------------------------ the layout (world units: Fig. 1's millimetres × 9.6)
const AGENTS = [
	['ev', 1, 414, 139, 'Architectural Evidence\nConstructor', () => html`${Robot(1)} ${Gear()}`, 'code facts + LLM views'],
	['dom', 2, 952, 139, 'Domain Knowledge\nExtractor', () => Robot(1), 'business capabilities'],
	['gen', 3, 1490, 139, 'Decomposition\nGenerator', () => html`${Robot(3)} ${Gear()}`, '3 strategies, then repair'],
	['evl', 4, 1490, 528, 'Decomposition\nEvaluator', Gear, 'gate · score · select'],
	['ref', 5, 921, 528, 'Decomposition\nRefiner', Gear, 'Pareto local search'],
]
const BL_OLD = { x: 394, y: 554, w: 211, h: 106 }, BL_NEW = { x: 384, y: 547, w: 230, h: 120 }
// arrows: fixed ones, and the three that meet the Blinded Evaluator (they follow its box on click 3)
const ARROWS = [
	[[380, 182], [414, 182]], [[380, 272], [414, 272]], [[779, 218], [952, 218]], [[1317, 218], [1490, 218]],
	[[1672, 297], [1672, 528]], [[1490, 585], [1286, 585]], [[1286, 630], [1490, 630]], [[921, 607], [871, 607]],
]
const BL_ARROWS = (n) => n
	? [[[781, 607], [614, 607]], [[286, 607], [384, 607]], [[499, 667], [499, 695]]]
	: [[[781, 607], [605, 607]], [[286, 607], [394, 607]], [[499, 660], [499, 690]]]
const LABELS = [['evidence pack', 865, 196], ['capability map', 1403, 196], ['3 candidates', 1760, 452], ['selected', 1388, 565], ['accepted move', 1388, 652]]
// the Process Controller's control of each agent (dotted, not data flow): x, from y, to y (band: y 357–419)
const TICKS = [[596, 297, 357], [1134, 297, 357], [1546, 297, 357], [1210, 419, 528], [1546, 419, 528]]
const pathOf = (pts) => 'M' + pts.map(([x, y]) => `${x} ${y}`).join(' L')

// the 10th-November deck's framing of the new figure, moved down below the list of changes
const WORLD = [140, 50, 1760, 820], VIEW = { x: 60, y: 160, w: 1800, h: 890 }
const S = Math.min(VIEW.w / WORLD[2], VIEW.h / WORLD[3])
const TX = VIEW.x + VIEW.w / 2 - S * (WORLD[0] + WORLD[2] / 2), TY = VIEW.y + VIEW.h / 2 - S * (WORLD[1] + WORLD[3] / 2)
const toSlide = (x, y) => [TX + S * x, TY + S * y]

function Agent({ n, x, y, label, icons, sub }) {
	return html`<div style=${{ ...box(x, y, 365, 158), background: '#fff', border: `3px solid ${C.ink}`, borderRadius: 14, boxShadow: '0 2px 0 rgba(0,0,0,0.06)',
			display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: F.sans, color: C.ink }}>
		<div style=${{ position: 'absolute', left: -16, top: -16, width: 36, height: 36, borderRadius: 18, background: C.ink, color: '#fff', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>${n}</div>
		<div style=${{ fontSize: 25, fontWeight: 700, lineHeight: 1.12, whiteSpace: 'pre-line' }}>${label}</div>
		<div style=${{ marginTop: 4, fontSize: 20, display: 'flex', alignItems: 'center', gap: 6 }}>${icons()}</div>
		<div style=${{ fontSize: 19, marginTop: 3, color: '#4d473f' }}>${sub}</div>
	</div>`
}

function Figure({ B, quiet }) {
	const t = (ms, delay = 0) => (quiet ? 'none' : `all ${ms}ms ${EASE} ${delay}ms`)
	const region = (x, y, w, h, fill, title, color) => html`<div style=${{ ...box(x, y, w, h), background: fill, borderRadius: 22 }}>
		<div style=${{ position: 'absolute', left: 20, top: 10, fontFamily: F.sans, fontSize: 22, fontWeight: 700, color }}>${title}</div></div>`
	const input = (y, text) => html`<div style=${{ ...box(150, y, 230, 64), background: '#fff', border: '3px solid #8a847a', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 21, color: '#4d473f' }}>${text}</div>`
	const glyph = (x, grey, text) => html`<div style=${{ ...box(x, 566, 90, 90), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans }}>
		<${Partition} grey=${grey} /><div style=${{ fontSize: 21, marginTop: 6 }}>${text}</div></div>`
	const bl = B >= BLIND ? BL_NEW : BL_OLD
	return html`<div>
		${region(394, 60, 1488, 260, 'rgba(204,121,167,0.11)', 'LLM interprets and proposes', '#8c4a77')}
		${region(740, 454, 1142, 269, 'rgba(0,114,178,0.08)', 'Deterministic code decides', '#0b5f8f')}
		${region(154, 454, 499, 340, 'rgba(0,0,0,0.045)', 'Blinded evaluation', '#5d5850')}
		${CHANGES.map((c, i) => !quiet && B === i + CTRL && html`<div key=${'g' + i} style=${{ ...box(c.target.x, c.target.y, c.target.w, c.target.h), borderRadius: 20,
			background: MARK + '26', boxShadow: `0 0 0 4px ${MARK}`, animation: `rv-glow 2600ms ${EASE} ${LAND}ms both` }} />`)}
		<div style=${{ ...box(360, 357, 1258, 62), border: '2px solid #a39d94', background: '#f3f1ee', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 22, color: C.ink }}>
			<b style=${{ marginRight: 12 }}>Process Controller</b>runs 1–5 in order · validates artifacts · freezes and records the run</div>
		<svg width="1920" height="1180" style=${{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
			<defs><marker id="rv-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill=${C.ink} /></marker></defs>
			${ARROWS.map((p, i) => html`<path key=${'a' + i} d=${pathOf(p)} fill="none" stroke=${C.ink} strokeWidth="2.6" markerEnd="url(#rv-head)" />`)}
			${BL_ARROWS(B >= BLIND).map((p, i) => html`<path key=${'b' + i} fill="none" stroke=${C.ink} strokeWidth="2.6" markerEnd="url(#rv-head)" style=${{ d: `path('${pathOf(p)}')`, transition: quiet ? 'none' : `d 700ms ${EASE} ${LAND}ms` }} />`)}
			${TICKS.map(([x, y1, y2], i) => html`<line key=${'t' + i} x1=${x} y1=${y1} x2=${x} y2=${y2} stroke=${DOT} strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round"
				style=${{ opacity: B >= CTRL ? 1 : 0, transition: t(500, LAND + 120 * i) }} />`)}
			<line x1="697" y1="435" x2="697" y2="857" stroke=${C.red} strokeWidth="4" strokeDasharray="14 10" />
		</svg>
		${LABELS.map(([s, x, y]) => html`<div key=${s} style=${{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', fontFamily: F.sans, fontSize: 18, color: C.ink, background: C.paper, padding: '0 4px', whiteSpace: 'nowrap' }}>${s}</div>`)}
		<div style=${{ position: 'absolute', left: 697, top: 880, transform: 'translateX(-50%)', fontFamily: F.sans, fontSize: 22, fontWeight: 700, color: C.red }}>oracle firewall</div>
		${input(150, 'monolith source')}${input(240, 'dependency graph')}
		${AGENTS.map(([id, n, x, y, label, icons, sub]) => html`<${Agent} key=${id} n=${n} x=${x} y=${y} label=${label} icons=${icons} sub=${sub} />`)}
		${glyph(781, false, '🔒 frozen')}${glyph(196, true, 'reference')}
		<div style=${{ ...box(bl.x, bl.y, bl.w, bl.h), background: '#fff', border: `3px solid ${C.ink}`, borderRadius: 14, boxShadow: '0 2px 0 rgba(0,0,0,0.06)', transition: t(700, LAND),
				display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: F.sans, color: C.ink }}>
			<div style=${{ fontSize: 25, fontWeight: 700, lineHeight: 1.12 }}>Blinded<br />Evaluator</div>
			${B >= BLIND && html`<div style=${{ marginTop: 4, fontSize: 19, display: 'flex', alignItems: 'center', gap: 8, color: '#4d473f', animation: quiet ? 'none' : `rv-in 600ms ${EASE} ${LAND + 300}ms both` }}>${Gear()}after freezing</div>`}
		</div>
		<div style=${{ ...box(360, B >= BLIND ? 695 : 690, 280, 64), display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: F.sans, fontSize: 21, lineHeight: 1.3, whiteSpace: 'pre-line', transition: t(700, LAND) }}>CMod · CiD · DTP${'\n'}DI · BCP · C2C</div>
		<div style=${{ position: 'absolute', left: 1730, top: 350 }}>
			${[0, 1, 2].map((i) => html`<div key=${i} style=${{ position: 'absolute', left: i * 9, top: i * 9 }}><${Partition} w=${56} h=${40} /></div>`)}
		</div>
		<div style=${{ ...box(1000, B >= KEY ? 748 : 760, 880, 40), display: 'flex', gap: 34, alignItems: 'center', justifyContent: 'flex-end', fontFamily: F.sans, fontSize: 21, transition: t(600, LAND) }}>
			<span>${Robot(html`<i>n</i>`)}  LLM calls per run</span><span>${Gear()}  deterministic code</span>
		</div>
		<div style=${{ ...box(1000, 796, 880, 40), display: 'flex', gap: 34, alignItems: 'center', justifyContent: 'flex-end', fontFamily: F.sans, fontSize: 21,
				opacity: B >= KEY ? 1 : 0, transition: t(600, LAND + 200) }}>
			<span style=${{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><${Partition} w=${46} h=${32} />decomposition: dots = classes, columns = services</span>
			<span style=${{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><${Dotted} />control</span>
		</div>
	</div>`
}

// The list of changes: first as large cards in the centre (INTRO), then a row above the diagram (LIST), where the
// bullets still to come share the row. On its click, a copy of a bullet flies to its target in the diagram and shrinks
// into it; the bullet itself leaves the list and the others widen to fill the row.
function Changes({ B, quiet }) {
	const done = Math.max(0, B - LIST) // bullets already flown into the diagram
	const big = B === INTRO
	return html`<div>
		${CHANGES.map((c, i) => {
			const gone = done > i, r = big ? CENTER(i) : gone ? CARD(i, i) : CARD(i, done)
			const move = B === LIST ? `all 800ms ${EASE} ${120 * i}ms` : `left 600ms ${EASE} 350ms, width 600ms ${EASE} 350ms`
			return html`<div key=${'c' + i} style=${{ ...box(r.x, r.y, r.w, r.h), display: 'flex', alignItems: 'center', gap: big ? 24 : 16, padding: big ? '0 34px' : '0 22px', boxSizing: 'border-box', overflow: 'hidden',
					borderRadius: 16, border: `${big ? 3 : 2.5}px solid ${MARK}`, background: '#fffdf8', opacity: gone ? 0 : 1, boxShadow: big ? '0 8px 28px rgba(0,0,0,0.12)' : 'none',
					transition: quiet ? 'none' : gone ? `opacity 120ms linear` : move }}>
				<div style=${{ width: big ? 58 : 40, height: big ? 58 : 40, flex: 'none', borderRadius: 29, border: `${big ? 3 : 2.5}px solid ${MARK}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
					fontFamily: F.sans, fontSize: big ? 32 : 24, fontWeight: 700, color: MARK, transition: quiet ? 'none' : `all 800ms ${EASE}` }}>${i + 1}</div>
				<div style=${{ fontFamily: F.hand, fontSize: big ? 46 : 30, lineHeight: 1.15, color: C.ink, transition: quiet ? 'none' : `font-size 800ms ${EASE}` }}>${c.text}</div>
			</div>`
		})}
		${CHANGES.map((c, i) => {
			if (quiet || B !== i + CTRL) return null
			const r = CARD(i, i), [x, y] = toSlide(c.target.x + c.target.w / 2, c.target.y + c.target.h / 2)
			return html`<div key=${'f' + i} style=${{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, zIndex: 5, display: 'flex', alignItems: 'center', padding: '0 22px', boxSizing: 'border-box',
					borderRadius: 16, background: MARK, color: '#fff', fontFamily: F.hand, fontSize: 30, boxShadow: '0 6px 18px rgba(0,0,0,0.18)', transformOrigin: '50% 50%',
					animation: `rv-fly-${i} ${LAND + 150}ms cubic-bezier(.45,.05,.3,1) both` }}>${c.text}</div>
				<style>${`@keyframes rv-fly-${i} { 0% { transform: translate(0, 0) scale(1); opacity: 1 } 70% { opacity: 1 }
					100% { transform: translate(${x - (r.x + r.w / 2)}px, ${y - (r.y + r.h / 2)}px) scale(0.18); opacity: 0 } }`}</style>`
		})}
	</div>`
}

function camera() {
	return `translate(${TX}px, ${TY}px) scale(${S})`
}

export function RevisionScene({ b, still }) {
	const B = still ? PAPER : Math.max(0, Math.min(PAPER, b))
	const arrived = useArrival(still) // a hook: always called, never behind ||
	const quiet = still || !arrived
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		<div style=${{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1180, transformOrigin: '0 0', transform: camera(), opacity: B >= PAPER ? 0 : B === INTRO ? 0.16 : 1, transition: quiet ? 'none' : `opacity 700ms ${EASE}` }}>
			<${Figure} B=${B} quiet=${quiet} />
		</div>
		<${Changes} B=${B} quiet=${quiet} />
		<div style=${{ ...box(60, 40, 1800, 1000), background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
				opacity: B >= PAPER ? 1 : 0, transform: B >= PAPER ? 'none' : 'scale(0.97)', transition: quiet ? 'none' : `opacity 700ms ${EASE}, transform 700ms ${EASE}` }}>
			<img src=${FIG1} style=${{ maxWidth: 1760, maxHeight: 960, display: 'block' }} />
		</div>
		<style>${`@keyframes rv-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
			@keyframes rv-glow { 0% { opacity: 0 } 15% { opacity: 1 } 70% { opacity: 1 } 100% { opacity: 0 } }`}</style>
	</div>`
}
