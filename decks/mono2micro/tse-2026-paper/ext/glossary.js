// The deck's glossary: every technical term a reader can click. Each entry says what the term means in
// this paper, gives a formula and a worked example where one helps, and names its source (paper section,
// cited work, or the code that implements it). Worked-example numbers are computed here, not typed.
import { html, C, F, P, H, Code, Formula, Note, List, Table, Term, Cite, useShared } from './ui.js'
import { clippedEntropy, cmod, cid, c2c, mf, overlap } from './metrics.js'

const f1 = (v) => (v == null ? '—' : (Math.round(v * 10) / 10).toFixed(1))
const Btn = ({ on, onClick, children }) => html`<button type="button" onClick=${(e) => { e.stopPropagation(); onClick() }}
	style=${{ margin: '0 8px 8px 0', padding: '8px 16px', borderRadius: 999, cursor: 'pointer', border: `2px solid ${on ? C.red : C.line}`, background: on ? C.red : '#fffdf8', color: on ? '#fff' : C.ink, fontFamily: F.sans, fontSize: 18, fontWeight: 600 }}>${children}</button>`

// ------------------------------------------------------------------ small worked-example widgets
// A toy system used by several metric examples (illustrative, not from the benchmark).
const TOY_EDGES = [['Order', 'OrderItem', 'd', 3], ['OrderItem', 'Product', 'd', 1], ['Order', 'Customer', 'd', 2], ['Product', 'Stock', 'd', 2], ['Invoice', 'Order', 'd', 1], ['Invoice', 'Customer', 'd', 1]]
const TOY_SPLITS = {
	'two services': { Sales: ['Order', 'OrderItem', 'Customer', 'Invoice'], Catalog: ['Product', 'Stock'] },
	'three services': { Orders: ['Order', 'OrderItem'], Customers: ['Customer', 'Invoice'], Catalog: ['Product', 'Stock'] },
	'one service': { All: ['Order', 'OrderItem', 'Customer', 'Invoice', 'Product', 'Stock'] },
}
function ToyMetric({ metric }) {
	const [pick, setPick] = useShared(`toy:split:${metric}`, 'two services')
	const dec = TOY_SPLITS[pick]
	const r = metric === 'cmod' ? cmod(dec, TOY_EDGES) : metric === 'cid' ? cid(dec, TOY_EDGES) : mf(dec)
	return html`<div>
		${P('An illustrative six-class system with weighted dependency edges: Order→OrderItem (3), OrderItem→Product (1), Order→Customer (2), Product→Stock (2), Invoice→Order (1), Invoice→Customer (1). Pick a split:', { fontSize: 19 })}
		<div>${Object.keys(TOY_SPLITS).map((k) => html`<${Btn} key=${k} on=${k === pick} onClick=${() => setPick(k)}>${k}</${Btn}>`)}</div>
		${Table(['service', 'classes'], Object.entries(dec).map(([s, cs]) => [s, cs.join(', ')]), { align: ['left', 'left'], size: 18 })}
		${metric === 'cmod' && html`<div>
			${Table(['service', 'internal', 'external', 'CF'], Object.entries(r.parts).map(([s, p]) => [s, p.internal, p.external, p.cf.toFixed(3)]), { size: 18 })}
			${P(html`CMod = mean CF × 100 = <b>${f1(r.value)}</b>${pick === 'one service' ? ' — the maximum, reached by putting everything in one service.' : ''}`)}</div>`}
		${metric === 'cid' && html`<div>
			${r.pairs.length ? Table(['pair', 'A → B', 'B → A', 'cyclic?'], r.pairs.map((p) => [`${p.a} · ${p.b}`, p.ab ? 'yes' : 'no', p.ba ? 'yes' : 'no', p.ab && p.ba ? 'yes' : 'no']), { size: 18 }) : P('One service: there are no service pairs.')}
			${P(html`CiD = <b>${f1(r.value)}</b>${pick === 'one service' ? ' — no pairs, so nothing can be cyclic.' : ''}`)}</div>`}
		${metric === 'mf' && html`<div>${P(html`s<sub>max</sub> = ${r.sMax.toFixed(3)}, s<sub>1</sub> = ${r.s1.toFixed(3)} → MF = <b>${f1(r.value)}</b>`)}</div>`}
	</div>`
}

function ToyEntropy({ kind }) {
	// Illustrative: how the classes touching one table (DTP) or one use case (DI) spread over services.
	const cases = { 'all in one service': [4], 'split 3 + 1': [3, 1], 'split 2 + 2': [2, 2], 'split 2 + 1 + 1': [2, 1, 1] }
	const [pick, setPick] = useShared(`toy:entropy:${kind}`, 'split 3 + 1')
	const counts = cases[pick]
	const raw = -counts.reduce((s, c) => s + (c / 4) * Math.log(c / 4), 0)
	return html`<div>
		${P(`Illustrative: four classes access one ${kind}. How are they spread over services?`, { fontSize: 19 })}
		<div>${Object.keys(cases).map((k) => html`<${Btn} key=${k} on=${k === pick} onClick=${() => setPick(k)}>${k}</${Btn}>`)}</div>
		${Formula(html`entropy = −Σ p·ln p = ${raw.toFixed(3)}  →  clipped at 1: ${clippedEntropy(counts).toFixed(3)}  →  contribution to purity: ${(100 * (1 - clippedEntropy(counts))).toFixed(1)}`)}
		${P(`The metric averages the clipped entropy over all ${kind === 'table' ? 'tables' : 'use cases'} and reports 100 × (1 − mean). Entropy above 1 (a very spread ${kind}) counts the same as 1.`, { fontSize: 19 })}
	</div>`
}

function ToyC2C() {
	const produced = ['Owner', 'Pet', 'Visit', 'Vet']
	const ref = { customers: ['Owner', 'Pet', 'PetType', 'BaseEntity'], visits: ['Visit', 'BaseEntity'] }
	const rows = Object.entries(ref).map(([n, cs]) => [n, cs.join(', '), `${produced.filter((c) => cs.includes(c)).length} / max(${produced.length}, ${cs.length})`, overlap(produced, cs).toFixed(2)])
	return html`<div>
		${P('Illustrative: one produced service {Owner, Pet, Visit, Vet} against two reference services. Note BaseEntity is in both reference services, as shared classes are in the real references.', { fontSize: 19 })}
		${Table(['reference service', 'classes', 'overlap', 'value'], rows, { size: 18 })}
		${P('The best overlap is 0.50. The service counts at C2C-10 and C2C-33 (0.50 > 0.10, 0.50 > 0.33) but not at C2C-50: the implementation needs strictly more than 50 %.', { fontSize: 19 })}
	</div>`
}

// Wilcoxon signed-rank, exact two-sided p by enumerating every sign pattern (fine for n ≤ 16).
function wilcoxon(d) {
	const nz = d.filter((x) => x !== 0)
	const abs = nz.map(Math.abs)
	const sorted = [...abs].sort((a, b) => a - b)
	const rank = (v) => { const first = sorted.indexOf(v), last = sorted.lastIndexOf(v); return (first + last) / 2 + 1 }
	const ranks = abs.map(rank)
	const wPlus = nz.reduce((s, x, i) => s + (x > 0 ? ranks[i] : 0), 0)
	const wMinus = nz.reduce((s, x, i) => s + (x < 0 ? ranks[i] : 0), 0)
	const n = nz.length, total = ranks.reduce((a, b) => a + b, 0), obs = Math.min(wPlus, wMinus)
	let extreme = 0
	for (let m = 0; m < 1 << n; m++) {
		let w = 0
		for (let i = 0; i < n; i++) if (m & (1 << i)) w += ranks[i]
		if (Math.min(w, total - w) <= obs + 1e-9) extreme++
	}
	return { nz, ranks, wPlus, wMinus, p: extreme / (1 << n) }
}
function ToyWilcoxon() {
	const sets = { 'mostly positive': [4.1, 2.0, 6.3, -1.2, 3.5, 5.0, 0, 2.2], 'mixed': [4.1, -2.0, 1.3, -3.2, 0.5, 2.0, -1.1, 0], 'all positive': [1.1, 2.4, 0.8, 3.0, 1.9, 2.6, 0.4, 1.5] }
	const [pick, setPick] = useShared('toy:wilcoxon', 'mostly positive')
	const r = wilcoxon(sets[pick])
	return html`<div>
		${P('Illustrative differences (arm A − arm B) for eight paired cells. Pick a pattern:', { fontSize: 19 })}
		<div>${Object.keys(sets).map((k) => html`<${Btn} key=${k} on=${k === pick} onClick=${() => setPick(k)}>${k}</${Btn}>`)}</div>
		${Table(['cell', 'difference', '|rank|', 'sign'], sets[pick].map((x, i) => {
			const j = r.nz.indexOf(x)
			return [String(i + 1), x.toFixed(1), x === 0 ? 'dropped (tie)' : r.ranks[j].toFixed(1), x > 0 ? '+' : x < 0 ? '−' : '0']
		}), { size: 18 })}
		${P(html`W<sub>+</sub> = ${r.wPlus}, W<sub>−</sub> = ${r.wMinus}. Exact two-sided p (all ${1 << r.nz.length} sign patterns) = <b>${r.p.toFixed(4)}</b>.`)}
		${Note(html`Here zero differences are simply dropped. The study's script keeps them with ${Code('zero_method="zsplit"')}, which splits their ranks between the two signs; the idea is the same.`, C.faint)}
	</div>`
}

function cliffsDelta(x, y) {
	let gt = 0, lt = 0
	for (const a of x) for (const b of y) { if (a > b) gt++; else if (a < b) lt++ }
	return { gt, lt, n: x.length * y.length, d: (gt - lt) / (x.length * y.length) }
}
function ToyCliff() {
	const sets = { 'A clearly higher': [[70, 72, 75, 78], [60, 62, 64, 71]], 'overlapping': [[60, 66, 70, 74], [58, 65, 71, 73]], 'identical': [[60, 65, 70], [60, 65, 70]] }
	const [pick, setPick] = useShared('toy:cliff', 'A clearly higher')
	const [x, y] = sets[pick]
	const r = cliffsDelta(x, y)
	return html`<div>
		${P('Illustrative scores of two arms. Pick a pattern:', { fontSize: 19 })}
		<div>${Object.keys(sets).map((k) => html`<${Btn} key=${k} on=${k === pick} onClick=${() => setPick(k)}>${k}</${Btn}>`)}</div>
		${P(html`A = [${x.join(', ')}], B = [${y.join(', ')}]. Comparing every a with every b (${r.n} pairs): a ${'>'} b in ${r.gt}, a ${'<'} b in ${r.lt}.`)}
		${Formula(html`δ = (${r.gt} − ${r.lt}) / ${r.n} = <b>${r.d.toFixed(3)}</b>`)}
		${P('Common reading of |δ|: below 0.147 negligible, below 0.33 small, below 0.474 medium, otherwise large (Romano et al.; a convention, not a law).', { fontSize: 18, color: C.dim })}
	</div>`
}

function ToyBonferroni() {
	const [m, setM] = useShared('toy:bonferroni', 8)
	const alpha = 0.05
	const ps = [['CMod', 0.0007], ['DI', 0.0013], ['C2C-50', 0.028], ['CiD', 0.052]]
	return html`<div>
		${P('Testing many metrics at α = 0.05 makes a false positive likely somewhere. Bonferroni divides α by the number of tests m.', { fontSize: 19 })}
		<div>${[1, 4, 8].map((k) => html`<${Btn} key=${k} on=${k === m} onClick=${() => setM(k)}>m = ${k}</${Btn}>`)}</div>
		${Formula(html`threshold = α / m = 0.05 / ${m} = <b>${(alpha / m).toFixed(5)}</b>`)}
		${Table(['ablation metric (§V-D)', 'p', `significant at ${(alpha / m).toFixed(4)}?`], ps.map(([k, p]) => [k, p.toFixed(4), p < alpha / m ? 'yes' : 'no']), { size: 18 })}
		${P('With m = 8 (the eight metrics of the ablation), CMod and DI stay significant and C2C-50 does not, as the current write-up reports.', { fontSize: 19 })}
	</div>`
}

// ------------------------------------------------------------------ the glossary
export const GLOSSARY = {
	// ---- the domain
	monolith: {
		term: 'Monolith', family: 'architecture',
		short: 'An application built and deployed as one unit: all its code shares one process, one release cycle and usually one database.',
		body: () => P('Simple early on; harder to evolve as the system and the teams around it grow. Every system in this study is a Java monolith.'),
		source: html`§I; Newman <${Cite} k="newman2019monolith" />`, see: ['microservice', 'decomposition'],
	},
	microservice: {
		term: 'Microservice', family: 'architecture',
		short: 'A small, independently deployable service that owns one part of the business and talks to other services over the network.',
		body: () => P(html`Promised benefits: modularity, independent deployment, technology choice, team autonomy <${Cite} k="lewis2014microservices" />. They depend on drawing good service boundaries.`),
		source: html`§I <${Cite} k="lewis2014microservices" />`, see: ['monolith', 'service-boundary'],
	},
	'service-boundary': {
		term: 'Service boundary', family: 'architecture',
		short: 'The line that decides which classes belong to which service. Getting it right is the hard part of a migration.',
		body: () => P(html`It must balance structural dependencies, business capabilities and quality concerns <${Cite} keys=${['evans2003ddd', 'wang2024comparison']} />.`),
		source: '§I', see: ['decomposition', 'bounded-context'],
	},
	decomposition: {
		term: 'Decomposition', family: 'the task',
		short: 'An assignment of the monolith\'s program elements (here: classes) to candidate microservices.',
		body: () => html`<div>${P(html`This work is at class level, like the benchmark. A decomposition is a <${Term} k="partition" />: every class belongs to exactly one named service.`)}
			${P('Method-level and mixed-granularity approaches exist but are out of scope.')}</div>`,
		source: '§II-A', see: ['partition', 'reference', 'validity'],
	},
	partition: {
		term: 'Partition', family: 'the task',
		short: 'A split of a set into groups where every element is in exactly one group.',
		body: () => html`<div>${P('Every decomposition this study produces or compares is a partition of the class inventory. The benchmark\'s reference decompositions are not: they put some shared classes in several services.')}
			${P(html`Why produce partitions anyway: comparability with the tools and baselines, metrics that assume one service per class, and keeping "should this class be duplicated?" as a separate later decision (§III-D).`)}</div>`,
		source: '§II-A, §III-D', see: ['overlap', 'reference', 'c2c'],
	},
	overlap: {
		term: 'Overlapping reference', family: 'the benchmark',
		short: 'A reference decomposition that lists some classes in more than one service, as real systems do when they copy shared code into each service.',
		body: () => P('Shared classes are base entities, exceptions, factories and utilities. In 7ep Demo, 12 of 47 classes appear in more than one service, adding 23 extra memberships; in Spring PetClinic, BaseEntity, NamedEntity, Person and PetClinicApplication each appear in several services.'),
		source: '§III-D, Table IV; benchmarks/systems/*/ground-truth', see: ['partition', 'c2c', 'reference'],
	},
	reference: {
		term: 'Reference decomposition', family: 'the benchmark',
		short: 'The microservice split the system\'s developers actually built, used as one possible "right answer".',
		body: () => html`<div>${P(html`From the independent tool comparison of Wang, Bornais and Rubin <${Cite} k="wang2024comparison" />. It is one valid architecture among several <${Cite} k="shtern2011multiple" />, so similarity to it is a secondary signal.`)}
			${P('It is never shown to any method before its answer is frozen.')}</div>`,
		source: '§II-A, §II-B, §VII', see: ['blinded-evaluation', 'c2c', 'overlap'],
	},
	'class-inventory': {
		term: 'Class inventory', family: 'the benchmark',
		short: 'The fixed list of classes that counts for a system: the evaluated universe. Every arm gets exactly this list.',
		body: () => P('Each arm also gets a source snapshot restricted to these classes and the static dependency graph filtered to them. 47, 24, 53 and 23 classes for 7ep Demo, JPetStore, PartsUnlimitedMRP and Spring PetClinic.'),
		source: '§III-C, Table IV; benchmarks/systems/*/evidence/application/classes.txt', see: ['validity', 'dependency-graph'],
	},
	'dependency-graph': {
		term: 'Static dependency graph', family: 'evidence',
		short: 'Which class uses which, read from the code without running it: calls, uses, creates, extends, implements, with weights.',
		body: () => P('The workflow\'s evidence constructor loads it as typed edges; the metric engine scores CMod and CiD on the benchmark\'s weighted class graph.'),
		source: '§III-B (1); benchmarks/systems/*/evidence', see: ['cmod', 'evidence-pack'],
	},
	'bounded-context': {
		term: 'Bounded context', family: 'domain-driven design',
		short: 'A boundary inside which one domain model is consistent: the same word means the same thing everywhere inside it.',
		body: () => P(html`A domain-driven-design idea <${Cite} k="evans2003ddd" /> often used as a guide for service boundaries. The workflow's domain extractor proposes bounded-context hypotheses.`),
		source: '§II-A', see: ['capability-map'],
	},
	'evidence-types': {
		term: 'Evidence types', family: 'techniques',
		short: 'What a decomposition technique looks at: static code structure, dynamic execution traces, semantic names and documentation, or data (tables, business objects).',
		body: () => P(html`No single type dominates: dynamic traces reveal couplings static analysis misses but cost more to collect <${Cite} keys=${['krause2020staticdynamic', 'andrade2022staticdynamic']} />.`),
		source: '§II-A', see: ['dependency-graph', 'search-based'],
	},
	'search-based': {
		term: 'Search-based modularization', family: 'techniques',
		short: 'Treat decomposition as optimisation: search over partitions for one that maximises a quality function.',
		body: () => P(html`Bunch hill-climbs over partitions to maximise modularization quality <${Cite} k="mitchell2006bunch" />; later work made it multi-objective <${Cite} k="praditwong2011multiobjective" />. The workflow's refiner is a small, bounded search of this kind.`),
		source: '§II-A, §III-B (5)', see: ['local-search', 'louvain'],
	},
	louvain: {
		term: 'Louvain community detection', family: 'techniques',
		short: 'A fast graph-clustering algorithm that groups nodes to maximise modularity.',
		body: () => P(html`Common in decomposition tools <${Cite} k="blondel2008louvain" />. Modularity optimisation has a resolution limit: below a certain size, small communities cannot be found <${Cite} k="fortunato2007resolution" />. Louvain-based seeds were tried as a design experiment (E2) and not adopted.`),
		source: '§II-A, Table VII', see: ['search-based'],
	},

	// ---- metrics
	'design-metric': {
		term: 'Design metric', family: 'metrics',
		short: 'Judges a decomposition on its own terms, from the decomposition and the monolith\'s evidence, without any reference.',
		body: () => P(html`CMod, CiD, DTP, DI, BCP (Table I). All range 0–100, higher is better. Several can be inflated by <${Term} k="coarse" />.`),
		source: '§II-B, Table I', see: ['cmod', 'cid', 'dtp', 'di', 'bcp', 'similarity-metric'],
	},
	'similarity-metric': {
		term: 'Similarity metric', family: 'metrics',
		short: 'Compares a produced decomposition with the reference decomposition. Computed only after the answer is frozen.',
		body: () => P(html`This work uses <${Term} k="c2c" /> at three thresholds.`),
		source: '§II-B, §III-D', see: ['c2c', 'blinded-evaluation'],
	},
	cmod: {
		term: 'CMod · Code Modularity', family: 'design metric',
		short: 'How much of each service\'s dependency weight stays inside it, averaged over services.',
		formula: html`CF<sub>i</sub> = 2·int<sub>i</sub> / (2·int<sub>i</sub> + ext<sub>i</sub>)   ·   CMod = 100 · mean<sub>i</sub> CF<sub>i</sub>`,
		body: () => P(html`int<sub>i</sub>: weight of edges with both ends in service i; ext<sub>i</sub>: weight of edges with one end in it. Normalised TurboMQ <${Cite} k="mitchell2006bunch" />. A service with no internal edge scores 0.`),
		example: () => html`<${ToyMetric} metric="cmod" />`,
		source: 'Table I; vendor/legacy-metrics-engine/calculator/evaluate.py (calculate_normalized_turbomq)', see: ['cid', 'coarse', 'dependency-graph'],
	},
	cid: {
		term: 'CiD · Cyclic Independence', family: 'design metric',
		short: 'The share of service pairs that do not depend on each other in both directions (no two-way cycle).',
		formula: 'CiD = 100 − 100 · (pairs with dependencies both ways) / (all pairs)',
		example: () => html`<${ToyMetric} metric="cid" />`,
		source: 'Table I; evaluate.py (calculate_cycles), reported as 100 − CDP', see: ['cmod', 'coarse'],
	},
	dtp: {
		term: 'DTP · Database Transaction Purity', family: 'design metric',
		short: 'For each database table: are the classes that access it concentrated in one service, or spread over many?',
		formula: 'DTP = 100 · (1 − mean over tables of min(1, entropy of the table\'s classes over services))',
		body: () => html`<div>${P('Needs the benchmark\'s table-access data, which covers only 14–16 classes per system; this makes DTP coarse.')}</div>`,
		example: () => html`<${ToyEntropy} kind="table" />`,
		source: 'Table I, §VII; entropy.py (_calculate_entropy)', see: ['di', 'bcp'],
	},
	di: {
		term: 'DI · Domain Independence', family: 'design metric',
		short: 'For each traced business use case: are the classes it runs through concentrated in few services?',
		formula: 'DI = 100 · (1 − mean over use cases of min(1, entropy of the use case\'s classes over services))',
		body: () => P('Computed from the benchmark\'s use-case traces, which touch 14–28 classes per system. The same routine as DTP, over use cases instead of tables. The workflow\'s largest directional gain; read it with this limited sensitivity in mind.'),
		example: () => html`<${ToyEntropy} kind="use case" />`,
		source: 'Table I, §VII; entropy.py (calculate_use_case_entropy)', see: ['dtp', 'bcp'],
	},
	bcp: {
		term: 'BCP · Business Context Purity', family: 'design metric',
		short: 'For each service: how few distinct use cases its classes take part in.',
		formula: 'BCP = 100 · (1 − mean over services of min(1, entropy of use-case occurrences in the service))',
		body: () => P('The mirror of DI: DI asks "is a use case spread over services?", BCP asks "is a service spread over use cases?". Services that support no traced use case are skipped.'),
		source: 'Table I; entropy.py (_calculate_bcp_prime_version)', see: ['di', 'dtp'],
	},
	c2c: {
		term: 'C2C · class-to-class coverage', family: 'similarity metric',
		short: 'The share of produced services that correspond to some reference service, comparing services as sets of classes.',
		formula: html`overlap(A, B) = |A ∩ B| / max(|A|, |B|)   ·   C2C-x = 100 · share of produced A with some reference B where overlap > x %`,
		body: () => html`<div>
			${P(html`Introduced for comparing architecture-recovery results <${Cite} keys=${['garcia2013comparative', 'lutellier2018dependencies']} /> and used by the benchmark <${Cite} k="wang2024comparison" /> and MicroAgent <${Cite} k="su2026microagent" />.`)}
			${P('Because it compares sets, a class that the reference places in several services simply belongs to several sets: C2C works with overlapping references. The reference scores 100 against itself at every threshold.')}
			${List(['C2C-10: does a produced service correspond to any reference service at all?', 'C2C-33: does it capture a substantial part of one?', 'C2C-50: does it match one closely? (the strictest)'])}
			${P('Limits: it counts services, not classes (a big service weighs the same as a small one); it does not penalise missing a reference service; the implementation needs strictly more than x %.', { fontSize: 19, color: C.dim })}</div>`,
		example: () => html`<${ToyC2C} />`,
		source: 'Table I, §III-D, §VII; vendor/legacy-metrics-engine/calculator/c2c.py', see: ['overlap', 'similarity-metric'],
	},
	coarse: {
		term: 'Coarse-partition inflation', family: 'metrics',
		short: 'Several design metrics look better when classes are lumped into few services, in the extreme a single one.',
		body: () => P('CMod is maximal when there are few inter-service dependencies; CiD, DI and BCP also reward concentrating classes. That is why this work reports the number of services next to every result, and why the workflow adds migration feasibility and a three-service minimum.'),
		example: () => html`<${ToyMetric} metric="cmod" />`,
		source: '§II-B, §VII', see: ['cmod', 'cid', 'mf'],
	},
	mf: {
		term: 'MF · Migration feasibility', family: 'workflow score',
		short: 'A size heuristic used only inside the workflow: it penalises one dominant service and many one-class services.',
		formula: html`MF = 100 · (1 − 0.6·s<sub>max</sub> − 0.4·s<sub>1</sub>), clipped at 0`,
		body: () => P(html`s<sub>max</sub>: share of classes in the largest service; s<sub>1</sub>: share of services with exactly one class. It counters the preference of CMod and CiD for coarse partitions. It is not a measured migration effort.`),
		example: () => html`<${ToyMetric} metric="mf" />`,
		source: '§III-B (4), Eq. 1; agents/decomposition_evaluator.py (_migration_feasibility)', see: ['composite', 'coarse'],
	},

	// ---- LLMs and agents
	llm: {
		term: 'LLM · large language model', family: 'LLMs',
		short: 'A neural network trained on large amounts of text that continues a prompt; here it reads code and writes structured JSON answers.',
		body: () => P('The study uses four hosted models from different developers (DeepSeek v4.1 Flash, GLM-5.2, gpt-oss:120b, gemma4:31b), all served by Ollama Cloud.'),
		source: '§III-C, Table V', see: ['token', 'temperature', 'prompt'],
	},
	prompt: {
		term: 'Prompt', family: 'LLMs',
		short: 'The text sent to an LLM: usually a short system prompt (its role) and a user prompt (the task and the data).',
		source: 'general', see: ['llm', 'token'],
	},
	token: {
		term: 'Token', family: 'LLMs',
		short: 'The unit an LLM reads and writes, roughly three to four characters of English or code. Cost is counted in input plus output tokens.',
		body: () => P('The study reports total input and output tokens per system for each run (Q3).'),
		source: '§III-A, Q3', see: ['llm'],
	},
	temperature: {
		term: 'Temperature', family: 'LLMs',
		short: 'A sampling setting: 0 always picks the most likely next token, higher values add randomness.',
		body: () => P(html`All workflow and single-shot calls use 0.2. Even at temperature 0, hosted LLMs are not fully deterministic <${Cite} keys=${['ouyang2025nondeterminism', 'atil2024nondeterminism']} />.`),
		source: '§III-C Controls', see: ['nondeterminism', 'seed'],
	},
	seed: {
		term: 'Seed · repetition', family: 'LLMs',
		short: 'A number that fixes the random choices of a run. The study repeats DeepSeek five times per cell with seeds 1–5.',
		source: '§III-C Repetitions', see: ['nondeterminism', 'temperature'],
	},
	nondeterminism: {
		term: 'Non-determinism', family: 'LLMs',
		short: 'The same prompt can give different answers on different runs, even with temperature 0.',
		body: () => P(html`Single-run studies risk mistaking variation for effects <${Cite} keys=${['sallou2024breaking', 'arcuri2014hitchhiker']} />, so the study repeats one model five times and reports variation.`),
		source: '§II-D', see: ['seed', 'nvi'],
	},
	'single-shot': {
		term: 'Single-shot prompting', family: 'approaches',
		short: 'One final LLM call produces the whole decomposition from everything placed in its prompt.',
		body: () => P(html`Our ICSA 2026 pipeline <${Cite} k="sambu2026icsa" /> is of this kind; in this study it is the "80k concat" arm.`),
		source: '§I, §III-C Arms', see: ['80k', 'agentic-workflow', 'autonomous-agent'],
	},
	'80k': {
		term: '80k concat', family: 'approaches',
		short: 'The single-shot arm: pack the source into chunks of about 80,000 tokens, summarise, generate five architectural views, then one final call decomposes.',
		body: () => P('On these systems the scoped source (11k–41k tokens) fits in one chunk, so the arm makes seven calls plus retries. It is the single-shot representative because the previous study found no benefit from other chunk sizes or from hierarchical summarisation.'),
		source: '§III-C Arms, §IV-B', see: ['single-shot', 'hierarchical', 'views'],
	},
	hierarchical: {
		term: 'Hierarchical summarisation', family: 'approaches',
		short: 'Summarise files, then summarise the summaries, before deciding.',
		body: () => P(html`In the matched DeepSeek runs it cost 414,006 tokens per system against 89,516 for 80k concat (4.6×) with lower C2C-50 (51.6 vs 60.8), so it is omitted from the benchmark <${Cite} k="dhulshette2025hierarchical" />.`),
		source: '§IV-B', see: ['80k'],
	},
	views: {
		term: 'Architectural views A1–A6', family: 'approaches',
		short: 'Structured descriptions of the monolith that an LLM writes from the code: components, API endpoints, persistence entities, interaction scenarios, a technology map (A1–A5), plus the static dependency graph (A6).',
		source: '§II-C, §III-B (1)', see: ['evidence-pack', '80k'],
	},
	agent: {
		term: 'Agent (in this work)', family: 'agents',
		short: 'A role-specialised component of the workflow with one responsibility, talking to the others only through validated artifacts, whether or not it calls an LLM.',
		body: () => P('Each is an LLM agent, a tool agent (deterministic) or a hybrid.'),
		source: '§II-D, §III-B', see: ['agentic-workflow', 'autonomous-agent'],
	},
	'autonomous-agent': {
		term: 'Autonomous agent', family: 'agents',
		short: 'An LLM that decides for itself what to read, which tools to call and when to stop, like a coding assistant.',
		body: () => P(html`Examples: SWE-agent <${Cite} k="yang2024sweagent" />, OpenCode <${Cite} k="opencode2026" />. In this study OpenCode is a baseline.`),
		source: '§I, §II-D', see: ['agentic-workflow', 'opencode'],
	},
	'agentic-workflow': {
		term: 'Agentic workflow', family: 'agents',
		short: 'LLM calls and tools orchestrated along predefined code paths: the order is fixed by code, not chosen by the model.',
		body: () => P(html`The distinction follows Anthropic's "Building effective agents" <${Cite} k="anthropic2024agents" />. Workflows trade flexibility for predictability; on issue resolution, a fixed pipeline beat open-source autonomous agents at a fraction of the cost <${Cite} k="xia2024agentless" />. This paper's approach is an agentic workflow.`),
		source: '§II-D', see: ['autonomous-agent', 'agent'],
	},
	opencode: {
		term: 'OpenCode', family: 'approaches',
		short: 'An open-source autonomous coding agent, used as the "autonomous agent" arm. It works in an isolated folder and must write the decomposition to a file.',
		body: () => P('It does not expose a temperature, so it runs with the provider default and reasoning effort low. Of five prompt variants, the study reports baseline-3, chosen by information parity.'),
		source: html`§III-C Arms, §IV-B <${Cite} k="opencode2026" />`, see: ['information-parity', 'autonomous-agent'],
	},
	'self-correction': {
		term: 'Self-correction', family: 'agents',
		short: 'Letting a model critique and revise its own output.',
		body: () => P(html`Self-Refine reported gains <${Cite} k="madaan2023selfrefine" />, but LLMs struggle to correct their own reasoning without external feedback <${Cite} k="huang2024cannot" />, reported benefits often rely on reliable external signals <${Cite} k="kamoi2024selfcorrection" />, and self-repair gains in code are modest once cost counts <${Cite} k="olausson2024selfrepair" />. So the workflow refines with deterministic measurements, not LLM critique.`),
		source: '§II-D', see: ['reward-hacking', 'local-search'],
	},
	'reward-hacking': {
		term: 'Reward hacking', family: 'agents',
		short: 'Optimisation raises the evaluator\'s score while true quality stagnates, often because generator and evaluator share a model or signal.',
		body: () => P(html`<${Cite} k="pan2024rewardhacking" />; LLM judges also prefer their own generations <${Cite} keys=${['panickssery2024selfpreference', 'zheng2023judging']} />. This work's self-referential scoring finding (Q4) is an instance of this trap.`),
		source: '§II-D, §V-D', see: ['self-referential', 'self-correction'],
	},

	// ---- the workflow
	'evidence-pack': {
		term: 'Evidence pack', family: 'workflow',
		short: 'One JSON document all later agents read: the observed classes and dependency edges, plus the LLM\'s architectural views, each item with a stable ID.',
		body: () => P('Only the inventory and the dependency edges are observed facts; the LLM views are hypotheses.'),
		source: '§III-B (1)', see: ['views', 'capability-map'],
	},
	'capability-map': {
		term: 'Capability map', family: 'workflow',
		short: 'The domain extractor\'s proposal: 3–10 business capabilities and one capability per class, with a confidence.',
		body: () => P('Explicitly provisional: one semantic lens for the generator, not ground truth. For Spring PetClinic: Owner, Pet, Visit and Veterinarian Management, System Infrastructure, Domain Model Foundations.'),
		source: '§III-B (2)', see: ['strategies', 'v-measure'],
	},
	strategies: {
		term: 'Generation strategies', family: 'workflow',
		short: 'Three independent generator calls with different instructions: dependency-first, domain-first, balanced.',
		body: () => List(['dependency-first: keep strongly coupled classes together', 'domain-first: follow the capability map, use dependencies only to resolve ambiguity', 'balanced: start from capabilities, move classes when dependencies strongly disagree']),
		source: '§III-B (3)', see: ['candidate-collapse', 'repair'],
	},
	'candidate-collapse': {
		term: 'Candidate collapse', family: 'workflow',
		short: 'Different strategy prompts return the same partition, so "three candidates" are really one or two.',
		body: () => P('Observed in design experiment E1: domain-first and balanced were identical on all four systems. Forcing diversity algorithmically (E2) gave distinct but not better candidates.'),
		source: '§IV-A, Table VII', see: ['strategies'],
	},
	repair: {
		term: 'Repair', family: 'workflow',
		short: 'Deterministic clean-up of each generated candidate so that every class is assigned exactly once, by construction.',
		body: () => List(['unknown class names and repeated assignments are removed', 'references to non-existent evidence are replaced by the IDs of the service\'s classes', 'any class the model omitted goes to a catch-all service']),
		source: '§III-B (3)', see: ['validity', 'quality-gate'],
	},
	'quality-gate': {
		term: 'Quality gate', family: 'workflow',
		short: 'Structural checks a candidate must pass: non-empty services, at least three of them, names and responsibilities present; cyclic service dependencies are flagged.',
		body: () => P('Candidates that pass are always preferred to those that fail.'),
		source: '§III-B (4)', see: ['validity', 'composite'],
	},
	composite: {
		term: 'Composite score', family: 'workflow',
		short: 'How the evaluator ranks candidates: a weighted mean of three reference-free measures.',
		formula: 'score = (0.3·CMod + 0.2·CiD + 0.2·MF) / 0.7',
		source: '§III-B (4)', see: ['mf', 'cmod', 'cid', 'self-referential'],
	},
	'v-measure': {
		term: 'V-measure', family: 'workflow diagnostic',
		short: 'How well a candidate agrees with the capability map: the harmonic mean of homogeneity (each service holds one capability) and completeness (each capability sits in one service).',
		body: () => P(html`<${Cite} k="rosenberg2007vmeasure" />. Recorded as a diagnostic but not optimised: scoring it rewarded the candidate built from that same map (Q4).`),
		source: '§III-B (4), §V-D', see: ['self-referential', 'capability-map'],
	},
	'self-referential': {
		term: 'Self-referential scoring', family: 'finding',
		short: 'Judging a candidate by a criterion it was constructed to satisfy. Here: scoring agreement with the capability map, when the domain-first candidate is generated from that map.',
		body: () => html`<div>${P('Removing the term (on identical LLM outputs) improved CMod by 7.6 and DI by 10.8 points. The check: for every selection criterion, ask whether any candidate was built to satisfy it.')}</div>`,
		source: '§V-D, §VI-C', see: ['reward-hacking', 'v-measure'],
	},
	pareto: {
		term: 'Strict Pareto improvement', family: 'optimisation',
		short: 'A change that makes no objective worse and at least one better.',
		body: () => P('The refiner accepts a move only if none of CMod, CiD and MF decreases and at least one increases, and the result stays valid.'),
		source: '§III-B (5), Alg. 1', see: ['local-search'],
	},
	'local-search': {
		term: 'Bounded local search', family: 'optimisation',
		short: 'Improve a solution by trying small changes near it and keeping the best improving one, for a limited number of rounds.',
		body: () => P('The refiner tries single-class moves (top 12 by signal strength), applies the strict Pareto move with the largest total gain, and stops when no move is admissible or after five rounds.'),
		source: '§III-B (5), Alg. 1', see: ['pareto', 'search-based'],
	},
	'blinded-evaluation': {
		term: 'Blinded evaluation', family: 'protocol',
		short: 'Reference-based metrics are computed only after a result is frozen, and never fed back to any component.',
		source: '§III-B, §III-C', see: ['oracle-firewall', 'reference'],
	},
	'oracle-firewall': {
		term: 'Oracle firewall', family: 'protocol',
		short: 'The code-level separation between online selection and reference-based evaluation.',
		body: () => List(['the metric library rejects reference-dependent metrics in any online objective', 'the reference files are physically absent from the online evaluation workspace', 'the blinded report is never passed back to any agent', 'prompts never mention the reference or the expected number of services']),
		source: '§III-B', see: ['blinded-evaluation'],
	},
	validity: {
		term: 'Valid decomposition', family: 'protocol',
		short: 'Every inventory class assigned exactly once, no unknown class, no empty service, at least three non-empty services. Checked deterministically, never with the reference.',
		source: '§III-C', see: ['repair', 'quality-gate', 'class-inventory'],
	},
	'information-parity': {
		term: 'Information parity', family: 'protocol',
		short: 'Every arm gets the same information: same model, inventory, source snapshot and dependency graph, and the same design goals.',
		body: () => P('The criterion, declared before comparing scores, that picked OpenCode\'s baseline-3 prompt: the only variant with the same inputs and design goals as the other arms.'),
		source: '§IV-B', see: ['opencode'],
	},
	replay: {
		term: 'Replay', family: 'protocol',
		short: 'Re-running a workflow version by feeding it the recorded LLM outputs of an earlier version, instead of calling the model again.',
		body: () => P('Exact when the two versions differ only in deterministic stages, as the final workflow and its predecessor do (selection and refinement). Used for DeepSeek and GLM-5.2.'),
		source: '§III-C Repetitions and reuse', see: ['development-confirmation'],
	},
	'development-confirmation': {
		term: 'Development vs confirmation data', family: 'protocol',
		short: 'Results a design was tuned on are optimistic; results from models run only after the design was frozen are a fairer check.',
		body: () => P(html`DeepSeek and GLM-5.2 are development data; gpt-oss:120b and gemma4:31b are confirmation <${Cite} keys=${['cawley2010overfitting', 'dwork2015reusable']} />.`),
		source: '§III-C', see: ['replay'],
	},
	gqm: {
		term: 'Goal Question Metric (GQM)', family: 'method',
		short: 'A way to structure a study: state the goal, derive questions from it, and pick metrics that answer each question.',
		body: () => P(html`<${Cite} k="basili1994gqm" />. The goal is written as analyse … for the purpose of … with respect to … from the viewpoint of … in the context of ….`),
		source: '§III-A', see: [],
	},
	nvi: {
		term: 'Normalised variation of information (NVI)', family: 'statistics',
		short: 'A distance between two partitions of the same classes: 0 means identical, 1 means as different as possible. It ignores service names.',
		body: () => P('Used to measure how much five repeated runs differ from each other.'),
		source: '§III-C Analysis, Table XIV', see: ['nondeterminism'],
	},

	// ---- statistics
	'p-value': {
		term: 'p-value', family: 'statistics',
		short: 'If there were truly no difference, how likely would a result at least this extreme be? Small p (below α = 0.05 here) counts as significant.',
		body: () => P('A non-significant p is not evidence of equivalence, especially with few pairs: this work reads such results as "no evidence of a difference".'),
		source: '§III-C Analysis', see: ['wilcoxon', 'power', 'bonferroni'],
	},
	wilcoxon: {
		term: 'Wilcoxon signed-rank test', family: 'statistics',
		short: 'A paired, non-parametric test: rank the absolute differences between paired observations and check whether positive and negative ranks balance.',
		body: () => P(html`<${Cite} k="wilcoxon1945" />. The study pairs observations by (model, system) cell, 16 pairs, two-sided, as recommended for randomised algorithms in software engineering <${Cite} k="arcuri2014hitchhiker" />.`),
		example: () => html`<${ToyWilcoxon} />`,
		source: '§III-C Analysis; tools/analyze_final_benchmark.py (scipy.stats.wilcoxon, zero_method="zsplit")', see: ['cliffs-delta', 'p-value', 'win-tie-loss'],
	},
	'cliffs-delta': {
		term: "Cliff's δ", family: 'statistics',
		short: 'An effect size: how often a value from one arm beats a value from the other, minus the reverse, from −1 to +1.',
		formula: 'δ = (#{a > b} − #{a < b}) / (n_A · n_B)',
		body: () => P(html`<${Cite} k="cliff1993dominance" />. The study's script compares every value of one arm with every value of the other (all pairs, not only matched cells).`),
		example: () => html`<${ToyCliff} />`,
		source: '§III-C Analysis; tools/analyze_final_benchmark.py', see: ['wilcoxon', 'effect-size'],
	},
	'effect-size': {
		term: 'Effect size', family: 'statistics',
		short: 'How big a difference is, separate from whether it is significant. This work reports Cliff\'s δ; all cross-model effects were small (|δ| ≤ 0.28).',
		source: '§V-A', see: ['cliffs-delta', 'p-value'],
	},
	bonferroni: {
		term: 'Bonferroni correction', family: 'statistics',
		short: 'When running m tests, require p < α / m for each, so the chance of any false positive stays at most α.',
		example: () => html`<${ToyBonferroni} />`,
		source: '§V-D (applied to the ablation), §VII', see: ['p-value'],
	},
	'win-tie-loss': {
		term: 'Win / tie / loss', family: 'statistics',
		short: 'Across paired cells, how often one arm was better, equal, or worse. Shown next to tests because 16 pairs give limited power.',
		source: '§III-C Analysis, Table XI', see: ['wilcoxon', 'power'],
	},
	power: {
		term: 'Statistical power', family: 'statistics',
		short: 'The chance a test detects a real difference. With 16 pairs, small differences usually go undetected.',
		source: '§III-C Analysis, §VII', see: ['p-value', 'win-tie-loss'],
	},
}
