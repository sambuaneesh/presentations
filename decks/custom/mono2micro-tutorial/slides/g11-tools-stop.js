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

// Learning 2, told with the map: (1) the cut line: cut where change is independent (Parnas); (2) the map's groups
// with their own data: boundaries follow teams and data (Conway), then split the data and migrate piece by piece
// (Newman; Shopify, Spring Modulith for the modular monolith); (3) CMod 100: a metric is a smoke detector (Strathern).
export default {
	name: 'Where tools stop',
	kicker: 'VI · what to take home · 2',
	title: 'Where tools stop, engineering starts',
	source: 'Parnas 1972 · Conway 1968 · Newman 2019 · Strathern 1997',
	draw(k) {
		const X = (i) => 110 + i * 590
		// 1 · change
		petmap(k, { x: X(0) - 40, y: 215, s: 0.3, tag: 'a' })
		cutPen(k, X(0) - 40, 215, 0.3, {})
		k.text(X(0), 640, 'cut where change\nis independent', { size: 'l' })
		k.text(X(0), 770, 'tools see calls; only you\nsee what will change', { size: 'm', color: 'grey' })
		// 2 · teams and data
		petmap(k, { x: X(1) - 40, y: 215, s: 0.3, tag: 'b', fill: (c) => DOMAIN_COLOR[domainOf(c)], node: () => ({ beat: 1, anim: 'fade' }), edge: () => ({ beat: 1, anim: 'fade' }) })
		;[['blue', 0], ['violet', 1], ['orange', 2]].forEach(([c, j]) => k.box(X(1) + 20 + j * 120, 545, 90, 50, { geo: 'oval', fill: 'solid', color: c, size: 's', text: 'db', font: 'mono', beat: 1, anim: 'pop', delay: 300 + j * 150 }))
		k.text(X(1), 640, 'boundaries follow\nteams and data', { size: 'l', beat: 1, anim: 'fade' })
		k.text(X(1), 770, 'then: split the data, migrate piece\nby piece, or stay a modular monolith', { size: 'm', color: 'grey', beat: 1, anim: 'fade', delay: 300 })
		// 3 · the smoke detector
		k.circle(X(2) + 150, 360, 110, { size: 'l', beat: 2, anim: 'pop' })
		k.circle(X(2) + 150, 360, 22, { fill: 'fill', color: 'red', size: 's', beat: 2, anim: 'pop', delay: 200 })
		k.text(X(2) + 300, 300, 'CMod\n100', { size: 'xl', color: 'red', beat: 2, anim: 'fade', delay: 300 })
		k.text(X(2), 640, 'a metric is a smoke\ndetector, not a target', { size: 'l', beat: 2, anim: 'fade' })
		k.text(X(2), 770, 'remember the\nhall of shame?', { size: 'm', color: 'grey', beat: 2, anim: 'fade' })
		k.text(110, 900, 'and sometimes the right cut is: don’t split.', { size: 'xl', beat: 2, anim: 'wipe', delay: 800 })
	},
}
