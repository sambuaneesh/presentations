// The GQM goal, revised after the 10 November feedback. Copied from presentations/10th-november/ext/gqm.js and shown
// as that slide ended (goal, chips, research questions, measures). Click 1 strikes every outdated piece of the goal in
// red, all at once; click 2 replaces them with the new wording, highlighted: a shorter purpose ("comparing it with…"),
// "autonomous coding agents" in the plural, and a generic context ("open-source Java monoliths"). The RQs are unchanged.
import { useState, useEffect } from 'react'
import { html, C, F, EASE, box } from '@pack/scenes/kit.js'
import { useArrival } from './arrive.js'

// one colour per research question (Okabe–Ito)
const RQC = { 1: '#0072B2', 2: '#009E73', 3: '#D55E00', 4: '#CC79A7' }
const DARK = { 1: '#005a8c', 2: '#00795a', 3: '#a84a00', 4: '#9c4f80' }

// The goal, facet by facet; [text, rq] pieces are the phrases a question comes from; { old, new } pieces are the
// revision (old: struck on click 1; new: shown, highlighted, on click 2); { keep, mark } is kept text highlighted on click 2.
const GOAL = [
	['analyze', [['an agentic LLM workflow', 4], ' for monolith-to-microservice decomposition,']],
	['for the purpose of', [
		{ old: ['evaluating whether it produces ', ['architecturally sound', 1], ', ', ['valid', 2], ', and ', ['affordable', 3], ' decompositions compared with'], new: 'comparing it with' },
		' single-shot prompting, ', { old: ['an autonomous coding agent'], new: 'autonomous coding agents' }, ', and traditional tools,']],
	['with respect to', [['design quality', 1], ', ', ['reference similarity', 1], ', ', ['validity', 2], ', ', ['stability', 2], ', and ', ['token cost', 3], ',']],
	['from the viewpoint of', ['software architects and researchers,']],
	['in the context of', [{ old: ['four '], new: '' }, { keep: 'open-source Java monoliths', mark: true },
		{ old: [' with reference microservice decompositions and seventeen LLMs, eight of them run five times per system and approach'], new: '' }, '.']],
]
const STRIKE = 1, NEW = 2
export const GQM_REVISION_BEATS = NEW
const MARKER = 'rgba(240,228,66,0.6)' // the highlighter: yellow means nothing else on this slide
const CHIPS = { 1: ['design quality', 'reference similarity'], 2: ['validity', 'stability'], 3: ['token cost'], 4: ['an agentic LLM workflow'] }
const RQS = [
	[1, 'Quality', 'How does the design quality and reference similarity of the workflow’s decompositions compare with single-shot prompting, an autonomous coding agent, and traditional tools?'],
	[2, 'Reliability', 'How reliably does each approach produce valid decompositions, and how stable are its results across repeated runs?'],
	[3, 'Cost', 'How many tokens does each approach consume, and where does the workflow spend them?'],
	[4, 'Design', 'Which design decisions of the workflow matter, and why?'],
]
const METRICS = {
	1: ['CMod · CiD · DTP · DI · BCP', 'C2C-10 / 33 / 50'],
	2: ['share of valid decompositions', 'distinct partitions over five runs', 'their pairwise distance'],
	3: ['input and output tokens per system', 'their split across workflow stages'],
	4: ['documented design experiments'],
}
const TINT = 1, Q1 = 2, MET = 6

const COL = (i) => 150 + i * 432 // four columns, 410 wide
const W = 410

// one piece of the goal: plain text, a tinted phrase, or the old/new pieces of the revision
function Piece({ p, S, struck, still }) {
	const strike = (bg) => ({ background: `linear-gradient(${C.red}, ${C.red}) 0 58% / ${struck && S >= STRIKE ? '100%' : '0%'} 5px no-repeat${bg ? ', ' + bg : ''}`,
		boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', transition: still ? 'none' : `background-size 600ms ${EASE}` })
	const mark = { background: MARKER, borderRadius: 6, padding: '0 4px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', animation: still ? 'none' : `gq-in 600ms ${EASE} both` }
	if (typeof p === 'string') return struck ? html`<span style=${strike()}>${p}</span>` : p
	if (Array.isArray(p)) return html`<span style=${{ color: DARK[p[1]], borderRadius: 6, padding: '0 3px', margin: '0 -3px', ...strike(RQC[p[1]] + '22') }}>${p[0]}</span>`
	if (p.keep) return S >= NEW && p.mark ? html`<span style=${mark}>${p.keep}</span>` : p.keep
	if (S < NEW) return html`${p.old.map((q, j) => html`<${Piece} key=${j} p=${q} S=${S} struck=${true} still=${still} />`)}`
	return p.new ? html`<span style=${mark}>${p.new}</span>` : null
}

function Goal({ B, S, still }) {
	const up = B >= TINT
	// once up, the goal's lines run wider (and wrap less), so it stays short above the questions; once revised (shorter),
	// it grows just enough to fill the footprint the old wording had (7 lines at 0.6 ≈ 5 unwrapped lines at 0.78)
	const s = !up ? 1 : S >= NEW ? 0.78 : 0.6
	const t = still ? 'none' : S >= NEW ? `transform 900ms ${EASE} 250ms, width 900ms ${EASE} 250ms` : `transform 1000ms ${EASE}`
	return html`<div style=${{ position: 'absolute', left: 150, top: 0, width: up ? 1700 / s : 1720, transformOrigin: '0 0', transform: up ? `translate(0px, 40px) scale(${s})` : 'translate(0px, 290px)', transition: t }}>
		${GOAL.map(([label, parts], i) => html`<div key=${label} style=${{ display: 'flex', gap: 26, alignItems: 'baseline', marginBottom: 14 }}>
			<div style=${{ width: 360, flex: 'none', textAlign: 'right', fontFamily: F.hand, fontSize: 32, color: C.dim, whiteSpace: 'nowrap' }}>${label}</div>
			<div style=${{ fontFamily: F.hand, fontSize: 36, lineHeight: 1.3, color: C.ink }}>${parts.map((p, j) => html`<${Piece} key=${j} p=${p} S=${S} struck=${false} still=${still} />`)}</div>
		</div>`)}
	</div>`
}

function Chips({ B, still }) {
	return html`<div>${[1, 2, 3, 4].map((q, i) => html`<div key=${q} style=${{ ...box(COL(i), 368, W, 50), display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
		${CHIPS[q].map((c, j) => html`<div key=${c} style=${{ padding: '6px 14px', borderRadius: 999, border: `2px solid ${RQC[q]}`, background: RQC[q] + '1f', color: DARK[q], fontFamily: F.sans, fontSize: 21, fontWeight: 600, whiteSpace: 'nowrap',
			opacity: B >= TINT ? 1 : 0, transform: B >= TINT ? 'none' : 'translateY(-120px)', transition: still ? 'none' : `opacity 600ms ${EASE} ${800 + 80 * (i * 2 + j)}ms, transform 800ms ${EASE} ${800 + 80 * (i * 2 + j)}ms` }}>${c}</div>`)}
	</div>`)}</div>`
}

function Arrow({ x, y1, y2, color, on, still, delay = 0 }) {
	return html`<svg width="24" height=${y2 - y1} style=${{ position: 'absolute', left: x - 12, top: y1, overflow: 'visible', opacity: on ? 1 : 0, transition: still ? 'none' : `opacity 500ms ${EASE} ${delay}ms` }}>
		<line x1="12" y1="0" x2="12" y2=${y2 - y1 - 10} stroke=${color} strokeWidth="3" /><path d=${`M3 ${y2 - y1 - 12} L12 ${y2 - y1} L21 ${y2 - y1 - 12} z`} fill=${color} /></svg>`
}

function Questions({ B, still }) {
	return html`<div>${RQS.map(([q, name, text], i) => {
		const on = B >= Q1 + i
		const fade = { opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(16px)', transition: still ? 'none' : `opacity 600ms ${EASE}, transform 600ms ${EASE}` }
		return html`<div key=${q}>
			<${Arrow} x=${COL(i) + W / 2} y1=${424} y2=${470} color=${RQC[q]} on=${on} still=${still} />
			<div style=${{ ...box(COL(i), 474, W, 270), border: `3px solid ${RQC[q]}`, borderRadius: 18, background: '#fffdf8', padding: '16px 20px', boxSizing: 'border-box', ...fade }}>
				<div style=${{ fontFamily: F.hand, fontSize: 40, color: DARK[q], lineHeight: 1.1 }}>RQ${q} · ${name}</div>
				<div style=${{ fontFamily: F.sans, fontSize: 21, lineHeight: 1.42, marginTop: 10, color: C.ink }}>${text}</div>
			</div>
		</div>`
	})}</div>`
}

function Metrics({ B, still }) {
	const on = B >= MET
	return html`<div>${RQS.map(([q], i) => html`<div key=${q}>
		<${Arrow} x=${COL(i) + W / 2} y1=${748} y2=${790} color=${RQC[q]} on=${on} still=${still} delay=${120 * i} />
		<div style=${{ ...box(COL(i), 794, W, 170), borderRadius: 14, background: RQC[q] + '14', border: `2px dashed ${RQC[q]}`, padding: '14px 20px', boxSizing: 'border-box',
			opacity: on ? 1 : 0, transition: still ? 'none' : `opacity 600ms ${EASE} ${120 * i}ms` }}>
			${METRICS[q].map((m) => html`<div key=${m} style=${{ fontFamily: F.sans, fontSize: 21, lineHeight: 1.5, color: C.ink }}>${m}</div>`)}
		</div>
	</div>`)}</div>`
}

// G, Q and M: the three levels of the paradigm, at the left edge
function Levels({ B, still }) {
	const L = (ch, y, on) => html`<div style=${{ position: 'absolute', left: 52, top: y, fontFamily: F.hand, fontSize: 72, color: C.red, lineHeight: 1, opacity: on ? 1 : 0, transition: still ? 'none' : `opacity 600ms ${EASE}, top 1000ms ${EASE}` }}>${ch}</div>`
	return html`<div>${L('G', B >= TINT ? 44 : 296, true)}${L('Q', 560, B >= Q1)}${L('M', 856, B >= MET)}</div>`
}

// On arrival it replays the 10th-November GQM build by itself (A: 0 → MET, no clicks) and stops at its end; the clicks
// (b) then step through the revision. A click before the replay ends jumps it to the end.
const AUTO = [500, 2000, 800, 800, 800, 800] // ms before each replay step (the first one moves the goal and drops the chips)
export function GqmRevisionScene({ b, still }) {
	const [A, setA] = useState(0)
	const arrived = useArrival(still) // a hook: always called, never behind ||
	const quiet = still || !arrived // no transitions on the first live frame (see arrive.js)
	useEffect(() => {
		if (still) { setA(0); return }
		if (!arrived || A >= MET) return
		const timer = setTimeout(() => setA((a) => Math.min(MET, a + 1)), AUTO[A])
		return () => clearTimeout(timer)
	}, [still, arrived, A])
	const S = still ? NEW : Math.max(0, Math.min(NEW, b))
	const B = still || S > 0 ? MET : A
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		<${Levels} B=${B} still=${quiet} />
		<${Goal} B=${B} S=${S} still=${quiet} />
		<${Chips} B=${B} still=${quiet} />
		<${Questions} B=${B} still=${quiet} />
		<${Metrics} B=${B} still=${quiet} />
		<style>${`@keyframes gq-in { from { opacity: 0 } to { opacity: 1 } }`}</style>
	</div>`
}
