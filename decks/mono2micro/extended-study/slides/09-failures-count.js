// Unreadable answers: 31 runs whose output could not be parsed count as failures.
export default {
	name: 'Failures count',
	kicker: 'II · what we did',
	title: 'Unreadable answers count as failures',
	source: '§IV-J · Table X · e.g. Kimi K3, workflow, JPetStore, seed 5',
	draw(k) {
		k.box(170, 330, 700, 300, { dash: 'dotted', size: 'm', id: 'json' })
		k.text(210, 360, '{ "name": "AccountManagement", … },\n{\n  "CatalogManagement",\n', { size: 'm', font: 'mono', scale: 1.0 })
		k.cross(760, 560, 60, { color: 'red' })
		k.text(210, 660, 'the answer broke off: not valid JSON', { size: 'm', scale: 1.1, color: 'grey' })
		k.box(1180, 380, 520, 200, { text: 'a failed run', size: 'l', id: 'fail' })
		k.arrow('json', 'fail', { color: 'red' })
		k.text(170, 820, '31 such runs · never retried · kept with their raw output', { size: 'l', scale: 1.05, color: 'red' })
	},
}
