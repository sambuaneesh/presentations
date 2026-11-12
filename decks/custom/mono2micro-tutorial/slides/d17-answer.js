// The prompt (its five rules, verbatim in spirit, compact) and a real answer drawn ON the talk's PetClinic map:
// GPT-5 with the 80k-concat summary (studies/icsa-2026/systems/spring-petclinic/generation/summaries/gpt-5/80k/
// artifacts_concat/decomposition.json): 5 services. Its inventory has 25 classes; PetTypeRepository and
// WebConfiguration are not among the benchmark's 23, so they are not on the map.
// Click 1 colours the map by GPT-5's services; click 2 circles the shared kernel and asks the question.
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
const GPT5 = [
	['Owner-Pet-Visit Management', 'blue', ['Owner', 'OwnerController', 'OwnerRepository', 'Pet', 'PetController', 'PetType', 'PetTypeFormatter', 'PetValidator', 'Visit', 'VisitController']],
	['Veterinarian Catalog', 'violet', ['Vet', 'Specialty', 'VetRepository', 'VetController', 'Vets', 'CacheConfiguration']],
	['Shared Domain Kernel', 'black', ['BaseEntity', 'NamedEntity', 'Person']],
	['Web Portal', 'light-violet', ['WelcomeController', 'CrashController']],
	['Platform & I18n Infrastructure', 'yellow', ['PetClinicApplication', 'PetClinicRuntimeHints']],
]
const SVC = Object.fromEntries(GPT5.flatMap(([, col, cls]) => cls.map((c) => [c, col])))
export default {
	name: 'A real answer',
	kicker: 'III · enter the LLM · phase 3',
	title: 'One prompt in, one decomposition out',
	source: 'ICSA 2026 §IV-C · run files: GPT-5 · 80k-concat · Spring PetClinic',
	draw(k) {
		k.text(110, 235, 'every class exactly once · exact names · 3–6 services · high cohesion, low coupling · JSON only', { size: 'm', font: 'mono', color: 'grey' })
		// 1: the map, coloured by GPT-5's services
		petmap(k, { x: 40, y: 150, s: 0.7, edge: () => ({ until: 2 }), node: () => ({ until: 2 }) })
		petmap(k, { x: 40, y: 150, s: 0.7, tag: 'g', edges: false, fill: (c) => SVC[c], node: (c) => ({ beat: 1, anim: 'pop', delay: 100 + Object.keys(MAP).indexOf(c) * 30, until: 2 }) })
		;['Owner', 'Pet', 'VisitController', 'Vet', 'BaseEntity'].forEach((c) => k.text(40 + MAP[c][0] * 0.7 + 18, 150 + MAP[c][1] * 0.7 - 16, c, { size: 'm', font: 'mono', beat: 1, anim: 'fade', delay: 900, until: 2 }))
		GPT5.forEach(([name, col, cls], i) => {
			const y = 360 + i * 95, o = { beat: 1, anim: 'fade', delay: 300 + i * 150, until: 2 }
			k.circle(1000, y + 22, 16, { fill: 'fill', color: col, size: 's', ...o })
			k.text(1035, y, name, { size: 'l', ...o })
			k.text(1690, y, String(cls.length), { size: 'l', color: 'grey', ...o })
		})
		// 2: what it actually hands back: no edges, just services with their classes
		serviceColumns(k, GPT5.map(([n, c, cls]) => [n, c === 'black' ? 'grey' : c, cls]), { x: 110, y: 295, w: 1700, h: 600, o: { beat: 2, anim: 'fade' } })
		k.text(110, 912, 'what the LLM hands back: services, each a list of classes (+ 2 classes outside the benchmark’s 23)', { size: 'm', color: 'grey', beat: 2, anim: 'fade', delay: 1200, until: 3 })
		// 3: the base classes everyone inherits got a service of their own
		k.box(110 + 2 * (1700 - 4 * 18) / 5 + 2 * 18 - 10, 290, (1700 - 4 * 18) / 5 + 20, 340, { color: 'red', size: 'm', dash: 'solid', beat: 3, anim: 'pop' })
		k.text(110, 912, 'the base classes everyone inherits got a service of their own', { size: 'm', beat: 3, anim: 'fade', delay: 200 })
		k.text(110, 960, 'is it good? how would we even know?', { size: 'l', beat: 3, anim: 'fade', delay: 500 })
	},
}

// A decomposition as what it really is: services, each a list of classes (no edges). One tinted column per service.
function serviceColumns(k, groups, { x, y, w, h, gap = 18, chipH = 42, o = {} }) {
	const cw = (w - gap * (groups.length - 1)) / groups.length
	groups.forEach(([name, color, classes], i) => {
		const gx = x + i * (cw + gap), d = (o.delay ?? 0) + i * 180
		k.box(gx, y, cw, h, { fill: 'semi', color, size: 's', dash: 'draw', ...o, delay: d, id: 'col' + i })
		k.text(gx + 14, y + 10, name, { size: 'm', w: cw - 28, ...o, anim: 'fade', delay: d })
		classes.forEach((c, j) => k.box(gx + 12, y + 92 + j * (chipH + 6), cw - 24, chipH, { text: c, font: 'mono', size: 's', fill: 'solid', color: 'white', labelColor: 'black', ...o, anim: 'pop', delay: d + 150 + j * 40 }))
	})
}
