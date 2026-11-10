// How the study is planned: the paper's GQM goal (papers/tse-2026/manuscript/sections/04-study-design.tex, §IV-A),
// then the research questions that refine it (01-introduction.tex) and the measures that answer them (§IV-A).
// Click 1 moves the goal up, tints the phrases each question comes from and drops them out as chips, one column per
// question; clicks 2–5 bring in RQ1–RQ4 under their chips; click 6 the measures. All wording is the paper's.
import { html, C, F, EASE, box } from '@pack/scenes/kit.js'
import { useArrival } from './arrive.js'

// one colour per research question (Okabe–Ito)
const RQC = { 1: '#0072B2', 2: '#009E73', 3: '#D55E00', 4: '#CC79A7' }
const DARK = { 1: '#005a8c', 2: '#00795a', 3: '#a84a00', 4: '#9c4f80' }

// The goal, facet by facet; [text, rq] pieces are the phrases a question comes from.
const GOAL = [
	['analyze', [['an agentic LLM workflow', 4], ' for monolith-to-microservice decomposition,']],
	['for the purpose of', ['evaluating whether it produces ', ['architecturally sound', 1], ', ', ['valid', 2], ', and ', ['affordable', 3], ' decompositions compared with single-shot prompting, an autonomous coding agent, and traditional tools,']],
	['with respect to', [['design quality', 1], ', ', ['reference similarity', 1], ', ', ['validity', 2], ', ', ['stability', 2], ', and ', ['token cost', 3], ',']],
	['from the viewpoint of', ['software architects and researchers,']],
	['in the context of', ['four open-source Java monoliths with reference microservice decompositions and seventeen LLMs, eight of them run five times per system and approach.']],
]
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
export const GQM_BEATS = MET

const COL = (i) => 150 + i * 432 // four columns, 410 wide
const W = 410

function Goal({ B, still }) {
	const up = B >= TINT
	// once up, the goal's lines run wider (and wrap less), so it stays short above the questions
	const s = up ? 0.6 : 1
	const t = still ? 'none' : `transform 1000ms ${EASE}`
	return html`<div style=${{ position: 'absolute', left: 150, top: 0, width: up ? 2800 : 1720, transformOrigin: '0 0', transform: up ? `translate(0px, 40px) scale(${s})` : 'translate(0px, 290px)', transition: t }}>
		${GOAL.map(([label, parts], i) => html`<div key=${label} style=${{ display: 'flex', gap: 26, alignItems: 'baseline', marginBottom: 14 }}>
			<div style=${{ width: 360, flex: 'none', textAlign: 'right', fontFamily: F.hand, fontSize: 32, color: C.dim, whiteSpace: 'nowrap' }}>${label}</div>
			<div style=${{ fontFamily: F.hand, fontSize: 36, lineHeight: 1.3, color: C.ink }}>${parts.map((p, j) => typeof p === 'string' ? p : html`<span key=${j} style=${{
				color: up ? DARK[p[1]] : C.ink, background: up ? RQC[p[1]] + '22' : 'transparent', borderRadius: 6, padding: '0 3px', margin: '0 -3px',
				transition: still ? 'none' : `color 600ms ${EASE} 500ms, background 600ms ${EASE} 500ms` }}>${p[0]}</span>`)}</div>
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

export function GqmScene({ b, still }) {
	const B = still ? MET : Math.max(0, Math.min(MET, b))
	const arrived = useArrival(still) // a hook: always called, never behind ||
	const quiet = still || !arrived // no transitions on the first live frame (see arrive.js)
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		<${Levels} B=${B} still=${quiet} />
		<${Goal} B=${B} still=${quiet} />
		<${Chips} B=${B} still=${quiet} />
		<${Questions} B=${B} still=${quiet} />
		<${Metrics} B=${B} still=${quiet} />
	</div>`
}
