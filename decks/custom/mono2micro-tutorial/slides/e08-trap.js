// The hall of shame: everything in one service is "perfect". Scores computed with ext/metrics.js on the benchmark
// data (all 23 classes in one service: CMod, CiD, DTP, DI 100; BCP 0; C2C-50 0). Meme: imgflip "Trade Offer".
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
	name: 'Hall of shame',
	kicker: 'IV · game · the hall of shame',
	title: 'Thought you could get away with this??',
	source: 'the study’s metric code on the benchmark’s PetClinic data · Strathern, 1997',
	draw(k) {
		// the map, every class in one service (one colour, one loop: no cut anywhere)
		petmap(k, { x: 80, y: 170, s: 0.7, fill: () => 'blue', edges: 'blue' })
		k.loop(535, 600, 470, 300, { color: 'blue', size: 'l' })
		k.text(150, 250, 'one service: “PetClinic”', { size: 'l', color: 'blue' })
		const sc = [['CMod', '100', 'black'], ['CiD', '100', 'black'], ['DTP', '100', 'black'], ['DI', '100', 'black'], ['BCP', '0', 'grey'], ['C2C-50', '0', 'grey']]
		sc.forEach(([m, v, c], i) => { k.text(1060, 260 + i * 100, m, { size: 'l', beat: 1, anim: 'fade', delay: i * 120 }); k.text(1240, 250 + i * 100, v, { size: 'xl', color: c, beat: 1, anim: 'pop', delay: i * 120 }) })
		k.image(1420, 250, 400, 523, 'meme-trade.jpg', { beat: 2, anim: 'pop', rot: 2, alt: 'Trade offer meme: I receive CMod 100, you receive your monolith back' })
		k.text(110, 900, 'perfect scores, zero cuts: the monolith we started with', { size: 'l', beat: 2, anim: 'wipe', delay: 300 })
		k.text(110, 965, '“When a measure becomes a target, it ceases to be a good measure.” (Goodhart, in Strathern’s words)', { size: 'm', color: 'grey', beat: 2, anim: 'fade', delay: 800 })
	},
}
