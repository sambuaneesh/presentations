// The tools' shopping list: everything the traditional tools need before they can "just cluster" (Wang, Bornais &
// Rubin, ASE 2024: Table 1 "additional input", §2.2 tool descriptions, §2.3 case-study requirements, §4 on MEM).
// A tiny "cluster the graph" box; one click buries it under the requirements, one per sticky note.
const NEED = [
	['a running build\nof the app', 130, 245, -4],
	['business use cases,\nwritten down', 420, 235, 3],
	['execution traces\nof every use case', 720, 250, -2],
	['functional tests,\n≥ 60 % coverage', 1020, 235, 4],
	['at least 3\nuse-case tests', 1320, 250, -3],
	['the database\nschema', 1610, 240, 2],
	['≥ 3 database\ntables', 130, 500, -3],
	['which method touches\nwhich table', 420, 520, 3],
	['git history:\n≥ 100 commits', 1320, 510, -2],
	['≥ 3 contributors', 1610, 495, 4],
	['the number of\nservices, from you', 560, 740, -4],
	['config knobs:\n12 → 30, 10 → 25', 1180, 735, 2],
]
export default {
	name: 'The shopping list',
	kicker: 'II · it’s just clustering… right?',
	title: 'What “just clustering” actually needs',
	source: 'Wang, Bornais & Rubin, ASE 2024 · Table 1 (additional input), §2.2, §2.3, §4',
	draw(k) {
		// the promise: a tiny, easy box
		k.box(760, 470, 400, 150, { size: 'm', text: 'cluster the graph', id: 'easy' })
		k.text(895, 640, 'easy', { size: 'l', color: 'green' })
		k.cross(940, 660, 70, { color: 'red', size: 'm', beat: 1, anim: 'wipe', delay: 2600 })
		// 1: the pile
		NEED.forEach(([t, x, y, r], i) => k.note(x, y, t, { color: 'yellow', size: 'm', scale: 0.85, rot: r, beat: 1, anim: 'drop', delay: i * 200 }))
	},
}
