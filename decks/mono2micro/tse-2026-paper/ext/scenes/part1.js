// Part I · the problem and its background (paper §I–II).
import { html, C, F, box, EASE, Stage, Term, Cite, Inside, Card, SHIELD, P, H, List, Note, Code, Quote, Table, Formula, rich, reveal, SlideSource, SubTabs, Src, useShared } from '../ui.js'
import { SYSTEMS, PETCLINIC } from '../data/systems.js'
import { PAPER, POSITIONING, SYSTEMS_TABLE, LABELS } from '../data/paper.js'
import { cmod, cid, c2c, mf, labelPurity } from '../metrics.js'

const PC = SYSTEMS['spring-petclinic']
const f1 = (v) => (v == null ? '—' : (Math.round(v * 10) / 10).toFixed(1))
const Caption = ({ y = 930, children, still, on = true, delay = 0 }) => html`<div style=${{ ...box(120, y, 1680, 60), textAlign: 'center', fontFamily: F.hand, fontSize: 34, color: C.ink, ...reveal(on, still, { delay }) }}>${children}</div>`

// A class chip that can travel between layouts.
function Chip({ name, x, y, w = 330, dashed, hot, dim, still, visible = true, color }) {
	return html`<div style=${{ position: 'absolute', left: 0, top: 0, width: w, height: 36, transform: `translate(${x}px, ${y}px)`,
			transition: still ? 'none' : `transform 1100ms ${EASE}, opacity 600ms ${EASE}, width 1100ms ${EASE}`, opacity: visible ? (dim ? 0.35 : 1) : 0,
			border: `2px ${dashed ? 'dashed' : 'solid'} ${hot ? C.red : color ?? '#8a847a'}`, borderRadius: 8, background: hot ? C.redGlow : '#fffdf8',
			fontFamily: F.mono, fontSize: 17, display: 'flex', alignItems: 'center', padding: '0 12px', boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden', color: C.ink }}>${name}</div>`
}
function Group({ x, y, w, h, label, sub, still, visible = true, color = C.ink, dashed }) {
	return html`<div style=${{ ...box(x, y, w, h), border: `2.5px ${dashed ? 'dashed' : 'solid'} ${color}`, borderRadius: 16, opacity: visible ? 1 : 0,
		transition: still ? 'none' : `opacity 700ms ${EASE}, left 1100ms ${EASE}, top 1100ms ${EASE}, width 1100ms ${EASE}, height 1100ms ${EASE}` }}>
		<div style=${{ position: 'absolute', left: 14, top: -18, padding: '0 8px', background: C.paper, fontFamily: F.hand, fontSize: 28, color }}>${label}</div>
		${sub && html`<div style=${{ position: 'absolute', right: 14, top: -14, padding: '0 8px', background: C.paper, fontFamily: F.sans, fontSize: 16, color: C.dim }}>${sub}</div>`}
	</div>`
}

// ------------------------------------------------------------------ I · the problem
const PKG_ORDER = ['owner', 'vet', 'system', 'model', 'petclinic']
const REF_ORDER = ['customers', 'vets', 'visits', 'uncounted']
const REF_NOTE = { uncounted: 'unassigned' }

function referenceTable(sys) {
	const member = {}
	for (const [g, cs] of Object.entries(sys.reference)) for (const c of cs) (member[c] ??= []).push(g)
	return Table(['class', 'reference services'], sys.classes.map((c) => [c, (member[c] ?? ['—']).join(', ')]), { align: ['left', 'left'], hi: (j) => (member[sys.classes[j]]?.length ?? 0) > 1, size: 18 })
}

export function MonolithScene({ b, still }) {
	const B = still ? 2 : b
	// Monolith layout: one column per package.
	const mono = {}
	PKG_ORDER.forEach((pkg, i) => PC.classes.filter((c) => (PETCLINIC.packages[c] ?? 'petclinic') === pkg).forEach((c, j) => { mono[c] = { x: 250 + i * 290, y: 330 + j * 46 } }))
	// Reference layout: one column per reference service, extra copies for shared classes.
	const refPos = {}
	REF_ORDER.forEach((g, i) => (PC.reference[g] ?? []).forEach((c, j) => { (refPos[c] ??= []).push({ g, x: 130 + i * 430, y: 330 + j * 46 }) }))
	const primary = (c) => refPos[c].find((p) => PC.disjoint[p.g]?.includes(c)) ?? refPos[c][0]
	const shared = new Set(PC.shared)
	const drawer = {
		title: 'Spring PetClinic, class by class', kicker: 'the reference decomposition',
		tabs: [
			{ id: 'ref', label: 'Where each class goes', render: () => html`<div>${P('The benchmark\'s reference split of the 23 inventory classes. Highlighted: classes listed in more than one service.')}${referenceTable(PC)}</div>` },
			{ id: 'why', label: 'Why this is hard', render: () => html`<div>
				${Quote(rich(`Achieving these benefits, however, depends on identifying appropriate service boundaries—a task that requires balancing structural dependencies, business capabilities, and architectural quality concerns [5, 6].`), '§I, first paragraph')}
				${P(html`The reference is one valid answer: the one the system's developers built <${Cite} k="wang2024comparison" />. Other good answers exist <${Cite} k="shtern2011multiple" />.`)}</div>` },
		],
		source: 'Source: benchmarks/systems/spring-petclinic/ground-truth/ground_truth.rsf, restricted to the class inventory; §I, §II-A.',
	}
	return html`<${Stage} still=${still}>
		${B === 0 && html`<${Group} x=${210} y=${290} w=${1500} h=${560} label="Spring PetClinic · one deployable unit" sub="23 classes, grouped by Java package" still=${still} />`}
		${B >= 1 && REF_ORDER.map((g, i) => html`<${Group} key=${'r' + g} x=${110 + i * 430} y=${290} w=${380} h=${(PC.reference[g]?.length ?? 0) * 46 + 50}
			label=${g} sub=${REF_NOTE[g]} dashed=${g === 'uncounted'} still=${still} color=${g === 'uncounted' ? C.dim : C.ink} />`)}
		${PC.classes.map((c) => {
			const p = B === 0 ? mono[c] : primary(c)
			return html`<${Chip} key=${c} name=${c} x=${p.x} y=${p.y} w=${B === 0 ? 260 : 340} hot=${B >= 2 && shared.has(c)} still=${still} />`
		})}
		${PC.classes.flatMap((c) => refPos[c].filter((p) => p !== primary(c)).map((p, k) => {
			const at = B === 0 ? mono[c] : p
			return html`<${Chip} key=${c + '#' + k} name=${c} x=${at.x} y=${at.y} w=${B === 0 ? 260 : 340} dashed hot=${B >= 2} visible=${B >= 1} still=${still} />`
		}))}
		${B === 0 && html`<${Caption} still=${still}>A <${Term} k="monolith" />: 23 classes, one unit. Which <${Term} k="microservice">microservices</${Term}> should it become?</${Caption}>`}
		${B === 1 && html`<${Caption} still=${still}>What its developers built: the <${Term} k="reference">reference decomposition</${Term}> <${Cite} k="wang2024comparison" /></${Caption}>`}
		${B >= 2 && html`<${Caption} still=${still}>Four <${Term} k="overlap">shared classes</${Term}> sit in several services at once (dashed copies)</${Caption}>`}
		<${Inside} x=${1560} y=${200} w=${300} label="Class by class" drawer=${drawer} still=${still} />
		<${SlideSource}>§I, §II-A · benchmarks/systems/spring-petclinic</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ II-A · a decomposition is a partition
export function PartitionScene({ b, still }) {
	const B = still ? 2 : b
	const services = PC.reference ? REF_ORDER.filter((g) => PC.reference[g]?.includes('BaseEntity')) : []
	const cx = 960, cy = 470
	const pos = services.map((g, i) => ({ g, x: 360 + i * 600, y: 760 }))
	const overlapRows = Object.entries(SYSTEMS).map(([id, s]) => [id, String(s.classes.length), String(s.shared.length), String(s.extraMemberships)])
	const drawer = {
		title: 'Why this study produces partitions', kicker: '§III-D',
		tabs: [
			{ id: 'reasons', label: 'Three reasons', render: () => html`<div>
				${P('Letting the workflow copy shared classes, as the references do, looks natural. The paper deliberately does not, for three reasons:')}
				${List([
					html`<b>Comparability.</b> The traditional tools, the single-shot pipeline and the autonomous agent all produce partitions; allowing copies in one arm alone would confound approach with output format.`,
					html`<b>Measurability.</b> The design metrics assume one service per class. With copies it is ambiguous which copy a dependency ends at, and copying can lower measured coupling without changing any boundary: in design experiment E7, explicit replication cut cross-service dependency weight by 3–33 % on three systems, a gain the metrics cannot tell apart from a better design.`,
					html`<b>Separation of decisions.</b> A copy adds size and must be kept consistent. A partition keeps each shared class in one place and exposes its use as explicit cross-service dependencies, which an architect can later replicate, extract into a library, or keep behind an interface.`,
				], { ordered: true })}</div>` },
			{ id: 'overlap', label: 'How much the references overlap', render: () => html`<div>
				${P('Classes the reference lists in more than one service, and the extra memberships they add (restricted to the class inventory, computed from the reference files):')}
				${Table(['system', 'classes', 'shared classes', 'extra memberships'], overlapRows)}
				${P('The last column matches the Overlap column of Table IV.', { fontSize: 18, color: C.dim })}</div>` },
		],
		source: 'Source: §II-A, §III-D, Table IV; benchmarks/systems/*/ground-truth.',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(cx - 170, cy - 40, 340, 80), border: `3px solid ${C.red}`, borderRadius: 14, background: C.redGlow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 32 }}>BaseEntity</div>
		<svg width="1920" height="1080" style=${{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
			${pos.map((p, i) => {
				const keep = i === 0
				const on = B === 0 || keep
				return html`<line key=${p.g} x1=${cx} y1=${cy + 40} x2=${p.x + 160} y2=${p.y - 10} stroke=${keep && B >= 1 ? C.red : C.ink}
					strokeWidth=${keep && B >= 1 ? 5 : 3} strokeDasharray=${on ? 'none' : '10 10'} style=${{ opacity: on ? 1 : 0.25, transition: still ? 'none' : `opacity 700ms ${EASE}` }} />`
			})}
		</svg>
		${pos.map((p, i) => html`<div key=${p.g} style=${{ ...box(p.x, p.y, 320, 90), border: `2.5px solid ${C.ink}`, borderRadius: 16, background: '#fffdf8', display: 'flex', alignItems: 'center', justifyContent: 'center',
			fontFamily: F.hand, fontSize: 36, opacity: B === 0 || i === 0 ? 1 : 0.35, transition: still ? 'none' : `opacity 700ms ${EASE}` }}>${p.g}</div>`)}
		<div style=${{ ...box(120, 250, 560, 160), fontFamily: F.hand, fontSize: 30, lineHeight: 1.3, color: C.ink, ...reveal(true, still) }}>
			${B === 0 ? html`In the <${Term} k="reference" />, <b>BaseEntity</b> is in three services.` : html`A <${Term} k="partition" /> must pick one of them.`}</div>
		<div style=${{ ...box(1240, 250, 560, 160), fontFamily: F.sans, fontSize: 21, lineHeight: 1.45, color: C.dim, ...reveal(true, still, { delay: 200 }) }}>
			Also shared in PetClinic: ${PC.shared.filter((c) => c !== 'BaseEntity').map((c, i) => html`<span key=${c}>${i ? ', ' : ''}<code style=${{ fontFamily: F.mono }}>${c}</code></span>`)}.</div>
		<${Caption} y=${900} still=${still} on=${B >= 2}>Every arm must return a <${Term} k="partition" />: each <${Term} k="class-inventory">inventory</${Term}> class in exactly one service</${Caption}>
		<${Inside} x=${1560} y=${200} w=${300} label="Why partitions" drawer=${drawer} still=${still} />
		<${SlideSource}>§II-A, §III-D · ground_truth.rsf</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ II-A · techniques
const TOOLS = [
	{ name: 'Mono2Micro', key: 'kalia2021mono2micro', what: 'static + runtime analysis, clusters classes into non-overlapping partitions' },
	{ name: 'CARGO', key: 'nitin2022cargo', what: 'context-sensitive dependencies and database accesses' },
	{ name: 'MOSAIC', key: 'filippone2023mosaic', what: 'graph clustering + combinatorial optimisation; can duplicate classes and methods' },
	{ name: 'MicroMiner', key: 'trabelsi2023microminer', what: 'separates application, entity and utility classes before clustering' },
]
export function TechniquesScene({ b, still }) {
	const B = still ? 2 : b
	const col = (x, title, lines, on, delay) => html`<div style=${{ ...box(x, 280, 470, 360), ...reveal(on, still, { delay }) }}>
		<div style=${{ ...box(0, 0, 470, 360), border: `2.5px solid ${C.ink}`, borderRadius: 18, background: '#fffdf8' }} />
		<div style=${{ position: 'absolute', left: 26, top: 18, fontFamily: F.hand, fontSize: 40 }}>${title}</div>
		<div style=${{ position: 'absolute', left: 26, top: 84, right: 22, fontFamily: F.sans, fontSize: 22, lineHeight: 1.5 }}>${lines}</div></div>`
	const drawer = {
		title: 'Decomposition techniques', kicker: '§II-A',
		tabs: [
			{ id: 'evidence', label: 'Evidence', render: () => html`<div>
				${P(html`Techniques differ mainly in the evidence they use <${Cite} keys=${['abgaz2023decomposition', 'oumoussa2024evolution']} />:`)}
				${List(['static: call and dependency graphs', 'dynamic: execution traces collected while exercising use cases', 'semantic: identifiers, documentation, domain concepts', 'data-centric: code grouped around database tables or business objects'])}
				${P(html`No single type dominates: dynamic traces reveal couplings missed by static analysis, but cost more to collect <${Cite} keys=${['krause2020staticdynamic', 'andrade2022staticdynamic']} />. Domain-driven design contributes the <${Term} k="bounded-context" /> <${Cite} k="evans2003ddd" />, and Service Cutter distinguishes several coupling criteria rather than one similarity <${Cite} k="gysel2016servicecutter" />.`)}</div>` },
			{ id: 'search', label: 'Search', render: () => html`<div>
				${P(html`Given evidence, most tools solve a clustering or search problem. Bunch hill-climbs over partitions to maximise a modularization quality function <${Cite} k="mitchell2006bunch" />; later work made it multi-objective <${Cite} k="praditwong2011multiobjective" />.`)}
				${P(html`<${Term} k="louvain" /> community detection is also common <${Cite} k="blondel2008louvain" />, but modularity optimisation has a resolution limit below which small communities cannot be detected <${Cite} k="fortunato2007resolution" />.`)}</div>` },
			{ id: 'tools', label: 'Tools', render: () => html`<div>
				${Table(['tool', 'what it does'], TOOLS.map((t) => [html`${t.name} <${Cite} k=${t.key} />`, t.what]), { align: ['left', 'left'] })}
				${P(html`Business-oriented approaches infer functionality groups <${Cite} k="agarwal2021businessfunction" /> or mine processes <${Cite} k="taibi2019processmining" />.`)}</div>` },
			{ id: 'finding', label: 'What a comparison found', render: () => html`<div>
				${Quote(rich('An independent comparison of such tools on common benchmarks found that their results vary widely across systems and metrics and depend on configuration choices [6].'), '§I')}
				${P('The tools measured there (DataCentric, HyDec, Mono2Micro in two configurations, Log2MS) are this paper\'s traditional-tool context. Tools that need a target number of services were given the reference\'s number, which favours them.')}</div>` },
		],
		source: 'Source: §I, §II-A, §III-C, §VII.',
	}
	return html`<${Stage} still=${still}>
		${col(110, 'Evidence', html`<${Term} k="evidence-types">static · dynamic · semantic · data-centric</${Term}><div style=${{ marginTop: 14, color: C.dim, fontSize: 19 }}>what the technique reads</div>`, true, 0)}
		${col(725, 'Search', html`clustering, <${Term} k="search-based">hill-climbing</${Term}>, <${Term} k="louvain">community detection</${Term}><div style=${{ marginTop: 14, color: C.dim, fontSize: 19 }}>how it groups classes</div>`, B >= 1, 0)}
		${col(1340, 'Boundaries', html`a <${Term} k="decomposition" /> into services<div style=${{ marginTop: 14, color: C.dim, fontSize: 19 }}>the answer</div>`, B >= 1, 250)}
		<svg width="1920" height="1080" style=${{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
			${[[580, 725, B >= 1], [1195, 1340, B >= 1]].map(([x1, x2, on], i) => html`<path key=${i} d=${`M${x1 + 10} 460 L${x2 - 14} 460`} stroke=${C.ink} strokeWidth="4" markerEnd="url(#tp-arrow)" style=${{ opacity: on ? 1 : 0, transition: `opacity 600ms ${EASE}` }} />`)}
			<defs><marker id="tp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill=${C.ink} /></marker></defs>
		</svg>
		<div style=${{ ...box(110, 690, 1700, 180), display: 'flex', gap: 22, ...reveal(B >= 2, still) }}>
			${TOOLS.map((t) => html`<div key=${t.name} style=${{ flex: 1, border: `2px solid ${C.line}`, borderRadius: 14, padding: '14px 18px', background: '#fffdf8' }}>
				<div style=${{ fontFamily: F.hand, fontSize: 30 }}>${t.name} <${Cite} k=${t.key} /></div>
				<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, lineHeight: 1.4, marginTop: 6 }}>${t.what}</div></div>`)}
		</div>
		<${Caption} y=${905} still=${still} on=${B >= 2}>Results vary widely across systems and metrics <${Cite} k="wang2024comparison" /></${Caption}>
		<${Inside} x=${1560} y=${200} w=${300} label="Techniques" drawer=${drawer} still=${still} />
		<${SlideSource}>§I, §II-A</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ II-A · the benchmark
const SYS_ORDER = [['demo', 0], ['jpetstore', 1], ['partsunlimited', 2], ['spring-petclinic', 3]]
export function BenchmarkScene({ b, still }) {
	const B = still ? 1 : b
	const rows = SYSTEMS_TABLE.rows
	const maxes = [53, 4829, 5, 23]
	const card = (id, i) => {
		const r = rows[i]
		const s = SYSTEMS[id]
		const refGroups = Object.keys(s.reference)
		const drawer = {
			title: r[0], kicker: `${r[1]} · benchmark system`,
			tabs: [
				{ id: 'ref', label: 'Reference services', render: () => html`<div>
					${P(`${refGroups.length} groups in the reference file${refGroups.includes('uncounted') ? ', including "uncounted": classes the benchmark leaves unassigned to any service, which the metric code treats as one more group' : ''}. Highlighted: shared classes.`)}
					${referenceTable(s)}</div>` },
				{ id: 'numbers', label: 'In numbers', render: () => html`<div>
					${Table(['', 'value'], [['classes (inventory)', r[2]], ['non-blank lines of scoped source', r[3]], ['reference services', r[4]], ['extra memberships (overlap)', r[5]],
						['classes in table-access data (DTP)', `${s.tableCovered} of ${s.classes.length}`], ['classes in use-case traces (DI, BCP)', `${s.traceCovered} of ${s.classes.length}`]])}
					${P('The last two rows are why DTP, DI and BCP are coarse: they only see the classes that appear in the benchmark\'s table-access and trace data.', { fontSize: 19, color: C.dim })}</div>` },
				{ id: 'graph', label: 'Dependency graph', render: () => html`<div>
					${P(html`The weighted class graph the metric engine scores CMod and CiD on: ${s.graph.length} edges among the ${s.classes.length} inventory classes.`)}
					${Table(['from', 'to', 'weight'], s.graph.map(([a, bb, w]) => [a, bb, String(w)]), { size: 17 })}</div>` },
			],
			source: `Source: Table IV; benchmarks/systems/${id}; docs/research-notes/domain-metric-support-2026-09-22.json.`,
		}
		const x = 110 + i * 430
		return html`<${Card} key=${id} drawer=${drawer} still=${still} delay=${i * 120} style=${{ left: x, top: 270, width: 400, height: 560, padding: '20px 24px' }}>
			<div style=${{ fontFamily: F.hand, fontSize: 38, lineHeight: 1.05 }}>${r[0]}</div>
			<div style=${{ fontFamily: F.sans, fontSize: 19, color: C.dim, margin: '4px 0 18px' }}>${r[1]}</div>
			${[['classes', r[2], 0], ['lines of code', r[3], 1], ['reference services', r[4], 2], ['overlap', r[5], 0]].map(([label, v, m], k) => html`<div key=${label} style=${{ marginBottom: 20 }}>
				<div style=${{ display: 'flex', justifyContent: 'space-between', fontFamily: F.sans, fontSize: 19 }}><span>${label}</span><b>${v}</b></div>
				<div style=${{ height: 12, background: C.paper2, borderRadius: 6, marginTop: 5, overflow: 'hidden' }}>
					<div style=${{ height: '100%', width: `${(100 * Number(v.replace(',', ''))) / maxes[m]}%`, background: k === 3 ? C.red : C.ink, opacity: k === 3 ? 0.8 : 0.7, borderRadius: 6 }} /></div></div>`)}
			<div style=${{ position: 'absolute', bottom: 18, left: 24, fontFamily: F.sans, fontSize: 17, color: C.red, fontWeight: 600 }}>⌕ click for its reference</div>
		</${Card}>`
	}
	return html`<${Stage} still=${still}>
		${SYS_ORDER.map(([id, i]) => card(id, i))}
		<${Caption} y=${880} still=${still} on=${B >= 1}>Java systems with a <${Term} k="reference">reference decomposition</${Term}>, from an independent tool comparison <${Cite} k="wang2024comparison" /></${Caption}>
		<${SlideSource}>Table IV · §II-A</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ II-B · metrics, with a live calculator on PetClinic
const SERVICES = Object.keys(PETCLINIC.final)
const G = PC.graph.map(([a, bb, w]) => [a, bb, 'dep', w])
function allMetrics(dec) {
	const d = Object.fromEntries(Object.entries(dec).filter(([, cs]) => cs.length))
	return {
		CMod: cmod(d, G).value, CiD: cid(d, G).value, DTP: labelPurity(d, PC.tables).value, DI: labelPurity(d, PC.usecases).value,
		MF: mf(d).value, services: Object.keys(d).length,
		c10: c2c(d, PC.reference, 0.10).value, c33: c2c(d, PC.reference, 0.33).value, c50: c2c(d, PC.reference, 0.50).value,
	}
}
export function MetricsScene({ b, still }) {
	const B = still ? 1 : b
	const [dec, setDec] = useShared('calc:dec', PETCLINIC.final)
	const untouched = JSON.stringify(dec) === JSON.stringify(PETCLINIC.final)
	const m = allMetrics(dec)
	const move = (c) => {
		const from = SERVICES.find((s) => dec[s].includes(c))
		const to = SERVICES[(SERVICES.indexOf(from) + 1) % SERVICES.length]
		setDec({ ...dec, [from]: dec[from].filter((x) => x !== c), [to]: [...dec[to], c] })
	}
	const allInOne = () => setDec(Object.fromEntries(SERVICES.map((s, i) => [s, i === 0 ? PC.classes.slice() : []])))
	const family = (k, label) => html`<div style=${{ fontFamily: F.hand, fontSize: 27, marginBottom: 8 }}><${Term} k=${k}>${label}</${Term}></div>`
	const readout = [['CMod', m.CMod, 'cmod'], ['CiD', m.CiD, 'cid'], ['DTP', m.DTP, 'dtp'], ['DI', m.DI, 'di'], ['BCP', untouched ? PETCLINIC.finalMetrics.BCP : null, 'bcp'], ['MF', m.MF, 'mf'], ['C2C-10', m.c10, 'c2c'], ['C2C-33', m.c33, 'c2c'], ['C2C-50', m.c50, 'c2c']]
	// Fixed geometry: four service columns, a readout row and a button row that never move.
	const X = 640, W = 1180, colW = (W - 3 * 14) / 4, colTop = 330, colH = 440
	const btn = (x, w, label, onClick) => html`<button type="button" ...${SHIELD} onClick=${(e) => { e.stopPropagation(); onClick() }}
		style=${{ ...box(x, 930, w, 48), pointerEvents: 'all', cursor: 'pointer', borderRadius: 999, border: `2.5px solid ${C.ink}`, background: '#fffdf8', color: C.ink,
			fontFamily: F.sans, fontSize: 18, fontWeight: 600, padding: 0, boxShadow: '0 3px 0 rgba(43,38,33,0.12)' }}>${label}</button>`
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 250, 480, 700) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 36, color: C.red }}><${Term} k="design-metric">design</${Term}></div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, margin: '2px 0 14px' }}>judge it on its own terms</div>
			${family('cmod', 'CMod · modularity')}${family('cid', 'CiD · no two-way cycles')}${family('dtp', 'DTP · tables in one place')}${family('di', 'DI · use cases in few services')}${family('bcp', 'BCP · services in few use cases')}
			<div style=${{ fontFamily: F.hand, fontSize: 36, color: C.red, marginTop: 26 }}><${Term} k="similarity-metric">similarity</${Term}></div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, margin: '2px 0 14px' }}>compare it with the reference, after freezing</div>
			${family('c2c', 'C2C-10 · 33 · 50')}
			<div style=${{ fontFamily: F.sans, fontSize: 17, color: C.dim, marginTop: 22, lineHeight: 1.45 }}>Click any name for its definition, formula and a toy example.</div>
		</div>
		<div style=${{ ...reveal(B >= 1, still) }}>
			<div style=${{ ...box(X, 244, W, 44), fontFamily: F.hand, fontSize: 30 }}>Try it: click a class to move it to the next service</div>
			<div style=${{ ...box(X, 288, W, 30), fontFamily: F.sans, fontSize: 16, color: C.dim }}>Spring PetClinic, starting from the workflow's final answer (§IV-D) · metrics recomputed live with the study's formulas</div>
			${SERVICES.map((s, i) => {
				const cs = dec[s]
				const two = cs.length > 12
				const chipW = two ? (colW - 26) / 2 : colW - 20
				return html`<div key=${s} style=${{ ...box(X + i * (colW + 14), colTop, colW, colH), border: `2px ${cs.length ? 'solid' : 'dashed'} ${C.ink}`, borderRadius: 14, background: '#fffdf8', overflow: 'hidden' }}>
					<div style=${{ position: 'absolute', left: 10, right: 10, top: 8, fontFamily: F.sans, fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>${s.replace('Service', '')} · ${cs.length}</div>
					<div style=${{ position: 'absolute', left: 10, right: 10, top: 36, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
						${cs.map((c) => html`<div key=${c} ...${SHIELD} onClick=${(e) => { e.stopPropagation(); move(c) }} title=${`${c}: click to move to the next service`}
							style=${{ pointerEvents: 'all', cursor: 'pointer', width: chipW, height: two ? 25 : 28, boxSizing: 'border-box', fontFamily: F.mono, fontSize: two ? 11.5 : 14, lineHeight: two ? '21px' : '24px',
								padding: '0 7px', border: `1.5px solid ${C.faint}`, borderRadius: 7, background: C.paper, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>${c}</div>`)}
					</div>
				</div>`
			})}
			${readout.map(([k, v, t], i) => html`<div key=${k} style=${{ ...box(X + i * (W / 9), 790, W / 9 - 10, 110), border: `2px solid ${C.line}`, borderRadius: 12, background: '#fffdf8', textAlign: 'center', boxSizing: 'border-box', paddingTop: 12 }}>
				<div style=${{ fontFamily: F.sans, fontSize: 15, color: C.dim }}><${Term} k=${t}>${k}</${Term}></div>
				<div style=${{ fontFamily: F.sans, fontSize: 30, fontWeight: 700, marginTop: 6, color: v == null ? C.faint : C.ink }}>${f1(v)}</div></div>`)}
			${btn(X, 330, 'Put everything in one service', allInOne)}
			${btn(X + 346, 150, 'Reset', () => setDec(PETCLINIC.final))}
			<div style=${{ ...box(X + 516, 930, W - 516, 48), display: 'flex', alignItems: 'center', fontFamily: F.sans, fontSize: 16, color: m.services === 1 ? C.red : C.dim, lineHeight: 1.3 }}>
				${m.services} service${m.services === 1 ? '' : 's'} · ${m.services === 1 ? ' · CMod is at its maximum: the coarse-partition trap' : untouched ? ' · the recorded answer' : ' · your edit (BCP: recorded answer only)'}</div>
		</div>
		<${SlideSource}>Table I · §II-B</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ I, II-C · our earlier study
export function IcsaScene({ b, still }) {
	const B = still ? 2 : b
	const phase = (x, n, title, sub, delay) => html`<div style=${{ ...box(x, 300, 480, 230), ...reveal(true, still, { delay }) }}>
		<div style=${{ ...box(0, 0, 480, 230), border: `2.5px solid ${C.ink}`, borderRadius: 18, background: '#fffdf8' }} />
		<div style=${{ position: 'absolute', left: -14, top: -14, width: 40, height: 40, borderRadius: 20, background: C.ink, color: '#fff', fontFamily: F.sans, fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>${n}</div>
		<div style=${{ position: 'absolute', left: 26, top: 22, fontFamily: F.hand, fontSize: 38 }}>${title}</div>
		<div style=${{ position: 'absolute', left: 26, top: 84, right: 20, fontFamily: F.sans, fontSize: 20, lineHeight: 1.45, color: C.dim }}>${sub}</div></div>`
	const problems = [['No guarantee', html`nothing ensures a <${Term} k="validity">valid</${Term}> answer, e.g. every class assigned exactly once`], ['No alternatives', 'only one candidate is ever considered: no visible trade-offs'], ['No cost control', 'cost grows with the context placed in the prompt']]
	const drawer = {
		title: 'Our ICSA 2026 study', kicker: 'the conference paper this extends',
		tabs: [
			{ id: 'pipeline', label: 'The pipeline', render: () => html`<div>
				${List(['Phase 1 · summarise: ingest the code base at a fixed commit and summarise it with one of seven strategies', 'Phase 2 · views: generate architectural views A1–A5 from the summary, plus the static dependency graph A6', 'Phase 3 · decide: one model call synthesises the decomposition from the views'], { ordered: true })}
				${P(html`<${Cite} k="sambu2026icsa" /> · its replication package is on Zenodo (record 18622108, cited in the ICSA paper's conclusion).`, { fontSize: 19, color: C.dim })}</div>` },
			{ id: 'strategies', label: 'Seven strategies', render: () => html`<div>
				${Table(['strategy', 'how the summary is built'], [['30k / 50k / 80k · concatenation', 'pack whole files into chunks of that token budget and concatenate'], ['30k / 50k / 80k · LLM aggregation', 'summarise each chunk with an LLM and merge'], ['hierarchical', 'segment → file → package → repository summaries (Dhulshette et al.)']], { align: ['left', 'left'] })}
				${P(html`Hierarchical follows <${Cite} k="dhulshette2025hierarchical" />.`)}</div>` },
			{ id: 'models', label: 'Models', render: () => P('GPT-5, Gemini-2.5 Pro, GLM-4.6 and DeepSeek-3.2 Terminus, on the same four benchmark systems (ICSA 2026, §IV).') },
			{ id: 'found', label: 'What it found', render: () => html`<div>
				${List(['decompositions were structurally clean: in particular few cyclic dependencies between services, and competitive with traditional tools on several design metrics', 'summarisation strategy had no significant effect on quality', 'hierarchical summarisation cost several times more tokens'])}
				${Src('§I and §II-C of the TSE draft')}</div>` },
			{ id: 'open', label: 'What it left open', render: () => html`<div>
				${Quote('The pipeline, however, relied on a single, centralized reasoning step: one model call had to interpret heterogeneous evidence and produce the final answer.', '§I')}
				${List(problems.map(([a, bb]) => html`<b>${a}</b>: ${bb}`))}</div>` },
		],
		source: 'Source: §I, §II-C of the TSE draft; papers/icsa-2026/manuscript §III–IV.',
	}
	return html`<${Stage} still=${still}>
		${phase(110, 1, 'Summarise', 'the code base, with one of seven strategies', 0)}
		${phase(720, 2, 'Views', html`<${Term} k="views">A1–A5</${Term}> written by the LLM, plus the static graph A6`, 150)}
		${phase(1330, 3, 'One call decides', html`<${Term} k="single-shot">single-shot</${Term}>: the whole decomposition in one answer`, 300)}
		<div style=${{ ...box(110, 575, 1700, 60), fontFamily: F.hand, fontSize: 32, color: C.fix, textAlign: 'center', ...reveal(B >= 1, still) }}>
			Structurally clean: few cyclic dependencies · strategy barely mattered · hierarchical cost several times more</div>
		<div style=${{ ...box(110, 670, 1700, 220), display: 'flex', gap: 24, ...reveal(B >= 2, still) }}>
			${problems.map(([t, s]) => html`<div key=${t} style=${{ flex: 1, border: `2.5px solid ${C.red}`, borderRadius: 16, padding: '16px 20px', background: '#fffdf8' }}>
				<div style=${{ fontFamily: F.hand, fontSize: 36, color: C.red }}>${t}</div>
				<div style=${{ fontFamily: F.sans, fontSize: 20, lineHeight: 1.45, marginTop: 6 }}>${s}</div></div>`)}
		</div>
		<${Inside} x=${1560} y=${200} w=${300} label="ICSA 2026" drawer=${drawer} still=${still} />
		<${SlideSource}>§I, §II-C <${Cite} k="sambu2026icsa" /></${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ II-C · LLMs for decomposition
const KINDS = [
	{ t: 'Representation', s: 'LLM embeddings as features for clustering', ex: 'MonoEmbed', keys: ['sellami2026monoembed'] },
	{ t: 'Generation', s: 'the model proposes the decomposition directly', ex: 'our ICSA 2026 study', keys: ['sambu2026icsa'] },
	{ t: 'Hybrid', s: 'LLMs inside search or clustering', ex: 'MLStractor, SemRef', keys: ['kasdallah2026mlstractor', 'zhang2026semref'] },
	{ t: 'Refactoring', s: 'take a decomposition as given, generate the service code', ex: 'Sellami et al.', keys: ['sellami2025beyond'] },
]
export function LlmScene({ b, still }) {
	const B = still ? 1 : b
	const drawer = {
		title: 'MicroAgent, the closest work', kicker: '§II-C',
		tabs: [
			{ id: 'what', label: 'What it does', render: () => html`<div>
				${P(html`Decomposes monoliths with five specialised LLM agents and analytical tools, and reports higher similarity to reference decompositions than zero-shot prompting and traditional tools on ten Java systems that include our four <${Cite} k="su2026microagent" />.`)}
				${P('Its Common Class Agent deliberately assigns shared classes to several services, mirroring the overlapping references, and it evaluates similarity with C2C.')}</div>` },
			{ id: 'diff', label: 'How this paper differs', render: () => html`<div>
				${Table(['', 'MicroAgent', 'this paper'], [['target number of services', 'given, taken from the reference (as the benchmark did for tools)', 'never: no reference-derived information before freezing'], ['repeated runs', 'none reported (temperature 0)', 'five DeepSeek repetitions'], ['also measured', 'similarity', 'validity, cost, run-to-run variation']], { align: ['left', 'left', 'left'] })}</div>` },
			{ id: 'more', label: 'Other signals', render: () => P(html`Recent work questions whether LLM-generated decompositions respect the code's dependencies <${Cite} k="silva2026structural" />, and surveys map the growing use of LLMs in software architecture <${Cite} keys=${['bucaioni2025aisa', 'schmid2025slr']} />.`) },
		],
		source: 'Source: §II-C.',
	}
	return html`<${Stage} still=${still}>
		${KINDS.map((k, i) => html`<div key=${k.t} style=${{ ...box(110 + (i % 2) * 560, 260 + Math.floor(i / 2) * 290, 530, 260), ...reveal(true, still, { delay: i * 120 }) }}>
			<div style=${{ ...box(0, 0, 530, 260), border: `2.5px solid ${k.t === 'Generation' ? C.red : C.ink}`, borderRadius: 18, background: '#fffdf8' }} />
			<div style=${{ position: 'absolute', left: 24, top: 16, fontFamily: F.hand, fontSize: 40, color: k.t === 'Generation' ? C.red : C.ink }}>${k.t}</div>
			<div style=${{ position: 'absolute', left: 24, top: 78, right: 20, fontFamily: F.sans, fontSize: 21, lineHeight: 1.45 }}>${k.s}</div>
			<div style=${{ position: 'absolute', left: 24, bottom: 18, fontFamily: F.sans, fontSize: 19, color: C.dim }}>e.g. ${k.ex} <${Cite} keys=${k.keys} /></div></div>`)}
		<div style=${{ ...box(1260, 260, 550, 550), ...reveal(B >= 1, still) }}>
			<div style=${{ ...box(0, 0, 550, 550), border: `3px dashed ${C.red}`, borderRadius: 20, background: '#fffdf8' }} />
			<div style=${{ position: 'absolute', left: 26, top: 18, fontFamily: F.hand, fontSize: 40 }}>closest: MicroAgent <${Cite} k="su2026microagent" /></div>
			<div style=${{ position: 'absolute', left: 26, top: 90, right: 24, fontFamily: F.sans, fontSize: 21, lineHeight: 1.5 }}>
				five LLM agents · shared classes in several services · C2C<br /><br />
				<span style=${{ color: C.red, fontWeight: 600 }}>but</span> it is given the target number of services from the reference, and reports no repeated runs.</div>
			<div style=${{ position: 'absolute', left: 26, bottom: 24 }}><${Inside} label="Compare" drawer=${drawer} still=${still} /></div>
		</div>
		<${SlideSource}>§II-C</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ II-D · agents and workflows
export function AgentsScene({ b, still }) {
	const B = still ? 2 : b
	const pts = [['one call', 'single-shot prompting', 'single-shot', 260], ['a workflow', 'LLM calls and tools on fixed code paths', 'agentic-workflow', 960], ['an autonomous agent', 'the LLM chooses what to read and do next', 'autonomous-agent', 1660]]
	const drawer = {
		title: 'What the agent literature says', kicker: '§II-D',
		tabs: [
			{ id: 'agents', label: 'Agents vs workflows', render: () => html`<div>
				${P(html`LLM agents interleave reasoning with actions such as tool calls <${Cite} k="yao2023react" />. In software engineering, autonomous agents navigate repositories, edit files and run tests <${Cite} k="yang2024sweagent" />; surveys catalogue their growth <${Cite} k="liu2024agentsurvey" />.`)}
				${P(html`A useful distinction separates agents, where the LLM directs its own process, from workflows, where calls and tools follow predefined code paths <${Cite} k="anthropic2024agents" />. On repository-level issue resolution, a fixed three-phase pipeline beat open-source autonomous agents at a fraction of their cost <${Cite} k="xia2024agentless" />.`)}
				${P(html`For architecture, agentic AI raises the question of which decisions can be delegated and which must stay with humans <${Cite} k="vaidhyanathan2025agentic" />.`)}
				${Note(html`In this paper, the <${Term} k="agentic-workflow" /> is the approach, <${Term} k="opencode" /> is a baseline, and <${Term} k="agent" /> means a role-specialised component of the workflow.`, C.faint)}</div>` },
			{ id: 'self', label: 'Self-correction', tabs: [
				{ id: 'refine', label: 'Self-Refine', render: () => P(html`Reported gains from iterative self-feedback across several tasks <${Cite} k="madaan2023selfrefine" />.`) },
				{ id: 'cannot', label: 'Cannot self-correct', render: () => P(html`LLMs struggle to correct their own reasoning without external feedback <${Cite} k="huang2024cannot" />.`) },
				{ id: 'signals', label: 'External signals', render: () => P(html`Reported benefits often rely on reliable external signals <${Cite} k="kamoi2024selfcorrection" />.`) },
				{ id: 'repair', label: 'Self-repair in code', render: () => P(html`Even with test feedback, the gains of self-repair in code generation are modest once cost is considered <${Cite} k="olausson2024selfrepair" />.`) },
				{ id: 'hack', label: 'Reward hacking', render: () => P(html`When a generator and its evaluator share a model and context, optimisation can raise the evaluator's score while true quality stagnates <${Cite} k="pan2024rewardhacking" />; LLM judges prefer their own generations <${Cite} keys=${['panickssery2024selfpreference', 'zheng2023judging']} />.`) },
			], render: () => P('Five results that shaped the workflow\'s design:') },
			{ id: 'nondet', label: 'Non-determinism', render: () => P(html`LLM outputs vary between runs even at temperature zero <${Cite} keys=${['ouyang2025nondeterminism', 'atil2024nondeterminism']} />, and single-run studies risk mistaking variation for effects <${Cite} keys=${['sallou2024breaking', 'arcuri2014hitchhiker']} />. The study therefore repeats one model five times.`) },
			{ id: 'decisions', label: 'What follows for us', render: () => List(['refinement is driven by deterministic, reference-free measurements, not LLM critique', 'no candidate is judged by a criterion derived from the same model output that produced it']) },
		],
		source: 'Source: §II-D.',
	}
	return html`<${Stage} still=${still}>
		<svg width="1920" height="1080" style=${{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
			<line x1="220" y1="440" x2="1700" y2="440" stroke=${C.ink} strokeWidth="4" />
			${pts.map(([, , , x]) => html`<circle key=${x} cx=${x} cy="440" r="18" fill=${x === 960 ? C.red : C.ink} />`)}
		</svg>
		${pts.map(([t, s, k, x], i) => html`<div key=${t} style=${{ ...box(x - 250, 290, 500, 110), textAlign: 'center', fontFamily: F.hand, fontSize: 40, color: i === 1 ? C.red : C.ink, ...reveal(true, still, { delay: i * 120 }) }}><${Term} k=${k}>${t}</${Term}></div>`)}
		${pts.map(([t, s, , x], i) => html`<div key=${t + 's'} style=${{ ...box(x - 250, 480, 500, 110), textAlign: 'center', fontFamily: F.sans, fontSize: 21, color: C.dim, lineHeight: 1.4, ...reveal(true, still, { delay: 200 + i * 120 }) }}>${s}</div>`)}
		<div style=${{ ...box(220, 610, 1480, 60), display: 'flex', justifyContent: 'space-between', fontFamily: F.hand, fontSize: 28, color: C.dim, ...reveal(B >= 1, still) }}>
			<span>← predictable</span><span>this paper's approach · OpenCode is the baseline on the right</span><span>flexible →</span></div>
		<div style=${{ ...box(220, 720, 1480, 180), ...reveal(B >= 2, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 34, textAlign: 'center', lineHeight: 1.35 }}>
				LLMs rarely fix their own output without external feedback <${Cite} keys=${['huang2024cannot', 'kamoi2024selfcorrection']} /><br />→ let code do the checking, scoring and improving</div>
		</div>
		<${Inside} x=${1560} y=${200} w=${300} label="The literature" drawer=${drawer} still=${still} />
		<${SlideSource}>§II-D</${SlideSource}>
	</${Stage}>`
}

// ------------------------------------------------------------------ II-E · positioning
const ROW_TERMS = { 'Multiple candidates': 'strategies', 'Reference-free selection/refinement': 'oracle-firewall', 'No reference-derived inputs': 'blinded-evaluation', 'Guaranteed complete assignment': 'repair', 'Autonomous-agent baseline': 'autonomous-agent', 'Repeated runs': 'nondeterminism', 'Token cost reported': 'token' }
export function PositionScene({ b, still }) {
	const cols = POSITIONING.head
	const colW = [560, 260, 260, 300, 260]
	const x0 = 150
	const cell = (v, i) => html`<span style=${{ color: v.startsWith('✓') ? (i === 4 ? C.fix : C.ink) : v.startsWith('✗') ? C.red : C.dim, fontWeight: 700 }}>${v}</span>`
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(x0, 240, 1640, 60), display: 'flex', fontFamily: F.hand, fontSize: 30 }}>
			${cols.map((c, i) => html`<div key=${i} style=${{ width: colW[i], textAlign: i ? 'center' : 'left', color: i === 4 ? C.red : C.ink }}>${i ? rich(c) : ''}</div>`)}
		</div>
		<div style=${{ ...box(x0 + colW.slice(0, 4).reduce((a, v) => a + v, 0) - 10, 232, colW[4] + 20, 76 + POSITIONING.rows.length * 64), border: `3px solid ${C.red}`, borderRadius: 18, pointerEvents: 'none' }} />
		${POSITIONING.rows.map((r, j) => html`<div key=${j} style=${{ ...box(x0, 310 + j * 64, 1640, 60), display: 'flex', alignItems: 'center', borderBottom: `1.5px solid ${C.line}`, ...reveal(true, still, { delay: j * 60 }) }}>
			${r.map((v, i) => html`<div key=${i} style=${{ width: colW[i], textAlign: i ? 'center' : 'left', fontFamily: i ? F.sans : F.hand, fontSize: i ? 28 : 25, whiteSpace: 'nowrap' }}>
				${i === 0 ? (ROW_TERMS[v] ? html`<${Term} k=${ROW_TERMS[v]}>${v}</${Term}>` : v) : cell(v, i)}</div>`)}
		</div>`)}
		<div style=${{ ...box(x0, 330 + POSITIONING.rows.length * 64, 1640, 60), fontFamily: F.sans, fontSize: 18, color: C.dim }}>
			✓ yes · ✗ no · – not applicable · n/r not reported · ᵃ tools that need a target number of services, including Mono2Micro, received the reference's service count</div>
		<${SlideSource}>Table II · §II-E</${SlideSource}>
	</${Stage}>`
}
