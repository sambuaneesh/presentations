// Part IV · results (paper §V). Numbers come from the paper's tables (Tables X–XV) and, for
// drill-downs, from studies/final-benchmark-v1/analysis/final-benchmark-analysis.json.
import { useState } from 'react'
import { html, C, F, box, EASE, Stage, Term, Cite, Inside, SHIELD, P, H, List, Note, Code, Quote, Table, rich, reveal, SlideSource, Src } from '../ui.js'
import { TABLES, ANALYSIS, RQ_ANSWERS, PROSE } from '../data/results.js'

const ARM_COLOR = { '80k concat': '#6f675c', OpenCode: '#2f6fb5', Final: C.red }
const METRICS = ['CMod', 'CiD', 'DTP', 'DI', 'BCP', 'C2C-10', 'C2C-33', 'C2C-50']
const TERM = { CMod: 'cmod', CiD: 'cid', DTP: 'dtp', DI: 'di', BCP: 'bcp', 'C2C-10': 'c2c', 'C2C-33': 'c2c', 'C2C-50': 'c2c' }
const num = (s) => Number(String(s).replace(/[^0-9.\-]/g, ''))
const prose = (label, head) => (PROSE[label] ?? []).find((e) => e.head === head)?.text ?? ''
const Toggle = ({ options, value, onChange }) => html`<div style=${{ display: 'flex', gap: 8 }}>
	${options.map((o) => html`<button key=${o} type="button" ...${SHIELD} onClick=${(e) => { e.stopPropagation(); onChange(o) }}
		style=${{ pointerEvents: 'all', cursor: 'pointer', height: 44, padding: '0 18px', borderRadius: 999, border: `2.5px solid ${o === value ? C.red : C.ink}`, background: o === value ? C.red : '#fffdf8', color: o === value ? '#fff' : C.ink, fontFamily: F.sans, fontSize: 17, fontWeight: 600 }}>${o}</button>`)}</div>`
const Answer = ({ rq, still, on }) => html`<div style=${{ ...box(110, 905, 1700, 90), display: 'flex', gap: 18, alignItems: 'flex-start', padding: '10px 18px', border: `2.5px solid ${C.red}`, borderRadius: 16, background: '#fffdf8', boxSizing: 'border-box', ...reveal(on, still) }}>
	<div style=${{ fontFamily: F.hand, fontSize: 28, color: C.red, whiteSpace: 'nowrap' }}>${rq} answer</div>
	<div style=${{ fontFamily: F.sans, fontSize: 17, lineHeight: 1.4 }}>${rich(RQ_ANSWERS[rq])}</div></div>`

// ------------------------------------------------------------------ RQ1 · per model (Table X, Fig. 3)
// The paper's table names each model once (\multirow): carry it down to the model's other rows.
let lastModel = ''
const MAIN = TABLES.main.rows.map((r) => ({ model: (lastModel = r[0] || lastModel), arm: r[1], valid: r[2], v: r.slice(3, 11).map(num), services: num(r[11]), tokens: num(r[12]) }))
const MODELS = [...new Set(MAIN.map((r) => r.model))]
export function Rq1MainScene({ b, still }) {
	const B = still ? 1 : b
	const [model, setModel] = useState(MODELS[0])
	const rows = MAIN.filter((r) => r.model === model)
	const best = METRICS.map((_, j) => Math.max(...rows.map((r) => r.v[j])))
	const drawer = {
		title: 'RQ1 in the paper\'s words', kicker: '§V-A',
		tabs: [
			{ id: 'per', label: 'Design quality per model', render: () => P(rich(prose('sc:results-rq1', 'Design quality per model.'))) },
			{ id: 'table', label: 'Table X (all models)', render: () => html`<div>
				${Table(['model', 'arm', 'valid', ...METRICS, 'services', 'tokens (k)'], TABLES.main.rows, { align: ['left', 'left', 'right'], size: 16 })}
				${P(rich(TABLES.main.caption), { fontSize: 16, color: C.dim })}</div>` },
			{ id: 'read', label: 'How to read it', render: () => html`<div>
				${List([html`higher is better for every metric (<${Term} k="design-metric">design</${Term}>: CMod … BCP; <${Term} k="similarity-metric">similarity</${Term}>: C2C)`, html`means over the four systems, valid observations only; OpenCode with gpt-oss has 2 of 4 valid, so its mean covers two systems`, html`look at the service count too: several design metrics favour <${Term} k="coarse">coarse partitions</${Term}>`, 'compare arms within a model only; never across models'])}</div>` },
		],
		source: 'Source: Table X, Fig. 3, §V-A.',
	}
	const X = 110, W = 1700
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(X, 240, W, 50), display: 'flex', alignItems: 'center', gap: 20 }}>
			<${Toggle} options=${MODELS} value=${model} onChange=${setModel} />
			<span style=${{ fontFamily: F.sans, fontSize: 16, color: C.dim }}>repetition 1 · mean over four systems</span></div>
		<div style=${{ ...box(X, 320, W, 36), display: 'flex', fontFamily: F.sans, fontSize: 17, fontWeight: 700, color: C.dim }}>
			<div style=${{ width: 250 }}>arm</div><div style=${{ width: 90, textAlign: 'right' }}>valid</div>
			${METRICS.map((m) => html`<div key=${m} style=${{ width: 130, textAlign: 'right' }}><${Term} k=${TERM[m]}>${m}</${Term}></div>`)}
			<div style=${{ width: 120, textAlign: 'right' }}>services</div></div>
		${rows.map((r, i) => html`<div key=${model + r.arm} style=${{ ...box(X, 362 + i * 70, W, 62), display: 'flex', alignItems: 'center', borderBottom: `1.5px solid ${C.line}`, animation: still ? 'none' : `tp-in 400ms ${EASE} ${i * 60}ms both` }}>
			<div style=${{ width: 250, fontFamily: F.hand, fontSize: 30, color: ARM_COLOR[r.arm] }}>${r.arm}</div>
			<div style=${{ width: 90, textAlign: 'right', fontFamily: F.sans, fontSize: 20, color: r.valid !== '4/4' ? C.red : C.ink }}>${r.valid}</div>
			${r.v.map((v, j) => html`<div key=${j} style=${{ width: 130, textAlign: 'right', fontFamily: F.sans, fontSize: 24, fontWeight: v === best[j] ? 800 : 400, color: v === best[j] ? C.ink : C.dim }}>${v.toFixed(1)}</div>`)}
			<div style=${{ width: 120, textAlign: 'right', fontFamily: F.sans, fontSize: 20, color: C.dim }}>${r.services.toFixed(1)}</div></div>`)}
		<div style=${{ ...box(X, 590, W, 280), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.sans, fontSize: 16, color: C.dim, marginBottom: 8 }}>design metrics as bars (Fig. 3) · bold above = best of the three arms</div>
			<div style=${{ display: 'flex', gap: 34, alignItems: 'flex-end', height: 230 }}>
				${METRICS.slice(0, 5).map((m, j) => html`<div key=${m} style=${{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<div style=${{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 190 }}>
						${rows.map((r) => html`<div key=${r.arm} title=${`${r.arm}: ${r.v[j]}`} style=${{ width: 60, height: `${(r.v[j] / 100) * 190}px`, background: ARM_COLOR[r.arm], opacity: 0.85, borderRadius: '8px 8px 0 0', transition: `height 600ms ${EASE}` }} />`)}</div>
					<div style=${{ fontFamily: F.sans, fontSize: 17, marginTop: 6 }}>${m}</div></div>`)}
				<div style=${{ fontFamily: F.sans, fontSize: 17, lineHeight: 1.8 }}>${Object.entries(ARM_COLOR).map(([a, c]) => html`<div key=${a}><span style=${{ display: 'inline-block', width: 16, height: 16, background: c, borderRadius: 4, marginRight: 8, verticalAlign: -2 }} />${a}</div>`)}</div>
			</div>
		</div>
		<${Answer} rq="RQ1" still=${still} on=${B >= 1} />
		<${Inside} x=${1560} y=${196} w=${300} label="RQ1 in detail" drawer=${drawer} still=${still} />
		<style>${`@keyframes tp-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }`}</style>
		<${SlideSource}>Table X · Fig. 3</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ RQ1 · paired comparison (Table XI)
export function Rq1PairedScene({ b, still }) {
	const [vs, setVs] = useState('vs 80k concat')
	const off = vs === 'vs 80k concat' ? 1 : 5
	const rows = TABLES.paired.rows.map((r) => ({ m: r[0], wtl: r[off].split('/').map(Number), d: num(r[off + 1]), p: num(r[off + 2]), delta: num(r[off + 3]) }))
	const drawer = {
		title: 'Reading the paired comparison', kicker: '§V-A',
		tabs: [
			{ id: 'paper', label: 'The paper\'s reading', render: () => P(rich(prose('sc:results-rq1', 'Paired comparison across models.'))) },
			{ id: 'cols', label: 'The columns', render: () => List([html`<b>W/T/L</b>: in how many of the 16 (model, system) cells the workflow was better, equal, worse (<${Term} k="win-tie-loss" />)`, html`<b>Δ</b>: mean difference, workflow minus the other arm`, html`<b>p</b>: two-sided <${Term} k="wilcoxon">Wilcoxon signed-rank</${Term}> test (<${Term} k="p-value" />)`, html`<b>δ</b>: <${Term} k="cliffs-delta">Cliff's δ</${Term}>, an <${Term} k="effect-size" />`]) },
			{ id: 'table', label: 'Table XI', render: () => html`<div>${Table(['metric', 'W/T/L', 'Δ', 'p', 'δ', 'W/T/L', 'Δ', 'p', 'δ'], TABLES.paired.rows, { size: 17 })}${P('Left four columns: vs 80k concat (16 pairs); right four: vs OpenCode (14 pairs with valid OpenCode output).', { fontSize: 17, color: C.dim })}</div>` },
		],
		source: 'Source: Table XI, §V-A; tools/analyze_final_benchmark.py.',
	}
	const X = 110, barW = 520
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(X, 240, 1300, 50), display: 'flex', alignItems: 'center', gap: 20 }}>
			<${Toggle} options=${['vs 80k concat', 'vs OpenCode']} value=${vs} onChange=${setVs} />
			<span style=${{ fontFamily: F.sans, fontSize: 16, color: C.dim }}>the workflow, paired by (model, system) cell · ${off === 1 ? '16' : '14'} pairs</span></div>
		<div style=${{ ...box(X, 310, 1700, 34), display: 'flex', fontFamily: F.sans, fontSize: 16, fontWeight: 700, color: C.dim }}>
			<div style=${{ width: 180 }}>metric</div><div style=${{ width: barW + 30 }}>win · tie · loss</div><div style=${{ width: 150, textAlign: 'right' }}>Δ</div><div style=${{ width: 150, textAlign: 'right' }}><${Term} k="p-value">p</${Term}></div><div style=${{ width: 150, textAlign: 'right' }}><${Term} k="cliffs-delta">δ</${Term}></div></div>
		${rows.map((r, i) => {
			const n = r.wtl.reduce((a, v) => a + v, 0)
			return html`<div key=${vs + r.m} style=${{ ...box(X, 350 + i * 66, 1700, 58), display: 'flex', alignItems: 'center', borderBottom: `1.5px solid ${C.line}`, animation: still ? 'none' : `tp-in 400ms ${EASE} ${i * 40}ms both` }}>
				<div style=${{ width: 180, fontFamily: F.hand, fontSize: 28 }}><${Term} k=${TERM[r.m]}>${r.m}</${Term}></div>
				<div style=${{ width: barW, height: 26, display: 'flex', borderRadius: 8, overflow: 'hidden', marginRight: 30 }}>
					${r.wtl.map((v, k) => html`<div key=${k} style=${{ width: `${(v / n) * 100}%`, background: [C.fix, C.paper2, C.red][k], opacity: k === 1 ? 1 : 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 15, fontWeight: 700, color: k === 1 ? C.dim : '#fff' }}>${v || ''}</div>`)}</div>
				<div style=${{ width: 150, textAlign: 'right', fontFamily: F.sans, fontSize: 24, fontWeight: 700, color: r.d > 0 ? C.fix : r.d < 0 ? C.red : C.dim }}>${r.d > 0 ? '+' : ''}${r.d.toFixed(2)}</div>
				<div style=${{ width: 150, textAlign: 'right', fontFamily: F.sans, fontSize: 22 }}>${r.p.toFixed(2)}</div>
				<div style=${{ width: 150, textAlign: 'right', fontFamily: F.sans, fontSize: 22, color: C.dim }}>${r.delta > 0 ? '+' : ''}${r.delta.toFixed(2)}</div></div>`
		})}
		<div style=${{ ...box(X, 890, 1700, 60), fontFamily: F.hand, fontSize: 30, textAlign: 'center' }}>No difference is significant (all p > 0.05), all effects small: <span style=${{ color: C.red }}>no evidence that either designs better</span> — not proof that they are equal</div>
		<${Inside} x=${1560} y=${196} w=${300} label="How to read it" drawer=${drawer} still=${still} />
		<style>${`@keyframes tp-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }`}</style>
		<${SlideSource}>Table XI · §V-A</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ RQ1 · tools and convergence (Table XII)
export function Rq1ToolsScene({ b, still }) {
	const B = still ? 1 : b
	const rows = TABLES.tools.rows.map((r) => ({ arm: r[0].replace('Final', 'Final'), v: r.slice(1).map(num) }))
	const colors = [C.faint, ARM_COLOR['80k concat'], ARM_COLOR.Final]
	const conv = ANALYSIS.convergence
	const tools = ANALYSIS.traditional_tools?.per_system ?? {}
	const drawer = {
		title: 'Tools and convergence', kicker: '§V-A',
		tabs: [
			{ id: 'tools', label: 'Traditional tools', render: () => html`<div>${P(rich(prose('sc:results-rq1', 'Traditional tools.')))}
				${Table(['', ...METRICS], TABLES.tools.rows, { size: 17 })}
				${P('Means over systems. The tool set varies by system: Log2MS produced decompositions only for JPetStore and Spring PetClinic. Tools that need a target number of services were given the reference\'s number, which favours them.', { fontSize: 17, color: C.dim })}</div>` },
			{ id: 'pertool', label: 'Each tool, each system', tabs: Object.entries(tools).map(([sys, ts]) => ({ id: sys, label: sys, render: () => Table(['tool', ...Object.keys(Object.values(ts)[0]).map((k) => k.replace('c2c_cvg ', 'C2C-').replace('%', ''))], Object.entries(ts).map(([t, m]) => [t, ...Object.values(m).map((v) => (v == null ? '—' : Number(v).toFixed(1)))]), { size: 16 }) })), render: () => P('From the benchmark\'s published tool outputs, re-scored with the same metric code.', { fontSize: 18, color: C.dim }) },
			{ id: 'conv', label: 'Convergence', render: () => html`<div>${P(rich(prose('sc:results-rq1', 'Convergence.')))}
				${Table(['system', 'distinct partitions (all arms, all models)', '80k across models', 'workflow across models', 'workflow = 80k (same model)'], Object.entries(conv).map(([s, c]) => [s, String(c.unique_partitions_all_arms_models), String(c['80k_unique_across_models']), String(c.final_unique_across_models), String(c.final_equals_80k_same_model.length)]), { size: 17 })}</div>` },
		],
		source: 'Source: Table XII, §V-A; analysis/final-benchmark-analysis.json (convergence, traditional_tools).',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 240, 1100, 40), fontFamily: F.sans, fontSize: 17, color: C.dim }}>means over systems · traditional tools as measured by the benchmark <${Cite} k="wang2024comparison" /></div>
		<div style=${{ ...box(110, 300, 1100, 520), display: 'flex', gap: 22, alignItems: 'flex-end' }}>
			${METRICS.map((m, j) => html`<div key=${m} style=${{ width: 116, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<div style=${{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 420 }}>
					${rows.map((r, i) => html`<div key=${r.arm} style=${{ width: 32, height: `${(r.v[j] / 100) * 420}px`, background: colors[i], borderRadius: '6px 6px 0 0', opacity: 0.9, position: 'relative' }}>
						<div style=${{ position: 'absolute', top: -18, left: -1, right: -1, textAlign: 'center', fontFamily: F.sans, fontSize: 11, color: C.dim }}>${r.v[j].toFixed(0)}</div></div>`)}</div>
				<div style=${{ fontFamily: F.sans, fontSize: 16, marginTop: 6 }}><${Term} k=${TERM[m]}>${m}</${Term}></div></div>`)}
		</div>
		<div style=${{ ...box(110, 840, 1100, 40), display: 'flex', gap: 26, fontFamily: F.sans, fontSize: 17 }}>${rows.map((r, i) => html`<span key=${r.arm}><span style=${{ display: 'inline-block', width: 16, height: 16, background: colors[i], borderRadius: 4, marginRight: 8, verticalAlign: -2 }} />${r.arm}</span>`)}</div>
		<div style=${{ ...box(1270, 280, 540, 600), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 34, color: C.red }}>models converge</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, lineHeight: 1.5, marginTop: 10 }}>On JPetStore and PartsUnlimited, 80k concat returned the <b>identical</b> partition for all four models; GLM-5.2 and gpt-oss:120b gave identical 80k partitions on all four systems.</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, lineHeight: 1.5, marginTop: 14 }}>The workflow never reproduced the 80k partition of the same model (0 of 16 cells).</div>
			<div style=${{ fontFamily: F.hand, fontSize: 28, marginTop: 18, color: C.dim }}>a strong shared prior about well-known systems</div>
		</div>
		<${Inside} x=${1560} y=${196} w=${300} label="Tools, convergence" drawer=${drawer} still=${still} />
		<${SlideSource}>Table XII · §V-A</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ RQ2 · validity and stability (Tables XIII, XIV)
export function Rq2Scene({ b, still }) {
	const B = still ? 2 : b
	const val = TABLES.validity.rows
	const stab = TABLES.stability.rows
	const drawer = {
		title: 'RQ2 in the paper\'s words', kicker: '§V-B',
		tabs: [
			{ id: 'validity', label: 'Validity', render: () => P(rich(prose('sc:results-rq2', 'Validity.'))) },
			{ id: 'why', label: 'Why always valid', render: () => P(rich(prose('sc:results-rq2', 'Why the workflow was always valid.'))) },
			{ id: 'stability', label: 'Stability', render: () => html`<div>${P(rich(prose('sc:results-rq2', 'Stability.')))}
				${Table(['arm', 'Demo', 'JPet', 'Parts', 'PetCl', 'mean', 'NVI'], stab, { size: 18 })}${P(rich(TABLES.stability.caption), { fontSize: 16, color: C.dim })}</div>` },
		],
		source: 'Source: Tables XIII–XIV, §V-B.',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 245, 760, 50), fontFamily: F.hand, fontSize: 32 }}><${Term} k="validity">valid</${Term}> decompositions</div>
		${val.map((r, i) => {
			const [v, n] = r[2].split('/').map(Number)
			return html`<div key=${r[0]} style=${{ ...box(110, 310 + i * 86, 760, 76), display: 'flex', alignItems: 'center', gap: 16 }}>
				<div style=${{ width: 200, fontFamily: F.hand, fontSize: 30, color: ARM_COLOR[r[0]] ?? C.ink }}>${r[0]}</div>
				<div style=${{ display: 'flex', flexWrap: 'wrap', gap: 3, width: 400 }}>${Array.from({ length: n }, (_, k) => html`<div key=${k} style=${{ width: 20, height: 20, borderRadius: 4, background: k < v ? (ARM_COLOR[r[0]] ?? C.ink) : 'transparent', border: k < v ? 'none' : `2.5px solid ${C.red}`, opacity: 0.85, boxSizing: 'border-box' }} />`)}</div>
				<div style=${{ fontFamily: F.sans, fontSize: 24, fontWeight: 700 }}>${r[2]}</div></div>`
		})}
		<div style=${{ ...box(110, 580, 760, 280), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 30, color: C.red }}>OpenCode's two failures (gpt-oss:120b)</div>
			${List(['PartsUnlimited: all 53 classes in a single service', 'Spring PetClinic: omitted BaseEntity, NamedEntity and Person'], { size: 21 })}
			<div style=${{ fontFamily: F.sans, fontSize: 19, color: C.dim }}>genuine violations of the output contract, not infrastructure failures</div>
			<div style=${{ fontFamily: F.sans, fontSize: 19, marginTop: 14, lineHeight: 1.45 }}>The workflow is complete <${Term} k="repair">by construction</${Term}>. Repair was not needed here (0 of 48 raw candidates invalid), but in the smaller-model pilot 3 of 12 were, and were repaired.</div>
		</div>
		<div style=${{ ...box(960, 245, 850, 620), ...reveal(B >= 2, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 32 }}>stability: 5 DeepSeek repetitions</div>
			<div style=${{ fontFamily: F.sans, fontSize: 17, color: C.dim, margin: '4px 0 18px' }}>distinct partitions per system (of 5) · mean pairwise <${Term} k="nvi">NVI</${Term}> (0 = identical)</div>
			${Table(['arm', 'Demo', 'JPet', 'Parts', 'PetCl', 'mean', 'NVI'], stab, { size: 22 })}
			<div style=${{ fontFamily: F.hand, fontSize: 30, marginTop: 16 }}>No arm is stable. Several candidates plus refinement does not, by itself, make the outcome repeatable.</div>
		</div>
		<${Answer} rq="RQ2" still=${still} on=${B >= 2} />
		<${Inside} x=${1560} y=${196} w=${300} label="RQ2 in detail" drawer=${drawer} still=${still} />
		<${SlideSource}>Tables XIII–XIV · §V-B</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ RQ3 · cost (Fig. 4)
export function Rq3Scene({ b, still }) {
	const B = still ? 2 : b
	const st = ANALYSIS.tokens_agentic_stage_breakdown
	const shares = [['evidence', st.evidence.share], ['domain', st.domain.share], ['3 candidates', st.candidate_generation.share]]
	const max = Math.max(...MAIN.map((r) => r.tokens))
	const drawer = {
		title: 'RQ3 in the paper\'s words', kicker: '§V-C',
		tabs: [
			{ id: 'tokens', label: 'Tokens per system', render: () => P(rich(prose('sc:results-rq3', 'Tokens per system.'))) },
			{ id: 'where', label: 'Where the workflow spends', render: () => html`<div>${P(rich(prose('sc:results-rq3', 'Where the workflow spends tokens.')))}
				${Table(['stage', 'mean tokens per run', 'share'], [['evidence', st.evidence.mean_tokens, st.evidence.share], ['domain', st.domain.mean_tokens, st.domain.share], ['candidate generation', st.candidate_generation.mean_tokens, st.candidate_generation.share]].map(([a, t, s]) => [a, t.toLocaleString('en-US'), `${(s * 100).toFixed(1)} %`]))}
				${P(`Over the ${st.evidence.n_runs} fresh runs (gpt-oss:120b and gemma4:31b); selection, refinement and evaluation make no LLM calls.`, { fontSize: 17, color: C.dim })}</div>` },
		],
		source: 'Source: Fig. 4, §V-C; analysis/final-benchmark-analysis.json (tokens_agentic_stage_breakdown).',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 240, 1100, 40), fontFamily: F.sans, fontSize: 17, color: C.dim }}><${Term} k="token">tokens</${Term}> per system (thousands) · repetition 1 · accepted session of each run</div>
		${MODELS.map((m, i) => html`<div key=${m} style=${{ ...box(110, 292 + i * 150, 1100, 145) }}>
			<div style=${{ fontFamily: F.sans, fontSize: 18, fontWeight: 600, marginBottom: 4 }}>${m}</div>
			${MAIN.filter((r) => r.model === m).map((r) => html`<div key=${r.arm} style=${{ display: 'flex', alignItems: 'center', gap: 12, height: 32 }}>
				<div style=${{ width: 120, fontFamily: F.sans, fontSize: 15, color: C.dim }}>${r.arm}</div>
				<div style=${{ width: `${(r.tokens / max) * 800}px`, height: 20, background: ARM_COLOR[r.arm], opacity: 0.85, borderRadius: 6, ...reveal(true, still, { delay: 60 * i }) }} />
				<div style=${{ fontFamily: F.sans, fontSize: 16, fontWeight: 700 }}>${r.tokens.toFixed(1)}</div></div>`)}</div>`)}
		<div style=${{ ...box(1270, 260, 540, 330), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 60, color: C.red, lineHeight: 1 }}>−31.9 %</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, lineHeight: 1.5, marginTop: 8 }}>vs 80k concat: 53,724 vs 78,911 tokens per system, cheaper in all 16 cells (<${Term} k="wilcoxon">Wilcoxon</${Term}> p = 3.1 × 10⁻⁵)</div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, lineHeight: 1.45, marginTop: 10 }}>vs OpenCode: cheaper in 13 of 14 cells (p = 0.0004). gpt-oss:120b's OpenCode also abandoned retry sessions worth 139,394 tokens, not counted above.</div>
		</div>
		<div style=${{ ...box(1270, 610, 540, 280), ...reveal(B >= 2, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 30 }}>where the workflow spends</div>
			<div style=${{ display: 'flex', height: 44, borderRadius: 10, overflow: 'hidden', marginTop: 12 }}>
				${shares.map(([l, s], i) => html`<div key=${l} style=${{ width: `${s * 100}%`, background: [C.blue, '#2e9e6e', C.red][i], opacity: 0.8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 17, fontWeight: 700 }}>${Math.round(s * 100)} %</div>`)}</div>
			<div style=${{ display: 'flex', marginTop: 6 }}>${shares.map(([l, s]) => html`<div key=${l} style=${{ width: `${s * 100}%`, textAlign: 'center', fontFamily: F.sans, fontSize: 16, color: C.dim }}>${l}</div>`)}</div>
			<div style=${{ fontFamily: F.sans, fontSize: 17, color: C.dim, marginTop: 12, lineHeight: 1.45 }}>selection, refinement and evaluation: 0 tokens (no LLM calls)</div>
		</div>
		<${Answer} rq="RQ3" still=${still} on=${B >= 2} />
		<${Inside} x=${1560} y=${196} w=${300} label="RQ3 in detail" drawer=${drawer} still=${still} />
		<${SlideSource}>Fig. 4 · §V-C</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ RQ4 · the self-referential ablation (Table XV, Fig. 5)
export function Rq4Scene({ b, still }) {
	const B = still ? 2 : b
	const rows = TABLES.ablation.rows.filter((r) => r[0] !== 'Services').map((r) => ({ m: r[0], d: num(r[1]), wl: r[2], p: r[3] === '–' ? null : num(r[3]) }))
	const max = 16
	const drawer = {
		title: 'The ablation, explained', kicker: '§V-D',
		tabs: [
			{ id: 'paper', label: 'The paper\'s words', render: () => P(rich(prose('sc:results-rq4', 'Self-referential scoring.'))) },
			{ id: 'why', label: 'Why it is a clean test', render: () => html`<div>
				${P(html`The earlier version scored candidates partly by <${Term} k="v-measure" /> against the capability map (weight 0.3). The domain-first candidate is generated from that map, so it agrees with it almost by construction and tends to win whatever its structure: <${Term} k="self-referential" />, like <${Term} k="reward-hacking" /> <${Cite} k="pan2024rewardhacking" />.`)}
				${P('Both versions use identical LLM outputs (replayed), so any difference comes from selection and refinement alone: a paired ablation.')}</div>` },
			{ id: 'stats', label: 'Multiple comparisons', render: () => html`<div>
				${P(html`Eight metrics are tested. With a <${Term} k="bonferroni">Bonferroni correction</${Term}> (α / 8 = 0.00625), the CMod and DI effects stay significant and the C2C-50 effect does not.`)}
				${Note('Two caveats: the ablation uses development data only (DeepSeek repetitions 1–5 and GLM-5.2), and the analysis was prompted by a blinded outcome (E8), so the effect size may be optimistic.')}</div>` },
			{ id: 'table', label: 'Table XV', render: () => html`<div>${Table(['metric', 'Δ', 'W/L', 'p'], TABLES.ablation.rows, { size: 18 })}${P(rich(TABLES.ablation.caption), { fontSize: 16, color: C.dim })}</div>` },
		],
		source: 'Source: Table XV, Fig. 5, §V-D.',
	}
	const X0 = 660, unit = 30
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 240, 1300, 40), fontFamily: F.sans, fontSize: 17, color: C.dim }}>final workflow minus the version that also scored <${Term} k="v-measure" /> · identical LLM outputs · 24 pairs</div>
		<svg width="1920" height="1080" style=${{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}><line x1=${X0} y1="300" x2=${X0} y2="850" stroke=${C.ink} strokeWidth="2" /></svg>
		${rows.map((r, i) => {
			const sig = r.p != null && r.p < 0.05
			const w = Math.abs(r.d) * unit
			return html`<div key=${r.m} style=${{ ...box(110, 305 + i * 66, 1700, 58), display: 'flex', alignItems: 'center' }}>
				<div style=${{ width: 200, fontFamily: F.hand, fontSize: 28 }}><${Term} k=${TERM[r.m] ?? 'cmod'}>${r.m}</${Term}></div>
				<div style=${{ position: 'absolute', left: r.d >= 0 ? X0 - 110 : X0 - 110 - w, width: w, height: 30, top: 14, background: r.d >= 0 ? C.fix : C.red, opacity: sig ? 0.9 : 0.35, borderRadius: 6, transition: `width 700ms ${EASE}` }} />
				<div style=${{ position: 'absolute', left: X0 - 110 + (r.d >= 0 ? w + 12 : 12), top: 12, fontFamily: F.sans, fontSize: 20, fontWeight: 700 }}>${r.d > 0 ? '+' : ''}${r.d.toFixed(1)}</div>
				<div style=${{ position: 'absolute', left: 1100, top: 14, fontFamily: F.sans, fontSize: 17, color: C.dim, whiteSpace: 'nowrap' }}>W/L ${r.wl} · p ${r.p == null ? '–' : r.p}</div></div>`
		})}
		<div style=${{ ...box(110, 860, 1400, 40), fontFamily: F.sans, fontSize: 16, color: C.dim }}>dark: p ${'<'} 0.05 · light: not significant · C2C-10 unchanged in all 24 pairs</div>
		<div style=${{ ...box(1430, 300, 380, 540), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 32, color: C.red }}>why C2C-33 fell</div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, lineHeight: 1.5, marginTop: 8 }}>On PetClinic the old score picked six small services: each overlaps a reference service by more than a third (C2C-33 100) but rarely by more than half (C2C-50 16.7). The final version picks fewer, larger services that match closely (both 75.0).</div>
		</div>
		<${Answer} rq="RQ4" still=${still} on=${B >= 2} />
		<${Inside} x=${1560} y=${196} w=${300} label="The ablation" drawer=${drawer} still=${still} />
		<${SlideSource}>Table XV · Fig. 5 · §V-D</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ RQ4 · refinement, alternatives, transfer
export function Rq4OtherScene({ b, still }) {
	const B = still ? 2 : b
	const R = ANALYSIS.refiner
	const d = R.blinded_delta_after_refinement_mean
	const bars = [['CMod', d.CMod], ['CiD', d.CiD], ['DI', d.DI], ['C2C-50', 6.3], ['DTP', d.DTP], ['BCP', d.BCP], ['C2C-33', -8.8]]
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 245, 800, 640) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 34 }}>deterministic <${Term} k="local-search">refinement</${Term}></div>
			<div style=${{ fontFamily: F.sans, fontSize: 19, color: C.dim, margin: '6px 0 18px' }}>accepted at least one move in ${R.runs_with_moves} of ${R.runs} runs; in those runs, change vs the selected candidate (blinded):</div>
			${bars.map(([m, v], i) => html`<div key=${m} style=${{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, ...reveal(true, still, { delay: 60 * i }) }}>
				<div style=${{ width: 110, fontFamily: F.hand, fontSize: 26 }}>${m}</div>
				<div style=${{ width: 520, position: 'relative', height: 26 }}>
					<div style=${{ position: 'absolute', left: 260, top: -4, bottom: -4, width: 2, background: C.ink }} />
					<div style=${{ position: 'absolute', left: v >= 0 ? 260 : 260 - Math.abs(v) * 25, width: Math.abs(v) * 25, height: 26, background: v >= 0 ? C.fix : C.red, opacity: 0.85, borderRadius: 6 }} /></div>
				<div style=${{ fontFamily: F.sans, fontSize: 19, fontWeight: 700 }}>${v > 0 ? '+' : ''}${v.toFixed(1)}</div></div>`)}
			<div style=${{ fontFamily: F.hand, fontSize: 28, marginTop: 8 }}>improves structure, can trade away data qualities</div>
		</div>
		<div style=${{ ...box(980, 245, 830, 300), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 34 }}>three candidates: a safeguard</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, lineHeight: 1.5, marginTop: 8 }}>They give a real choice only when they differ, and often they do not (E1); forcing them apart did not help (E2). If one candidate fails the gate another can be selected, but no run here needed that fallback: a design rationale, not a measured effect.</div>
		</div>
		<div style=${{ ...box(980, 580, 830, 300), ...reveal(B >= 2, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 34 }}>transfer to <${Term} k="development-confirmation">confirmation</${Term}> models</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, lineHeight: 1.5, marginTop: 8 }}>Fixed on DeepSeek, then run unchanged: the workflow beat 80k concat on three of five design metrics with gpt-oss:120b and four of five with gemma4:31b.</div>
		</div>
		<${SlideSource}>§V-D · analysis (refiner)</${SlideSource}>
	</${Stage}>`
}
