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

// Spot the smell: a 2-minute exercise before the learnings. One deliberately bad decomposition of PetClinic, drawn on
// the map (illustrative, not a run's output): a god service, two services that call each other both ways, and two
// services sharing one table. Students call out what's wrong; the click reveals the three answers.
const GOD = ['PetClinicApplication', 'PetClinicRuntimeHints', 'BaseEntity', 'NamedEntity', 'Person', 'Owner', 'OwnerController', 'OwnerRepository', 'Pet', 'PetController', 'PetType', 'PetTypeFormatter', 'PetValidator', 'Visit', 'VisitController']
const B = ['Vet', 'Specialty', 'Vets', 'VetController']
const C = ['VetRepository', 'CacheConfiguration', 'CrashController', 'WelcomeController']

export default {
	name: 'Spot the smell',
	kicker: 'VI · what to take home',
	title: 'Spot the smell',
	draw(k) {
		petmap(k, { x: 0, y: 110, s: 0.8, fill: (c) => (GOD.includes(c) ? 'blue' : B.includes(c) ? 'violet' : 'orange') })
		k.loop(380, 610, 330, 310, { color: 'blue', size: 'm' })
		k.loop(856, 560, 120, 160, { color: 'violet', size: 'm' })
		k.loop(830, 840, 170, 85, { color: 'orange', size: 'm' })
		// the cycle between the violet and orange services
		k.arrow([990, 620], [1000, 800], { size: 'l', color: 'red', bend: -40 })
		k.arrow([1040, 800], [1030, 620], { size: 'l', color: 'red', bend: -40 })
		// one table, two owners
		k.box(1180, 640, 200, 90, { geo: 'oval', fill: 'solid', color: 'grey', size: 's', text: 'vets table', font: 'mono', id: 'tbl' })
		k.arrow([976, 520], [1180, 670], { size: 'm', color: 'red' })
		k.arrow([1000, 850], [1190, 720], { size: 'm', color: 'red' })
		k.text(1420, 280, 'what’s wrong\nwith this cut?', { size: 'xl', color: 'grey' })
		// 1: the answers
		k.text(1420, 440, 'god service:\none team owns it all', { size: 'l', color: 'blue', beat: 1, anim: 'fade' })
		k.text(1420, 590, 'cycle:\ncan’t deploy alone', { size: 'l', color: 'red', beat: 1, anim: 'fade', delay: 400 })
		k.text(1420, 740, 'shared table:\ncan’t change alone', { size: 'l', color: 'red', beat: 1, anim: 'fade', delay: 800 })
	},
}
