// What the extension does not settle.
export default {
	name: 'Still open',
	kicker: 'VI · what it means',
	title: 'What it does not settle',
	source: '§VII threats to validity',
	draw(k) {
		const N = [
			['the DI gain\ndepends on the model', 'light-red'],
			['same four systems\nfor development\nand testing', 'yellow'],
			['plan declared,\nnot pre-registered', 'yellow'],
			['one model provider', 'yellow'],
		]
		N.forEach(([t, c], i) => k.box(150 + i * 420, 360, 380, 260, { text: t, color: c === 'light-red' ? 'red' : 'grey', fill: 'semi', size: 'm' }))
		k.text(150, 860, 'next: larger, less-known systems, and a human evaluation', { size: 'l', scale: 1.05, color: 'red' })
	},
}
