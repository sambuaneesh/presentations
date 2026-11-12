// The 7th strategy, animated: hierarchical summarisation (ICSA §IV-A, after Dhulshette et al.). A real PetClinic file
// (owner/Owner.java, shortened) is parsed into code units; the LLM summarises each unit; the unit summaries are
// summarised into a file summary; the camera pulls back as the other owner-package files join a package summary; the
// packages roll up into one repository summary. Every box on the right is an LLM call: hierarchical runs averaged
// ~736k tokens, 3–4× the chunked strategies, with no better decompositions (ICSA §V-D).
const CODE = [
	'class Owner extends Person {',
	'  String address;',
	'  String city;',
	'  String telephone;',
	'  List<Pet> pets;',
	'  get/set address, city, phone',
	'  List<Pet> getPets()',
	'  void addPet(Pet pet)',
	'  Pet getPet(String name)',
	'  Owner addVisit(petId, visit)',
	'}',
]
// code units: [first line, last line, label, what the LLM writes]
const UNITS = [
	[1, 4, 'fields', 'contact data + pets'],
	[5, 5, 'accessors', 'get / set contact data'],
	[6, 6, 'getPets()', 'lists the pets'],
	[7, 7, 'addPet()', 'adds a pet'],
	[8, 8, 'getPet()', 'finds a pet by name'],
	[9, 9, 'addVisit()', 'records a pet’s visit'],
]
const LX = 120, LY = 285, LH = 33 // code text origin and line height
export default {
	name: 'The summary tree',
	kicker: 'III · enter the LLM · phase 1',
	title: 'The 7th way: a summary tree',
	source: 'ICSA 2026 §IV-A (Dhulshette et al.), §V-D · PetClinic Owner.java, shortened',
	draw(k) {
		const unitY = (j) => 270 + j * 72
		// 1: parse into code units (bands behind the code, cards to the right)
		UNITS.forEach(([a, b, , ], j) => k.box(LX - 10, LY + a * LH - 2, 470, (b - a + 1) * LH, { fill: 'solid', color: j % 2 ? 'light-blue' : 'light-violet', size: 's', dash: 'solid', beat: 1, anim: 'wipe', delay: j * 120 }))
		k.box(100, 270, 500, 400, { size: 'm', id: 'file' })
		CODE.forEach((t, i) => k.text(LX, LY + i * LH, t, { font: 'mono', size: 'm' }))
		k.text(100, 690, 'Owner.java', { size: 'm', color: 'grey' })
		UNITS.forEach(([a, b, lbl], j) => {
			k.box(650, unitY(j), 220, 56, { text: lbl, font: 'mono', size: 's', fill: 'solid', color: j % 2 ? 'light-blue' : 'light-violet', labelColor: 'black', id: 'u' + j, beat: 1, anim: 'pop', delay: 300 + j * 120 })
			k.arrow([605, LY + ((a + b) / 2) * LH + 14], [642, unitY(j) + 28], { size: 's', color: 'grey', beat: 1, delay: 250 + j * 120 })
		})
		k.text(650, 225, 'parse into code units', { size: 'm', color: 'grey', beat: 1, anim: 'fade' })
		k.box(60, 200, 860, 520, { opacity: 0, size: 's', focus: 1 })
		// 2: one LLM call per unit
		UNITS.forEach(([, , , sum], j) => {
			k.box(930, unitY(j), 250, 56, { text: sum, size: 's', fill: 'solid', color: 'yellow', labelColor: 'black', id: 's' + j, beat: 2, anim: 'drop', delay: j * 180 })
			k.arrow('u' + j, 's' + j, { size: 's', color: 'violet', beat: 2, delay: j * 180 })
		})
		k.text(930, 225, 'LLM: summarise each unit', { size: 'm', color: 'violet', beat: 2, anim: 'fade' })
		k.box(60, 200, 1150, 520, { opacity: 0, size: 's', focus: 2 })
		// 3: the unit summaries become one file summary
		k.note(1290, 395, 'Owner.java:\nan owner and\ntheir pets', { color: 'yellow', size: 'm', scale: 0.85, rot: -2, id: 'fs', beat: 3, anim: 'zoom', delay: 900 })
		UNITS.forEach((u, j) => k.arrow([1185, unitY(j) + 28], [1282, 440 + j * 16], { size: 's', color: 'violet', beat: 3, delay: j * 100 }))
		k.text(1260, 330, 'summarise the summaries', { size: 'm', color: 'violet', beat: 3, anim: 'fade' })
		k.box(60, 200, 1440, 560, { opacity: 0, size: 's', focus: 3 })
		// 4: pull back: the other files of the package, then the package summary
		const FILES = ['Pet.java', 'Visit.java', 'OwnerController.java', '+ 6 more files']
		FILES.forEach((f, i) => {
			k.box(1240, 600 + i * 78, 270, 60, { text: f, font: 'mono', size: 's', fill: 'solid', color: i === 3 ? 'white' : 'yellow', labelColor: 'black', id: 'f' + i, beat: 4, anim: 'pop', delay: i * 150 })
		})
		k.note(1560, 470, 'owner\npackage', { color: 'light-violet', size: 'm', scale: 0.8, rot: 2, id: 'pk', beat: 4, anim: 'zoom', delay: 800 })
		k.arrow('fs', 'pk', { size: 's', color: 'violet', beat: 4, delay: 600 })
		FILES.forEach((f, i) => k.arrow([1515, 630 + i * 78], [1555, 560 + i * 20], { size: 's', color: 'violet', beat: 4, delay: 650 + i * 60 }))
		k.box(560, 200, 1260, 760, { opacity: 0, size: 's', focus: 4 })
		// 5: all packages → one repository summary; the bill
		const PK = [['model', 250], ['vet', 700], ['system', 860]]
		PK.forEach(([p, y], i) => k.box(1560, y, 170, 70, { text: p, font: 'mono', size: 's', fill: 'solid', color: 'light-violet', labelColor: 'black', id: 'p' + i, beat: 5, anim: 'pop', delay: i * 150 }))
		k.note(1760, 520, 'one repo\nsummary', { color: 'violet', size: 'm', scale: 0.7, rot: -3, id: 'repo', beat: 5, anim: 'zoom', delay: 700 })
		k.arrow('pk', 'repo', { size: 'm', color: 'violet', beat: 5, delay: 600 })
		PK.forEach((p, i) => k.arrow('p' + i, 'repo', { size: 'm', color: 'violet', beat: 5, delay: 600 + i * 80 }))
		k.box(0, 0, 1920, 1080, { opacity: 0, size: 's', focus: 5 })
		k.text(110, 790, 'every coloured box is an LLM call', { size: 'm', beat: 5, anim: 'fade', delay: 1000 })
		k.text(110, 860, '~736k tokens per run: 3–4× the chunked ways', { size: 'xl', color: 'red', beat: 5, anim: 'wipe', delay: 1300 })
		k.text(110, 950, 'and the cuts were no better', { size: 'm', color: 'grey', beat: 5, anim: 'fade', delay: 1800 })
	},
}
