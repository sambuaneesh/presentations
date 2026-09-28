// Where Arianna's behavioural models enter the ICSA single-shot pipeline.
// Beat 0: the ICSA pipeline. 1: everything up to the final call is reused. 2: her four models drop into
// the final call. 3: the two decompositions go to the same blinded evaluation. 4: what came out.
// Numbers: studies/behavioural-models-side-v1 (DeepSeek v4.1 Flash, seed 1).
import { html, C, F, EASE, box } from '@pack/scenes/kit.js'

const STAGES = [
	{ id: 'src', x: 60, label: 'Source code', sub: 'scoped classes', llm: false },
	{ id: 'sum', x: 360, label: '80k summary', sub: '1 LLM call', llm: true },
	{ id: 'views', x: 660, label: '5 architectural views', sub: '5 LLM calls', llm: true },
	{ id: 'final', x: 1000, label: 'Final decomposition call', sub: '1 LLM call', llm: true, w: 340 },
	{ id: 'dec', x: 1440, label: 'Decomposition', sub: 'services', llm: false },
]
const MODELS = ['State machine (EFSM)', 'Directly-follows graph', 'Petri net', 'BPMN']
const Y = 430, H = 150

function Stage({ s, dim, hot, still }) {
	const w = s.w ?? 250
	return html`<div style=${{ ...box(s.x, Y, w, H), borderRadius: 16, border: `3px solid ${hot ? C.red : s.llm ? '#2e9e6e' : C.ink}`,
		background: s.llm ? '#e4f4ec' : '#fffdf8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
		textAlign: 'center', fontFamily: F.sans, opacity: dim ? 0.3 : 1, boxShadow: hot ? `0 0 0 8px ${C.redGlow}` : 'none',
		transition: still ? 'none' : `opacity 600ms ${EASE}, box-shadow 600ms ${EASE}` }}>
		<div style=${{ fontSize: 26, fontWeight: 600, lineHeight: 1.15 }}>${s.label}</div>
		<div style=${{ fontSize: 19, color: C.dim, marginTop: 6 }}>${s.sub}</div>
	</div>`
}

const arrow = (x1, y1, x2, y2, on = true, color = C.ink) => html`<line x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke=${color} strokeWidth="3.5" markerEnd="url(#ib-head)" opacity=${on ? 1 : 0.25} />`

export const BEATS = 4

export function IcsaBehavioural({ b, still }) {
	const B = still ? BEATS : Math.max(0, Math.min(BEATS, b))
	const focusFinal = B >= 1
	const models = B >= 2
	const evalOn = B >= 3
	const result = B >= 4
	const titles = [
		'Our ICSA single-shot pipeline',
		'Everything up to the final call is reused unchanged',
		'Her four behavioural models join the final call',
		'Both decompositions go through the same blinded evaluation',
		'What came out',
	]
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		<div style=${{ ...box(80, 50, 1760, 130) }}>
			<div style=${{ fontFamily: F.sans, fontSize: 22, color: C.red }}>II · where her diagrams go</div>
			<div key=${B} style=${{ fontFamily: F.hand, fontSize: 50, marginTop: 4, animation: still ? 'none' : `ib-in 400ms ${EASE} both` }}>${titles[B]}</div>
		</div>
		<svg width="1920" height="1080" style=${{ position: 'absolute', left: 0, top: 0 }}>
			<defs><marker id="ib-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill=${C.ink} /></marker></defs>
			${arrow(310, Y + H / 2, 358, Y + H / 2, !focusFinal)}
			${arrow(610, Y + H / 2, 658, Y + H / 2, !focusFinal)}
			${arrow(910, Y + H / 2, 998, Y + H / 2)}
			${arrow(1340, Y + H / 2, 1438, Y + H / 2)}
			${arrow(1060, 790, 1100, Y + H + 2)}
			${arrow(1280, 790, 1240, Y + H + 2)}
			${evalOn && arrow(1565, Y + H, 1565, 790)}
		</svg>
		${STAGES.map((s) => html`<${Stage} key=${s.id} s=${s} still=${still} hot=${focusFinal && s.id === 'final'} dim=${focusFinal && ['src', 'sum', 'views'].includes(s.id)} />`)}
		<div style=${{ ...box(930, 790, 250, 80), border: `2.5px solid ${C.ink}`, borderRadius: 12, background: '#fffdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 21 }}>dependency graph</div>
		<div style=${{ ...box(1200, 790, 230, 80), border: `2.5px solid ${C.ink}`, borderRadius: 12, background: '#fffdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 21 }}>class inventory</div>
		${focusFinal && html`<div style=${{ ...box(60, 640, 820, 110), fontFamily: F.sans, fontSize: 21, color: C.dim, lineHeight: 1.4, animation: still ? 'none' : `ib-in 500ms ${EASE} 300ms both` }}>
			stored DeepSeek v4.1 Flash run, repetition 1: the summary, the five views, the graph and the inventory are byte-identical in both conditions</div>`}
		${MODELS.map((m, i) => html`<div key=${m} style=${{
				...box(1000 + (i % 2) * 175, 215 + Math.floor(i / 2) * 92, 165, 78), borderRadius: 10, border: `3px solid ${C.red}`, background: '#fbeaea',
				display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: F.sans, fontSize: 17, fontWeight: 600, lineHeight: 1.1,
				opacity: models ? 1 : 0, transform: models ? 'none' : 'translateY(-60px)',
				transition: still ? 'none' : `opacity 500ms ${EASE} ${i * 120}ms, transform 600ms ${EASE} ${i * 120}ms` }}>${m}</div>`)}
		${models && html`<div style=${{ ...box(1370, 215, 480, 170), fontFamily: F.sans, fontSize: 20, lineHeight: 1.45, animation: still ? 'none' : `ib-in 500ms ${EASE} 600ms both` }}>
			<div style=${{ fontWeight: 700, color: C.red }}>her files, unchanged (Mermaid text)</div>
			<div>input tokens · PetClinic 18.4k → 46.2k</div>
			<div>PartsUnlimited 41.7k → 143.9k</div>
		</div>`}
		${evalOn && html`<div style=${{ ...box(1440, 790, 250, 80), border: `3px solid #c0578e`, borderRadius: 12, background: '#fbeaf2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 21, animation: still ? 'none' : `ib-in 500ms ${EASE} both` }}>blinded evaluation</div>`}
		${evalOn && html`<div style=${{ ...box(1440, 890, 420, 60), fontFamily: F.sans, fontSize: 18, color: C.dim, animation: still ? 'none' : `ib-in 500ms ${EASE} 200ms both` }}>CMod · CiD · DTP · DI · BCP · C2C</div>`}
		${result && html`<div style=${{ ...box(60, 800, 820, 200), fontFamily: F.sans, fontSize: 23, lineHeight: 1.5, animation: still ? 'none' : `ib-in 600ms ${EASE} both` }}>
			<div><b>PartsUnlimited:</b> identical decomposition</div>
			<div><b>PetClinic:</b> same business services; only the infrastructure was split in two <span style=${{ color: C.red }}>(CMod −11.1, C2C-50 −30)</span></div>
		</div>`}
		<style>${`@keyframes ib-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }`}</style>
	</div>`
}
