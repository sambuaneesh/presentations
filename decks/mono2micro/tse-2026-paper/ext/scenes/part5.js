// Part V · what it means (paper §VI–VIII) and the appendix (the research record behind the paper).
import { html, C, F, box, EASE, Stage, Term, Cite, Inside, Card, SHIELD, P, H, List, Note, Code, Quote, Table, rich, reveal, SlideSource, Src } from '../ui.js'
import { PROSE, TABLES, ANALYSIS } from '../data/results.js'
import { REFS, ORDER } from '../data/refs.js'
import { LABELS } from '../data/paper.js'
import { GLOSSARY } from '../glossary.js'
import { useStage } from '../ui.js'

const paras = (label) => PROSE[label] ?? []
const body = (label) => paras(label).map((e, i) => html`<div key=${i}>${e.head && H(e.head.replace(/\.$/, ''))}${e.text && P(rich(e.text))}${e.items.length > 0 && List(e.items.map(rich))}</div>`)

// ------------------------------------------------------------------ VI-A · what the agentic organisation buys
export function BuysScene({ b, still }) {
	const B = still ? 2 : b
	const yes = [html`a complete assignment, guaranteed <${Term} k="repair">by construction</${Term}>`, 'lower and more predictable cost', 'up to three explicit alternatives (often only one or two distinct)', 'a complete audit trail from evidence to decision']
	const no = ['designs better than a well-prompted single call', 'more repeatable results']
	const drawer = { title: 'What the agentic organisation buys', kicker: '§VI-A', tabs: [{ id: 'text', label: 'The paper\'s argument', render: () => html`<div>${body('sc:disc-buys')}</div>` }], source: 'Source: §VI-A.' }
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 260, 820, 560) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 44, color: C.fix }}>process benefits ✓</div>
			${yes.map((t, i) => html`<div key=${i} style=${{ fontFamily: F.hand, fontSize: 32, lineHeight: 1.3, margin: '20px 0 0', ...reveal(true, still, { delay: 120 * i }) }}>• ${t}</div>`)}
		</div>
		<div style=${{ ...box(990, 260, 820, 560), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 44, color: C.red }}>no quality benefit ✗</div>
			${no.map((t, i) => html`<div key=${i} style=${{ fontFamily: F.hand, fontSize: 32, lineHeight: 1.3, margin: '20px 0 0' }}>• ${t}</div>`)}
			<div style=${{ fontFamily: F.sans, fontSize: 20, color: C.dim, lineHeight: 1.5, marginTop: 30 }}>An autonomous agent received the same inputs and goals, yet once collapsed a system into one service and once silently dropped three classes: flexibility without guarantees <${Cite} k="xia2024agentless" />.</div>
		</div>
		<div style=${{ ...box(110, 860, 1700, 60), textAlign: 'center', fontFamily: F.hand, fontSize: 34, ...reveal(B >= 2, still) }}>Much of an architect's cost is checking LLM output: a well-formed, auditable answer lowers it even when it is no better.</div>
		<${Inside} x=${1560} y=${196} w=${300} label="The argument" drawer=${drawer} still=${still} />
		<${SlideSource}>§VI-A</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ VI-B…E · four lessons
const LESSONS = [
	['sc:disc-safeguards', 'Safeguards matter more than reasoning', 'The components with measurable effects were deterministic; let the LLM interpret and propose, and let code check, compare and improve.'],
	['sc:disc-selfref', 'Never grade a candidate by its own construction', 'For every selection criterion, ask whether any candidate was built to satisfy it.'],
	['sc:disc-proxies', 'Structural proxies are not business cohesion', 'Inheritance coupling looks like cohesion to CMod: decision support, not an autonomous replacement.'],
	['sc:disc-convergence', 'Models converge on public benchmarks', 'Different models gave the same split: benchmarks may measure recall of familiar architectures.'],
]
export function LessonsScene({ b, still }) {
	return html`<${Stage} still=${still}>
		${LESSONS.map(([label, t, s], i) => {
			const drawer = { title: t, kicker: `§${LABELS[label]}`, tabs: [{ id: 'text', label: 'The paper', render: () => html`<div>${body(label)}</div>` }], source: `Source: §${LABELS[label]}.` }
			return html`<${Card} key=${label} drawer=${drawer} still=${still} delay=${i * 120} style=${{ left: 110 + (i % 2) * 865, top: 260 + Math.floor(i / 2) * 350, width: 835, height: 320, padding: '22px 28px' }}>
				<div style=${{ fontFamily: F.hand, fontSize: 26, color: C.red }}>§${LABELS[label]}</div>
				<div style=${{ fontFamily: F.hand, fontSize: 40, lineHeight: 1.15, margin: '6px 0 14px' }}>${t}</div>
				<div style=${{ fontFamily: F.sans, fontSize: 20, lineHeight: 1.5, color: C.dim }}>${s}</div>
				<div style=${{ position: 'absolute', bottom: 16, right: 24, fontFamily: F.sans, fontSize: 16, color: C.red, fontWeight: 600 }}>⌕ read the section</div>
			</${Card}>`
		})}
		<${SlideSource}>§VI-B–E</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ VI-F · implications
export function ImplicationsScene({ b, still }) {
	const B = still ? 1 : b
	const [prac, res] = paras('sc:disc-implications')
	const col = (x, e, on, color) => html`<div style=${{ ...box(x, 260, 820, 640), ...reveal(on, still) }}>
		<div style=${{ fontFamily: F.hand, fontSize: 44, color }}>${e.head.replace(/\.$/, '').replace('For ', 'for ')}</div>
		${e.items.map((t, i) => html`<div key=${i} style=${{ fontFamily: F.sans, fontSize: 22, lineHeight: 1.5, margin: '18px 0 0', paddingLeft: 26, position: 'relative' }}>
			<span style=${{ position: 'absolute', left: 0, color }}>●</span>${rich(t)}</div>`)}</div>`
	return html`<${Stage} still=${still}>
		${prac && col(110, prac, true, C.ink)}
		${res && col(990, res, B >= 1, C.red)}
		<${SlideSource}>§VI-F</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ VII · threats to validity
const THREAT_LINES = {
	'Construct validity.': 'Metrics capture parts of quality; coarse partitions inflate some; references are one valid answer; DTP, DI, BCP see only part of each system.',
	'Internal validity.': 'Developed on the same systems with one model; last change prompted by a blinded outcome; replayed outputs; OpenCode settings differ.',
	'External validity.': 'Small (23–53 classes), Java, public systems the models may know; one provider; class-level partitions only.',
	'Conclusion validity.': '16 paired cells: small differences undetectable; no correction across metrics; three models run once per cell.',
	'Reliability.': 'Everything is released and every number regenerates from stored artifacts, but hosted models evolve.',
}
export function ThreatsScene({ still }) {
	const items = paras('sc:threats').filter((e) => e.head)
	return html`<${Stage} still=${still}>
		${items.map((e, i) => {
			const drawer = { title: e.head.replace(/\.$/, ''), kicker: 'threats to validity · §VII', tabs: [{ id: 't', label: 'The paper', render: () => P(rich(e.text)) }], source: 'Source: §VII.' }
			const x = 110 + (i % 3) * 575, y = 260 + Math.floor(i / 3) * 340
			return html`<${Card} key=${e.head} drawer=${drawer} still=${still} delay=${i * 100} style=${{ left: x, top: y, width: 545, height: 310, padding: '20px 26px' }}>
				<div style=${{ fontFamily: F.hand, fontSize: 38 }}>${e.head.replace(/\.$/, '').replace(' validity', '')}</div>
				<div style=${{ fontFamily: F.sans, fontSize: 19, lineHeight: 1.5, color: C.dim, marginTop: 10 }}>${THREAT_LINES[e.head] ?? ''}</div>
				<div style=${{ position: 'absolute', bottom: 16, right: 22, fontFamily: F.sans, fontSize: 16, color: C.red, fontWeight: 600 }}>⌕ threats and mitigations</div>
			</${Card}>`
		})}
		<${SlideSource}>§VII</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ VIII · conclusion
export function ConclusionScene({ b, still }) {
	const B = still ? 2 : b
	const c = paras('sc:conclusion')
	const drawer = { title: 'Conclusion', kicker: '§VIII', tabs: [{ id: 'c', label: 'The paper', render: () => html`<div>${body('sc:conclusion')}</div>` }], source: 'Source: §VIII.' }
	const future = ['instantiate the Quality Agent for stakeholder constraints', 'replace LLM-inferred ownership links with source-verified evidence', 'add explicit refactoring operations, such as replicating shared classes', 'evaluate on larger, less-exposed systems, together with practising architects']
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 270, 1700, 300), display: 'flex', gap: 40, alignItems: 'center' }}>
			<div style=${{ flex: 1, border: `3px solid #2e9e6e`, borderRadius: 22, padding: '26px 30px', background: '#fffdf8' }}>
				<div style=${{ fontFamily: F.hand, fontSize: 48, color: '#2e9e6e' }}>the LLM</div>
				<div style=${{ fontFamily: F.hand, fontSize: 34, marginTop: 8 }}>interprets code and proposes meaningful boundaries</div></div>
			<div style=${{ fontFamily: F.hand, fontSize: 60 }}>+</div>
			<div style=${{ flex: 1, border: `3px solid #c0578e`, borderRadius: 22, padding: '26px 30px', background: '#fffdf8', ...reveal(B >= 1, still) }}>
				<div style=${{ fontFamily: F.hand, fontSize: 48, color: '#c0578e' }}>deterministic code</div>
				<div style=${{ fontFamily: F.hand, fontSize: 34, marginTop: 8 }}>checks, compares and improves them, auditably</div></div>
		</div>
		<div style=${{ ...box(110, 620, 1700, 300), ...reveal(B >= 2, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 34, color: C.red }}>future work</div>
			${future.map((t, i) => html`<div key=${i} style=${{ fontFamily: F.sans, fontSize: 23, lineHeight: 1.5, marginTop: 10 }}>→ ${t}</div>`)}
		</div>
		<${Inside} x=${1560} y=${196} w=${300} label="The conclusion" drawer=${drawer} still=${still} />
		<${SlideSource}>§VIII</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ appendix · the research record
const STUDIES = [
	{ id: 'icsa-2026', t: 'ICSA 2026 study', role: 'the conference paper', what: 'The original single-shot study: four models, seven summarisation strategies, the traditional tools and the references (134 imported runs).', status: 'foundation' },
	{ id: 'harness-baselines-v1', t: 'Coding-agent harnesses', role: 'exploratory', what: 'Prompt variants across four coding agents (Claude Code, Codex, Qwen Code, OpenCode) on the four systems (140 runs). The source of the five OpenCode prompt variants.', status: 'archived' },
	{ id: 'harness-repeatability-v1', t: 'Harness repeatability', role: 'exploratory', what: 'Three repeated runs of one harness prompt for two models (24 runs): an early sign that single runs vary.', status: 'archived' },
	{ id: 'matched-agentic-v1', t: 'First matched campaign', role: 'superseded', what: 'The first comparison of all arms with a locally served Qwen model. Generation and validation used different class universes, which led to the canonical class scope (ADR 0005).', status: 'superseded' },
	{ id: 'matched-agentic-v2', t: 'qwen-35B pilot', role: 'pilot', what: 'The same comparison with the canonical scope and NVIDIA\'s NVFP4 build of Qwen 3.6 35B-A3B (32 runs). Here repair mattered: 3 of 12 raw candidates were invalid and were repaired.', status: 'kept' },
	{ id: 'matched-ollama-deepseek-v1', t: 'Matched DeepSeek campaign', role: 'baseline choice', what: 'All eight treatments with DeepSeek v4.1 Flash (32 runs, all valid). The evidence for choosing 80k concat and OpenCode baseline-3; its first 80k and OpenCode runs are reused in the benchmark.', status: 'archived' },
	{ id: 'agentic-improvement-lab-v1', t: 'Improvement lab', role: 'design experiments', what: 'One change at a time on DeepSeek (trials T000–T008): the source of the design experiments in Table VII.', status: 'archived' },
	{ id: 'agentic-development-loop-v1', t: 'Development loop', role: 'selection tests', what: 'Replayed the recorded LLM outputs to test selection and refinement changes cheaply; it produced the final version (v1b), checked once on GLM-5.2 as a hold-out (2 of 5 design metrics better there).', status: 'kept' },
	{ id: 'final-benchmark-v1', t: 'Final benchmark', role: 'the paper\'s data', what: 'Four models × four systems × three arms, five DeepSeek repetitions: the 96 observations behind every result, plus the earlier workflow version kept for the ablation.', status: 'the paper' },
]
export function StudiesScene({ still }) {
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 245, 1700, 40), fontFamily: F.sans, fontSize: 18, color: C.dim }}>every study lives in studies/&lt;id&gt; with its runs, manifests and README; click one</div>
		${STUDIES.map((s, i) => {
			const drawer = { title: s.t, kicker: `studies/${s.id} · ${s.status}`, tabs: [{ id: 'w', label: 'What it was', render: () => html`<div>${P(s.what, { fontSize: 23 })}${Src(`studies/${s.id}/README.md`)}</div>` }] }
			const x = 110 + (i % 3) * 575, y = 300 + Math.floor(i / 3) * 215
			const hot = s.status === 'the paper'
			return html`<${Card} key=${s.id} drawer=${drawer} still=${still} delay=${i * 60} color=${hot ? C.red : s.status === 'archived' || s.status === 'superseded' ? C.faint : C.ink} style=${{ left: x, top: y, width: 545, height: 196, padding: '14px 22px' }}>
				<div style=${{ fontFamily: F.sans, fontSize: 15, color: hot ? C.red : C.dim, fontWeight: 700, letterSpacing: 0.4 }}>${i + 1} · ${s.role.toUpperCase()} · ${s.status}</div>
				<div style=${{ fontFamily: F.hand, fontSize: 32, marginTop: 2, lineHeight: 1.15 }}>${s.t}</div>
				<div style=${{ fontFamily: F.mono, fontSize: 14, color: C.dim, marginTop: 2 }}>${s.id}</div>
				<div style=${{ fontFamily: F.sans, fontSize: 16, color: C.dim, marginTop: 6, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>${s.what.split(':')[0].split('.')[0]}.</div>
			</${Card}>`
		})}
		<${SlideSource}>studies/ · studies/README.md</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ appendix · tried and not adopted
const NOT_ADOPTED = [
	['E3', 'A capability-purity score', 'saturated at 100 and could not penalise mixed services; replaced by V-measure, which was later removed from selection (E9)'],
	['E4', 'A Pareto selector', 'with three candidates and four objectives every candidate was non-dominated: no discrimination, so the weighted composite stayed'],
	['E6', 'Ownership-guided refinement', 'the entity/repository links were LLM-inferred, and prioritising them displaced structural moves'],
	['E7', 'Replicating shared classes', 'cut cross-service dependency weight by 3–33 % on three systems, but the metrics cannot evaluate replicated classes fairly: future work'],
	['loop', 'Consensus (medoid) selection', 'picking the candidate closest to the others beat 80k concat on only one of five design metrics'],
	['loop', 'A persistence-cohesion objective', 'beat 80k concat on three of five design metrics, but less than the final version'],
]
export function NotAdoptedScene({ still }) {
	return html`<${Stage} still=${still}>
		${NOT_ADOPTED.map(([id, t, s], i) => html`<div key=${t} style=${{ ...box(110 + (i % 2) * 865, 260 + Math.floor(i / 2) * 225, 835, 200), border: `2px solid ${C.line}`, borderRadius: 16, background: '#fffdf8', padding: '18px 24px', boxSizing: 'border-box', ...reveal(true, still, { delay: 80 * i }) }}>
			<div style=${{ fontFamily: F.sans, fontSize: 15, fontWeight: 700, color: C.dim }}>${id === 'loop' ? 'DEVELOPMENT LOOP' : `DESIGN EXPERIMENT ${id}`}</div>
			<div style=${{ fontFamily: F.hand, fontSize: 34, marginTop: 4 }}>${t}</div>
			<div style=${{ fontFamily: F.sans, fontSize: 19, lineHeight: 1.45, color: C.dim, marginTop: 6 }}>${s}</div></div>`)}
		<${SlideSource}>Table VII · studies/agentic-development-loop-v1/loop-log.jsonl</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ appendix · reproducing the paper
export function ReproduceScene({ still }) {
	const steps = [
		['every run is a folder', 'studies/final-benchmark-v1/runs/<run-id>: inputs, all LLM calls, artifacts, blinded report, manifest'],
		['every number is recomputed', 'tools/analyze_final_benchmark.py reads the runs and writes analysis/final-benchmark-analysis.json, without calling a model'],
		['every prompt and protocol is versioned', 'protocols/campaigns/*.yaml and protocols/decomposer-configs/*: a protocol is never changed after it has produced observations'],
		['the paper links it all', html`the replication package <${Cite} k="sambu2026replication" />, to be archived before submission`],
	]
	return html`<${Stage} still=${still}>
		${steps.map(([t, s], i) => html`<div key=${i} style=${{ ...box(110, 260 + i * 150, 1300, 135), ...reveal(true, still, { delay: 120 * i }) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 38 }}>${i + 1} · ${t}</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, color: C.dim, marginTop: 6, lineHeight: 1.45 }}>${s}</div></div>`)}
		<div style=${{ ...box(1460, 260, 350, 560), border: `2.5px solid ${C.ink}`, borderRadius: 18, background: '#fffdf8', padding: '20px 24px', boxSizing: 'border-box' }}>
			<div style=${{ fontFamily: F.hand, fontSize: 32 }}>explore the runs</div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, lineHeight: 1.5, margin: '10px 0 16px' }}>The public Grid Visualizer shows every study's results, system by system.</div>
			<a href="https://sambuaneesh.github.io/mono2micro/" target="_blank" rel="noopener noreferrer" ...${SHIELD} onClick=${(e) => e.stopPropagation()}
				style=${{ pointerEvents: 'all', display: 'inline-block', padding: '10px 18px', borderRadius: 999, border: `2.5px solid ${C.red}`, color: C.red, fontFamily: F.sans, fontSize: 18, fontWeight: 600, textDecoration: 'none' }}>open the visualizer ↗</a>
		</div>
		<${SlideSource}>§VII Reliability · repository README</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ appendix · references
export function RefsScene({ still }) {
	const { open } = useStage()
	const groups = {}
	for (const k of ORDER) {
		const r = REFS[k]
		if (r.hidden) continue
		const sec = r.contexts[0]?.sec?.split('-')[0] || 'other'
		;(groups[sec] ??= []).push(r)
	}
	const secs = Object.keys(groups)
	const drawer = {
		title: 'All references', kicker: `${ORDER.length} cited works`,
		tabs: secs.map((s) => ({ id: s, label: s === 'other' ? 'Other' : `First cited in §${s}`, render: () => html`<div>${groups[s].map((r) => html`<div key=${r.n} style=${{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'baseline' }}>
			<span style=${{ minWidth: 50 }}><${Cite} k=${ORDER[r.n - 1]} /></span>
			<span style=${{ fontFamily: F.serif, fontSize: 19, lineHeight: 1.4 }}><b>${r.title}</b><br /><span style=${{ color: C.dim, fontSize: 16 }}>${r.authors} · ${r.venue} · ${r.year}</span></span></div>`)}</div>` })),
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 250, 1700, 60), fontFamily: F.hand, fontSize: 32, color: C.dim }}>numbered as in the paper · click any number for the full reference and where it is cited</div>
		<div style=${{ ...box(110, 320, 1700, 580), display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: '12px 14px' }}>
			${ORDER.filter((k) => !REFS[k].hidden).map((k) => html`<span key=${k} style=${{ fontFamily: F.sans, fontSize: 30 }}><${Cite} k=${k} /></span>`)}
		</div>
		<div style=${{ ...box(110, 910, 400, 60) }}><${Inside} label="Browse by section" drawer=${drawer} still=${still} /></div>
		<${SlideSource}>refs.bib · numbered by the compiled bibliography</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ appendix · glossary
export function GlossaryScene({ still }) {
	const fam = {}
	for (const [k, g] of Object.entries(GLOSSARY)) (fam[g.family ?? 'other'] ??= []).push([k, g])
	const order = ['architecture', 'the task', 'the benchmark', 'evidence', 'techniques', 'domain-driven design', 'metrics', 'design metric', 'similarity metric', 'workflow score', 'LLMs', 'approaches', 'agents', 'workflow', 'workflow diagnostic', 'finding', 'optimisation', 'protocol', 'method', 'statistics']
	const fams = [...order.filter((f) => fam[f]), ...Object.keys(fam).filter((f) => !order.includes(f))]
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 245, 1700, 740), columnCount: 4, columnGap: 40 }}>
			${fams.map((f) => html`<div key=${f} style=${{ breakInside: 'avoid', marginBottom: 16 }}>
				<div style=${{ fontFamily: F.sans, fontSize: 14, fontWeight: 700, letterSpacing: 0.5, color: C.red, textTransform: 'uppercase' }}>${f}</div>
				${fam[f].map(([k, g]) => html`<div key=${k} style=${{ fontFamily: F.sans, fontSize: 18, lineHeight: 1.5 }}><${Term} k=${k}>${g.term}</${Term}></div>`)}</div>`)}
		</div>
		<${SlideSource}>ext/glossary.js · every entry names its source</${SlideSource}>
	</${Stage}>`
}
