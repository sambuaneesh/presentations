// Two real answers to the same question, drawn on the map: GLM-4.6 and DeepSeek-3.2 Terminus, both from the 80k-concat
// summary of Spring PetClinic (studies/icsa-2026/systems/spring-petclinic/generation/summaries/*/80k/artifacts_concat).
// Colour = service. (Their ICSA inventory also had PetTypeRepository and WebConfiguration, which the map leaves out.)
const GLM = [
	['Owner', 'blue', ['Owner', 'OwnerController', 'OwnerRepository']],
	['Pet', 'light-blue', ['Pet', 'PetController', 'PetValidator', 'PetType', 'PetTypeFormatter']],
	['Visit', 'orange', ['Visit', 'VisitController']],
	['Veterinary', 'violet', ['Vet', 'VetController', 'VetRepository', 'Specialty', 'Vets']],
	['API Gateway', 'yellow', ['WelcomeController', 'CrashController']],
	['Infrastructure', 'light-violet', ['PetClinicApplication', 'PetClinicRuntimeHints', 'CacheConfiguration']],
	['Domain Model', 'grey', ['BaseEntity', 'NamedEntity', 'Person']],
]
const DS = [
	['Owner Management', 'blue', ['Owner', 'OwnerController', 'OwnerRepository', 'Pet', 'PetController', 'PetType', 'PetTypeFormatter', 'PetValidator', 'Visit', 'VisitController']],
	['Veterinarian Management', 'violet', ['Vet', 'VetController', 'VetRepository', 'Vets', 'Specialty', 'CacheConfiguration']],
	['Shared Infrastructure', 'grey', ['PetClinicApplication', 'PetClinicRuntimeHints', 'BaseEntity', 'NamedEntity', 'Person', 'CrashController', 'WelcomeController']],
]
const colourIn = (ans) => (c) => (ans.find(([, , cs]) => cs.includes(c)) ?? [])[1] ?? null
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


export default {
	name: 'Which is better?',
	kicker: 'IV · is it any good?',
	title: 'Same input, two answers. Which is better?',
	source: 'ICSA runs: GLM-4.6, DeepSeek-3.2 · 80k-concat · Spring PetClinic',
	draw(k) {
		k.text(120, 240, 'GLM-4.6: 7 services', { size: 'l' })
		petmap(k, { x: 110, y: 160, s: 0.6, tag: 'g', fill: colourIn(GLM), node: () => ({ until: 2 }), edge: () => ({ until: 2 }) })
		GLM.forEach(([n, col], i) => { const x = 120 + (i % 2) * 380, y = 800 + Math.floor(i / 2) * 50; k.circle(x + 12, y + 24, 12, { fill: 'fill', color: col, size: 's', until: 2 }); k.text(x + 34, y, n, { size: 'm', until: 2 }) })
		k.text(1010, 240, 'DeepSeek-3.2: 3 services', { size: 'l', beat: 1, anim: 'fade' })
		petmap(k, { x: 1000, y: 160, s: 0.6, tag: 'd', fill: colourIn(DS), node: () => ({ beat: 1, anim: 'pop', until: 2 }), edge: () => ({ beat: 1, anim: 'fade', until: 2 }) })
		DS.forEach(([n, col], i) => { const o = { beat: 1, anim: 'fade', delay: i * 150, until: 2 }; k.circle(1022, 824 + i * 50, 12, { fill: 'fill', color: col, size: 's', ...o }); k.text(1044, 800 + i * 50, n, { size: 'm', ...o }) })
		// 2: drop the edges: what each one really is, services with their classes
		serviceRows(k, GLM, { x: 110, y: 310, w: 820, h: 600, o: { beat: 2, anim: 'fade' } })
		serviceRows(k, DS, { x: 1000, y: 310, w: 820, h: 600, o: { beat: 2, anim: 'fade', delay: 500 } })
		// 3: the main idea
		k.text(1010, 960, 'proposing a cut is easy. judging it is the job.', { size: 'l', color: 'red', beat: 3, anim: 'fade' })
	},
}

// A decomposition as what it really is: services, each a list of classes (no edges). One tinted row per service.
function serviceRows(k, groups, { x, y, w, h, gap = 12, o = {} }) {
	const rh = (h - gap * (groups.length - 1)) / groups.length
	groups.forEach(([name, color, classes], i) => {
		const gy = y + i * (rh + gap), d = (o.delay ?? 0) + i * 150
		k.box(x, gy, w, rh, { fill: 'semi', color, size: 's', dash: 'draw', ...o, delay: d })
		k.text(x + 14, gy + 6, name, { size: 'm', ...o, anim: 'fade', delay: d })
		k.text(x + 14, gy + 44, classes.join(' · '), { font: 'mono', size: 's', w: w - 28, ...o, anim: 'fade', delay: d + 100 })
	})
}
