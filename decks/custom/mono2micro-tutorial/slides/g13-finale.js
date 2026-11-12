// The finale, for an autonomous-SE class: the grey tangle from the "it's complicated" slide grows back into the whole cut
// map; an agent can propose such a cut in minutes, but not judge it without an answer key, not avoid gaming the score,
// not know what will change (the talk's lessons, as open problems). Last line: judging is the open problem of AutoSE.
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
	name: 'The whole map',
	draw(k) {
		petmap(k, { x: 790, y: 330, s: 0.27, tag: 't', node: () => ({ until: 1 }), edge: () => ({ until: 1 }) })
		k.text(700, 760, 'remember “it’s complicated”?', { size: 'xl', color: 'grey', until: 1 })
		// 1: it opens up, coloured and cut
		petmap(k, { x: 60, y: -40, s: 1, names: true, tag: 'c', fill: (c) => DOMAIN_COLOR[domainOf(c)], node: () => ({ beat: 1, anim: 'zoom', origin: [960, 540] }), edge: () => ({ beat: 1, anim: 'fade' }) })
		const cut = { color: 'red', size: 'l', dash: 'dashed', beat: 1, anim: 'wipe', delay: 600 }
		k.pen([[90, 750], [130, 752], [170, 753], [210, 755], [250, 757], [290, 758], [330, 760], [360, 790], [360, 860], [405, 895], [405, 942], [405, 990]], cut)
		k.pen([[935,  230],  [935,  271],  [934,  312],  [934,  352],  [933,  393],  [933,  434],  [933,  475],  [932,  515],  [932,  556],  [932,  597],  [931,  638],  [931,  678],  [930,  719],  [930,  760],  [973,  777],  [1017,  793],  [1060,  810],  [1103,  811],  [1146,  813],  [1189,  814],  [1231,  816],  [1274,  817],  [1317,  819],  [1360,  820]], cut)
		// right column: the AutoSE ending. 1: what an agent can do now
		k.text(1400, 230, 'an agent can propose\nthis cut in minutes', { size: 'l', beat: 1, anim: 'fade', delay: 1200, until: 3 })
		// 2: what it still can't: the talk's three lessons, as open problems for autonomous SE
		k.text(1400, 400, 'what it still can’t do:', { size: 'm', color: 'grey', beat: 2, anim: 'fade', until: 3 })
		k.note(1400, 470, 'judge a cut with\nno answer key', { color: 'yellow', size: 'm', rot: -3, beat: 2, anim: 'drop', delay: 200, until: 3 })
		k.note(1650, 560, 'not game\nthe score', { color: 'yellow', size: 'm', rot: 3, beat: 2, anim: 'drop', delay: 450, until: 3 })
		k.note(1420, 720, 'know what\nwill change', { color: 'yellow', size: 'm', rot: -2, beat: 2, anim: 'drop', delay: 700, until: 3 })
		// 3: stays up for questions: the results link and the thanks
		k.image(1420, 200, 380, 380, 'qr-visualizer.svg', { beat: 3, anim: 'fade', alt: 'QR code for the ICSA web visualizer' })
		k.text(1420, 595, 'all the results', { size: 'l', beat: 3, anim: 'fade' })
		k.text(1420, 650, 'sambuaneesh.github.io/llms4arch', { size: 's', font: 'mono', color: 'grey', beat: 3, anim: 'fade' })
		k.text(1400, 760, 'thank you!', { size: 'xl', beat: 3, anim: 'fade', delay: 300 })
		k.text(1405, 870, 'Aneesh Sambu · SERC, IIIT Hyderabad', { size: 's', color: 'grey', beat: 3, anim: 'fade', delay: 300 })
	},
}
