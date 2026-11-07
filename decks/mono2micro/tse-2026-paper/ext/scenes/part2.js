// Part II · how the workflow and the study are built (paper §III–IV).
import { html, C, F, box, EASE, Stage, Term, Cite, Inside, Card, SHIELD, P, H, List, Note, Code, Quote, Table, Formula, rich, reveal, SlideSource, Src, useShared } from '../ui.js'
import { SYSTEMS, PETCLINIC } from '../data/systems.js'
import { PAPER, AGENTS_TABLE } from '../data/paper.js'
import { TABLES } from '../data/results.js'
import { EXT, ROLES } from '../data/extension.js'
import { DETAILS } from '../trace/detailsData.js'
import { c2c, overlap } from '../metrics.js'
import { useGo } from './front.js'
import { SLIDES } from '../deck.js'

const f1 = (v) => (v == null ? '—' : (Math.round(v * 10) / 10).toFixed(1))
const idx = (scene) => SLIDES.findIndex((s) => s.scene === scene)
const Caption = ({ y = 930, children, still, on = true, delay = 0, size = 34 }) => html`<div style=${{ ...box(120, y, 1680, 60), textAlign: 'center', fontFamily: F.hand, fontSize: size, color: C.ink, ...reveal(on, still, { delay }) }}>${children}</div>`
const KIND = { LLM: { fill: '#e4f4ec', stroke: '#2e9e6e' }, Tool: { fill: '#fbeaf2', stroke: '#c0578e' }, Hybrid: { fill: '#e4eefa', stroke: '#2f6fb5' }, '–': { fill: 'rgba(255,255,255,0.4)', stroke: '#9a948a' } }

// ------------------------------------------------------------------ III-A · goal and questions
const RQ_SLIDES = { RQ1: 'p4-rq1-main', RQ2: 'p4-rq2', RQ3: 'p4-rq3', RQ4: 'p4-rq4' }
export function GqmScene({ b, still }) {
	const B = still ? 1 : b
	const go = useGo()
	const facets = [['analyze', 'an agentic LLM workflow for monolith-to-microservice decomposition'], ['for the purpose of', 'evaluating whether it produces sound, valid and affordable decompositions'], ['with respect to', 'design quality, reference similarity, validity, stability, token cost'], ['from the viewpoint of', 'software architects and researchers'], ['in the context of', 'four open-source Java monoliths and four LLMs']]
	const rqs = PAPER.rqs.map((t) => { const m = t.match(/^(RQ\d) \(([^)]+)\): (.*)$/); return { id: m[1], label: m[1].replace('RQ', 'Q'), name: m[2], q: m[3] } })
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 245, 1700, 330) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 30, color: C.red, marginBottom: 10 }}>the goal, in <${Term} k="gqm">GQM</${Term}> form <${Cite} k="basili1994gqm" /></div>
			${facets.map(([a, t], i) => html`<div key=${a} style=${{ display: 'flex', gap: 22, alignItems: 'baseline', marginBottom: 8, ...reveal(true, still, { delay: 90 * i }) }}>
				<div style=${{ width: 300, flex: 'none', textAlign: 'right', fontFamily: F.hand, fontSize: 26, color: C.dim }}>${a}</div>
				<div style=${{ fontFamily: F.hand, fontSize: 28, color: C.ink, whiteSpace: 'nowrap' }}>${t}</div></div>`)}
		</div>
		<div style=${{ ...box(110, 610, 1700, 330), display: 'flex', gap: 22, ...reveal(B >= 1, still) }}>
			${rqs.map((r) => html`<div key=${r.id} ...${SHIELD} class="tp-btn" onClick=${(e) => { e.stopPropagation(); if (idx(RQ_SLIDES[r.id]) >= 0) go(idx(RQ_SLIDES[r.id])) }}
				style=${{ flex: 1, pointerEvents: 'all', cursor: 'pointer', border: `2.5px solid ${C.ink}`, borderRadius: 18, padding: '16px 20px', background: '#fffdf8', position: 'relative' }}>
				<div style=${{ fontFamily: F.hand, fontSize: 40, color: C.red }}>${r.label} · ${r.name}</div>
				<div style=${{ fontFamily: F.sans, fontSize: 19, lineHeight: 1.45, marginTop: 6 }}>${r.q}</div>
				<div style=${{ position: 'absolute', bottom: 12, right: 18, fontFamily: F.sans, fontSize: 15, color: C.dim }}>${idx(RQ_SLIDES[r.id]) >= 0 ? `answer: slide ${idx(RQ_SLIDES[r.id]) + 1} →` : ''}</div></div>`)}
		</div>
		<${SlideSource}>§IV-A</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ III-B · three principles
export function PrinciplesScene({ b, still }) {
	const B = still ? 2 : b
	const items = [
		['Separate interpretation from decision', html`LLMs interpret: summarise code, infer business meaning, propose boundaries. Code checks, scores, chooses and improves, because <${Term} k="self-correction">LLM self-critique</${Term}> without external feedback is unreliable <${Cite} keys=${['huang2024cannot', 'kamoi2024selfcorrection']} />.`],
		['Consider alternatives before deciding', html`Three candidates from different <${Term} k="strategies">perspectives</${Term}>, so the trade-off between them is explicit rather than hidden in one answer.`],
		['Never look at the answer', html`No component that produces or selects a decomposition can see the <${Term} k="reference" /> or any metric derived from it. Reference-based evaluation happens only after the result is frozen.`],
	]
	return html`<${Stage} still=${still}>
		${items.map(([t, s], i) => html`<div key=${t} style=${{ ...box(110 + i * 575, 280, 545, 560), ...reveal(B >= i, still, { delay: 0 }) }}>
			<div style=${{ ...box(0, 0, 545, 560), border: `2.5px solid ${i === 2 ? C.red : C.ink}`, borderRadius: 20, background: '#fffdf8' }} />
			<div style=${{ position: 'absolute', left: 28, top: 18, fontFamily: F.hand, fontSize: 90, color: i === 2 ? C.red : C.faint, lineHeight: 1 }}>${i + 1}</div>
			<div style=${{ position: 'absolute', left: 28, top: 120, right: 24, fontFamily: F.hand, fontSize: 40, lineHeight: 1.15 }}>${t}</div>
			<div style=${{ position: 'absolute', left: 28, top: 250, right: 26, fontFamily: F.sans, fontSize: 22, lineHeight: 1.5 }}>${s}</div></div>`)}
		<${SlideSource}>§III-A</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ III-B · the roles (Table III)
export function RolesScene({ still }) {
	const rows = AGENTS_TABLE.rows
	const detail = {
		'Architectural Evidence Constructor': 'evidence-pack', 'Domain Knowledge Extractor': 'capability-map', 'Decomposition Generator': 'strategies',
		'Decomposition Evaluator': 'composite', 'Decomposition Refiner': 'local-search', 'Process Controller': 'oracle-firewall',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 240, 1700, 40), display: 'flex', fontFamily: F.sans, fontSize: 17, fontWeight: 700, color: C.dim }}>
			<div style=${{ width: 430 }}>agent</div><div style=${{ width: 150 }}>kind</div><div style=${{ width: 110 }}>LLM calls</div><div style=${{ width: 560 }}>responsibility</div><div>output</div></div>
		${rows.map((r, i) => {
			const k = KIND[r[1]] ?? KIND['–']
			return html`<div key=${r[0]} style=${{ ...box(110, 285 + i * 92, 1700, 80), display: 'flex', alignItems: 'center', background: k.fill, border: `2.5px ${r[1] === '–' ? 'dashed' : 'solid'} ${k.stroke}`, borderRadius: 14, padding: '0 18px', boxSizing: 'border-box', ...reveal(true, still, { delay: 70 * i }) }}>
				<div style=${{ width: 412, fontFamily: F.hand, fontSize: 25, lineHeight: 1.1 }}>${detail[r[0]] ? html`<${Term} k=${detail[r[0]]}>${r[0]}</${Term}>` : r[0]}</div>
				<div style=${{ width: 150, fontFamily: F.sans, fontSize: 19, fontWeight: 600, color: k.stroke }}>${r[1]}</div>
				<div style=${{ width: 110, fontFamily: F.sans, fontSize: 24, fontWeight: 700 }}>${r[2]}</div>
				<div style=${{ width: 560, fontFamily: F.sans, fontSize: 18, lineHeight: 1.35 }}>${r[3]}</div>
				<div style=${{ flex: 1, fontFamily: F.sans, fontSize: 17, color: C.dim, lineHeight: 1.35 }}>${r[4]}</div></div>`
		})}
		<div style=${{ ...box(110, 935, 1400, 66), fontFamily: F.sans, fontSize: 18, lineHeight: 1.4, color: C.dim }}>Each component has one responsibility and talks to the others only through validated artifacts: an <${Term} k="agent" /> in this work's sense. The order is fixed, so this is an <${Term} k="agentic-workflow" />.</div>
		<${SlideSource}>Table III · §III-B</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ III-B · Algorithm 1, stepped on the real PetClinic run
const ALG = [
	[0, 'require candidates C₁..C₃, evidence E, objectives O = {CMod, CiD, MF}'],
	[0, 'for each Cᵢ'],
	[1, 'Cᵢ ← Repair(Cᵢ, E)', 'every class exactly once'],
	[1, 'gᵢ ← Gate(Cᵢ);  sᵢ ← Σ w_o · o(Cᵢ)'],
	[0, 'D ← argmax (gᵢ, sᵢ)', 'valid candidates first'],
	[0, 'for r = 1 to 5'],
	[1, 'M ← top-12 single-class moves of D by signal strength'],
	[1, 'A ← { m ∈ M : Gate(m(D)) ∧ ∀o: o(m(D)) ≥ o(D) ∧ ∃o: o(m(D)) > o(D) }'],
	[1, 'if A = ∅ then break'],
	[1, 'D ← m*(D),  m* = argmax over A of Σ (o(m(D)) − o(D))'],
	[0, 'freeze D; only now evaluate against the reference'],
]
const STEP_LINES = [[], [1, 2, 3], [4], [5, 6, 7], [9], [5, 6, 7, 9], [8], [10]]
export const ALG_BEATS = STEP_LINES.length - 1
export function AlgorithmScene({ b, still }) {
	const B = still ? 0 : Math.min(b, ALG_BEATS)
	const hot = new Set(STEP_LINES[B])
	const R = DETAILS.rounds
	const adm = (r) => r.neighbors.filter((x) => x.pareto && x.valid).length
	const cand = DETAILS.candidates
	const names = { CAND_001: 'dependency-first', CAND_002: 'domain-first', CAND_003: 'balanced' }
	const panel = [
		html`<div>${P('Selection and refinement never read the reference. Click through to run it on the traced Spring PetClinic run (DeepSeek v4.1 Flash).', { fontSize: 22 })}</div>`,
		html`<div>${P('Three repaired candidates, all pass the gate:', { fontSize: 21 })}${Table(['candidate', 'CMod', 'CiD', 'MF', 'score'], cand.map((c) => [names[c.id], f1(c.metrics.CMod), f1(c.metrics.CiD), f1(c.metrics.migration_feasibility), f1(c.score)]), { size: 19 })}</div>`,
		html`<div>${P(html`Highest score wins: <b>dependency-first</b> (${f1(cand[0].score)} vs ${f1(cand[1].score)}).`, { fontSize: 22 })}${P(html`Score = (0.3·CMod + 0.2·CiD + 0.2·MF) / 0.7, see <${Term} k="composite" />.`, { fontSize: 19, color: C.dim })}</div>`,
		html`<div>${P(html`Round 1: 12 moves tried, ${adm(R[0])} admissible (strict <${Term} k="pareto">Pareto</${Term}> and valid).`, { fontSize: 22 })}${P('Candidate moves come from two signals: a dependency edge crossing a boundary, and a class whose capability majority lies elsewhere.', { fontSize: 19, color: C.dim })}</div>`,
		html`<div>${P(html`Apply the best: move <b>${R[0].selected}</b> → ${R[0].selectedTo.replace('Service', '')}.`, { fontSize: 22 })}${P(`CMod ${f1(R[0].parent.CMod)} → ${f1(R[1].parent.CMod)}, CiD ${f1(R[0].parent.CiD)} → ${f1(R[1].parent.CiD)}, MF ${f1(R[0].parent.migration_feasibility)} → ${f1(R[1].parent.migration_feasibility)}`, { fontSize: 20 })}</div>`,
		html`<div>${P('Rounds 2 and 3 repeat it:', { fontSize: 22 })}${Table(['round', 'moved', 'CMod after', 'MF after'], [1, 2].map((i) => [String(i + 1), R[i].selected, f1(R[i + 1].parent.CMod), f1(R[i + 1].parent.migration_feasibility)]), { size: 19 })}</div>`,
		html`<div>${P(html`Round 4: none of the 12 moves is admissible (${adm(R[3])} admissible), so the search stops (${Code(DETAILS.stoppingReason)}).`, { fontSize: 22 })}</div>`,
		html`<div>${P('Frozen: 4 services, all 23 classes once. Only now, blinded evaluation:', { fontSize: 22 })}${P(`C2C-10/33/50 = ${f1(DETAILS.blinded['c2c_cvg 10%'])} / ${f1(DETAILS.blinded['c2c_cvg 33%'])} / ${f1(DETAILS.blinded['c2c_cvg 50%'])} · CMod ${f1(DETAILS.blinded.CMod)} · CiD ${f1(DETAILS.blinded.CiD)}`, { fontSize: 20 })}</div>`,
	]
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 250, 1000, 700), background: '#fffdf8', border: `2.5px solid ${C.ink}`, borderRadius: 18, padding: '22px 26px', boxSizing: 'border-box' }}>
			<div style=${{ fontFamily: F.sans, fontSize: 17, fontWeight: 700, color: C.dim, marginBottom: 12 }}>Algorithm 1 · reference-free selection and refinement</div>
			${ALG.map(([ind, code, note], i) => html`<div key=${i} style=${{ display: 'flex', gap: 14, alignItems: 'baseline', padding: '5px 10px', marginBottom: 3, borderRadius: 8,
				background: hot.has(i) ? C.redGlow : 'transparent', transition: still ? 'none' : `background 400ms ${EASE}` }}>
				<span style=${{ width: 26, fontFamily: F.mono, fontSize: 15, color: C.faint, textAlign: 'right' }}>${i + 1}</span>
				<span style=${{ paddingLeft: ind * 34, fontFamily: F.mono, fontSize: 20, color: hot.has(i) ? C.ink : B === 0 ? C.ink : C.dim, fontWeight: hot.has(i) ? 700 : 400 }}>${code}</span>
				${note && html`<span style=${{ marginLeft: 'auto', fontFamily: F.sans, fontSize: 15, color: C.dim, fontStyle: 'italic' }}>${note}</span>`}</div>`)}
		</div>
		<div key=${B} style=${{ ...box(1150, 250, 660, 700), animation: still ? 'none' : `tp-in 500ms ${EASE} both` }}>
			<div style=${{ fontFamily: F.hand, fontSize: 30, color: C.red, marginBottom: 12 }}>${B === 0 ? 'the algorithm' : `step ${B} of ${ALG_BEATS} · PetClinic`}</div>
			${panel[B]}
		</div>
		<style>${`@keyframes tp-in { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }`}</style>
		<${SlideSource}>Algorithm 1 · §III-C · §III-F</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ III-B · the oracle firewall
export function FirewallScene({ b, still }) {
	const B = still ? 4 : b
	const locks = [
		['in the metric library', 'every metric is labelled online-safe or reference-dependent; reference-dependent ones are refused as online objectives'],
		['in the files', 'during online evaluation the reference files are physically absent from the evaluation workspace'],
		['in the flow', 'the blinded report is written after the freeze and never passed back to any agent'],
		['in the prompts', 'no prompt mentions the reference or the expected number of services'],
	]
	const drawer = {
		title: 'Where the firewall lives in the code', kicker: 'oracle firewall',
		tabs: [
			{ id: 'lib', label: 'Metric library', render: () => html`<div>
				${P(html`${Code('packages/decomplab-metrics/src/decomplab_metrics/catalog.py')} marks C2C (and every other reference metric) ${Code('oracle_required=True')}. The evaluator calls ${Code('assert_allowed_online(...)')} on its configured objectives when it starts, and again on every metric set it computes.`)}
				${Src('agents/decomposition_evaluator.py')}</div>` },
			{ id: 'files', label: 'Files', render: () => P(html`The legacy metric engine prepares a fresh workspace per evaluation and copies the ground truth into it only in ${Code('blinded')} mode (${Code('include_ground_truth=(mode == "blinded")')}); online mode computes only the structural and statistics groups.`) },
			{ id: 'flow', label: 'Order', render: () => List(['evidence → domain → generator → evaluator (select)', 'refinement rounds (each re-evaluated online)', 'final quality gate, then output/decomposition.json is written: the freeze', 'only then evaluate_blinded(selected) → evaluation/blinded-report.json', 'the report goes to the manifest, never back to an agent'], { ordered: true }) },
			{ id: 'why', label: 'Why it matters', render: () => html`<div>
				${Quote('The separation between online selection and reference-based evaluation is enforced in code, not by prompt wording.', '§III-D')}
				${P(html`A method that saw the reference, or even the number of services in it, would be graded against an answer it was shown. MicroAgent, for example, receives the reference's service count <${Cite} k="su2026microagent" />.`)}</div>` },
		],
		source: 'Source: §III-D; packages/decomplab-metrics, packages/decomplab-agentic (agents/process_controller.py), vendor/legacy-metrics-engine.',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 250, 740, 110), fontFamily: F.hand, fontSize: 30, lineHeight: 1.3 }}>agents: evidence · domain · generator · evaluator · refiner</div>
		<div style=${{ ...box(110, 700, 740, 110), fontFamily: F.hand, fontSize: 30, lineHeight: 1.3, color: C.dim }}><${Term} k="reference" /> · <${Term} k="blinded-evaluation">blinded evaluator</${Term}></div>
		<svg width="1920" height="1080" style=${{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
			<line x1="110" y1="560" x2="1810" y2="560" stroke=${C.red} strokeWidth="6" strokeDasharray="18 12" />
		</svg>
		<div style=${{ ...box(110, 500, 900, 40), fontFamily: F.hand, fontSize: 30, color: C.red }}><${Term} k="oracle-firewall">the oracle firewall</${Term}></div>
		${locks.map(([t, s], i) => html`<div key=${t} style=${{ ...box(880 + (i % 2) * 470, 250 + Math.floor(i / 2) * 390, 440, 230), ...reveal(B >= i + 1, still) }}>
			<div style=${{ ...box(0, 0, 440, 230), border: `2.5px solid ${C.red}`, borderRadius: 18, background: '#fffdf8' }} />
			<div style=${{ position: 'absolute', left: 22, top: 14, fontFamily: F.hand, fontSize: 34 }}>🔒 ${t}</div>
			<div style=${{ position: 'absolute', left: 22, top: 70, right: 20, fontFamily: F.sans, fontSize: 19, lineHeight: 1.45 }}>${s}</div></div>`)}
		<${Inside} x=${1560} y=${200} w=${300} label="In the code" drawer=${drawer} still=${still} />
		<${SlideSource}>§III-D</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ III-C · experiment design
export function DesignScene({ b, still }) {
	const B = still ? 2 : b
	const arms = [
		['Single-shot (ICSA)', 'single-shot', '80k', 'the ICSA pipeline: summarise, five views, one final call'],
		['OpenCode', 'autonomous agent', 'opencode', 'an open-source coding agent decides what to read and do'],
		['Final (ours)', 'agentic workflow', 'agentic-workflow', 'the workflow of §III'],
	]
	const models = TABLES.models.rows
	const drawer = {
		title: 'The experiment, in detail', kicker: '§IV',
		tabs: [
			{ id: 'inputs', label: 'Same inputs', render: () => html`<div>
				${P(html`For each system a canonical <${Term} k="class-inventory" /> defines the evaluated universe. Every arm receives exactly this set of classes, a source snapshot restricted to them, and the static dependency graph filtered to them, and must return every class assigned to one named service.`)}
				${P(html`A decomposition is <${Term} k="validity">valid</${Term}> if it assigns every inventory class exactly once, contains no unknown class and no empty service, and has at least three non-empty services.`)}</div>` },
			{ id: 'arms', label: 'Arms', tabs: [
				{ id: '80k', label: 'Single-shot (ICSA)', render: () => html`<div>${P(html`The pipeline of our previous study <${Cite} k="sambu2026icsa" />, in its 80k-concatenation configuration. Source files are packed into chunks of about 80,000 tokens (300,000 characters) and summarised, five architectural views are generated from the summary, and one final call produces the decomposition from the views, the dependency graph and the class inventory.`)}${P('On these systems the scoped source (11k–41k tokens, depending on the tokenizer) fits in one chunk, so the arm makes seven calls plus retries.')}</div>` },
				{ id: 'oc', label: 'OpenCode', render: () => html`<div>${P(html`The open-source coding agent OpenCode <${Cite} k="opencode2026" /> runs in an isolated workspace with the source snapshot and the dependency graph, and must write the decomposition to a file. It decides autonomously which files to read and which tools to use.`)}${P('It exposes no sampling temperature: it runs with the provider default and reasoning effort low. The prompt is baseline-3, chosen by information parity (Part III).')}</div>` },
				{ id: 'final', label: 'Final (ours)', render: () => P('The workflow of §III: evidence, domain, three candidates, repair, gate, score, local search, freeze.') },
				{ id: 'tools', label: 'Traditional tools', render: () => P(html`DataCentric, HyDec, Mono2Micro (two configurations) and Log2MS, as measured in the tool comparison <${Cite} k="wang2024comparison" />: deterministic, included for context.`) },
			], render: () => P('Four arms; the first three share model, inputs and blinded evaluation.') },
			{ id: 'models', label: 'Models', render: () => html`<div>
				${Table(['model', 'developer', 'architecture', 'context', 'AA', 'valid single-shot', 'OpenCode', 'Final'], models, { align: ['left', 'left', 'left', 'right', 'right', 'right', 'right', 'right'], size: 15 })}
				${P(html`The first eight rows are the primary analysis (five seeds), the rest run once. The models were chosen in two steps: four for diversity of developer, architecture and capability, after a probe for parseable JSON and tool calls; then a screening of the provider's other thirteen models (one run each, including those the probe had excluded), from which the four with all twelve runs valid joined the primary set. All are served by Ollama Cloud <${Cite} k="ollama2026models" />; AA is the Artificial Analysis Intelligence Index <${Cite} k="aa2026index" />; † development model.`, { fontSize: 17 })}
				${Note('Within each model, all arms use that model: arms are never compared across models.', C.faint)}</div>` },
			{ id: 'controls', label: 'Controls', render: () => List([html`workflow and single-shot: <${Term} k="temperature" /> 0.2, reasoning disabled where supported, at most 16,384 output tokens`, 'retries use the same model and parameters (the generator appends the validation error); no fallback model, no truncated prompt', 'every observation records its frozen inputs, a benchmark-scope fingerprint, every LLM call and a manifest']) },
			{ id: 'reps', label: 'Repetitions and runs', render: () => html`<div>
				${P('All runs follow one frozen protocol, scope and decoding:', { fontSize: 20 })}
				${List([
					`primary: ${ROLES.primary.length} models × 4 systems × 5 seeds × 3 arms`,
					`breadth: ${ROLES.breadth.length} more models, seed 1 only`,
					`repeatability: seed 1 run twice, three weeks apart, for ${ROLES.repeat.join(', ')}; the earlier run serves only this check`,
					html`the V-measure ablation was re-scored on every stored workflow run by <${Term} k="replay">replaying</${Term}> its LLM outputs (no model calls)`,
				])}
				${P(html`<b>Primary analysis:</b> 8 models × 4 systems × 5 seeds (32 cells): the four models chosen first and the four selected by screening.`, { fontSize: 19 })}
				${Note("DeepSeek v4.1 Flash's seed-1 single-shot and OpenCode runs were reused from an earlier matched campaign after checking identical frozen inputs, scope fingerprints and byte-identical regenerated prompts; DeepSeek v4.1 Flash's workflow runs, and GLM-5.2's earlier seed-1 workflow runs, replay the preceding version's LLM outputs (the versions differ only in deterministic selection and refinement).", C.faint)}</div>` },
			{ id: 'devconf', label: 'Development vs confirmation', render: () => html`<div>
				${P(html`Design decisions were made while observing DeepSeek v4.1 Flash on the four systems, and the last one also GLM-5.2, so both are <${Term} k="development-confirmation">development data</${Term}>. The other six models of the primary analysis, and all nine models run once, ran only after the design was frozen and informed no decision: the held-out view <${Cite} keys=${['cawley2010overfitting', 'dwork2015reusable']} />.`)}
				${Note('The systems are not out of sample: the workflow was developed on the same four public systems it is evaluated on.', C.amber)}</div>` },
		],
		source: 'Source: §IV-E, Table VIII.',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 250, 400, 400), border: `2.5px solid ${C.ink}`, borderRadius: 18, background: '#fffdf8', padding: '18px 22px', boxSizing: 'border-box' }}>
			<div style=${{ fontFamily: F.hand, fontSize: 36 }}>same inputs</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, lineHeight: 1.6, marginTop: 8 }}>one model · the <${Term} k="class-inventory">class inventory</${Term}> · a scoped source snapshot · the <${Term} k="dependency-graph">dependency graph</${Term}></div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, marginTop: 14 }}>no reference-derived input, not even the number of services</div>
		</div>
		${arms.map(([t, k, term, s], i) => html`<div key=${t} style=${{ ...box(640, 250 + i * 140, 700, 120), ...reveal(B >= 1, still, { delay: i * 120 }) }}>
			<div style=${{ ...box(0, 0, 700, 120), border: `2.5px solid ${i === 2 ? C.red : C.ink}`, borderRadius: 16, background: '#fffdf8' }} />
			<div style=${{ position: 'absolute', left: 22, top: 12, fontFamily: F.hand, fontSize: 34, color: i === 2 ? C.red : C.ink }}>${t} · <${Term} k=${term}>${k}</${Term}></div>
			<div style=${{ position: 'absolute', left: 22, top: 66, right: 20, fontFamily: F.sans, fontSize: 19, color: C.dim }}>${s}</div></div>`)}
		<svg width="1920" height="1080" style=${{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', ...reveal(B >= 1, still) }}>
			${[0, 1, 2].map((i) => html`<path key=${i} d=${`M510 ${450} C 570 450, 580 ${310 + i * 140}, 636 ${310 + i * 140}`} fill="none" stroke=${C.ink} strokeWidth="3" />`)}
			<line x1="110" y1="700" x2="1810" y2="700" stroke=${C.red} strokeWidth="4" strokeDasharray="14 10" />
		</svg>
		<div style=${{ ...box(1380, 250, 430, 440), ...reveal(B >= 1, still, { delay: 400 }) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 34 }}>eight models × five seeds</div>
			${Object.keys(EXT.models8_5reps.arm_means).map((m) => html`<div key=${m} style=${{ fontFamily: F.mono, fontSize: 18, margin: '6px 0 0' }}>${m}</div>`)}
			<div style=${{ fontFamily: F.sans, fontSize: 17, color: C.dim, marginTop: 12 }}>+ ${Object.keys(EXT.models17_seed1.arm_means).length - 8} more models, one seed · all arms of one model run with that model</div>
		</div>
		<div style=${{ ...box(110, 720, 1700, 200), ...reveal(B >= 2, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 30, color: C.red }}>after freezing only</div>
			<div style=${{ fontFamily: F.hand, fontSize: 34, marginTop: 8 }}><${Term} k="blinded-evaluation">blinded evaluation</${Term}>: design metrics, C2C against the reference, <${Term} k="validity">validity</${Term}>, tokens</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, color: C.dim, marginTop: 12 }}>${EXT.observation_counts.final_benchmark_v1 + EXT.observation_counts.extension_recorded} recorded observations and ${EXT.observation_counts.extension_unrecorded} unreadable outputs counted as failures</div>
		</div>
		<${Inside} x=${1560} y=${200} w=${300} label="The experiment" drawer=${drawer} still=${still} />
		<${SlideSource}>Fig. 2 · §IV · Table VIII</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ III-C · analysis
const MODELS = ['DeepSeek v4.1', 'GLM-5.2', 'gpt-oss:120b', 'gemma4', 'DeepSeek v4 Pro', 'Mistral L4', 'Kimi K2.7', 'Kimi K3']
const SYSTEMS_SHORT = ['Demo', 'JPetStore', 'PartsUnl.', 'PetClinic']
export function AnalysisScene({ b, still }) {
	const B = still ? 2 : b
	const cell = 52
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 250, 720, 60), fontFamily: F.hand, fontSize: 32 }}>one pair per (model, system) cell</div>
		<div style=${{ ...box(330, 316, 4 * 100, 30), display: 'flex' }}>${SYSTEMS_SHORT.map((s) => html`<div key=${s} style=${{ width: 100, textAlign: 'center', fontFamily: F.sans, fontSize: 15, color: C.dim }}>${s}</div>`)}</div>
		${MODELS.map((m, i) => html`<div key=${m} style=${{ ...box(110, 350 + i * cell, 210, cell), display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontFamily: F.sans, fontSize: 17, color: i < 4 ? C.ink : C.dim }}>${m}</div>`)}
		${MODELS.flatMap((m, i) => SYSTEMS_SHORT.map((s, j) => html`<div key=${m + s} style=${{ ...box(330 + j * 100 + 5, 350 + i * cell + 4, 90, cell - 8), borderRadius: 10, border: `2px solid ${C.ink}`, background: '#fffdf8',
			display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.hand, fontSize: 19, ...reveal(true, still, { delay: 20 * (i * 4 + j) }) }}>A · B ×5</div>`))}
		<div style=${{ ...box(110, 780, 720, 160), fontFamily: F.sans, fontSize: 19, lineHeight: 1.5, color: C.dim }}>32 cells (the primary analysis): the same model and system under two arms, five seeds each, averaged per cell, because seeds of one cell are not independent. Metric tests use valid observations; failures are counted under validity and checked in a worst-case treatment.</div>
		<div style=${{ ...box(900, 250, 910, 700) }}>
			${[
				['is the difference systematic?', html`<${Term} k="wilcoxon">Wilcoxon signed-rank</${Term}> test over cells, two-sided <${Cite} k="wilcoxon1945" />, <${Term} k="holm">Holm</${Term}> across eight metrics`, 0],
				['how large is it?', html`mean difference with a <${Term} k="bootstrap-ci">bootstrap 95% interval</${Term}>, <${Term} k="cliffs-delta">Cliff's δ</${Term}> <${Cite} k="cliff1993dominance" />, <${Term} k="win-tie-loss">win / tie / loss</${Term}>`, 1],
				['does it depend on the analysis?', html`declared primary analysis; failures scored at worst; a regression on every run, clustered by cell and by model`, 1],
				['can 32 cells see small effects?', html`better than 16, still limited <${Term} k="power">power</${Term}>: non-significant ≠ equivalent`, 2],
				['how repeatable is one arm?', html`distinct partitions and mean pairwise <${Term} k="nvi">NVI</${Term}> over five seeds, eight models`, 2],
			].map(([q, a, beat], i) => html`<div key=${q} style=${{ marginBottom: 26, ...reveal(B >= beat, still, { delay: 80 * i }) }}>
				<div style=${{ fontFamily: F.hand, fontSize: 30, color: C.red }}>${q}</div>
				<div style=${{ fontFamily: F.sans, fontSize: 22, marginTop: 4 }}>${a}</div></div>`)}
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, ...reveal(B >= 2, still) }}>Non-parametric tests and effect sizes, as recommended for randomised algorithms in software engineering <${Cite} k="arcuri2014hitchhiker" />. Every number is computed by a script from the immutable run artifacts.</div>
		</div>
		<${SlideSource}>§IV-I</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ III-D · why C2C
const FIN = PETCLINIC.final
const REF = SYSTEMS['spring-petclinic'].reference
export function C2cScene({ b, still }) {
	const B = still ? 1 : b
	const [pick, setPick] = useShared('c2c:pick', Object.keys(FIN)[0])
	const produced = FIN[pick]
	const rows = Object.entries(REF).map(([g, cs]) => ({ g, cs, o: overlap(produced, cs), inter: produced.filter((c) => cs.includes(c)) }))
	const best = Math.max(...rows.map((r) => r.o))
	const selfRows = Object.entries(SYSTEMS).map(([id, s]) => [id, ...[0.1, 0.33, 0.5].map((t) => f1(c2c(s.disjoint, s.reference, t).value))])
	const drawer = {
		title: 'C2C in detail', kicker: '§IV-G',
		tabs: [
			{ id: 'def', label: 'Definition', render: () => html`<div>
				${Formula(html`overlap(A, B) = |A ∩ B| / max(|A|, |B|)`)}
				${P('C2C-x is the share of produced services A for which some reference service B has overlap > x %. Services are compared as sets of classes, so a class the reference places in several services simply belongs to several sets.')}
				${List(['C2C-10: does a produced service correspond to any reference service at all?', 'C2C-33: does it capture a substantial part of one?', 'C2C-50: does it match one closely?'])}</div>` },
			{ id: 'self', label: 'The reference against itself', render: () => html`<div>
				${P('The reference scores 100 against itself at every threshold. A disjoint copy (each shared class kept only in the first service that lists it) agrees with the reference on every class:')}
				${Table(['system', 'C2C-10', 'C2C-33', 'C2C-50'], selfRows)}
				${P('C2C notices that a partition cannot reproduce a replicated design exactly, but counts the difference once per service, not once per shared class. Values recomputed here from the reference files; they match Table IX.', { fontSize: 19, color: C.dim })}</div>` },
			{ id: 'limits', label: 'Its limits', render: () => List(['it counts produced services, not classes, so services are not weighted by size', 'it does not penalise a decomposition for missing a reference service', 'the implementation needs strictly more than x % (the benchmark paper says "at least"), so a service overlapping by exactly half does not count at C2C-50', 'the thresholds do not always agree, so no conclusion rests on one cut-off']) },
			{ id: 'refs', label: 'Where it comes from', render: () => P(html`Introduced for comparing architecture-recovery results <${Cite} keys=${['garcia2013comparative', 'lutellier2018dependencies']} />, used by the benchmark <${Cite} k="wang2024comparison" /> and by MicroAgent <${Cite} k="su2026microagent" />.`) },
		],
		source: 'Source: §IV-G, §VII, Table IX; vendor/legacy-metrics-engine/calculator/c2c.py.',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 245, 760, 220), fontFamily: F.hand, fontSize: 28, lineHeight: 1.35 }}>
			The references <${Term} k="overlap">overlap</${Term}>: shared classes sit in several services. A similarity measure must accept that.<br />
			<span style=${{ color: C.red }}><${Term} k="c2c" /> compares services as sets of classes.</span></div>
		<div style=${{ ...box(110, 480, 760, 460), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 28, marginBottom: 10 }}>Try it: pick one of the workflow's PetClinic services</div>
			<div style=${{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
				${Object.keys(FIN).map((s) => html`<button key=${s} type="button" ...${SHIELD} onClick=${(e) => { e.stopPropagation(); setPick(s) }}
					style=${{ pointerEvents: 'all', cursor: 'pointer', padding: '8px 14px', borderRadius: 999, border: `2px solid ${s === pick ? C.red : C.ink}`, background: s === pick ? C.red : '#fffdf8', color: s === pick ? '#fff' : C.ink, fontFamily: F.sans, fontSize: 16, fontWeight: 600 }}>${s.replace('Service', '')} (${FIN[s].length})</button>`)}
			</div>
			<div style=${{ fontFamily: F.mono, fontSize: 15, color: C.dim, lineHeight: 1.5 }}>${produced.join(', ')}</div>
		</div>
		<div style=${{ ...box(930, 250, 880, 700), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.sans, fontSize: 17, fontWeight: 700, color: C.dim, marginBottom: 8 }}>overlap with each reference service</div>
			${rows.map((r) => html`<div key=${r.g} style=${{ marginBottom: 20 }}>
				<div style=${{ display: 'flex', justifyContent: 'space-between', fontFamily: F.sans, fontSize: 20 }}>
					<span>${r.g} <span style=${{ color: C.dim, fontSize: 16 }}>(${r.cs.length} classes, ${r.inter.length} shared with it)</span></span><b>${(r.o * 100).toFixed(0)} %</b></div>
				<div style=${{ position: 'relative', height: 22, background: C.paper2, borderRadius: 11, marginTop: 6 }}>
					<div style=${{ height: '100%', width: `${r.o * 100}%`, borderRadius: 11, background: r.o === best ? C.red : C.ink, opacity: r.o === best ? 0.85 : 0.35, transition: `width 600ms ${EASE}` }} />
					${[10, 33, 50].map((t) => html`<div key=${t} style=${{ position: 'absolute', left: `${t}%`, top: -6, bottom: -6, width: 2, background: C.ink, opacity: 0.5 }} />`)}
				</div></div>`)}
			<div style=${{ display: 'flex', gap: 14, marginTop: 10 }}>
				${[10, 33, 50].map((t) => html`<div key=${t} style=${{ flex: 1, padding: '10px 12px', borderRadius: 12, border: `2px solid ${best > t / 100 ? C.fix : C.red}`, textAlign: 'center', fontFamily: F.sans, fontSize: 18 }}>
					C2C-${t}: <b>${best > t / 100 ? 'counts ✓' : 'does not count ✗'}</b></div>`)}</div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, marginTop: 16 }}>C2C-x is the share of produced services that count. Over all four services here: ${[0.1, 0.33, 0.5].map((t) => f1(c2c(FIN, REF, t).value)).join(' / ')}.</div>
		</div>
		<${Inside} x=${1560} y=${200} w=${300} label="C2C in detail" drawer=${drawer} still=${still} />
		<${SlideSource}>§IV-G · Table IX</${SlideSource}>
	</${Stage}>`
}
