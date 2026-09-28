// Part III · how the workflow reached its final form (paper §IV). Only the design experiments that
// taught something that shaped the final design: E1, E2, E5, and E8 → E9.
import { html, C, F, box, EASE, Stage, Term, Cite, Inside, Card, SHIELD, P, H, List, Note, Code, Quote, Table, rich, reveal, SlideSource, Src } from '../ui.js'
import { TABLES, PROMPTS, RUN_FILES } from '../data/results.js'
import { PETCLINIC } from '../data/systems.js'
import { useGo } from './front.js'
import { SLIDES } from '../deck.js'

const idx = (scene) => SLIDES.findIndex((s) => s.scene === scene)
const EVO = Object.fromEntries(TABLES.evolution.rows.map((r) => [r[0], { q: r[1], obs: r[2], dec: r[3] }]))
const Caption = ({ y = 930, children, still, on = true }) => html`<div style=${{ ...box(120, y, 1680, 60), textAlign: 'center', fontFamily: F.hand, fontSize: 32, color: C.ink, ...reveal(on, still) }}>${children}</div>`

// ------------------------------------------------------------------ IV-A · the design experiments that mattered
const KEY = [
	{ id: 'E1', lesson: 'Prompts alone do not create alternatives', term: 'candidate-collapse', extra: () => html`<div>
		${P('The three generator calls get the same evidence and differ only in their strategy instruction. The worked example shows the effect: on Spring PetClinic, domain-first and balanced return the same six-service partition under different names.')}
		${P(html`What stayed: the diversity diagnostics are still computed and reported, and collapse is reported as a finding. See <${Term} k="candidate-collapse" />.`)}</div>` },
	{ id: 'E2', lesson: 'Forcing diversity does not make better candidates', term: 'louvain', extra: () => html`<div>
		${P(html`The seeds grouped classes algorithmically (<${Term} k="louvain" /> community detection <${Cite} k="blondel2008louvain" />) and let the LLM only name the groups. They guaranteed three distinct candidates, but the pools were not better.`)}
		${P('What stayed: the LLM keeps control of class membership.')}</div>` },
	{ id: 'E5', lesson: 'Deterministic refinement beats self-critique', term: 'local-search', extra: () => html`<div>
		${P(html`The first refiner asked the LLM to critique and patch its own candidate. That matches the literature's warning: LLMs rarely improve their own output without reliable external feedback <${Cite} keys=${['huang2024cannot', 'kamoi2024selfcorrection', 'olausson2024selfrepair']} />.`)}
		${P(html`Its replacement, bounded <${Term} k="local-search" /> with strict <${Term} k="pareto">Pareto</${Term}> acceptance, only accepts a move when the measurements improve, and otherwise abstains. It makes no LLM call.`)}</div>` },
	{ id: 'E9', trigger: 'E8', lesson: 'Never grade a candidate by its own construction', term: 'self-referential', extra: () => html`<div>
		${P(html`E8 evaluated the interim design and found lower C2C-50 and DTP than 80k concat, with selection favouring the fragmented domain-first candidate. Analysing the score (E9) showed why: V-measure rewarded agreement with the capability map from which the domain-first candidate was generated.`)}
		${P('How the change was checked before adoption (development loop, recorded LLM outputs of the 20 DeepSeek runs replayed):')}
		${List(['with the circular term, the refiner accepted 0 moves in all 20 runs', 'without it, the refiner accepted 36 moves across the 20 runs', 'on the development runs the change beat 80k concat on four of five design metrics (CMod, CiD, DI, BCP) and lost on DTP'])}
		${Src('studies/agentic-development-loop-v1/loop-log.jsonl (v0-control, v1b-no-domain-selection); docs/research-notes/final-architecture-and-benchmark-design-2026-09-25.md')}
		${Note(html`Adopted as the final workflow. Its effect is measured by the paired ablation of RQ4. The analysis was prompted by a blinded outcome (E8), so the paper treats the size of that effect as possibly optimistic.`, C.faint)}</div>` },
]
export function EvolutionScene({ b, still }) {
	const B = still ? 4 : b
	const all = {
		title: 'All nine design experiments (Table VII)', kicker: '§IV-A',
		tabs: [{ id: 'all', label: 'Table VII', render: () => html`<div>
			${P('Every experiment used DeepSeek v4.1 Flash and blinded evaluation after freezing. E1–E7 and E9 each changed one mechanism; E8 evaluated the interim design. The slide shows the four that shaped the final design.', { fontSize: 19, color: C.dim })}
			${Table(['', 'question', 'observation', 'decision'], TABLES.evolution.rows.map((r) => [r[0], r[1], r[2], r[3]]), { align: ['left', 'left', 'left', 'left'], size: 17 })}</div>` }],
		source: 'Source: Table VII, §IV-A.',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 245, 1400, 50), fontFamily: F.hand, fontSize: 30, color: C.dim }}>one change at a time, on DeepSeek, outcomes blinded, every result kept</div>
		<svg width="1920" height="1080" style=${{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
			<line x1="150" y1="360" x2="1780" y2="360" stroke=${C.ink} strokeWidth="4" strokeDasharray="3 14" strokeLinecap="round" />
		</svg>
		${KEY.map((k, i) => {
			const e = EVO[k.id]
			const drawer = {
				title: `${k.trigger ? k.trigger + ' → ' : ''}${k.id} · ${k.lesson}`, kicker: 'design experiment',
				tabs: [
					{ id: 'row', label: 'Question · observation · decision', render: () => html`<div>
						${k.trigger && html`<div>${H(`${k.trigger} · ${EVO[k.trigger].q}`)}${P(rich(EVO[k.trigger].obs))}${P(html`<b>Decision:</b> ${EVO[k.trigger].dec}`)}</div>`}
						${H(`${k.id} · ${e.q}`)}${P(rich(e.obs))}${P(html`<b>Decision:</b> ${e.dec}`)}</div>` },
					{ id: 'more', label: 'What we learned', render: k.extra },
				],
				source: 'Source: Table VII, §IV-A.',
			}
			const x = 110 + i * 430
			return html`<div key=${k.id} style=${{ ...reveal(B >= i + 1 || B === 0, still, { delay: B === 0 ? i * 100 : 0 }) }}>
				<div style=${{ ...box(x + 150, 330, 60, 60), borderRadius: 30, background: B >= i + 1 ? C.red : C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.hand, fontSize: 26 }}>${k.id}</div>
				<${Card} drawer=${drawer} still=${still} style=${{ left: x, top: 420, width: 400, height: 470, padding: '20px 24px' }} color=${B >= i + 1 ? C.red : C.ink}>
					${k.trigger && html`<div style=${{ fontFamily: F.sans, fontSize: 16, color: C.dim, marginBottom: 4 }}>triggered by ${k.trigger}</div>`}
					<div style=${{ fontFamily: F.hand, fontSize: 30, lineHeight: 1.15 }}>${e.q}</div>
					<div style=${{ fontFamily: F.sans, fontSize: 18, lineHeight: 1.45, color: C.dim, marginTop: 12 }}>${e.obs.length > 170 ? e.obs.slice(0, 165).replace(/\s\S*$/, '') + ' …' : e.obs}</div>
					<div style=${{ position: 'absolute', left: 24, right: 24, bottom: 20, fontFamily: F.hand, fontSize: 26, color: C.red, lineHeight: 1.2 }}>${k.lesson}</div>
				</${Card}>
			</div>`
		})}
		<${Inside} x=${1560} y=${200} w=${300} label="All nine (Table VII)" drawer=${all} still=${still} color=${C.ink} />
		<${Caption} y=${920} still=${still} on=${B >= 4}>click a card: the experiment, what it showed, what it changed</${Caption}>
		<${SlideSource}>Table VII · §IV-A</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ IV-B · choosing the baselines
export function BaselinesScene({ b, still }) {
	const B = still ? 2 : b
	const oc = TABLES.opencode.rows
	const prompts = {
		title: 'The five OpenCode prompts', kicker: '§IV-B · verbatim',
		tabs: oc.map((r, i) => ({ id: `b${i + 1}`, label: `${r[0]} · ${r[1]}`, render: () => html`<div>
			${Note(html`In the matched runs the benchmark scope was appended to every variant, requiring each inventory class to be assigned exactly once.${i === 4 ? ' One line of this prompt is paraphrased for this deck, marked "edited".' : ''}`, C.faint)}
			<pre style=${{ margin: 0, padding: '16px 20px', background: '#fffdf8', border: `2px solid ${C.line}`, borderRadius: 12, fontFamily: F.mono, fontSize: 16, lineHeight: 1.5, whiteSpace: 'pre-wrap', userSelect: 'text' }}>${PROMPTS[`baseline-${i + 1}`]}</pre>
			${Src(`protocols/prompts/harness-baselines-v1/baseline-${i + 1}.md`)}</div>` })),
	}
	const why = {
		title: 'Why baseline-3', kicker: 'information parity',
		tabs: [
			{ id: 'rule', label: 'The rule', render: () => html`<div>
				${P(html`Chosen by a criterion declared before comparing scores: <${Term} k="information-parity" />. The comparison is meant to isolate the paradigm (one call, a fixed workflow, an autonomous agent), so every arm should receive the same information.`)}
				${List(['baseline-1 and baseline-2 lack the dependency graph', 'baseline-4 lacks the design goals and would be a strawman', 'baseline-5 is told evaluation metrics (including DTP, DI, BCP) that no other arm receives', 'baseline-3 is the only one with the same inputs (source + dependency graph) and the same design goals'])}</div>` },
			{ id: 'checks', label: 'Two checks', render: () => List([
				'reliability: baseline-3 produced a valid decomposition in all eight matched runs (four with DeepSeek, four with the pilot model), as did baseline-2; baseline-1, baseline-4 and baseline-5 each failed once with the pilot model',
				'strength: with DeepSeek and across the four agents of the earlier study, baseline-3 is second only to baseline-5; with the pilot model it is mid-range',
			]) },
			{ id: 'cost', label: 'The cost of fairness', render: () => P('Choosing baseline-3 rather than the highest-scoring baseline-5 makes the OpenCode baseline somewhat weaker in reference similarity. The paper accepts this, because baseline-5\'s advantage comes from knowing how it will be evaluated.') },
			{ id: 'table', label: 'Table VIII', render: () => html`<div>
				${Table(['variant', 'prompt content', 'DeepSeek', 'pilot (valid)', '4 harnesses (valid)'], oc, { align: ['left', 'left', 'right', 'right', 'right'], hi: (j) => j === 2 })}
				${P(rich(TABLES.opencode.caption), { fontSize: 17, color: C.dim })}</div>` },
		],
		source: 'Source: §IV-B, Table VIII.',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 250, 780, 690) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 36, color: C.red }}>which single-shot variant?</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, color: C.dim, margin: '6px 0 22px' }}>matched DeepSeek runs, per system</div>
			${[['80k concat', 60.8, 89516], ['hierarchical', 51.6, 414006]].map(([n, c, t]) => html`<div key=${n} style=${{ marginBottom: 26 }}>
				<div style=${{ fontFamily: F.hand, fontSize: 32 }}>${n === 'hierarchical' ? html`<${Term} k="hierarchical">hierarchical</${Term}>` : html`<${Term} k="80k">80k concat</${Term}>`}</div>
				<div style=${{ display: 'flex', gap: 14, alignItems: 'center', fontFamily: F.sans, fontSize: 18, marginTop: 6 }}>
					<span style=${{ width: 110 }}>C2C-50</span><div style=${{ width: 400, height: 18, background: C.paper2, borderRadius: 9 }}><div style=${{ width: `${c}%`, height: '100%', background: C.ink, borderRadius: 9, opacity: 0.75 }} /></div><b>${c.toFixed(1)}</b></div>
				<div style=${{ display: 'flex', gap: 14, alignItems: 'center', fontFamily: F.sans, fontSize: 18, marginTop: 8 }}>
					<span style=${{ width: 110 }}>tokens</span><div style=${{ width: 400, height: 18, background: C.paper2, borderRadius: 9 }}><div style=${{ width: `${(t / 414006) * 100}%`, height: '100%', background: C.red, borderRadius: 9, opacity: 0.8 }} /></div><b>${t.toLocaleString('en-US')}</b></div></div>`)}
			<div style=${{ fontFamily: F.hand, fontSize: 30, marginTop: 10 }}>4.6× the tokens, no gain → <span style=${{ color: C.red }}>80k concat</span></div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, marginTop: 8 }}>as our previous study found <${Cite} k="sambu2026icsa" /></div>
		</div>
		<div style=${{ ...box(960, 250, 850, 690), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 36, color: C.red }}>which OpenCode prompt?</div>
			<div style=${{ fontFamily: F.sans, fontSize: 20, color: C.dim, margin: '6px 0 16px' }}>five variants, same output format · C2C-50 with DeepSeek</div>
			${oc.map((r, i) => html`<div key=${r[0]} style=${{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
				<div style=${{ width: 150, fontFamily: F.hand, fontSize: 28, color: i === 2 ? C.red : C.ink }}>${r[0]}</div>
				<div style=${{ width: 290, fontFamily: F.sans, fontSize: 17, color: C.dim }}>${r[1]}</div>
				<div style=${{ width: 260, height: 18, background: C.paper2, borderRadius: 9 }}><div style=${{ width: `${Number(r[2])}%`, height: '100%', background: i === 2 ? C.red : C.ink, opacity: i === 2 ? 0.85 : 0.45, borderRadius: 9 }} /></div>
				<b style=${{ fontFamily: F.sans, fontSize: 18 }}>${r[2]}</b></div>`)}
			<div style=${{ fontFamily: F.hand, fontSize: 30, marginTop: 12, ...reveal(B >= 2, still) }}>picked by <${Term} k="information-parity" />, not by score: baseline-3</div>
			<div style=${{ display: 'flex', gap: 14, marginTop: 18, ...reveal(B >= 2, still) }}>
				<${Inside} label="Why baseline-3" drawer=${why} still=${still} />
				<${Inside} label="Read the prompts" drawer=${prompts} still=${still} color=${C.ink} />
			</div>
		</div>
		<${SlideSource}>§IV-B · Table VIII</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ IV-C · execution and provenance
function tree(files) {
	const dirs = {}
	for (const f of files) { const d = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '.'; (dirs[d] ??= []).push(f.slice(f.lastIndexOf('/') + 1)) }
	return Object.entries(dirs).sort().map(([d, fs]) => html`<div key=${d} style=${{ marginBottom: 8 }}>
		<div style=${{ fontFamily: F.mono, fontSize: 16, fontWeight: 700 }}>${d === '.' ? '(run root)' : d + '/'}</div>
		<div style=${{ fontFamily: F.mono, fontSize: 15, color: C.dim, paddingLeft: 22, lineHeight: 1.5 }}>${fs.join(' · ')}</div></div>`)
}
export function ExecutionScene({ b, still }) {
	const B = still ? 1 : b
	const models = [['DeepSeek v4.1 Flash', 5], ['GLM-5.2', 1], ['gpt-oss:120b', 1], ['gemma4:31b', 1]]
	const arms = ['80k', 'OpenCode', 'Final']
	const drawer = {
		title: 'One observation, on disk', kicker: 'provenance',
		tabs: [
			{ id: 'tree', label: 'Files of one run', render: () => html`<div>
				${P(html`The traced PetClinic run of the final workflow (${Code(PETCLINIC.run)}): ${RUN_FILES.length} files.`, { fontSize: 18 })}${tree(RUN_FILES)}</div>` },
			{ id: 'what', label: 'What every run stores', render: () => List(['its frozen inputs and a benchmark-scope fingerprint', 'every LLM call with its token usage', 'every intermediate artifact (evidence pack, domain model, candidates, refinement rounds)', 'the validation result and the blinded report', 'a manifest with content hashes']) },
			{ id: 'runner', label: 'The runner', render: () => P(html`All runs used Ollama Cloud <${Cite} k="ollama2026models" />, executed by a campaign runner that materialises the scoped benchmark for each system, runs one model at a time with at most three concurrent requests, and publishes each observation atomically. Runs are immutable: the controller refuses to overwrite an existing run, and a retry gets a new run.`) },
		],
		source: 'Source: §III-B (Process Controller), §IV-C; studies/final-benchmark-v1/runs.',
	}
	let n = 0
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 245, 1000, 50), fontFamily: F.hand, fontSize: 32 }}>96 observations, each one a sealed folder</div>
		${models.map(([m, reps], i) => html`<div key=${m} style=${{ ...box(110, 320 + i * 150, 1100, 140) }}>
			<div style=${{ fontFamily: F.sans, fontSize: 20, fontWeight: 600 }}>${m} <span style=${{ color: C.dim, fontWeight: 400, fontSize: 17 }}>· ${reps === 5 ? '5 repetitions (seeds 1–5)' : '1 run per cell'}</span></div>
			<div style=${{ display: 'flex', gap: 22, marginTop: 10 }}>
				${arms.map((a) => html`<div key=${a} style=${{ display: 'flex', flexWrap: 'wrap', gap: 5, width: 330 }}>
					${Array.from({ length: 4 * reps }, (_, k) => { const d = n++; return html`<div key=${k} style=${{ width: 13, height: 13, borderRadius: 3, background: a === 'Final' ? C.red : C.ink, opacity: a === 'Final' ? 0.85 : 0.5, ...reveal(true, still, { delay: 6 * d, dy: 4 }) }} />` })}
					<div style=${{ width: '100%', fontFamily: F.sans, fontSize: 15, color: C.dim, marginTop: 2 }}>${a} · ${4 * reps}</div></div>`)}
			</div></div>`)}
		<div style=${{ ...box(1260, 320, 550, 560), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 32, color: C.red }}>inside each folder</div>
			${List(['frozen inputs + scope fingerprint', 'every LLM call and its tokens', 'every intermediate artifact', 'validation + blinded report', 'a manifest with content hashes'], { size: 21 })}
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, marginTop: 8 }}>Every number in the paper is recomputed from these files by a script, without calling a model.</div>
			<div style=${{ marginTop: 20 }}><${Inside} label="Open one run" drawer=${drawer} still=${still} /></div>
		</div>
		<${SlideSource}>§IV-C</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ IV-D · the worked example
export function ExampleScene({ b, still }) {
	const B = still ? 3 : b
	const go = useGo()
	const ex = TABLES.example.rows
	const names = ['dependency-first (selected)', 'domain-first', 'balanced']
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 245, 1700, 50), fontFamily: F.hand, fontSize: 30, color: C.dim }}>Spring PetClinic · DeepSeek v4.1 Flash · the run the live trace follows</div>
		<div style=${{ ...box(110, 310, 1700, 60), display: 'flex', fontFamily: F.sans, fontSize: 16, fontWeight: 700, color: C.dim }}>
			<div style=${{ width: 300 }}>candidate</div><div style=${{ width: 780 }}>services (classes)</div>
			${[['CMod', 'cmod'], ['CiD', 'cid'], ['MF', 'mf'], ['score', 'composite'], ['V-measure', 'v-measure']].map(([h, t]) => html`<div key=${h} style=${{ width: 124, textAlign: 'right' }}><${Term} k=${t}>${h}</${Term}></div>`)}</div>
		${ex.map((r, i) => html`<div key=${i} style=${{ ...box(110, 370 + i * 96, 1700, 86), display: 'flex', alignItems: 'center', borderRadius: 14, background: i === 0 && B >= 1 ? C.redGlow : '#fffdf8', border: `2px solid ${i === 0 && B >= 1 ? C.red : C.line}`, padding: '0 0 0 16px', boxSizing: 'border-box', ...reveal(true, still, { delay: 100 * i }) }}>
			<div style=${{ width: 284, fontFamily: F.hand, fontSize: 27 }}>${names[i]}</div>
			<div style=${{ width: 780, fontFamily: F.sans, fontSize: 17, lineHeight: 1.35, color: C.dim }}>${r[1]}</div>
			${r.slice(2).map((v, j) => html`<div key=${j} style=${{ width: 124, textAlign: 'right', fontFamily: F.sans, fontSize: 24, fontWeight: 700, color: j === 4 ? C.dim : C.ink }}>${v}</div>`)}</div>`)}
		<div style=${{ ...box(110, 680, 1700, 80), fontFamily: F.hand, fontSize: 27, lineHeight: 1.3, ...reveal(B >= 1, still) }}>
			Selected: dependency-first. Had the <${Term} k="v-measure">capability agreement</${Term}> been scored, the six-service candidates would have won: the <${Term} k="self-referential" /> trap.</div>
		<div style=${{ ...box(110, 770, 1700, 80), fontFamily: F.hand, fontSize: 27, lineHeight: 1.3, ...reveal(B >= 2, still) }}>
			Refinement: Vet, Specialty and Visit move to the shared base classes; CMod 55.4 → 66.8, MF 73.9 → 76.5, CiD stays 100. Frozen: C2C-10/33/50 = 100 / 75 / 75.</div>
		<div style=${{ ...box(110, 858, 1700, 50), fontFamily: F.hand, fontSize: 27, color: C.red, ...reveal(B >= 3, still) }}>
			Structurally better, semantically questionable: an architect would likely reverse these moves.</div>
		<div style=${{ ...box(110, 925, 900, 60), display: 'flex', gap: 14 }}>
			${[['the live trace', 'p2-trace'], ['Algorithm 1, step by step', 'p2-algorithm']].map(([l, s]) => idx(s) >= 0 && html`<button key=${s} type="button" ...${SHIELD} onClick=${(e) => { e.stopPropagation(); go(idx(s)) }}
				style=${{ pointerEvents: 'all', cursor: 'pointer', padding: '0 20px', height: 46, borderRadius: 999, border: `2.5px solid ${C.ink}`, background: '#fffdf8', fontFamily: F.sans, fontSize: 18, fontWeight: 600 }}>← ${l} (slide ${idx(s) + 1})</button>`)}
		</div>
		<${SlideSource}>Table IX · §IV-D</${SlideSource}>
	</${Stage}>`
}
