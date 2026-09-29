// Agentic Journal Extension: the TSE paper as an explorable deck. One scene per slide; the
// `tse-paper` template lays them out in order (ext/deck.js).
import { TitleScene, HowtoScene, MapScene as MapInner } from './scenes/front.js'
import { MonolithScene, PartitionScene, TechniquesScene, BenchmarkScene, MetricsScene, IcsaScene, LlmScene, AgentsScene, PositionScene } from './scenes/part1.js'
import { GqmScene, PrinciplesScene, RolesScene, AlgorithmScene, ALG_BEATS, FirewallScene, DesignScene, AnalysisScene, C2cScene } from './scenes/part2.js'
import { EvolutionScene, BaselinesScene, ExecutionScene, ExampleScene } from './scenes/part3.js'
import { Rq1MainScene, Rq1PairedScene, Rq1ToolsScene, Rq2Scene, Rq3Scene, Rq4Scene, Rq4OtherScene } from './scenes/part4.js'
import { BuysScene, LessonsScene, ImplicationsScene, ThreatsScene, ConclusionScene, StudiesScene, NotAdoptedScene, ReproduceScene, RefsScene, GlossaryScene } from './scenes/part5.js'
import { AgenticTrace, AGENTIC_BEATS } from './trace/agentic.js'
import { SLIDES } from './deck.js'
import { Compass } from './nav.js'
import { useAnnotate } from './annotate.js'
import { useRef } from 'react'

// A slide's root: also lets the laser and highlighter draw over the deck's interactive parts.
function SlideRoot({ children }) {
	const ref = useRef(null)
	useAnnotate(ref)
	return html`<div ref=${ref} style=${{ position: 'absolute', inset: 0 }}>${children}</div>`
}
import { html, C, F, box, Stage, SlideCtx } from './ui.js'
const MapScene = (props) => html`<${Stage} still=${props.still}><${MapInner} ...${props} /></${Stage}>`

// Each scene draws its own kicker, title and slide number (not the layout's text shapes), so the
// drawers and sheets a scene opens always cover the whole slide.
function withHead(id, Scene) {
	const i = SLIDES.findIndex((s) => s.scene === id)
	const slide = SLIDES[i] ?? {}
	return (props) => html`<${SlideCtx.Provider} value=${id}><${SlideRoot}>
		${slide.kicker && html`<div style=${{ ...box(120, 58, 1680, 40), fontFamily: F.hand, fontSize: 26, color: C.red, whiteSpace: 'nowrap' }}>${slide.kicker}</div>`}
		${slide.title && html`<div style=${{ ...box(120, 92, 1680, 96), fontFamily: F.hand, fontSize: 64, lineHeight: 1.25, color: C.ink, whiteSpace: 'nowrap' }}>${slide.title}</div>`}
		<${Scene} ...${props} />
		${i >= 0 && !props.frozen && html`<${Stage} still=${props.still} name="nav"><${Compass} index=${i} /></${Stage}>`}
	</${SlideRoot}></${SlideCtx.Provider}>`
}

const SCENES = {
	'tp-title': { name: 'Title', beats: 0, render: TitleScene },
	'tp-howto': { name: 'How to read this deck', beats: 0, render: HowtoScene },
	'tp-map': { name: 'Map of the work', beats: 0, render: MapScene },
	'p1-monolith': { name: 'Monolith to microservices', beats: 2, render: MonolithScene },
	'p1-partition': { name: 'A decomposition is a partition', beats: 2, render: PartitionScene },
	'p1-techniques': { name: 'Techniques', beats: 2, render: TechniquesScene },
	'p1-benchmark': { name: 'The benchmark', beats: 1, render: BenchmarkScene },
	'p1-metrics': { name: 'Measuring a decomposition', beats: 1, render: MetricsScene },
	'p1-icsa': { name: 'Our earlier study', beats: 2, render: IcsaScene },
	'p1-llm': { name: 'LLMs for decomposition', beats: 1, render: LlmScene },
	'p1-agents': { name: 'Agents vs workflows', beats: 2, render: AgentsScene },
	'p1-position': { name: 'Positioning', beats: 0, render: PositionScene },
	'p2-gqm': { name: 'Goal and questions', beats: 1, render: GqmScene },
	'p2-principles': { name: 'Three principles', beats: 2, render: PrinciplesScene },
	'p2-trace': { name: 'The workflow, traced live', beats: AGENTIC_BEATS, render: AgenticTrace },
	'p2-roles': { name: 'The roles', beats: 0, render: RolesScene },
	'p2-algorithm': { name: 'Algorithm 1', beats: ALG_BEATS, render: AlgorithmScene },
	'p2-firewall': { name: 'Oracle firewall', beats: 4, render: FirewallScene },
	'p2-design': { name: 'Experiment design', beats: 2, render: DesignScene },
	'p2-analysis': { name: 'Analysis', beats: 2, render: AnalysisScene },
	'p2-c2c': { name: 'Why C2C', beats: 1, render: C2cScene },
	'p3-evolution': { name: 'Design experiments', beats: 4, render: EvolutionScene },
	'p3-baselines': { name: 'Choosing the baselines', beats: 2, render: BaselinesScene },
	'p3-execution': { name: 'Execution', beats: 1, render: ExecutionScene },
	'p3-example': { name: 'Worked example', beats: 3, render: ExampleScene },
	'p4-rq1-main': { name: 'Q1 per model', beats: 1, render: Rq1MainScene },
	'p4-rq1-paired': { name: 'Q1 paired', beats: 0, render: Rq1PairedScene },
	'p4-rq1-tools': { name: 'Q1 tools', beats: 1, render: Rq1ToolsScene },
	'p4-rq2': { name: 'Q2', beats: 2, render: Rq2Scene },
	'p4-rq3': { name: 'Q3', beats: 2, render: Rq3Scene },
	'p4-rq4': { name: 'Q4 ablation', beats: 2, render: Rq4Scene },
	'p4-rq4-other': { name: 'Q4 other', beats: 2, render: Rq4OtherScene },
	'p5-buys': { name: 'What it buys', beats: 2, render: BuysScene },
	'p5-lessons': { name: 'Four lessons', beats: 0, render: LessonsScene },
	'p5-implications': { name: 'Implications', beats: 1, render: ImplicationsScene },
	'p5-threats': { name: 'Threats', beats: 0, render: ThreatsScene },
	'p5-conclusion': { name: 'Conclusion', beats: 2, render: ConclusionScene },
	'p6-studies': { name: 'Studies', beats: 0, render: StudiesScene },
	'p6-notadopted': { name: 'Not adopted', beats: 0, render: NotAdoptedScene },
	'p6-reproduce': { name: 'Reproducing', beats: 0, render: ReproduceScene },
	'p6-refs': { name: 'References', beats: 0, render: RefsScene },
	'p6-glossary': { name: 'Glossary', beats: 0, render: GlossaryScene },
}

export default {
	scenes: Object.fromEntries(Object.entries(SCENES).map(([id, s]) => [id, { ...s, render: withHead(id, s.render), safelight: false }])),
	templates: {
		'tse-paper': {
			name: 'Research so far (interactive)', theme: 'ink',
			slides: SLIDES.map((s) => ({ layout: 'scene', overrides: { scene: s.scene, name: s.name, notes: s.notes ?? '' } })),
		},
	},
}
