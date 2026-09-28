// "Inside this agent": a button on each component step of the live trace that opens a scrollable
// panel with what the component actually did in the traced run: the exact prompts and responses of
// its LLM calls (from the run's call log, via scripts/export_details.py → detailsData.js), and, for
// the deterministic components, the rules they apply (from packages/decomplab-agentic) with the
// run's recorded numbers. The panel is local to this viewer (it never writes to the document).
import { useEffect, useRef } from 'react'
import { useShared, useSharedScroll } from '../shared.js'
import { html, C, F, box } from '@pack/scenes/kit.js'
import { DETAILS as D } from './detailsData.js'

const K = {
	tool: { fill: '#fbeaf2', stroke: '#c0578e', label: 'Tool (deterministic)' },
	llm: { fill: '#e4f4ec', stroke: '#2e9e6e', label: 'LLM' },
	hybrid: { fill: '#e4eefa', stroke: '#2f6fb5', label: 'Hybrid (tool + LLM)' },
	plain: { fill: '#fffdf8', stroke: '#6f675c', label: 'Controller (deterministic)' },
}
const n = (v) => v.toLocaleString('en-US')
const f1 = (v) => (v == null ? '—' : v.toFixed(1))
const sgn = (v) => (v == null ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(1)}`)
const SEC = (s) => (s / 1000).toFixed(1)

// ------------------------------------------------------------------ building blocks
const P = (s, extra) => html`<p style=${{ fontFamily: F.sans, fontSize: 22, lineHeight: 1.45, margin: '0 0 14px', color: C.ink, ...extra }}>${s}</p>`
const H = (s) => html`<div style=${{ fontFamily: F.sans, fontSize: 20, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: C.dim, margin: '22px 0 10px' }}>${s}</div>`
const Code = (s) => html`<code style=${{ fontFamily: F.mono, fontSize: 19, background: C.paper2, padding: '1px 6px', borderRadius: 5 }}>${s}</code>`
function Steps(items) {
	return html`<ol style=${{ margin: '0 0 8px', paddingLeft: 34, fontFamily: F.sans, fontSize: 22, lineHeight: 1.45, color: C.ink }}>
		${items.map((it, i) => html`<li key=${i} style=${{ marginBottom: 10 }}>${it}</li>`)}</ol>`
}
function Bullets(items) {
	return html`<ul style=${{ margin: '0 0 8px', paddingLeft: 30, fontFamily: F.sans, fontSize: 21, lineHeight: 1.45, color: C.ink }}>
		${items.map((it, i) => html`<li key=${i} style=${{ marginBottom: 6 }}>${it}</li>`)}</ul>`
}
const Note = (s, color = C.amber) => html`<div style=${{ margin: '12px 0 16px', padding: '12px 16px', border: `2px dashed ${color}`, borderRadius: 12, fontFamily: F.sans, fontSize: 20, lineHeight: 1.45, color: C.ink }}>${s}</div>`
function Table(head, rows, { hi } = {}) {
	return html`<table style=${{ borderCollapse: 'collapse', fontFamily: F.sans, fontSize: 19, width: '100%', margin: '4px 0 12px' }}>
		<thead><tr>${head.map((h, i) => html`<th key=${i} style=${{ textAlign: i ? 'right' : 'left', color: C.dim, fontWeight: 600, padding: '6px 10px', borderBottom: `2px solid ${C.line}` }}>${h}</th>`)}</tr></thead>
		<tbody>${rows.map((r, j) => html`<tr key=${j} style=${{ background: hi && hi(j) ? C.redGlow : 'transparent' }}>
			${r.map((c, i) => html`<td key=${i} style=${{ textAlign: i ? 'right' : 'left', padding: '6px 10px', borderBottom: `1px solid ${C.line}`, fontFamily: i === 0 ? F.mono : F.sans, fontSize: i === 0 ? 17 : 19 }}>${c}</td>`)}</tr>`)}</tbody>
	</table>`
}
function Pre(text) {
	return html`<pre style=${{ margin: 0, padding: '18px 20px', background: '#fffdf8', border: `2px solid ${C.line}`, borderRadius: 12, fontFamily: F.mono, fontSize: 17, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: C.ink, userSelect: 'text' }}>${text}</pre>`
}
// A prompt whose pasted source code is folded into one placeholder block (click to expand).
function CollapsedPrompt({ c }) {
	const [open, setOpen] = useShared(`trace:fold:${c.collapse.start}:${c.collapse.chars}`, false)
	const { start, end, slot, files, chars, whole } = c.collapse
	const what = whole ? `all ${files} Java files of the scoped source, concatenated` : `the first ${n(chars)} characters of the concatenated source (${files} Java files begin in it)`
	const pre = { margin: 0, fontFamily: F.mono, fontSize: 17, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: C.ink, userSelect: 'text' }
	return html`<div style=${{ padding: '18px 20px', background: '#fffdf8', border: `2px solid ${C.line}`, borderRadius: 12 }}>
		<pre style=${pre}>${c.user.slice(0, start)}</pre>
		<button type="button" onClick=${(e) => { e.stopPropagation(); setOpen(!open) }}
			style=${{ display: 'block', width: '100%', textAlign: 'left', margin: '6px 0', padding: '12px 16px', cursor: 'pointer', borderRadius: 10,
				border: `2px dashed ${C.red}`, background: C.redGlow, fontFamily: F.mono, fontSize: 18, color: C.ink }}>
			<b>${slot}</b> · ${what} · ${n(chars)} characters, sent in full · ${open ? '▾ click to fold' : '▸ click to show'}</button>
		${open && html`<pre style=${{ ...pre, borderLeft: `4px solid ${C.red}55`, paddingLeft: 14 }}>${c.user.slice(start, end)}</pre>`}
		<pre style=${pre}>${c.user.slice(end)}</pre>
	</div>`
}

function CallMeta(c) {
	return html`<div style=${{ fontFamily: F.sans, fontSize: 19, color: C.dim, marginBottom: 12 }}>
		${n(c.input_tokens)} input + ${n(c.output_tokens)} output = <b style=${{ color: C.ink }}>${n(c.total_tokens)} tokens</b> · ${SEC(c.latency_ms)} s ·
		temperature ${D.decoding.temperature} · max ${n(D.decoding.maxTokens)} output tokens · reasoning ${D.decoding.think ? 'on' : 'off'} · seed ${D.decoding.seed}</div>`
}
const promptSec = (id, label, c, part, intro) => ({
	id, label, render: () => html`<div>
		${CallMeta(c)}
		${intro && P(intro, { fontSize: 20, color: C.dim })}
		${part === 'user' && P(c.user.length === c.recordedUserChars ? `Complete prompt as sent: ${n(c.user.length)} characters.` : `Complete prompt as sent (${n(c.recordedUserChars)} characters), with the local path prefix shortened to <scope>/ in the file headers.`, { fontSize: 19, color: C.dim })}
		${part === 'user' && c.collapse ? html`<${CollapsedPrompt} c=${c} />` : Pre(c[part])}</div>`,
})
const REPLAY = Note(html`Recorded call. The traced v1b run replayed its three LLM stages from run ${Code(D.replaySource)}
	(same prompts; only selection and refinement differ), so these are that run's calls, copied from its ${Code('raw/llm-calls.jsonl')}.
	The local path prefix of the scoped source is shortened to ${Code('<scope>/')}.`, C.faint)

// ------------------------------------------------------------------ the components
const [EV, DOM, G1, G2, G3] = D.calls
const O = D.objectives
const W = O.CMod + O.CiD + O.migration_feasibility

const COMPONENTS = {
	ev: {
		kind: 'hybrid', title: 'Architectural Evidence Constructor',
		code: 'agents/evidence_constructor.py · evidence/llm_views.py · prompts/evidence_views.md',
		sections: [
			{ id: 'inside', label: 'What happens inside', render: () => html`<div>
				${P('Builds one evidence pack that every later agent reads: observed facts from code, plus LLM-written architectural views.')}
				${H('Deterministic part')}
				${Steps([
					html`Walks the scoped source: ${D.sourceFiles} Java files.`,
					html`Loads the static dependency graph (view A6) and gives every class a stable ID (${Code('C001')}, …) and every edge an ID; 23 classes, 49 typed edges.`,
					html`Summarises the source with ${Code('80k_concat')}: concatenates the files, each under a ${Code('// ─── path ───')} header, cut at 80,000 × 4 characters. No LLM call. Here all ${D.sourceFiles} files fit: ${n(D.summaryChars)} characters.`,
				])}
				${H('LLM part · 1 call')}
				${Steps([
					html`Fills the template ${Code('evidence_views.md')}: ${Code('<<SYSTEM>>')}, ${Code('<<KNOWN_CLASSES>>')} (the class list), ${Code('<<SOURCE_SUMMARY>>')} (the concatenated source).`,
					'Asks for views A1–A5 in one JSON object: component diagram, components, API endpoints, technology map, interaction scenarios, persistence entities.',
					'Parses the JSON (code fences and stray prose are tolerated), gives IDs to components, endpoints and scenarios, and validates the pack against its schema before writing evidence-pack.json.',
				])}
				${P(html`Result: 6 components, 17 endpoints, 6 persistence entities, 7 scenarios · ${n(EV.total_tokens)} tokens.`, { fontWeight: 600 })}`,
			},
			promptSec('sys', 'System prompt', EV, 'system'),
			promptSec('user', 'User prompt', EV, 'user'),
			promptSec('resp', 'Response', EV, 'response'),
		],
	},
	dom: {
		kind: 'llm', title: 'Domain Knowledge Extractor',
		code: 'agents/domain_extractor.py · prompts/domain_extractor.md',
		sections: [
			{ id: 'inside', label: 'What happens inside', render: () => html`<div>
				${P('Proposes business capabilities and maps every class to one of them. The map is a hypothesis that guides the generator, never ground truth.')}
				${Steps([
					html`Fills ${Code('domain_extractor.md')} from the evidence pack: counts, technology, the components, up to 80 endpoints, the persistence entities, every class as ${Code('ID | name | package | stereotypes')}, and the first 8,000 characters of the source summary.`,
					'One LLM call returns business capabilities, bounded-context hypotheses and a class → capability matrix.',
					'Normalisation in code: classes not in the inventory are dropped; confidences are clipped to [0, 1] (0.5 if missing); only known evidence labels or IDs are kept; exactly one matrix row per class, filled from the capabilities where the model left gaps.',
					'Validates the domain model against its schema and writes domain-model.json and a class-capability CSV.',
				])}
				${P(html`Result: 6 capabilities, one per class for all 23 classes, confidences 0.6–0.95 · ${n(DOM.total_tokens)} tokens.`, { fontWeight: 600 })}
				${Note(html`The template still opens with the notice “TEMPORARY PLACEHOLDER — NOT YET CONCRETIZED”, and that notice was sent to the model as part of the prompt (see the user prompt).`)}`,
			},
			promptSec('sys', 'System prompt', DOM, 'system'),
			promptSec('user', 'User prompt', DOM, 'user'),
			promptSec('resp', 'Response', DOM, 'response'),
		],
	},
	gen: {
		kind: 'llm', title: 'Decomposition Generator',
		code: 'agents/decomposition_generator.py · prompts/generator_*.md',
		sections: [
			{ id: 'inside', label: 'What happens inside', render: () => html`<div>
				${P('Three independent calls with the same evidence and different instructions, one candidate each.')}
				${Steps([
					html`Strategies rotate ${Code('dependency_first')} → ${Code('domain_first')} → ${Code('balanced')}; each call is ${Code('generator_common.md')} with that strategy's directive pasted in.`,
					html`The prompt carries the components, persistence entities, up to 200 dependency edges (heaviest first), up to 80 endpoints, the capabilities, the class → capability matrix, every class, and the bounds: at least ${D.constraints.min_services} services, no maximum.`,
					html`Up to 2 attempts per candidate: if the JSON does not parse or fails the schema, the same prompt is sent again with “Your previous response failed validation: …  Reply with ONLY the corrected JSON object”. Here every candidate passed on the first attempt.`,
					html`Repair in code: duplicate or unknown classes are dropped, any class left out goes to a catch-all ${Code('UnassignedService')} (so every class is assigned exactly once), dependencies on non-existent services are removed, and evidence references must be known IDs. Here each response already listed all 23 classes exactly once, so no class went to the catch-all.`,
				])}
				${P(html`Result: dependency-first 4 services; domain-first and balanced the same 6 services · ${n(G1.total_tokens + G2.total_tokens + G3.total_tokens)} tokens in 3 calls.`, { fontWeight: 600 })}`,
			},
			promptSec('sys', 'System prompt', G1, 'system', 'The same system prompt for all three calls.'),
			promptSec('p1', 'Prompt · dependency-first', G1, 'user'),
			promptSec('r1', 'Response · dependency-first', G1, 'response'),
			promptSec('p2', 'Prompt · domain-first', G2, 'user'),
			promptSec('r2', 'Response · domain-first', G2, 'response'),
			promptSec('p3', 'Prompt · balanced', G3, 'user'),
			promptSec('r3', 'Response · balanced', G3, 'response'),
		],
	},
	evl: {
		kind: 'tool', title: 'Decomposition Evaluator',
		code: 'agents/decomposition_evaluator.py · metrics/quality_gate.py',
		sections: [
			{ id: 'inside', label: 'What happens inside', render: () => html`<div>
				${P('No LLM. Every candidate is measured, gated and scored without any reference information.')}
				${Steps([
					html`Online metrics from the metric engine in ${Code('online')} mode (structural metrics only; the reference is not in its workspace), plus migration feasibility MF = 100·(1 − 0.6·s${html`<sub>max</sub>`} − 0.4·s${html`<sub>1</sub>`}).`,
					html`A guard (${Code('assert_allowed_online')}) refuses any reference metric, such as C2C, as an objective or online metric.`,
					'The quality gate checks the candidate (next tab); a failed gate halves the score and the candidate is rejected.',
					html`Score = (${O.CMod}·CMod + ${O.CiD}·CiD + ${O.migration_feasibility}·MF) / ${W.toFixed(1)}. The highest score is selected (ties: candidate ID).`,
					'Domain agreement (V-measure against the capability map) is computed and recorded, but not scored: it would reward a candidate for following its own recipe.',
					'Diagnostics (low CMod or CiD, oversized service, …) are recorded with each candidate.',
				])}`,
			},
			{ id: 'gate', label: 'Quality gate', render: () => html`<div>
				${H('Blocking checks (all must pass)')}
				${Bullets(['every inventory class is assigned', 'no class in two services', 'no empty service', 'unique service names', 'simple class names only', 'no self-dependency', 'every dependency target exists', 'every service has a responsibility or rationale', 'every service cites evidence', 'every cited evidence ID exists', html`service count within bounds (≥ ${D.constraints.min_services})`])}
				${H('Warnings (recorded, not blocking)')}
				${Bullets(['cyclic service dependencies', 'orphan classes'])}
				${P('All three candidates passed.', { fontWeight: 600 })}`,
			},
			{ id: 'scores', label: 'Scores in this run', render: () => html`<div>
				${Table(['candidate', 'CMod', 'CiD', 'MF', 'score', 'V-measure (not scored)'],
					D.candidates.map((c) => [c.id, f1(c.metrics.CMod), f1(c.metrics.CiD), f1(c.metrics.migration_feasibility), c.score.toFixed(1), f1(c.metrics.domain_v_measure)]),
					{ hi: (j) => j === 0 })}
				${P('CAND_001 = dependency-first, CAND_002 = domain-first, CAND_003 = balanced. Selected: CAND_001.', { fontSize: 20, color: C.dim })}
				${H('Recorded diagnostics')}
				${Bullets(D.candidates.map((c) => html`${Code(c.id)} ${c.diagnostics.join('; ')}`))}`,
			},
		],
	},
	ref: {
		kind: 'tool', title: 'Decomposition Refiner',
		code: 'agents/local_search_refiner.py (ConfiguredObjectiveRefinerAgent) · agents/process_controller.py',
		sections: [
			{ id: 'inside', label: 'What happens inside', render: () => html`<div>
				${P('No LLM. A bounded local search over single-class moves.')}
				${Steps([
					html`Proposes moves of two kinds: <b>cross-service dependency boundary</b> (a class with a dependency edge into another service moves there; priority = summed edge weight) and <b>capability majority</b> (a class moves to the service holding most classes of its capability; priority = 2 × that count). A class never leaves a one-class service.`,
					'Keeps the 12 highest-priority moves and evaluates each resulting neighbour with the same evaluator.',
					html`Accepts a move only if it is a strict Pareto improvement on CMod, CiD and MF (nothing worse by more than 10${html`<sup>−6</sup>`}, something better) and the neighbour passes the gate; among those, the largest total gain wins.`,
					html`The controller repeats this up to ${D.maxRounds} rounds and stops at the first round without an accepted move (${Code(D.stoppingReason)}).`,
				])}
				${H('This run')}
				${Table(['round', 'moved', 'CMod', 'CiD', 'MF', 'score'],
					D.rounds.map((r, i) => {
						const next = D.rounds[i + 1]?.parent
						return [`round ${r.round}`, r.selected ?? '— (stop)', next ? `${f1(r.parent.CMod)} → ${f1(next.CMod)}` : f1(r.parent.CMod), f1(r.parent.CiD), next ? `${f1(r.parent.migration_feasibility)} → ${f1(next.migration_feasibility)}` : f1(r.parent.migration_feasibility), D.refinementHistory[i].online_score.toFixed(1)]
					}))}`,
			},
			...D.rounds.map((r) => ({
				id: `round${r.round}`, label: `Round ${r.round} · all 12 moves`, render: () => html`<div>
					${P(r.selected ? html`Accepted: move <b>${r.selected}</b>. Highlighted: the accepted move.` : 'No move is a strict Pareto improvement, so the search stops.', { fontSize: 20 })}
					${Table(['class', 'from → to', 'why proposed', 'ΔCMod', 'ΔCiD', 'ΔMF', 'Pareto'],
						r.neighbors.map((x) => [x.cls, `${x.from.replace('Service', '')} → ${x.to.replace('Service', '')}`, x.reason.replace(' boundary', ''), sgn(x.gains.CMod), sgn(x.gains.CiD), sgn(x.gains.migration_feasibility), x.pareto ? '✓' : '✗']),
						{ hi: (j) => r.selected && r.neighbors[j].cls === r.selected && r.neighbors[j].to === r.selectedTo })}</div>`,
			})),
		],
	},
	ctl: {
		kind: 'plain', title: 'Process Controller · freeze',
		code: 'agents/process_controller.py',
		sections: [
			{ id: 'inside', label: 'What happens inside', render: () => html`<div>
				${P('Deterministic orchestration: it runs the stages in a fixed order, validates every artifact at each boundary, and freezes the answer before any reference is read.')}
				${Steps([
					'Evidence → domain → generator → evaluator (select one candidate).',
					html`Refinement loop: refiner, then the evaluator on the refined candidate; kept only if it improves, up to ${D.maxRounds} rounds.`,
					'Final quality gate on the selected candidate, then the decomposition is written to output/decomposition.json: this is the freeze.',
					'Only then the blinded evaluation, a canonical validation against the class inventory, final-output.json, and a run manifest with content hashes.',
				])}
				${H('This run')}
				${Bullets([
					html`Stages replayed from ${Code(D.replaySource)}: evidence, domain, generator; their artifacts are pinned by SHA-256 in ${Code('input/replay-source.json')}.`,
					html`${D.refinementHistory.length} refinement rounds, ${D.refinementHistory.filter((r) => r.accepted).length} accepted; stop: ${Code(D.stoppingReason)}.`,
					'4 services, 23/23 classes, each exactly once.',
				])}`,
			},
		],
	},
	bl: {
		kind: 'tool', title: 'Blinded Evaluator',
		code: 'DecompositionEvaluatorAgent.evaluate_blinded · decomplab_metrics',
		sections: [
			{ id: 'inside', label: 'What happens inside', render: () => html`<div>
				${P('Runs once, on the frozen decomposition only. Its results never go back to any agent.')}
				${Steps([
					html`The metric engine runs in ${Code('blinded')} mode: only now is the hidden reference decomposition copied into its workspace.`,
					'Reference metrics (C2C coverage at 10/33/50 %) are computed next to the structural ones.',
					html`The report is written to ${Code('evaluation/blinded-report.json')}; status ${Code(D.blindedStatus)}.`,
				])}
				${H('Recorded metrics')}
				${Table(['metric', 'value'], [
					['C2C-10', f1(D.blinded['c2c_cvg 10%'])], ['C2C-33', f1(D.blinded['c2c_cvg 33%'])], ['C2C-50', f1(D.blinded['c2c_cvg 50%'])],
					['CMod', f1(D.blinded.CMod)], ['CiD', f1(D.blinded.CiD)], ['DTP', f1(D.blinded.DTP)],
					['DI', f1(D.blinded.DI)], ['BCP', f1(D.blinded.BCP)], ['services', String(D.blinded.partition_count)],
				])}`,
			},
		],
	},
}

// Which component each trace step shows, and which tab opens first.
export function detailFor(B) {
	if (B === 2) return ['ev', 'inside']
	if (B === 3) return ['dom', 'inside']
	if (B === 4) return ['gen', 'inside']
	if (B === 5) return ['evl', 'inside']
	if (B >= 6 && B <= 9) return ['ref', `round${B - 5}`]
	if (B === 10) return ['ctl', 'inside']
	if (B === 11) return ['bl', 'inside']
	return null
}

// ------------------------------------------------------------------ events
// The slide sits on a tldraw canvas: a click there means "next step", the wheel pans, keys navigate.
// Stop pointer events in React (the canvas handlers are React handlers), the wheel natively at the
// target (tldraw listens natively on its container), and keys in the capture phase on window.
const stop = (e) => e.stopPropagation()
const SHIELD = { onPointerDown: stop, onPointerUp: stop, onPointerMove: stop, onDoubleClick: stop, onTouchStart: stop, onTouchEnd: stop }

export function DetailsButton({ onOpen, still }) {
	return html`<button type="button" ...${SHIELD} onClick=${(e) => { e.stopPropagation(); onOpen() }}
		style=${{ ...box(1590, 96, 270, 46), pointerEvents: 'all', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
			fontFamily: F.sans, fontSize: 20, fontWeight: 600, color: C.red, background: '#fffdf8', border: `2.5px solid ${C.red}`, borderRadius: 999,
			boxShadow: '0 4px 12px rgba(214,69,51,0.18)', animation: still ? 'none' : 'aw-in 500ms ease 700ms both' }}>
		<span style=${{ fontSize: 22 }}>⌕</span> Inside this agent</button>`
}

export function DetailsPanel({ comp, tab, onClose }) {
	const c = COMPONENTS[comp]
	const [active, setActive] = useShared(`trace:tab:${comp}`, tab && c.sections.some((s) => s.id === tab) ? tab : c.sections[0].id)
	const rootRef = useRef(null)
	const scrollRef = useSharedScroll(`trace:${comp}`)

	useEffect(() => {
		const root = rootRef.current
		const onWheel = (e) => e.stopPropagation()
		root?.addEventListener('wheel', onWheel, { passive: true })
		const onKey = (e) => {
			if (e.ctrlKey || e.metaKey) return // copy etc.
			const el = scrollRef.current
			const page = el ? el.clientHeight * 0.85 : 0
			const by = { ArrowDown: 90, ArrowUp: -90, PageDown: page, ' ': page, PageUp: -page }[e.key]
			if (e.key === 'Escape') onClose()
			else if (el && by) el.scrollBy({ top: by, behavior: 'smooth' })
			else if (el && e.key === 'Home') el.scrollTop = 0
			else if (el && e.key === 'End') el.scrollTop = el.scrollHeight
			e.stopPropagation()
			e.preventDefault()
		}
		window.addEventListener('keydown', onKey, true)
		return () => {
			root?.removeEventListener('wheel', onWheel)
			window.removeEventListener('keydown', onKey, true)
		}
	}, [onClose])
	useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0 }, [active])

	const k = K[c.kind]
	const section = c.sections.find((s) => s.id === active)
	return html`<div ref=${rootRef} ...${SHIELD} onClick=${(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose() }}
		style=${{ ...box(0, 0, 1920, 1080), pointerEvents: 'all', zIndex: 50, background: 'rgba(43,38,33,0.38)', animation: 'aw-fade 250ms ease both' }}>
		<div style=${{ ...box(70, 44, 1780, 992), background: C.paper, borderRadius: 24, border: `3px solid ${k.stroke}`, boxShadow: '0 40px 80px rgba(40,25,10,0.35)', overflow: 'hidden', animation: 'aw-in 350ms ease both' }}>
			<div style=${{ ...box(0, 0, 1780, 104), background: k.fill, borderBottom: `2px solid ${k.stroke}55` }}>
				<div style=${{ position: 'absolute', left: 36, top: 14, fontFamily: F.sans, fontSize: 18, fontWeight: 700, color: k.stroke, letterSpacing: 0.5 }}>${k.label.toUpperCase()} · INSIDE THE COMPONENT</div>
				<div style=${{ position: 'absolute', left: 34, top: 36, fontFamily: F.hand, fontSize: 46, color: C.ink, whiteSpace: 'nowrap' }}>${c.title}</div>
				<div style=${{ position: 'absolute', right: 110, top: 22, width: 760, textAlign: 'right', fontFamily: F.mono, fontSize: 16, color: C.dim, lineHeight: 1.4 }}>${c.code}</div>
				<button type="button" onClick=${(e) => { e.stopPropagation(); onClose() }} title="Close"
					style=${{ position: 'absolute', right: 28, top: 24, width: 56, height: 56, borderRadius: 28, border: `2.5px solid ${C.ink}`, background: '#fffdf8', fontSize: 30, lineHeight: '50px', cursor: 'pointer', color: C.ink, padding: 0 }}>×</button>
			</div>
			<div style=${{ ...box(0, 104, 330, 888), borderRight: `2px solid ${C.line}`, padding: '20px 14px', boxSizing: 'border-box', overflowY: 'auto' }}>
				${c.sections.map((s) => html`<button key=${s.id} type="button" onClick=${(e) => { e.stopPropagation(); setActive(s.id) }}
					style=${{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 8, padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
						border: `2px solid ${s.id === active ? k.stroke : 'transparent'}`, background: s.id === active ? k.fill : 'transparent',
						fontFamily: F.sans, fontSize: 20, fontWeight: s.id === active ? 700 : 500, color: C.ink }}>${s.label}</button>`)}
				<div style=${{ marginTop: 18, padding: '0 8px', fontFamily: F.sans, fontSize: 16, lineHeight: 1.45, color: C.dim }}>
					Scroll with the wheel or ↑ ↓ / Page keys. × or a click outside closes.<br /><br />Run: ${D.run}</div>
			</div>
			<div ref=${scrollRef} style=${{ ...box(330, 104, 1450, 888), overflowY: 'auto', padding: '28px 44px 60px', boxSizing: 'border-box', userSelect: 'text', overscrollBehavior: 'contain' }}>
				${(c.kind === 'llm' || c.kind === 'hybrid') && active !== 'inside' && REPLAY}
				${section.render()}
			</div>
		</div>
		<style>${'@keyframes aw-fade { from { opacity: 0 } to { opacity: 1 } }'}</style>
	</div>`
}

// Owns the open/closed state for one trace step; closes itself when the step changes.
export function Details({ B, still }) {
	const target = detailFor(B)
	const [open, setOpen] = useShared('trace:open', null)
	useEffect(() => setOpen(null), [B])
	if (!target) return null
	return html`<div>
		<${DetailsButton} still=${still} onOpen=${() => setOpen(target)} />
		${open && html`<${DetailsPanel} comp=${open[0]} tab=${open[1]} onClose=${() => setOpen(null)} />`}
	</div>`
}
