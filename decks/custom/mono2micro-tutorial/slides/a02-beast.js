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

// The hook, in the talk's breakup vibe: "how it started / how it's going". Year one: three tidy classes. Now: the
// PetClinic map as a grey tangle (planted here, paid off in the finale). Then the relationship status: it's
// complicated, the heart cut by the talk's red dashed line. Leads into "breaking up took them years".

export default {
	name: 'It’s complicated',
	kicker: '0 · it’s complicated',
	draw(k) {
		// how it started
		k.text(130, 240, 'how it started', { size: 'xl', scale: 1.1 })
		k.circle(300, 500, 34, { fill: 'fill', color: 'blue', size: 's', id: 's1' })
		k.circle(520, 420, 34, { fill: 'fill', color: 'blue', size: 's', id: 's2' })
		k.circle(560, 640, 34, { fill: 'fill', color: 'blue', size: 's', id: 's3' })
		k.arrow('s1', 's2', { size: 'm', color: 'blue', head: 'none' }); k.arrow('s2', 's3', { size: 'm', color: 'blue', head: 'none' })
		k.text(130, 800, 'one small app, one team.\nsimple.', { size: 'l', color: 'grey' })
		k.pen([[800, 260], [800, 960]], { size: 's', color: 'grey', dash: 'dotted' })
		// how it's going
		k.text(880, 240, 'how it’s going', { size: 'xl', scale: 1.1, beat: 1, anim: 'fade' })
		petmap(k, { x: 830, y: 190, s: 0.52, tag: 't', node: (c) => ({ beat: 1, anim: 'pop', delay: Object.keys(MAP).indexOf(c) * 30 }), edge: (a, b, i) => ({ beat: 1, anim: 'wipe', delay: 300 + i * 30 }) })
		const P = [['one more feature', 880, 760], ['a new team', 1160, 760], ['10× the users', 880, 820], ['deadline: Friday', 1160, 820]]
		P.forEach(([t, x, y], i) => k.text(x, y, '+ ' + t, { size: 'm', color: 'grey', beat: 1, anim: 'fade', delay: 900 + i * 200 }))
		// the status
		k.box(1440, 280, 440, 270, { fill: 'solid', color: 'white', size: 's', dash: 'solid', beat: 2, anim: 'pop', rot: 2 })
		k.text(1470, 300, 'Relationship status', { size: 'm', font: 'sans', color: 'grey', beat: 2, anim: 'fade', rot: 2 })
		k.text(1470, 350, 'It’s complicated', { size: 'xl', font: 'sans', beat: 2, anim: 'fade', rot: 2 })
		k.box(1480, 450, 80, 70, { geo: 'heart', fill: 'solid', color: 'red', size: 's', beat: 2, anim: 'pop', delay: 300 })
		k.pen([[1460, 430], [1490, 460], [1520, 485], [1550, 510], [1580, 540]], { color: 'red', size: 'm', dash: 'dashed', beat: 2, anim: 'wipe', delay: 700 })
	},
}
