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

// the developers' cut on the map (same lines as slide "cutting this graph"), at full size; cutPen scales them
const CUT_LINES = [[[30, 790], [270, 800], [300, 830], [300, 900], [345, 935], [345, 1030]], [[875, 280], [870, 800], [1000, 850], [1300, 860]]]
function cutPen(k, x, y, s, o) {
	for (const line of CUT_LINES) {
		const pts = []
		for (let i = 1; i < line.length; i++) {
			const [x0, y0] = line[i - 1], [x1, y1] = line[i], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 40))
			for (let j = i === 1 ? 0 : 1; j <= n; j++) pts.push([x + (x0 + (x1 - x0) * j / n) * s, y + (y0 + (y1 - y0) * j / n) * s])
		}
		k.pen(pts, { color: 'red', size: s < 0.6 ? 'm' : 'l', dash: 'dashed', ...o })
	}
}

// What does any software engineer say makes a good split? High cohesion, low coupling, shown on the map with the
// developers' cut: edges inside a group (green) vs edges that cross the cut (red). Then the game.
const REGION = (c) => (['visits', 'vets'].includes(domainOf(c)) ? domainOf(c) : ['CacheConfiguration', 'CrashController', 'WelcomeController'].includes(c) ? 'infra' : 'customers')
export default {
	name: 'Ask an engineer',
	kicker: 'IV · is it any good?',
	title: 'Ask any software engineer',
	source: 'Stevens, Myers & Constantine, “Structured Design”, 1974',
	draw(k) {
		petmap(k, { x: 20, y: 160, s: 0.75, fill: (c) => DOMAIN_COLOR[domainOf(c)] })
		cutPen(k, 20, 160, 0.75, {})
		k.box(1060, 230, 660, 240, { geo: 'cloud', size: 'xl', text: 'high cohesion,\nlow coupling!', font: 'draw' })
		MAP_EDGES.forEach(([a, b], i) => {
			const inside = REGION(a) === REGION(b)
			k.arrow('m' + a, 'm' + b, { size: 'l', color: inside ? 'green' : 'red', head: 'none', beat: inside ? 1 : 2, anim: 'wipe', delay: i * 40 })
		})
		k.text(1060, 560, 'inside a group: cohesion', { size: 'l', color: 'green', beat: 1, anim: 'fade' })
		k.text(1060, 650, 'across the cut: coupling', { size: 'l', color: 'red', beat: 2, anim: 'fade' })
		k.text(1060, 900, 'so: you be the architect.', { size: 'xl', beat: 2, anim: 'wipe', delay: 900 })
	},
}
