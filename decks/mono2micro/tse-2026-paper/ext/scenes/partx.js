// The results (paper §V): every results slide shows the study's final results, the primary analysis
// (8 models × 4 systems × 5 runs) with its supporting views, analysed read-only in
// studies/final-benchmark-extension-v1/analysis. Every number here comes from ext/data/extension.js; nothing is typed in.
import { html, C, F, box, EASE, Stage, Term, Inside, P, List, Note, Code, Table, reveal, SlideSource, useShared, SHIELD } from '../ui.js'
import { EXT, ROLES } from '../data/extension.js'
import { LABELS } from '../data/paper.js'

// The single-run lesson (comparison with the first, mostly single-run analysis) is printed in teal, as in the paper,
// so it is easy to find and remove.
import { TEAL } from '../ui.js'
export const Toggle = ({ options, value, onChange }) => html`<div style=${{ display: 'flex', gap: 8 }}>
	${options.map((o) => html`<button key=${o} type="button" ...${SHIELD} onClick=${(e) => { e.stopPropagation(); onChange(o) }}
		style=${{ pointerEvents: 'all', cursor: 'pointer', height: 44, padding: '0 18px', borderRadius: 999, border: `2.5px solid ${o === value ? C.red : C.ink}`, background: o === value ? C.red : '#fffdf8', color: o === value ? '#fff' : C.ink, fontFamily: F.sans, fontSize: 17, fontWeight: 600 }}>${o}</button>`)}</div>`
const ARMS = ['80k', 'OpenCode-B3', 'Final']
const ARM_LABEL = { '80k': '80k concat', 'OpenCode-B3': 'OpenCode', Final: 'Final' }
const ARM_COLOR = { '80k': '#6f675c', 'OpenCode-B3': '#2f6fb5', Final: C.red }
const KEYS = ['CMod', 'CiD', 'DTP', 'DI', 'BCP', 'c2c_cvg 10%', 'c2c_cvg 33%', 'c2c_cvg 50%']
const DESIGN = KEYS.slice(0, 5)
const LABEL = { CMod: 'CMod', CiD: 'CiD', DTP: 'DTP', DI: 'DI', BCP: 'BCP', 'c2c_cvg 10%': 'C2C-10', 'c2c_cvg 33%': 'C2C-33', 'c2c_cvg 50%': 'C2C-50' }
const TERM = { CMod: 'cmod', CiD: 'cid', DTP: 'dtp', DI: 'di', BCP: 'bcp', 'c2c_cvg 10%': 'c2c', 'c2c_cvg 33%': 'c2c', 'c2c_cvg 50%': 'c2c' }
const SYS = { demo: 'Demo', jpetstore: 'JPet', partsunlimited: 'Parts', 'spring-petclinic': 'PetCl' }
const VS = { 'vs 80k concat': 'final_vs_80k', 'vs OpenCode': 'final_vs_opencode' }
const SRC = 'studies/final-benchmark-extension-v1/analysis'
const sgn = (v, d = 1) => (v > 0 ? '+' : '') + v.toFixed(d)
const pfmt = (p) => (p == null ? '—' : p < 0.001 ? '< 0.001' : p.toFixed(3))
const fmt1 = (v) => (v == null ? '—' : v.toFixed(1))
const MODELS8 = Object.keys(EXT.models8_5reps.arm_means)
const Kf = `@keyframes tp-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }`

const METHOD_TAB = {
	id: 'method', label: 'How the runs were analysed', render: () => html`<div>
		${List([
			html`unit of analysis: the (model, system) <b>cell</b>; a cell's repetitions are averaged first, because repetitions of one cell are not independent`,
			html`paired <${Term} k="wilcoxon">Wilcoxon signed-rank</${Term}> over cells and <${Term} k="cliffs-delta">Cliff's δ</${Term}>`,
			html`<${Term} k="holm">Holm correction</${Term}> across the eight metrics of each comparison`,
			html`95% interval of the mean difference from a <${Term} k="bootstrap-ci">two-level bootstrap</${Term}> (cells, then repetitions within a cell)`,
			'only valid observations enter the metric tests; unreadable outputs count only in validity',
		])}
		${Note(html`Read-only analysis: ${Code(SRC + '/analyze_extension.py')} → ${Code('extension-analysis.json')}; report ${Code('README.md')}.`)}</div>`,
}
const Box = ({ x, y, w, h, title, children, on = true, still }) => html`<div style=${{ ...box(x, y, w, h), ...reveal(on, still) }}>
	${title && html`<div style=${{ fontFamily: F.hand, fontSize: 32, color: C.red, marginBottom: 8 }}>${title}</div>`}${children}</div>`
const Legend = ({ x, y }) => html`<div style=${{ ...box(x, y, 900, 30), display: 'flex', gap: 26, fontFamily: F.sans, fontSize: 17 }}>${ARMS.map((a) => html`<span key=${a}><span style=${{ display: 'inline-block', width: 16, height: 16, background: ARM_COLOR[a], borderRadius: 4, marginRight: 8, verticalAlign: -2 }} />${ARM_LABEL[a]}</span>`)}</div>`

// ------------------------------------------------------------------ overview: the runs behind the results
const VA = EXT.validity_all_17
const roleSum = (models, key) => models.reduce((n, m) => n + ARMS.reduce((k, a) => k + VA.per_model[m][a][key], 0), 0)
function ModelRow({ model }) {
	const v = VA.per_model[model]
	return html`<div style=${{ display: 'contents' }}>
		<div style=${{ fontFamily: F.sans, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>${model}</div>
		${ARMS.map((a) => html`<div key=${a} style=${{ fontFamily: F.sans, fontSize: 15, textAlign: 'right', color: v[a].valid < v[a].attempts ? C.red : C.dim }}>${v[a].valid}/${v[a].attempts}</div>`)}</div>`
}
export function CollectionScene({ b, still }) {
	const B = still ? 2 : b
	const m8 = EXT.models8_5reps, one = EXT.models8_rep1, fb = EXT.replication_16_cells_repetition_1.tse_original
	const sig = (t, sign) => KEYS.filter((k) => t[k].holm_p < 0.05 && Math.sign(t[k].mean_difference) === sign).map((k) => LABEL[k]).join(', ') || 'none'
	const seed = EXT.seed1_reproducibility
	const drawer = {
		title: 'The runs behind the results', kicker: 'IV · the runs',
		tabs: [
			{ id: 'same', label: 'One protocol', render: () => html`<div>
				${P('Every run follows one frozen protocol: the same four systems, the same three arms with one model per execution, the same decoding and the same blinded evaluation.')}
				${Table(['arm', 'exactly'], [
					['80k concat', '1 summary call (each system fits one chunk) + 5 view calls + 1 decomposition call'],
					['OpenCode', 'base opencode run, prompt baseline-3 + canonical inventory, source + dependency graph'],
					['Final', 'agentic-final-v1b, the final architecture'],
				], { align: ['left', 'left'], size: 18 })}
				${P('Temperature 0.2, reasoning off, 16,384 output tokens. Across the runs (September and October 2026): the same benchmark fingerprints, byte-identical prompts, the same OpenCode version, no code change.', { fontSize: 18, color: C.dim })}</div>` },
			{ id: 'choose', label: 'How the eight were chosen', render: () => html`<div>
				${List([
					'first, four models chosen for diversity of developer, architecture and capability: DeepSeek v4.1 Flash, GLM-5.2, gpt-oss:120b, gemma4:31b (a short probe had excluded models that could not return parseable JSON or call tools with reasoning off)',
					`then a screening of the provider's ${ROLES.breadth.length + 4} other models, one run of every arm on every system (seed 1, 12 runs each), including the models the probe had excluded`,
					'the four with all twelve screening runs valid joined the primary set, before any of their metrics was inspected: deepseek-v4-pro, mistral-large-4, kimi-k2.7-code, kimi-k3',
					`the other ${ROLES.breadth.length} stay as breadth: one run each, so validity also covers models that struggle with the output format`,
				])}</div>` },
			{ id: 'failed', label: 'Outputs that could not be read', render: () => html`<div>
				${P(`${EXT.observation_counts.extension_unrecorded} runs ended with model output that could not be parsed. They are kept with all their evidence, count as failures under validity, and were never retried.`)}
				${Table(['model · arm', 'valid', 'invalid', 'not readable'], Object.entries(EXT.validity.per_model_arm).filter(([, c]) => c.unrecorded).map(([k, c]) => [k.replace('|', ' · ').replace('OpenCode-B3', 'OpenCode'), String(c.valid ?? 0), String(c.invalid ?? 0), String(c.unrecorded)]), { align: ['left'], size: 17 })}</div>` },
			{ id: 'plan', label: 'Analysis plan', render: () => html`<div>
				${List([
					html`<b>primary</b>: 8 models × 4 systems × 5 runs (32 cells), cell means, paired Wilcoxon, Holm across the eight metrics, α = 0.05`,
					'validity counts every attempt; unreadable outputs count as failures',
					'supporting views (reported, never used to pick a claim): 17 models × 1 run; added while writing, the same 32 cells with one run (seed 1) and the six held-out models; plus failure treatments and an every-run regression',
					html`design metrics the workflow optimizes (CMod, CiD) are marked; DI, BCP and DTP are the independent evidence`,
				])}
				${Note('Declared after a first descriptive report of the collected runs and before the robustness checks: a declared plan, not a pre-registration.')}</div>` },
			{ id: 'lesson', label: 'Single-run lesson', render: () => html`<div style=${{ color: TEAL }}>
				${P('How the conclusion changed with the number of runs:', { color: TEAL })}
				${Table(['analysis', 'significant after Holm vs 80k concat', 'C2C-50 vs 80k'], [
					['first analysis: 4 models, mostly one run (16 cells)', sig(fb.final_vs_80k, 1), sgn(fb.final_vs_80k['c2c_cvg 50%'].mean_difference)],
					['8 models × 1 run (seed 1, 32 cells)', sig(one.final_vs_80k, 1), sgn(one.final_vs_80k['c2c_cvg 50%'].mean_difference)],
					['8 models × 5 runs (primary, 32 cells)', sig(m8.final_vs_80k, 1), sgn(m8.final_vs_80k['c2c_cvg 50%'].mean_difference)],
				], { align: ['left', 'left', 'right'], size: 18 })}
				${Note('Kept as a lesson and marked in teal, as in the paper, so it can be removed in one step.', TEAL)}</div>` },
			METHOD_TAB,
		],
		source: `Source: §${LABELS['sc:study-models']}, §${LABELS['sc:study-collection']}, Table ${LABELS['tab:runs']}; studies/final-benchmark-v1 · final-benchmark-extension-v1.`,
	}
	const COLS = [
		{ role: 'primary', title: 'the primary analysis', what: '8 models × 4 systems × 5 seeds × 3 arms', models: ROLES.primary },
		{ role: 'breadth', title: 'breadth', what: `${ROLES.breadth.length} more models × 4 systems × seed 1 × 3 arms`, models: ROLES.breadth },
	]
	const X = [110, 690]
	return html`<${Stage} still=${still}>
		${COLS.map((c, i) => html`<div key=${c.role} style=${{ ...box(X[i], 250, 540, 610), ...reveal(B >= i, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 40, lineHeight: 1.15, color: i === 0 ? C.red : C.ink }}>${c.title}</div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, marginTop: 4 }}>${c.what}</div>
			<div style=${{ marginTop: 14, display: 'grid', gridTemplateColumns: '240px repeat(3, 86px)', rowGap: 6, columnGap: 6, alignItems: 'center' }}>
				<div style=${{ fontFamily: F.sans, fontSize: 13, color: C.dim }}>valid / attempts</div>${ARMS.map((a) => html`<div key=${a} style=${{ fontFamily: F.sans, fontSize: 13, color: C.dim, textAlign: 'right' }}>${ARM_LABEL[a]}</div>`)}
				${c.models.map((m) => html`<${ModelRow} key=${m} model=${m} />`)}
			</div>
			<div style=${{ fontFamily: F.hand, fontSize: 32, marginTop: 12 }}><span style=${{ color: C.red }}>${roleSum(c.models, 'attempts') - roleSum(c.models, 'unrecorded')}</span> of ${roleSum(c.models, 'attempts')} runs recorded</div>
		</div>`)}
		<div style=${{ ...box(1270, 250, 540, 610), ...reveal(B >= 2, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 40, lineHeight: 1.15 }}>seed 1, twice</div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, marginTop: 4 }}>${ROLES.repeat.join(', ')}: seed 1 also ran three weeks before their primary runs, with identical inputs</div>
			<div style=${{ fontFamily: F.sans, fontSize: 19, lineHeight: 1.5, marginTop: 16 }}>Used only to measure repeatability. The identical partition came back in:</div>
			${Table(['arm', 'same partition'], ARMS.map((a) => [ARM_LABEL[a], `${seed[a].identical_partition} of ${seed[a].pairs}`]), { size: 20 })}
			<div style=${{ fontFamily: F.sans, fontSize: 16, color: C.dim, marginTop: 8 }}>OpenCode passes no seed: its pair is the same configuration run twice.</div>
		</div>
		<div style=${{ ...box(110, 880, 1700, 50), fontFamily: F.hand, fontSize: 30, textAlign: 'center', ...reveal(B >= 2, still) }}>
			${EXT.observation_counts.final_benchmark_v1 + EXT.observation_counts.extension_recorded} recorded runs · ${EXT.observation_counts.extension_unrecorded} unreadable outputs counted as failures · <span style=${{ color: C.red }}>the results that follow use the primary analysis</span></div>
		<${Inside} x=${1560} y=${196} w=${300} label="How it was run" drawer=${drawer} still=${still} />
		<${SlideSource}>§${LABELS['sc:study-collection']} · Table ${LABELS['tab:runs']} · studies/final-benchmark-v1 · final-benchmark-extension-v1</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ Q1 · per model
export function Rq1MainExtra({ b, still }) {
	const [model, setModel] = useShared('x:model', MODELS8[0])
	const means = EXT.models8_5reps.arm_means[model], valid = EXT.validity_per_model_8x5[model]
	const best = KEYS.map((k) => Math.max(...ARMS.map((a) => means[a][k] ?? -1)))
	const tally = KEYS.map((k) => [LABEL[k], MODELS8.filter((m) => { const v = EXT.models8_5reps.arm_means[m]; return ARMS.every((a) => (v.Final[k] ?? -1) >= (v[a][k] ?? -1)) }).length])
	const seed1 = EXT.models17_seed1.arm_means
	const drawer = {
		title: 'Per model, all runs', kicker: 'V-A · Q1',
		tabs: [
			{ id: 'tally', label: 'How often Final is highest', render: () => html`<div>${P('Number of the eight models for which Final has the highest five-run mean:', { fontSize: 19 })}${Table(['metric', 'models'], tally.map(([k, n]) => [k, `${n} of 8`]), { size: 19 })}</div>` },
			{ id: 'seed1', label: '17 models, one run', tabs: Object.keys(seed1).map((m) => ({ id: m, label: m, render: () => Table(['arm', ...KEYS.map((k) => LABEL[k]), 'services'], ARMS.map((a) => [ARM_LABEL[a], ...KEYS.map((k) => fmt1(seed1[m][a]?.[k])), fmt1(seed1[m][a]?.partition_count)]), { size: 16 }) })), render: () => P('Seed 1 of every model, valid observations only; "—" means no valid observation for that arm.', { fontSize: 17, color: C.dim }) },
			METHOD_TAB,
		],
		source: `Source: ${SRC} · models8_5reps, models17_seed1.`,
	}
	const X = 110, W = 1700
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(X, 252, 1700, 50), display: 'flex', alignItems: 'center', gap: 6 }}>
			<${Toggle} options=${MODELS8} value=${model} onChange=${setModel} /></div>
		<div style=${{ ...box(X, 318, W, 30), fontFamily: F.sans, fontSize: 16, color: C.dim }}>five runs per cell · mean over four systems · valid counts are attempts over 4 systems × 5 runs</div>
		<div style=${{ ...box(X, 352, W, 36), display: 'flex', fontFamily: F.sans, fontSize: 17, fontWeight: 700, color: C.dim }}>
			<div style=${{ width: 250 }}>arm</div><div style=${{ width: 90, textAlign: 'right' }}>valid</div>
			${KEYS.map((k) => html`<div key=${k} style=${{ width: 130, textAlign: 'right' }}><${Term} k=${TERM[k]}>${LABEL[k]}</${Term}></div>`)}
			<div style=${{ width: 120, textAlign: 'right' }}>services</div></div>
		${ARMS.map((a, i) => html`<div key=${model + a} style=${{ ...box(X, 392 + i * 66, W, 60), display: 'flex', alignItems: 'center', borderBottom: `1.5px solid ${C.line}`, animation: still ? 'none' : `tp-in 400ms ${EASE} ${i * 60}ms both` }}>
			<div style=${{ width: 250, fontFamily: F.hand, fontSize: 30, color: ARM_COLOR[a] }}>${ARM_LABEL[a]}</div>
			<div style=${{ width: 90, textAlign: 'right', fontFamily: F.sans, fontSize: 20, color: valid[a].valid < valid[a].attempts ? C.red : C.ink }}>${valid[a].valid}/${valid[a].attempts}</div>
			${KEYS.map((k, j) => html`<div key=${k} style=${{ width: 130, textAlign: 'right', fontFamily: F.sans, fontSize: 24, fontWeight: means[a][k] === best[j] ? 800 : 400, color: means[a][k] === best[j] ? C.ink : C.dim }}>${fmt1(means[a][k])}</div>`)}
			<div style=${{ width: 120, textAlign: 'right', fontFamily: F.sans, fontSize: 20, color: C.dim }}>${fmt1(means[a].partition_count)}</div></div>`)}
		<div style=${{ ...box(X, 610, 1080, 280) }}>
			<div style=${{ fontFamily: F.sans, fontSize: 16, color: C.dim, marginBottom: 8 }}>design metrics as bars · bold above = best of the three arms</div>
			<div style=${{ display: 'flex', gap: 26, alignItems: 'flex-end', height: 220 }}>
				${DESIGN.map((k) => html`<div key=${k} style=${{ width: 190, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<div style=${{ display: 'flex', gap: 7, alignItems: 'flex-end', height: 180 }}>
						${ARMS.map((a) => html`<div key=${a} title=${`${ARM_LABEL[a]}: ${fmt1(means[a][k])}`} style=${{ width: 44, height: `${((means[a][k] ?? 0) / 100) * 180}px`, background: ARM_COLOR[a], opacity: 0.85, borderRadius: '8px 8px 0 0', transition: `height 600ms ${EASE}` }} />`)}</div>
					<div style=${{ fontFamily: F.sans, fontSize: 17, marginTop: 6 }}>${LABEL[k]}</div></div>`)}
			</div></div>
		<${Box} x=${1260} y=${600} w=${550} h=${300} title="across all eight models" still=${still}>
			${tally.map(([k, n]) => html`<div key=${k} style=${{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.sans, fontSize: 19, height: 32 }}>
				<div style=${{ width: 90 }}>${k}</div>
				<div style=${{ display: 'flex', gap: 4 }}>${Array.from({ length: 8 }, (_, i) => html`<div key=${i} style=${{ width: 18, height: 18, borderRadius: 9, background: i < n ? C.red : C.paper2 }} />`)}</div>
				<div style=${{ color: C.dim }}>Final highest for ${n}</div></div>`)}
		</${Box}>
		<${Inside} x=${1560} y=${196} w=${300} label="All models" drawer=${drawer} still=${still} />
		<style>${Kf}</style>
		<${SlideSource}>${SRC} · 8 models × 5 runs</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ Q1 · paired comparison
const VIEWS = {
	'8 models × 5 · primary': { get: (vs) => EXT.models8_5reps[vs], note: 'the primary analysis: five runs averaged per cell' },
	'8 models × 1 · seed 1': { get: (vs) => EXT.models8_rep1[vs], note: 'the same 32 cells, one run each (seed 1)' },
	'6 held-out × 5': { get: (vs) => EXT.held_out_6x5[vs], note: 'the six primary models that informed no design decision' },
	'17 models × 1': { get: (vs) => EXT.models17_seed1[vs], note: 'every model, one run per cell' },
}
const OPTIMIZED = ['CMod', 'CiD']
// Failed runs (invalid or unreadable) in the primary analysis, per model and arm.
const FAILED8 = (() => {
	const v = EXT.validity_per_model_8x5, parts = []
	let total = 0, attempts = 0
	for (const [m, arms] of Object.entries(v)) for (const [a, c] of Object.entries(arms)) {
		attempts += c.attempts
		const f = c.attempts - c.valid
		if (f) { total += f; parts.push(`${m} · ${ARM_LABEL[a]}: ${f}`) }
	}
	return { total, attempts, parts: parts.join('; ') }
})()
const FAILV = [['A_valid_only', 'A · valid only'], ['B_invalid_as_measured', 'B · invalid as measured'], ['C_failures_at_worst', 'C · failures at worst']]
// Under the primary table: does each significant result survive the robustness checks?
function Robust({ vs, t }) {
	const sig = KEYS.filter((k) => t[k].holm_p < 0.05)
	if (!sig.length) return null
	const ok = (p) => (p < 0.05 ? html`<span style=${{ color: C.fix, fontWeight: 800 }}>✓</span>` : html`<span style=${{ color: C.red, fontWeight: 800 }}>✗</span>`)
	return html`<div style=${{ ...box(110, 968, 1700, 34), display: 'flex', justifyContent: 'center', gap: 34, fontFamily: F.sans, fontSize: 17, color: C.dim }}>
		<span title="failures: every failed run scored at the worst value · runs: regression on every run · models: the same, uncertainty clustered by model · held out: the six models that informed no design decision">still significant with · failures at worst · every run · clustered by model · held-out models:</span>
		${sig.map((k) => html`<span key=${k}><b style=${{ color: C.ink }}>${LABEL[k]}</b> ${ok(EXT.failure_sensitivity_8x5.C_failures_at_worst[vs][k].holm_p)} ${ok(EXT.run_level_model_8x5[k].cluster_cell[vs].holm_p)} ${ok(EXT.run_level_model_8x5[k].cluster_model[vs].holm_p)} ${ok(EXT.held_out_6x5[vs][k].holm_p)}</span>`)}
	</div>`
}
export function Rq1PairedExtra({ b, still }) {
	const [view, setView] = useShared('x:view', '8 models × 5 · primary')
	const [vs, setVs] = useShared('x:vs', 'vs 80k concat')
	const t = VIEWS[view].get(VS[vs])
	const better = KEYS.filter((k) => t[k].holm_p < 0.05 && t[k].mean_difference > 0).map((k) => LABEL[k])
	const worse = KEYS.filter((k) => t[k].holm_p < 0.05 && t[k].mean_difference < 0).map((k) => LABEL[k])
	const gain = EXT.precision_gain_models8
	const drawer = {
		title: 'The paired comparison, all runs', kicker: 'V-A · Q1',
		tabs: [
			{ id: 'views', label: 'The views', render: () => html`<div>
				${Table(['view', 'what it is'], Object.entries(VIEWS).map(([k, v]) => [k, v.note]), { align: ['left', 'left'], size: 18 })}
				${P('The eight models: DeepSeek v4.1 Flash, GLM-5.2, gpt-oss:120b, gemma4:31b (chosen first, for diversity) and deepseek-v4-pro, mistral-large-4, kimi-k2.7-code, kimi-k3 (selected by screening: all twelve screening runs valid). The workflow was developed on DeepSeek v4.1 Flash, and its last design change was also informed by GLM-5.2; the other six informed no design decision (the held-out view). All models share the four development systems.', { fontSize: 18 })}</div>` },
			{ id: 'robust', label: 'Robustness checks', tabs: [
				{ id: 'failures', label: 'Failed runs', render: () => html`<div>
					${P('Does the result depend on how failed runs are treated? A: valid runs only (primary). B: invalid runs kept with their measured metrics. C: every failure, invalid or unreadable, scored at the worst value of that metric seen on that system: the most pessimistic choice for the arm that fails.', { fontSize: 18 })}
					${Table(['metric', ...FAILV.map(([, l]) => l)], KEYS.map((k) => [LABEL[k], ...FAILV.map(([v]) => { const r = EXT.failure_sensitivity_8x5[v][VS[vs]][k]; return `${sgn(r.mean_difference, 2)} (Holm ${pfmt(r.holm_p)})` })]), { size: 17 })}
					${P(`In the eight models only ${FAILED8.total} of ${FAILED8.attempts} runs failed (${FAILED8.parts}), so no conclusion changes.`, { fontSize: 18, color: C.dim })}</div>` },
				{ id: 'runs', label: 'Every run, not cell means', render: () => html`<div>
					${P('A regression on all individual valid runs: metric = cell effect + arm effect + noise. One fixed effect per (model, system) cell keeps the comparison paired. Uncertainty clustered by cell (32 clusters) and, stricter, by model (8 clusters: it asks whether the gain generalises over models).', { fontSize: 18 })}
					${Table(['metric', 'estimate', 'by cell: 95% CI', 'Holm p', 'by model: 95% CI', 'Holm p'], KEYS.map((k) => { const m = EXT.run_level_model_8x5[k], c = m.cluster_cell[VS[vs]], g = m.cluster_model[VS[vs]]; return [LABEL[k], sgn(c.estimate, 2), `[${c.ci95.join(', ')}]`, pfmt(c.holm_p), `[${g.ci95.join(', ')}]`, pfmt(g.holm_p)] }), { size: 17 })}
					${P(`${EXT.run_level_model_8x5.CMod.n_runs} runs. The estimates match the cell analysis; with only eight models as clusters some effects lose significance.`, { fontSize: 18, color: C.dim })}</div>` },
				{ id: 'optimized', label: 'Optimized metrics', render: () => html`<div>
					${P(html`The workflow's selection and refinement maximise CMod (weight 0.3), CiD (0.2) and a service-size balance score (0.2). A gain in CMod is therefore partly <b>by construction</b>. DI, BCP and DTP are not optimized: their changes are the independent evidence. C2C compares with the developers' decomposition, which the workflow never sees.`)}
					${Note('Marked ◆ on the slide.')}</div>` },
			], render: () => P('The primary result, checked two more ways (no new model calls).', { fontSize: 18, color: C.dim }) },
			{ id: 'precision', label: 'What five runs bought', render: () => html`<div>
				${P('Width of the 95% interval with five runs per cell, as a share of its width with one run (8 models, Final vs 80k concat):', { fontSize: 19 })}
				${Table(['metric', 'one run', 'five runs', 'share'], KEYS.map((k) => [LABEL[k], gain[k].ci_width_1_rep.toFixed(1), gain[k].ci_width_5_reps.toFixed(1), Math.round(gain[k].ratio * 100) + '%']), { size: 18 })}
				${P('Repetitions remove run-to-run noise, but most of the remaining uncertainty comes from differences between models and systems: the number of cells matters as much as the number of runs.', { fontSize: 19 })}</div>` },
			METHOD_TAB,
		],
		source: `Source: ${SRC} · models8_5reps, models8_rep1, held_out_6x5, models17_seed1.`,
	}
	const X = 110, barW = 380
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(X, 252, 1440, 50), display: 'flex', alignItems: 'center', gap: 14 }}><${Toggle} options=${Object.keys(VIEWS)} value=${view} onChange=${setView} /></div>
		<div style=${{ ...box(X, 308, 1700, 46), display: 'flex', alignItems: 'center', gap: 18 }}>
			<${Toggle} options=${Object.keys(VS)} value=${vs} onChange=${setVs} />
			<span style=${{ fontFamily: F.sans, fontSize: 16, color: C.dim }}>${VIEWS[view].note} · ${t.CMod.n_cells} cells</span></div>
		<div style=${{ ...box(X, 368, 1700, 34), display: 'flex', fontFamily: F.sans, fontSize: 16, fontWeight: 700, color: C.dim }}>
			<div style=${{ width: 170 }}>metric</div><div style=${{ width: barW + 24 }}><${Term} k="win-tie-loss">win · tie · loss</${Term}></div><div style=${{ width: 120, textAlign: 'right' }}>Δ</div><div style=${{ width: 250, textAlign: 'right' }}><${Term} k="bootstrap-ci">95% interval</${Term}></div><div style=${{ width: 140, textAlign: 'right' }}><${Term} k="p-value">p</${Term}></div><div style=${{ width: 160, textAlign: 'right' }}><${Term} k="holm">Holm p</${Term}></div><div style=${{ width: 140, textAlign: 'right' }}><${Term} k="cliffs-delta">δ</${Term}></div></div>
		${KEYS.map((k, i) => {
			const r = t[k], wtl = [r.wins, r.ties, r.losses], n = r.n_cells
			const sig = r.holm_p < 0.05
			return html`<div key=${view + vs + k} style=${{ ...box(X, 406 + i * 64, 1700, 56), display: 'flex', alignItems: 'center', borderBottom: `1.5px solid ${C.line}`, animation: still ? 'none' : `tp-in 400ms ${EASE} ${i * 40}ms both` }}>
				<div style=${{ width: 170, fontFamily: F.hand, fontSize: 28, whiteSpace: 'nowrap' }}><${Term} k=${TERM[k]}>${LABEL[k]}</${Term}>${OPTIMIZED.includes(k) && html`<span title="optimized by the workflow's own selection and refinement" style=${{ fontFamily: F.sans, fontSize: 14, color: C.amber, marginLeft: 6, verticalAlign: 4 }}>◆</span>`}</div>
				<div style=${{ width: barW, height: 26, display: 'flex', borderRadius: 8, overflow: 'hidden', marginRight: 24 }}>
					${wtl.map((v, j) => html`<div key=${j} style=${{ width: `${(v / n) * 100}%`, background: [C.fix, C.paper2, C.red][j], opacity: j === 1 ? 1 : 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 15, fontWeight: 700, color: j === 1 ? C.dim : '#fff' }}>${v || ''}</div>`)}</div>
				<div style=${{ width: 120, textAlign: 'right', fontFamily: F.sans, fontSize: 24, fontWeight: 700, color: r.mean_difference > 0 ? C.fix : r.mean_difference < 0 ? C.red : C.dim }}>${sgn(r.mean_difference, 2)}</div>
				<div style=${{ width: 250, textAlign: 'right', fontFamily: F.sans, fontSize: 19, color: C.dim }}>${r.ci95_mean_difference ? `[${r.ci95_mean_difference.map((v) => v.toFixed(1)).join(', ')}]` : '—'}</div>
				<div style=${{ width: 140, textAlign: 'right', fontFamily: F.sans, fontSize: 21 }}>${pfmt(r.wilcoxon_p)}</div>
				<div style=${{ width: 160, textAlign: 'right', fontFamily: F.sans, fontSize: 21, fontWeight: sig ? 800 : 400, color: sig ? (r.mean_difference > 0 ? C.fix : C.red) : C.ink }}>${pfmt(r.holm_p)}</div>
				<div style=${{ width: 140, textAlign: 'right', fontFamily: F.sans, fontSize: 21, color: C.dim }}>${sgn(r.cliffs_delta, 2)}</div></div>`
		})}
		${view.endsWith('primary') && html`<${Robust} vs=${VS[vs]} t=${t} />`}
		<div style=${{ ...box(X, view.endsWith('primary') ? 918 : 930, 1700, 50), fontFamily: F.hand, fontSize: 30, textAlign: 'center' }}>
			${better.length || worse.length ? html`significant after Holm: Final <span style=${{ color: C.fix }}>better on ${better.join(', ') || 'nothing'}</span>${worse.length ? html`, <span style=${{ color: C.red }}>worse on ${worse.join(', ')}</span>` : ''}` : html`nothing significant after Holm: <span style=${{ color: C.red }}>still no evidence either way</span>`}</div>
		<${Inside} x=${1560} y=${196} w=${300} label="The views" drawer=${drawer} still=${still} />
		<style>${Kf}</style>
		<${SlideSource}>${SRC} · paired over cells</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ Q1 · tools and convergence
export function Rq1ToolsExtra({ b, still }) {
	const B = still ? 1 : b
	const T = EXT.tools_comparison_8x5, conv = EXT.convergence_8_models, conv17 = EXT.convergence_17_models_seed1
	const rows = [['traditional tools', T.tools, C.faint], ['80k concat', T['80k'], ARM_COLOR['80k']], ['Final', T.Final, ARM_COLOR.Final]]
	const eq = conv.final_equals_80k_same_model_and_seed
	const drawer = {
		title: 'Tools and convergence, all runs', kicker: 'V-A · Q1',
		tabs: [
			{ id: 'means', label: 'Means over systems', render: () => html`<div>${Table(['', ...KEYS.map((k) => LABEL[k])], [['traditional tools', ...KEYS.map((k) => fmt1(T.tools[k]))], ...ARMS.map((a) => [ARM_LABEL[a], ...KEYS.map((k) => fmt1(T[a][k]))])], { size: 17 })}
				${P('LLM arms: eight models, five runs per cell, valid observations; tools as measured by the benchmark (deterministic, unchanged).', { fontSize: 17, color: C.dim })}</div>` },
			{ id: 'conv', label: 'Convergence', render: () => html`<div>
				${P('Distinct partitions among the models at seed 1, per system (1 = every model returned the same partition):', { fontSize: 19 })}
				${Table(['system', ...ARMS.map((a) => `${ARM_LABEL[a]} · 8 models`), ...ARMS.map((a) => `${ARM_LABEL[a]} · 17 models`)], Object.keys(SYS).map((s) => [s, ...ARMS.map((a) => String(conv.per_system[s][a])), ...ARMS.map((a) => String(conv17.per_system[s][a]))]), { size: 17 })}
				${P(`Final reproduced the 80k partition of the same model and seed in ${eq.equal} of ${eq.pairs} runs (8 models × 5 runs).`, { fontSize: 19 })}</div>` },
		],
		source: `Source: ${SRC} · tools_comparison_8x5, convergence_8_models, convergence_17_models_seed1.`,
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 252, 1100, 40), fontFamily: F.sans, fontSize: 17, color: C.dim }}>means over systems · LLM arms: 8 models × 5 runs · tools: the benchmark's measured outputs</div>
		<div style=${{ ...box(110, 310, 1100, 510), display: 'flex', gap: 22, alignItems: 'flex-end' }}>
			${KEYS.map((k) => html`<div key=${k} style=${{ width: 116, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<div style=${{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 410 }}>
					${rows.map(([l, v, c]) => html`<div key=${l} style=${{ width: 32, height: `${((v[k] ?? 0) / 100) * 410}px`, background: c, borderRadius: '6px 6px 0 0', opacity: 0.9, position: 'relative' }}>
						<div style=${{ position: 'absolute', top: -18, left: -1, right: -1, textAlign: 'center', fontFamily: F.sans, fontSize: 11, color: C.dim }}>${(v[k] ?? 0).toFixed(0)}</div></div>`)}</div>
				<div style=${{ fontFamily: F.sans, fontSize: 16, marginTop: 6 }}><${Term} k=${TERM[k]}>${LABEL[k]}</${Term}></div></div>`)}
		</div>
		<div style=${{ ...box(110, 840, 1100, 40), display: 'flex', gap: 26, fontFamily: F.sans, fontSize: 17 }}>${rows.map(([l, , c]) => html`<span key=${l}><span style=${{ display: 'inline-block', width: 16, height: 16, background: c, borderRadius: 4, marginRight: 8, verticalAlign: -2 }} />${l}</span>`)}</div>
		<${Box} x=${1270} y=${300} w=${540} h=${580} title="convergence, eight models" on=${B >= 1} still=${still}>
			${Table(['system', '80k', 'Final'], Object.keys(SYS).map((s) => [SYS[s], String(conv.per_system[s]['80k']), String(conv.per_system[s].Final)]), { size: 21 })}
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, marginTop: -4 }}>distinct partitions among the 8 models (seed 1)</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, lineHeight: 1.45, marginTop: 14 }}>Final matched the 80k partition of the same model and seed in <b>${eq.equal} of ${eq.pairs}</b> runs.</div>
		</${Box}>
		<${Inside} x=${1560} y=${196} w=${300} label="Tools, convergence" drawer=${drawer} still=${still} />
		<${SlideSource}>${SRC} · tools and convergence</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ Q2 · validity and stability
export function Rq2Extra({ b, still }) {
	const B = still ? 2 : b
	const V = EXT.validity_per_model_8x5, S = EXT.stability_per_system_8x5, R = EXT.raw_candidate_repair_8x5, all = EXT.validity_all_17.pooled
	const tot = (a) => MODELS8.reduce((c, m) => ({ valid: c.valid + V[m][a].valid, attempts: c.attempts + V[m][a].attempts }), { valid: 0, attempts: 0 })
	const fails = ARMS.flatMap((a) => MODELS8.filter((m) => V[m][a].valid < V[m][a].attempts).map((m) => [ARM_LABEL[a], m, V[m][a]]))
	const drawer = {
		title: 'Q2, all runs', kicker: 'V-B · Q2',
		tabs: [
			{ id: 'models', label: 'Validity per model', render: () => Table(['model', ...ARMS.map((a) => ARM_LABEL[a])], MODELS8.map((m) => [m, ...ARMS.map((a) => `${V[m][a].valid}/${V[m][a].attempts}`)]), { align: ['left'], size: 18 }) },
			{ id: 'all', label: 'All 17 models', render: () => html`<div>
				${Table(['', ...ARMS.map((a) => ARM_LABEL[a])], [['valid / attempts', ...ARMS.map((a) => `${all[a].valid}/${all[a].attempts}`)], ['share', ...ARMS.map((a) => `${(all[a].valid_rate * 100).toFixed(1)}%`)]], { size: 19 })}
				${P(`All 17 models: the eight primary models with five seeds and the ${ROLES.breadth.length} breadth models with one. Fisher's exact test, Final vs 80k: p = ${pfmt(all.fisher_final_vs_80k)}; vs OpenCode: p = ${pfmt(all['fisher_final_vs_OpenCode-B3'])}. Eight of Final's eleven failures are glm-5.3 and glm-5.3-flash, whose evidence-stage answers could not be read.`, { fontSize: 18 })}</div>` },
			{ id: 'seed', label: 'Same seed, twice', render: () => html`<div>${P(`Seed 1 run twice, three weeks apart, for ${ROLES.repeat.join(', ')}:`, { fontSize: 18 })}${Table(['arm', 'cells', 'identical partition', 'NVI'], ARMS.map((a) => { const r = EXT.seed1_reproducibility[a]; return [ARM_LABEL[a], String(r.pairs), String(r.identical_partition), r.mean_nvi.toFixed(3)] }), { size: 19 })}</div>` },
			METHOD_TAB,
		],
		source: `Source: ${SRC} · validity_per_model_8x5, stability_per_system_8x5, raw_candidate_repair_8x5.`,
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 252, 760, 50), fontFamily: F.hand, fontSize: 32 }}><${Term} k="validity">valid</${Term}> decompositions · 8 models × 5 runs</div>
		${ARMS.map((a, i) => {
			const t = tot(a)
			return html`<div key=${a} style=${{ ...box(110, 318 + i * 80, 780, 72), display: 'flex', alignItems: 'center', gap: 16 }}>
				<div style=${{ width: 170, fontFamily: F.hand, fontSize: 30, color: ARM_COLOR[a] }}>${ARM_LABEL[a]}</div>
				<div style=${{ display: 'flex', flexWrap: 'wrap', gap: 2, width: 440 }}>${Array.from({ length: t.attempts }, (_, k) => html`<div key=${k} style=${{ width: 9, height: 9, borderRadius: 2, background: k < t.valid ? ARM_COLOR[a] : 'transparent', border: k < t.valid ? 'none' : `2px solid ${C.red}`, opacity: 0.85, boxSizing: 'border-box' }} />`)}</div>
				<div style=${{ fontFamily: F.sans, fontSize: 24, fontWeight: 700 }}>${t.valid}/${t.attempts}</div></div>`
		})}
		<${Box} x=${110} y=${570} w=${780} h=${330} title="where the failures are" on=${B >= 1} still=${still}>
			${fails.map(([a, m, c]) => html`<div key=${a + m} style=${{ fontFamily: F.sans, fontSize: 19, lineHeight: 1.5 }}><b style=${{ color: ARM_COLOR[a === 'Final' ? 'Final' : a === 'OpenCode' ? 'OpenCode-B3' : '80k'] }}>${a}</b> · ${m}: ${c.invalid ? `${c.invalid} invalid` : ''}${c.invalid && c.unrecorded ? ', ' : ''}${c.unrecorded ? `${c.unrecorded} unreadable` : ''}</div>`)}
			<div style=${{ fontFamily: F.sans, fontSize: 18, lineHeight: 1.45, marginTop: 12 }}>Final's raw candidates needed <${Term} k="repair">repair</${Term}> in ${R.runs_with_any_raw_invalid_candidate} of ${R.runs} runs (${R.raw_invalid_candidates} of ${R.candidates} candidates).</div>
		</${Box}>
		<${Box} x=${960} y=${252} w=${850} h=${640} on=${B >= 2} still=${still}>
			<div style=${{ fontFamily: F.hand, fontSize: 32 }}>stability: 8 models × 5 runs</div>
			<div style=${{ fontFamily: F.sans, fontSize: 17, color: C.dim, margin: '4px 0 18px' }}>distinct partitions per system (of 5, mean over models) · mean pairwise <${Term} k="nvi">NVI</${Term}></div>
			${Table(['arm', ...Object.values(SYS), 'mean', 'NVI'], ARMS.map((a) => [ARM_LABEL[a], ...Object.keys(SYS).map((s) => S[a][s].mean_distinct_of_5.toFixed(2)), S[a].mean_distinct_of_5.toFixed(2), S[a].mean_nvi.toFixed(3)]), { size: 22 })}
			<div style=${{ fontFamily: F.hand, fontSize: 30, marginTop: 16 }}>Still no arm is stable, and Final varies the most.</div>
		</${Box}>
		<${Inside} x=${1560} y=${196} w=${300} label="Q2 in detail" drawer=${drawer} still=${still} />
		<${SlideSource}>${SRC} · validity and stability</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ Q3 · cost
export function Rq3Extra({ b, still }) {
	const B = still ? 2 : b
	const M = EXT.arm_means_8x5_all_recorded, st = EXT.tokens_stage_breakdown_extension_fresh
	const t80 = EXT.tokens_8_models_5reps_all_recorded.final_vs_80k, toc = EXT.tokens_8_models_5reps_all_recorded['final_vs_OpenCode-B3']
	const mean = (a) => MODELS8.reduce((s, m) => s + M[m][a].tokens, 0) / MODELS8.length
	const pct = ((mean('Final') - mean('80k')) / mean('80k')) * 100
	const max = Math.max(...MODELS8.flatMap((m) => ARMS.map((a) => M[m][a].tokens)))
	const shares = [['evidence', st.evidence.share], ['domain', st.domain.share], ['3 candidates', st.candidate_generation.share]]
	const drawer = {
		title: 'Q3, all runs', kicker: 'V-C · Q3',
		tabs: [
			{ id: 'tokens', label: 'Tokens per model', render: () => Table(['model', ...ARMS.map((a) => ARM_LABEL[a])], MODELS8.map((m) => [m, ...ARMS.map((a) => Math.round(M[m][a].tokens).toLocaleString('en-US'))]), { align: ['left'], size: 18 }) },
			{ id: 'stages', label: 'Where Final spends', render: () => html`<div>${Table(['stage', 'mean tokens per run', 'share'], [['evidence', st.evidence], ['domain', st.domain], ['candidate generation', st.candidate_generation]].map(([l, s]) => [l, s.mean_tokens.toLocaleString('en-US'), `${(s.share * 100).toFixed(1)} %`]), { size: 18 })}${P(`Over the ${st.evidence.n_runs} Final runs of the seven primary models other than DeepSeek v4.1 Flash, whose workflow runs are replays of recorded LLM outputs.`, { fontSize: 17, color: C.dim })}</div>` },
		],
		source: `Source: ${SRC} · tokens_8_models_5reps_all_recorded, tokens_stage_breakdown_extension_fresh.`,
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 252, 1100, 40), fontFamily: F.sans, fontSize: 17, color: C.dim }}><${Term} k="token">tokens</${Term}> per system (thousands) · five-run means · all recorded runs</div>
		${MODELS8.map((m, i) => html`<div key=${m} style=${{ ...box(110, 300 + i * 80, 1100, 78) }}>
			<div style=${{ fontFamily: F.sans, fontSize: 16, fontWeight: 600 }}>${m}</div>
			${ARMS.map((a) => html`<div key=${a} style=${{ display: 'flex', alignItems: 'center', gap: 10, height: 18 }}>
				<div style=${{ width: (M[m][a].tokens / max) * 860, height: 13, background: ARM_COLOR[a], opacity: 0.85, borderRadius: 4, ...reveal(true, still, { delay: 40 * i }) }} />
				<div style=${{ fontFamily: F.sans, fontSize: 13, fontWeight: 700 }}>${(M[m][a].tokens / 1000).toFixed(0)}</div></div>`)}</div>`)}
		<${Box} x=${1270} y=${260} w=${540} h=${330} on=${B >= 1} still=${still}>
			<div style=${{ fontFamily: F.hand, fontSize: 60, color: C.red, lineHeight: 1 }}>${pct < 0 ? '−' : '+'}${Math.abs(pct).toFixed(1)} %</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, lineHeight: 1.5, marginTop: 8 }}>vs 80k concat: cheaper in <b>${t80.losses} of ${t80.n_cells}</b> cells (<${Term} k="wilcoxon">Wilcoxon</${Term}> p ${pfmt(t80.wilcoxon_p)})</div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, lineHeight: 1.45, marginTop: 10 }}>vs OpenCode: cheaper in ${toc.losses} of ${toc.n_cells} cells, ${Math.round(-toc.mean_difference).toLocaleString('en-US')} fewer tokens per system on average.</div>
		</${Box}>
		<${Box} x=${1270} y=${610} w=${540} h=${280} on=${B >= 2} still=${still}>
			<div style=${{ fontFamily: F.hand, fontSize: 30 }}>where Final spends</div>
			<div style=${{ display: 'flex', height: 44, borderRadius: 10, overflow: 'hidden', marginTop: 12 }}>
				${shares.map(([l, s], i) => html`<div key=${l} style=${{ width: `${s * 100}%`, background: [C.blue, '#2e9e6e', C.red][i], opacity: 0.8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 17, fontWeight: 700 }}>${Math.round(s * 100)} %</div>`)}</div>
			<div style=${{ display: 'flex', marginTop: 6 }}>${shares.map(([l, s]) => html`<div key=${l} style=${{ width: `${s * 100}%`, textAlign: 'center', fontFamily: F.sans, fontSize: 16, color: C.dim }}>${l}</div>`)}</div>
			<div style=${{ fontFamily: F.sans, fontSize: 17, color: C.dim, marginTop: 12 }}>${st.evidence.n_runs} runs · selection, refinement and evaluation: 0 tokens</div>
		</${Box}>
		<${Legend} x=${110} y=${950} />
		<${Inside} x=${1560} y=${196} w=${300} label="Q3 in detail" drawer=${drawer} still=${still} />
		<${SlideSource}>${SRC} · tokens</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ Q4 · the ablation, on eight models
export function Rq4Extra({ b, still }) {
	const B = still ? 1 : b
	const A = EXT.ablation_8x5
	if (!A) return html`<${Stage} still=${still}><div style=${{ ...box(260, 400, 1400, 200), fontFamily: F.hand, fontSize: 40 }}>the eight-model ablation is still running</div></${Stage}>`
	const c = A.over_cells, r = A.over_runs
	const rows = KEYS.filter((k) => k !== 'c2c_cvg 10%').map((k) => ({ k, d: c[k].mean_difference, ci: c[k].ci95_mean_difference, wl: `${c[k].wins}/${c[k].losses}`, p: c[k].wilcoxon_p, holm: c[k].holm_p }))
	const X0 = 700, unit = 26
	const drawer = {
		title: 'The ablation on eight models', kicker: 'V-D · Q4',
		tabs: [
			{ id: 'how', label: 'How it was made', render: () => html`<div>
				${P(html`Every stored Final run of the seven primary models other than DeepSeek v4.1 Flash was re-scored with the earlier selection and refinement that also used <${Term} k="v-measure" />: the evidence, domain model and candidates were <${Term} k="replay">replayed</${Term}>, so both versions see identical LLM outputs and no model was called (${A.zero_token_check.runs} replays, ${A.zero_token_check.nonzero} with any tokens).`)}
				${P(`DeepSeek v4.1 Flash already has both versions on the same LLM outputs. ${A.n_pairs} pairs: ${Object.entries(A.pairs_per_model).map(([m, n]) => `${m} ${n}`).join(', ')}.`, { fontSize: 18, color: C.dim })}</div>` },
			{ id: 'cells', label: 'Over cells (primary)', render: () => Table(['metric', 'cells', 'W/L', 'Δ', '95% interval', 'p', 'Holm p'], KEYS.map((k) => [LABEL[k], String(c[k].n_cells), `${c[k].wins}/${c[k].losses}`, sgn(c[k].mean_difference, 2), c[k].ci95_mean_difference ? `[${c[k].ci95_mean_difference.map((v) => v.toFixed(1)).join(', ')}]` : '—', pfmt(c[k].wilcoxon_p), pfmt(c[k].holm_p)]), { size: 17 }) },
			{ id: 'runs', label: 'Over run pairs (as Table XVII)', render: () => Table(['metric', 'pairs', 'W/L', 'Δ', 'p', 'Holm p'], KEYS.map((k) => [LABEL[k], String(r[k].n), `${r[k].wins}/${r[k].losses}`, sgn(r[k].mean_difference, 2), pfmt(r[k].wilcoxon_p), pfmt(r[k].holm_p)]), { size: 17 }) },
			{ id: 'models', label: 'Per model', render: () => Table(['model', 'pairs', 'Δ C2C-50', 'Δ CMod', 'Δ DI'], Object.entries(A.per_model_mean_difference).map(([m, v]) => [m, String(v.pairs), sgn(v['C2C-50']), sgn(v.CMod), sgn(v.DI)]), { align: ['left'], size: 18 }) },
			METHOD_TAB,
		],
		source: `Source: ${SRC} · ablation_8x5; protocols/campaigns/final-benchmark-extension-v1-ablation.yaml.`,
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 252, 1300, 40), fontFamily: F.sans, fontSize: 17, color: C.dim }}>Final minus the version that also scored <${Term} k="v-measure" /> · identical LLM outputs · ${c.CMod.n_cells} cells, ${A.n_pairs} run pairs, 8 models</div>
		<svg width="1920" height="1080" style=${{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}><line x1=${X0} y1="300" x2=${X0} y2="800" stroke=${C.ink} strokeWidth="2" /></svg>
		${rows.map((row, i) => {
			const sig = row.holm != null && row.holm < 0.05
			const w = Math.min(Math.abs(row.d) * unit, 520)
			return html`<div key=${row.k} style=${{ ...box(110, 305 + i * 68, 1700, 60), display: 'flex', alignItems: 'center' }}>
				<div style=${{ width: 200, fontFamily: F.hand, fontSize: 28 }}><${Term} k=${TERM[row.k]}>${LABEL[row.k]}</${Term}></div>
				<div style=${{ position: 'absolute', left: row.d >= 0 ? X0 - 110 : X0 - 110 - w, width: w, height: 30, top: 15, background: row.d >= 0 ? C.fix : C.red, opacity: sig ? 0.9 : 0.35, borderRadius: 6, transition: `width 700ms ${EASE}` }} />
				<div style=${{ position: 'absolute', left: X0 - 110 + (row.d >= 0 ? w + 12 : 12), top: 13, fontFamily: F.sans, fontSize: 20, fontWeight: 700 }}>${sgn(row.d)}</div>
				<div style=${{ position: 'absolute', left: 1020, top: 15, fontFamily: F.sans, fontSize: 17, color: C.dim, whiteSpace: 'nowrap' }}>W/L ${row.wl} · Holm p ${pfmt(row.holm)}</div></div>`
		})}
		<div style=${{ ...box(110, 818, 1100, 40), fontFamily: F.sans, fontSize: 16, color: C.dim }}>dark: significant after Holm (eight metrics) · C2C-10 omitted (unchanged in almost every pair)</div>
		<${Box} x=${1480} y=${300} w=${330} h=${480} title="with every model" on=${B >= 1} still=${still}>
			<div style=${{ fontFamily: F.sans, fontSize: 18, lineHeight: 1.5 }}>${(() => {
				const per = Object.values(A.per_model_mean_difference), up = ['CMod', 'DI', 'C2C-50'].filter((k) => per.every((v) => v[k] > 0))
				return up.length ? `${up.join(', ')} rise for all ${per.length} models, including the six held-out models that played no part in the decision.` : 'The direction differs between models.'
			})()}</div>
		</${Box}>
		<${Inside} x=${1560} y=${196} w=${300} label="The ablation" drawer=${drawer} still=${still} />
		<${SlideSource}>${SRC} · ablation (replay, no model calls)</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ Q4 · refinement, alternatives, transfer
export function Rq4OtherExtra({ b, still }) {
	const B = still ? 2 : b
	const R = EXT.refiner_8x5, d = R.blinded_delta_after_refinement_mean, raw = EXT.raw_candidate_repair_8x5, tr = EXT.transfer_8x5
	const bars = ['CMod', 'CiD', 'DI', 'c2c_cvg 50%', 'DTP', 'BCP', 'c2c_cvg 33%'].map((k) => [LABEL[k], d[k]])
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 252, 800, 640) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 34 }}>deterministic <${Term} k="local-search">refinement</${Term}></div>
			<div style=${{ fontFamily: F.sans, fontSize: 19, color: C.dim, margin: '6px 0 18px' }}>accepted at least one move in ${R.runs_with_moves} of ${R.runs} runs (8 models × 5); in those runs, change vs the selected candidate (blinded):</div>
			${bars.map(([m, v], i) => html`<div key=${m} style=${{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, ...reveal(true, still, { delay: 60 * i }) }}>
				<div style=${{ width: 110, fontFamily: F.hand, fontSize: 26 }}>${m}</div>
				<div style=${{ width: 520, position: 'relative', height: 26 }}>
					<div style=${{ position: 'absolute', left: 260, top: -4, bottom: -4, width: 2, background: C.ink }} />
					<div style=${{ position: 'absolute', left: v >= 0 ? 260 : 260 - Math.abs(v) * 25, width: Math.abs(v) * 25, height: 26, background: v >= 0 ? C.fix : C.red, opacity: 0.85, borderRadius: 6 }} /></div>
				<div style=${{ fontFamily: F.sans, fontSize: 19, fontWeight: 700 }}>${sgn(v)}</div></div>`)}
			<div style=${{ fontFamily: F.hand, fontSize: 28, marginTop: 8 }}>the trade: structure up, data qualities down</div>
		</div>
		<${Box} x=${980} y=${252} w=${830} h=${260} on=${B >= 1} still=${still}>
			<div style=${{ fontFamily: F.hand, fontSize: 34 }}>three candidates and repair</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, lineHeight: 1.5, marginTop: 8 }}>The safeguard was exercised: ${raw.raw_invalid_candidates} of ${raw.candidates} raw candidates (${raw.runs_with_any_raw_invalid_candidate} of ${raw.runs} runs) broke the output contract and were <${Term} k="repair">repaired</${Term}> before selection.</div>
		</${Box}>
		<${Box} x=${980} y=${540} w=${830} h=${380} on=${B >= 2} still=${still}>
			<div style=${{ fontFamily: F.hand, fontSize: 34 }}>transfer: design metrics where Final beats 80k</div>
			<div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 30, rowGap: 6, marginTop: 10 }}>
				${Object.entries(tr).map(([m, t]) => html`<div key=${m} style=${{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: F.sans, fontSize: 18 }}>
					<div style=${{ width: 210, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>${m}</div>
					<div style=${{ display: 'flex', gap: 3 }}>${Array.from({ length: t.of }, (_, i) => html`<div key=${i} style=${{ width: 15, height: 15, borderRadius: 8, background: i < t.design_metrics_final_beats_80k ? C.red : C.paper2 }} />`)}</div>
					<b>${t.design_metrics_final_beats_80k}/${t.of}</b></div>`)}</div>
			<div style=${{ fontFamily: F.sans, fontSize: 17, color: C.dim, marginTop: 10 }}>five-run means; DeepSeek v4.1 Flash and GLM-5.2 are development models, the other six are held out</div>
		</${Box}>
		<${SlideSource}>${SRC} · refiner, repair, transfer</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ the results slides
export const Rq1MainScene = Rq1MainExtra
export const Rq1PairedScene = Rq1PairedExtra
export const Rq1ToolsScene = Rq1ToolsExtra
export const Rq2Scene = Rq2Extra
export const Rq3Scene = Rq3Extra
export const Rq4Scene = Rq4Extra
export const Rq4OtherScene = Rq4OtherExtra
