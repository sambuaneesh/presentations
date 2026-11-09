// The workflow diagram, old to new, one design reason per click. Beat 0 is the TSE deck's live-trace diagram exactly
// as it ends ("One run, end to end"): its world data (N, A, K), boxes, arrows, controller frame, legend and badges are
// copied from presentations/tse-2026-paper/ext/trace/agentic.js. Each later click applies one principle behind the new
// figure (papers/tse-2026/manuscript/imgs/agenticFramework.tex; the principles are those of the research-diagrams
// skill) to every component it touches at once. Clicks 1–4 change components in their old places; click 5 glides them
// into the new layout; click 6 adds the phase regions; click 7 shows the paper's own figure. No headings: the reason
// for each click is in the slide's speaker notes.
import { html, C, F, EASE, box } from '@pack/scenes/kit.js'
import { useArrival } from './arrive.js'
import { FIG1 } from './fig1-paper.js'

// ------------------------------------------------------------------ copied from the trace scene (look + world)
const K = {
	tool: { fill: '#fbeaf2', stroke: '#c0578e' },
	llm: { fill: '#e4f4ec', stroke: '#2e9e6e' },
	hybrid: { fill: '#e4eefa', stroke: '#2f6fb5' },
	plain: { fill: '#fffdf8', stroke: '#6f675c' },
	future: { fill: 'rgba(255,255,255,0.4)', stroke: '#9a948a' },
}
const N = {
	src: { x: 40, y: 120, w: 270, h: 66, kind: 'plain', label: 'Monolith source', sub: '(scoped classes)' },
	graph: { x: 40, y: 215, w: 270, h: 66, kind: 'plain', label: 'Static dependency', sub: 'graph' },
	inv: { x: 40, y: 310, w: 270, h: 66, kind: 'plain', label: 'Canonical class', sub: 'inventory' },
	ev: { x: 450, y: 110, w: 380, h: 120, kind: 'hybrid', n: 1, label: 'Architectural Evidence', sub: 'Constructor Agent' },
	dom: { x: 1030, y: 110, w: 380, h: 120, kind: 'llm', n: 2, label: 'Domain Knowledge', sub: 'Extractor Agent' },
	gen: { x: 930, y: 330, w: 480, h: 130, kind: 'llm', n: 3, label: 'Decomposition Generator Agent', sub: 'dependency-first · domain-first · balanced · repair' },
	evl: { x: 930, y: 570, w: 480, h: 120, kind: 'tool', n: 4, label: 'Decomposition Evaluator Agent', sub: 'validity gate · score · select' },
	ref: { x: 440, y: 570, w: 340, h: 120, kind: 'tool', n: 5, label: 'Decomposition Refiner Agent', sub: 'bounded Pareto local search' },
	qa: { x: 1560, y: 400, w: 300, h: 120, kind: 'future', label: 'Quality Agent', sub: '(future work)' },
	frz: { x: 970, y: 800, w: 400, h: 80, kind: 'plain', label: 'Frozen decomposition', bold: true },
	refd: { x: 470, y: 1020, w: 320, h: 80, kind: 'plain', label: 'Reference', sub: 'decomposition' },
	bl: { x: 970, y: 1010, w: 400, h: 100, kind: 'tool', label: 'Blinded Evaluator' },
	met: { x: 1500, y: 1020, w: 340, h: 80, kind: 'plain', label: 'Design + similarity', sub: 'metrics' },
}
const A = [
	['srcEv', [[310, 153], [450, 153]]],
	['graphEv', [[310, 248], [520, 248], [520, 230]]],
	['invEvl', [[175, 376], [175, 780], [1100, 780], [1100, 690]]],
	['evDom', [[830, 170], [1030, 170]], 'evidence pack', [930, 150]],
	['domGen', [[1220, 230], [1220, 330]], 'capability map', [1310, 285]],
	['evGen', [[640, 230], [640, 395], [930, 395]], 'evidence', [785, 375]],
	['genEvl', [[1170, 460], [1170, 570]], '3 candidates', [1250, 520]],
	['evlRef', [[930, 610], [780, 610]], 'selected', [855, 590]],
	['refEvl', [[780, 655], [930, 655]], 'accepted move', [855, 678]],
	['qaGen', [[1560, 430], [1485, 430], [1485, 395], [1410, 395]], null, null, true],
	['qaEvl', [[1560, 490], [1485, 490], [1485, 630], [1410, 630]], null, null, true],
	['evlFrz', [[1170, 690], [1170, 800]], 'after refinement', [1265, 760]],
	['frzBl', [[1170, 880], [1170, 1010]]],
	['refdBl', [[790, 1060], [970, 1060]]],
	['blMet', [[1370, 1060], [1500, 1060]]],
]
const pathOf = (pts) => 'M' + pts.map(([x, y]) => `${x} ${y}`).join(' L')
const BADGES = { ev: '1 call · 15.9k tokens', dom: '1 call · 6.5k', gen: '3 calls · 11.7k', evl: '0 LLM calls', ref: '3 moves · 0 LLM calls', bl: 'C2C 100 / 75 / 75' }

// ------------------------------------------------------------------ the clicks: one principle each
const PRUNE = 1, LABEL = 2, NOTATION = 3, GLYPH = 4, LAYOUT = 5, REGION = 6, PAPER = 7
const FINAL = PAPER
export const MORPH_BEATS = FINAL

// The new figure's colours: LLM calls in pink, deterministic code in blue (as in the paper's Fig. 1).
const LLM = '#a24f86', CODE = '#0072B2'
const Robot = (n) => html`<span style=${{ display: 'inline-flex', alignItems: 'center', gap: 3, color: LLM, fontWeight: 600 }}>
	<svg width="26" height="22" viewBox="0 0 26 22"><rect x="3" y="5" width="20" height="15" rx="4" fill=${LLM} /><rect x="12" y="0" width="2" height="5" fill=${LLM} />
		<circle cx="9.5" cy="12" r="2.3" fill="#fff" /><circle cx="16.5" cy="12" r="2.3" fill="#fff" /><rect x="0" y="10" width="3" height="5" rx="1" fill=${LLM} /><rect x="23" y="10" width="3" height="5" rx="1" fill=${LLM} /></svg>${n}</span>`
const Gear = () => html`<span style=${{ color: CODE, fontSize: 26, lineHeight: 1 }}>⚙</span>`
const SVC = ['#F0E442', '#D55E00', '#7B3294']
const Partition = ({ grey, w = 70, h = 50 }) => html`<div style=${{ width: w, height: h, border: '2px solid #8a847a', borderRadius: 4, background: '#fff', display: 'flex', gap: 4, padding: 4, boxSizing: 'border-box' }}>
	${[0, 1, 2].map((i) => html`<div key=${i} style=${{ flex: 1, borderRadius: 2, background: grey ? '#d6d2cb' : SVC[i] + '59', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
		${[0, 1, 2].map((j) => html`<div key=${j} style=${{ width: 5, height: 5, borderRadius: 3, background: grey ? '#8a847a' : SVC[i] }} />`)}</div>`)}</div>`

// Short labels (click 2) and icons (click 3).
const SHORT = {
	src: { label: 'monolith source' },
	graph: { label: 'dependency graph' },
	ev: { label: 'Architectural Evidence\nConstructor', icons: () => html`${Robot(1)} ${Gear()}`, sub: 'code facts + LLM views' },
	dom: { label: 'Domain Knowledge\nExtractor', icons: () => Robot(1), sub: 'business capabilities' },
	gen: { label: 'Decomposition\nGenerator', icons: () => html`${Robot(3)} ${Gear()}`, sub: '3 strategies, then repair' },
	evl: { label: 'Decomposition\nEvaluator', icons: Gear, sub: 'gate · score · select' },
	ref: { label: 'Decomposition\nRefiner', icons: Gear, sub: 'Pareto local search' },
	bl: { label: 'Blinded\nEvaluator' },
	met: { text: 'CMod · CiD · DTP\nDI · BCP · C2C' },
}
const INPUT = new Set(['src', 'graph'])
// Where each component sits in the new figure (same world units; Fig. 1's millimetres × 9.6).
const AT_NEW = {
	src: { x: 150, y: 150, w: 230, h: 64 }, graph: { x: 150, y: 240, w: 230, h: 64 },
	ev: { x: 414, y: 139, w: 365, h: 158 }, dom: { x: 952, y: 139, w: 365, h: 158 }, gen: { x: 1490, y: 139, w: 365, h: 158 },
	evl: { x: 1490, y: 528, w: 365, h: 158 }, ref: { x: 921, y: 528, w: 365, h: 158 },
	frz: { x: 781, y: 566, w: 90, h: 90 }, bl: { x: 394, y: 554, w: 211, h: 106 },
	refd: { x: 196, y: 566, w: 90, h: 90 }, met: { x: 360, y: 690, w: 280, h: 64 },
}
const NEW_ARROWS = [
	[[380, 182], [414, 182]], [[380, 272], [414, 272]],
	[[779, 218], [952, 218], 'evidence pack', [865, 196]], [[1317, 218], [1490, 218], 'capability map', [1403, 196]],
	[[1672, 297], [1672, 528], '3 candidates', [1760, 452]],
	[[1490, 585], [1286, 585], 'selected', [1388, 565]], [[1286, 630], [1490, 630], 'accepted move', [1388, 652]],
	[[921, 607], [871, 607]], [[781, 607], [605, 607]], [[286, 607], [394, 607]], [[499, 660], [499, 690]],
]

// ------------------------------------------------------------------ rendering
function Node({ id, n, B, still }) {
	const k = K[n.kind]
	const gone = (id === 'qa' || id === 'inv') && B >= PRUNE
	const s = B >= LABEL ? SHORT[id] : null
	const plain = B >= NOTATION
	const glyph = B >= GLYPH && (id === 'frz' || id === 'refd')
	const text = s && s.text
	const bare = glyph || text
	const final = B >= LAYOUT && AT_NEW[id]
	const pos = final ? AT_NEW[id] : n
	const style = {
		...box(pos.x, pos.y, pos.w, pos.h),
		background: bare ? 'transparent' : plain ? '#fff' : k.fill,
		border: bare ? '3px solid transparent' : plain ? `3px solid ${INPUT.has(id) ? '#8a847a' : C.ink}` : `3px ${n.kind === 'future' ? 'dashed' : 'solid'} ${k.stroke}`,
		borderRadius: 14,
		display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
		fontFamily: F.sans, color: n.kind === 'future' ? '#8a847a' : C.ink,
		opacity: gone ? 0 : 1,
		boxShadow: bare ? 'none' : '0 2px 0 rgba(0,0,0,0.06)',
		transition: still ? 'none' : `left 1100ms ${EASE}, top 1100ms ${EASE}, width 1100ms ${EASE}, height 1100ms ${EASE}, opacity 600ms ${EASE}, background 500ms ${EASE}, border-color 500ms ${EASE}`,
	}
	// in the old, smaller boxes the new content is set a little tighter
	const big = final ? 25 : 22
	const content = glyph
		? html`<${Partition} grey=${id === 'refd'} /><div style=${{ fontSize: 21, marginTop: 6 }}>${id === 'refd' ? 'reference' : '🔒 frozen'}</div>`
		: text
		? html`<div style=${{ fontSize: 21, lineHeight: 1.3, whiteSpace: 'pre-line' }}>${text}</div>`
		: s
		? html`
			<div style=${{ fontSize: INPUT.has(id) ? 21 : big, fontWeight: INPUT.has(id) ? 400 : 700, lineHeight: 1.12, whiteSpace: 'pre-line', color: INPUT.has(id) ? '#4d473f' : C.ink }}>${s.label}</div>
			${plain && s.icons && html`<div style=${{ marginTop: 4, fontSize: 20, display: 'flex', alignItems: 'center', gap: 6 }}>${s.icons()}</div>`}
			${s.sub && html`<div style=${{ fontSize: final ? 19 : 18, marginTop: 3, color: '#4d473f' }}>${s.sub}</div>`}`
		: html`
			<div style=${{ fontSize: n.bold ? 28 : 25, fontWeight: n.bold ? 700 : 500, lineHeight: 1.15 }}>${n.label}</div>
			${n.sub && html`<div style=${{ fontSize: id === 'gen' || id === 'evl' || id === 'ref' ? 18 : 23, marginTop: 4, color: id === 'gen' || id === 'evl' || id === 'ref' ? '#4d473f' : 'inherit' }}>${n.sub}</div>`}`
	const key = `${s ? 1 : 0}${plain ? 1 : 0}${glyph ? 1 : 0}`
	return html`<div style=${style}>
		${n.n && html`<div style=${{ position: 'absolute', left: -16, top: -16, width: 36, height: 36, borderRadius: 18, background: C.ink, color: '#fff', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>${n.n}</div>`}
		<div key=${key} style=${{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: still || key === '000' ? 'none' : `mo-in 600ms ${EASE} both` }}>${content}</div>
		${BADGES[id] && html`<div style=${{ position: 'absolute', right: -12, bottom: -18, padding: '4px 12px', borderRadius: 999, background: C.ink, color: '#fff', fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap', opacity: B >= LABEL ? 0 : 1, transition: still ? 'none' : `opacity 500ms ${EASE}` }}>${BADGES[id]}</div>`}
	</div>`
}

function Arrows({ B, still }) {
	const hidden = (id) => B >= LAYOUT || ((id.startsWith('qa') || id === 'invEvl') && B >= PRUNE)
	const t = still ? 'none' : `opacity 600ms ${EASE}`
	const late = still ? 'none' : `opacity 700ms ${EASE} 700ms`
	return html`<svg width="1920" height="1180" style=${{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
		<defs>
			<marker id="mo-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill=${C.ink} /></marker>
			<marker id="mo-head-grey" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#9a948a" /></marker>
		</defs>
		${A.map(([id, pts, , , dashed]) => html`<path key=${id} d=${pathOf(pts)} fill="none" stroke=${dashed ? '#9a948a' : C.ink} strokeWidth="2.6"
			strokeDasharray=${dashed ? '10 7' : 'none'} markerEnd=${dashed ? 'url(#mo-head-grey)' : 'url(#mo-head)'} style=${{ opacity: hidden(id) ? 0 : 1, transition: t }} />`)}
		${NEW_ARROWS.map(([a, b], i) => html`<path key=${'n' + i} d=${pathOf([a, b])} fill="none" stroke=${C.ink} strokeWidth="2.6" markerEnd="url(#mo-head)"
			style=${{ opacity: B >= LAYOUT ? 1 : 0, transition: late }} />`)}
		<line x1="20" y1="930" x2="1900" y2="930" stroke=${C.red} strokeWidth="4" strokeDasharray="14 10" style=${{ opacity: B >= LAYOUT ? 0 : 1, transition: t }} />
		<line x1="697" y1="435" x2="697" y2="857" stroke=${C.red} strokeWidth="4" strokeDasharray="14 10" style=${{ opacity: B >= LAYOUT ? 1 : 0, transition: late }} />
	</svg>`
}

function Labels({ B, still }) {
	const lab = (x, y, s, on, key) => html`<div key=${key} style=${{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', fontFamily: F.sans, fontSize: 18, color: C.ink, background: C.paper, padding: '0 4px', whiteSpace: 'nowrap', opacity: on ? 1 : 0, transition: still ? 'none' : `opacity 600ms ${EASE} ${B >= LAYOUT ? 700 : 0}ms` }}>${s}</div>`
	const fade = (on, delay = 0) => ({ opacity: on ? 1 : 0, transition: still ? 'none' : `opacity 600ms ${EASE} ${delay}ms` })
	return html`<div>
		${A.filter(([, , label]) => label).map(([id, , label, [x, y]]) => lab(x, y, label, B < LAYOUT, id))}
		${NEW_ARROWS.filter((a) => a[2]).map(([, , label, [x, y]], i) => lab(x, y, label, B >= LAYOUT, 'nl' + i))}
		<div style=${{ position: 'absolute', left: 30, top: 900, fontFamily: F.sans, fontSize: 22, fontWeight: 700, color: C.red, ...fade(B < LAYOUT) }}>oracle firewall: no reference information above this line</div>
		<div style=${{ position: 'absolute', left: 697, top: 880, transform: 'translateX(-50%)', fontFamily: F.sans, fontSize: 22, fontWeight: 700, color: C.red, ...fade(B >= LAYOUT, 700) }}>oracle firewall</div>
		<div style=${{ position: 'absolute', left: 60, top: 86, fontFamily: F.sans, fontSize: 24, fontWeight: 700, ...fade(B < LAYOUT) }}>Inputs</div>
	</div>`
}

// The Process Controller: a frame round the agents, then (click 1) a band that runs them, then its place in the new figure.
function Controller({ B, still }) {
	const band = B >= PRUNE
	const r = B >= LAYOUT ? { x: 360, y: 357, w: 1258, h: 62 } : band ? { x: 400, y: 36, w: 1070, h: 62 } : { x: 400, y: 40, w: 1070, h: 700 }
	return html`<div style=${{ ...box(r.x, r.y, r.w, r.h), border: band ? '2px solid #a39d94' : `3px dashed ${K.tool.stroke}`, background: band ? '#f3f1ee' : 'transparent', borderRadius: band ? 10 : 22,
			transition: still ? 'none' : `left 1100ms ${EASE}, top 1100ms ${EASE}, width 1100ms ${EASE}, height 900ms ${EASE}, background 500ms ${EASE}` }}>
		${!band && html`<div style=${{ position: 'absolute', left: 18, top: 10, fontFamily: F.sans, fontSize: 21, fontWeight: 700, color: K.tool.stroke }}>Process Controller (tool): orders stages · validates artifacts · freezes the result · records provenance</div>`}
		${band && html`<div style=${{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 22, color: C.ink, animation: still ? 'none' : `mo-in 600ms ${EASE} both` }}><b style=${{ marginRight: 12 }}>Process Controller</b>runs 1–5 in order · validates artifacts · freezes and records the run</div>`}
	</div>`
}

// The old three-colour legend, then (click 3) the two-entry key, which moves with the figure on click 5.
function Legend({ B, still }) {
	const row = (fill, stroke, t) => html`<div style=${{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
		<div style=${{ width: 44, height: 24, borderRadius: 5, background: fill, border: `3px solid ${stroke}` }} /><span>${t}</span></div>`
	const final = B >= LAYOUT
	const t = still ? 'none' : `opacity 600ms ${EASE}, left 1100ms ${EASE}, top 1100ms ${EASE}, width 1100ms ${EASE}, height 1100ms ${EASE}`
	return html`<div>
		<div style=${{ ...box(40, 975, 380, 150), fontFamily: F.sans, fontSize: 20, border: `2px solid ${C.line}`, borderRadius: 10, padding: 16, background: '#fffdf8', opacity: B >= NOTATION ? 0 : 1, transition: t }}>
			${row(K.tool.fill, K.tool.stroke, 'Tool (deterministic)')}
			${row(K.llm.fill, K.llm.stroke, 'LLM')}
			${row(K.hybrid.fill, K.hybrid.stroke, 'Hybrid (tool + LLM)')}
		</div>
		<div style=${{ ...(final ? box(1180, 760, 700, 40) : box(40, 990, 380, 110)), display: 'flex', flexDirection: final ? 'row' : 'column', gap: final ? 34 : 14, alignItems: final ? 'center' : 'flex-start',
				justifyContent: final ? 'flex-end' : 'center', padding: final ? 0 : '0 16px', boxSizing: 'border-box', fontFamily: F.sans, fontSize: 21, opacity: B >= NOTATION ? 1 : 0, transition: t }}>
			<span>${Robot(html`<i>n</i>`)}  LLM calls per run</span><span>${Gear()}  deterministic code</span>
		</div>
	</div>`
}

// The phase regions (click 6).
function Regions({ B, still }) {
	const on = B >= REGION
	const r = (x, y, w, h, fill, title, color) => html`<div style=${{ ...box(x, y, w, h), background: fill, borderRadius: 22, opacity: on ? 1 : 0, transition: still ? 'none' : `opacity 900ms ${EASE}` }}>
		<div style=${{ position: 'absolute', left: 20, top: 10, fontFamily: F.sans, fontSize: 22, fontWeight: 700, color }}>${title}</div></div>`
	return html`<div>
		${r(394, 60, 1488, 260, 'rgba(204,121,167,0.11)', 'LLM interprets and proposes', '#8c4a77')}
		${r(740, 454, 1142, 269, 'rgba(0,114,178,0.08)', 'Deterministic code decides', '#0b5f8f')}
		${r(154, 454, 499, 340, 'rgba(0,0,0,0.045)', 'Blinded evaluation', '#5d5850')}
	</div>`
}
// The three candidates (click 4), beside the old generator → evaluator arrow, then beside the new one.
function Candidates({ B, still }) {
	const p = B >= LAYOUT ? [1730, 350] : [1070, 482]
	return html`<div style=${{ position: 'absolute', left: p[0], top: p[1], opacity: B >= GLYPH ? 1 : 0, transition: still ? 'none' : `opacity 600ms ${EASE}, left 1100ms ${EASE}, top 1100ms ${EASE}` }}>
		${[0, 1, 2].map((i) => html`<div key=${i} style=${{ position: 'absolute', left: i * 9, top: i * 9 }}><${Partition} w=${56} h=${40} /></div>`)}
	</div>`
}

// ------------------------------------------------------------------ the scene
function camera(B) {
	// clicks 0–4: the old board as the trace scene framed it; from click 5: the new figure's bounds
	const r = B >= LAYOUT ? [140, 50, 1760, 820] : [20, 30, 1880, 1110]
	const v = { x: 60, y: 80, w: 1800, h: 960 }
	const s = Math.min(v.w / r[2], v.h / r[3])
	const tx = v.x + v.w / 2 - s * (r[0] + r[2] / 2)
	const ty = v.y + v.h / 2 - s * (r[1] + r[3] / 2)
	return `translate(${tx}px, ${ty}px) scale(${s})`
}
export function MorphScene({ b, still }) {
	const B = still ? FINAL : Math.max(0, Math.min(FINAL, b))
	const arrived = useArrival(still) // a hook: always called, never behind ||
	const quiet = still || !arrived // no transitions on the first live frame (see arrive.js)
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		<div style=${{ ...box(1460, 48, 400, 30), display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
			${Array.from({ length: FINAL + 1 }, (_, i) => html`<div key=${i} style=${{ width: i === B ? 26 : 11, height: 11, borderRadius: 6, background: i <= B ? C.red : C.faint, transition: quiet ? 'none' : `all 400ms ${EASE}` }} />`)}
		</div>
		<div style=${{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1180, transformOrigin: '0 0', transform: camera(B), opacity: B >= PAPER ? 0 : 1, transition: quiet ? 'none' : `transform 1100ms ${EASE}, opacity 700ms ${EASE}` }}>
			<${Regions} B=${B} still=${quiet} />
			<${Controller} B=${B} still=${quiet} />
			<${Arrows} B=${B} still=${quiet} />
			<${Labels} B=${B} still=${quiet} />
			${Object.entries(N).map(([id, n]) => html`<${Node} key=${id} id=${id} n=${n} B=${B} still=${quiet} />`)}
			<${Candidates} B=${B} still=${quiet} />
			<${Legend} B=${B} still=${quiet} />
		</div>
		<div style=${{ ...box(60, 100, 1800, 920), background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
				opacity: B >= PAPER ? 1 : 0, transform: B >= PAPER ? 'none' : 'scale(0.97)', transition: quiet ? 'none' : `opacity 700ms ${EASE}, transform 700ms ${EASE}` }}>
			<img src=${FIG1} style=${{ width: 1760, height: 'auto' }} />
		</div>
		<style>${`@keyframes mo-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }`}</style>
	</div>`
}
