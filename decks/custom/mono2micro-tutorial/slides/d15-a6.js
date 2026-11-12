// Why A6, then A6 for real. Click 0: an answer built from the views only names classes loosely or invents them, so it
// can't be mapped or scored (ICSA §IV-B: A6 grounds the names and the real dependency structure). Click 1: the real A6
// entry for Visit (studies/icsa-2026/systems/spring-petclinic/generation/gemini_complete_context_results/prompt.txt,
// "Dependency Graph Structure", elided) next to the talk's PetClinic map: the map's edges come from such a graph.
// Click 2: Visit's relationships, and the whole A6 (25 classes, 100 dependencies).
// ===== the PetClinic map ==============================================================================
// The talk's recurring picture: Spring PetClinic's 23 classes and the 24 weighted dependencies the metrics see
// (benchmark of Wang, Bornais & Rubin, ASE 2024), always at the SAME positions and in the SAME colours.
// Slides cannot import, so this block is pasted verbatim into every slide that draws the map (keep the copies
// identical; change it here first). Colours: customers blue · vets violet · visits orange (the deck palette repaints
// "orange" as amber #cc8a00) · shared base classes and infrastructure grey. Red is only ever the cut.
const MAP = {
	PetClinicApplication: [150, 270], PetClinicRuntimeHints: [150, 350],
	BaseEntity: [640, 255], NamedEntity: [500, 360], Person: [790, 360],
	Owner: [330, 495], Pet: [580, 580], OwnerController: [140, 610], OwnerRepository: [300, 730], PetController: [540, 725],
	PetType: [770, 700], PetValidator: [700, 850], PetTypeFormatter: [440, 870], VisitController: [140, 860], Visit: [280, 975],
	Vet: [980, 495], Specialty: [1160, 420], Vets: [1160, 600], VetController: [980, 700], VetRepository: [1160, 800],
	CrashController: [900, 900], WelcomeController: [900, 975], CacheConfiguration: [1150, 940],
}
const MAP_EDGES = [['NamedEntity', 'BaseEntity'], ['Person', 'BaseEntity'], ['Owner', 'Person'], ['Owner', 'Pet'], ['OwnerController', 'Owner'], ['OwnerController', 'OwnerRepository'],
	['Pet', 'NamedEntity'], ['PetController', 'OwnerRepository'], ['PetController', 'Owner'], ['PetController', 'Pet'], ['PetController', 'PetValidator'], ['PetType', 'NamedEntity'],
	['PetTypeFormatter', 'OwnerRepository'], ['PetTypeFormatter', 'PetType'], ['PetValidator', 'Pet'], ['Visit', 'BaseEntity'], ['VisitController', 'Owner'], ['VisitController', 'OwnerRepository'],
	['VisitController', 'Pet'], ['VisitController', 'Visit'], ['Specialty', 'NamedEntity'], ['Vet', 'Person'], ['VetController', 'VetRepository'], ['VetController', 'Vets']]
// the developers' own split (customers / vets / visits), with the shared and infrastructure classes apart
const DOMAIN = {
	customers: ['Owner', 'OwnerController', 'OwnerRepository', 'Pet', 'PetController', 'PetType', 'PetTypeFormatter', 'PetValidator'],
	vets: ['Vet', 'VetController', 'VetRepository', 'Specialty', 'Vets'],
	visits: ['Visit', 'VisitController'],
	shared: ['BaseEntity', 'NamedEntity', 'Person'],
	infra: ['PetClinicApplication', 'PetClinicRuntimeHints', 'CacheConfiguration', 'CrashController', 'WelcomeController'],
}
const DOMAIN_COLOR = { customers: 'blue', vets: 'violet', visits: 'orange', shared: 'grey', infra: 'grey' }
const domainOf = (c) => Object.keys(DOMAIN).find((d) => DOMAIN[d].includes(c))
const chipW = (c) => c.length * 12.6 + 34
// petmap(k, opts) draws the map.
//   x, y, s   offset and scale: a class at MAP position [px, py] lands at [x + px·s, y + py·s] (defaults 0, 0, 1:
//             full size, the graph then spans about x 0–1300, y 230–1000)
//   names     class-name chips (only legible at s ≥ 0.9) · otherwise dots
//   fill(c)   colour name for class c, or null for neutral (white chip / grey dot)
//   edges     edge colour, or false for no edges · tag: id prefix (several maps on one slide)
//   node(c), edge(a, b, i): extra options per class / per edge (beat, anim, delay, until, …). Edges are faint context
//             (opacity 0.45) unless edge() says otherwise: give emphasised edges opacity: 1
function petmap(k, m = {}) {
	const { x = 0, y = 0, s = 1, names = false, fill = () => null, edges = 'grey', tag = 'm', node = () => ({}), edge = () => ({}) } = m
	const at = (c) => [x + MAP[c][0] * s, y + MAP[c][1] * s]
	const r = Math.max(9, 15 * s)
	for (const c of Object.keys(MAP)) {
		const [px, py] = at(c), col = fill(c)
		if (names) k.box(px - chipW(c) / 2, py - 24, chipW(c), 48, { text: c, font: 'mono', size: 's', fill: 'solid', color: col || 'white', labelColor: 'black', id: tag + c, ...node(c) })
		else k.circle(px, py, r, { fill: 'fill', color: col || 'grey', size: 's', id: tag + c, ...node(c) })
	}
	if (edges) MAP_EDGES.forEach(([a, b], i) => k.arrow(tag + a, tag + b, { size: 's', color: edges, head: 'none', opacity: 0.45, ...edge(a, b, i) }))
}
// ===== end of the PetClinic map ======================================================================
const L = [
	'"…owner.Visit": {',
	'  "annotations": ["@Entity", "@Table(name = \"visits\")"],',
	'  "fields": [{ "declaration": "private LocalDate date" }, …],',
	'  "relationships": {',
	'    "EXTENDS": { "…model.BaseEntity": 1 },',
	'    "USED_BY": { "…owner.Pet": 1,',
	'                 "…owner.VisitController": 1,',
	'                 "…owner.Owner": 5 }',
	'  }',
	'}',
]
const Y0 = 340, LH = 32.4 // size 'm' lines (24 px × 1.35)
const y = (i) => Y0 + i * LH
const SYN = [
	'"<class name>": {',
	'  "annotations": [ … ],',
	'  "methods":  [ { "signature": … } ],',
	'  "fields":   [ { "declaration": … } ],',
	'  "relationships": {',
	'    "<TYPE>": { "<other class>": <count> }',
	'  }',
	'}',
]
export default {
	name: 'Our miniature: A6',
	kicker: 'III · enter the LLM · phase 2',
	title: 'Our miniature: A6',
	source: 'ICSA 2026 §IV-B · PetClinic class dependency graph (A6), 29 KB · run files: the decomposition prompt',
	draw(k) {
		// 0: how small, and what we keep
		k.text(110, 240, '587 MB → 29 KB', { size: 'xl', scale: 1.6 })
		k.text(118, 395, 'about 20,000× smaller', { size: 'l', color: 'grey' })
		const KEEP = ['only PetClinic’s\nown classes:\nno libraries', 'one node per class,\nnot per method', 'edges typed\nand counted']
		KEEP.forEach((t, i) => k.note(860 + i * 330, 250, t, { color: 'yellow', size: 'm', rot: [-3, 2, -2][i], anim: 'drop', delay: 300 + i * 200, until: 1 }))
		// 1: the syntax, and a real entry
		k.text(110, 520, 'the shape of every entry', { size: 'm', color: 'grey', beat: 1, anim: 'fade', until: 2 })
		k.box(100, 560, 820, 330, { size: 's', fill: 'solid', color: 'white', beat: 1, anim: 'fade', until: 2 })
		k.text(125, 580, SYN.join('\n'), { font: 'mono', size: 'm', beat: 1, anim: 'fade', until: 2 })
		k.text(990, 280, 'a real one: Visit', { size: 'm', color: 'grey', beat: 1, anim: 'fade', delay: 300 })
		k.box(970, 320, 860, 360, { size: 's', fill: 'solid', color: 'white', beat: 1, anim: 'fade', delay: 300 })
		k.text(990, Y0, L.join('\n'), { font: 'mono', size: 's', scale: 1.25, beat: 1, anim: 'fade', delay: 300 })
		// 2: Visit and its edges on our map; the counts are the point
		const touches = (a, b) => a === 'Visit' || b === 'Visit'
		petmap(k, { x: 60, y: 390, s: 0.5, fill: (c) => (c === 'Visit' ? 'orange' : null), node: () => ({ beat: 2, anim: 'pop' }), edge: (a, b) => ({ beat: 2, delay: 200, ...(touches(a, b) && { color: 'orange', size: 'm', opacity: 1 }) }) })
		k.text(110, 920, 'Visit and its edges, on our map', { size: 'l', color: 'orange', beat: 2, anim: 'fade', delay: 400 })
		k.text(990, 740, 'Owner uses Visit 5 times: a summary loses that', { size: 'l', beat: 2, anim: 'fade', delay: 600 })
		k.text(990, 820, '25 classes · 100 dependencies', { size: 'l', beat: 2, anim: 'fade', delay: 800 })
		k.text(990, 900, 'exact names, real edges', { size: 'l', color: 'green', beat: 2, anim: 'fade', delay: 1000 })
	},
}
