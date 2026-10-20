// What the extension changed in our story.
export default {
	name: 'What it bought us',
	kicker: 'VI · what it means',
	title: 'From a tie to an answer',
	source: '§V · §VI-B · intervals with five runs: 57–88% of their one-run width',
	draw(k) {
		k.box(150, 330, 640, 380, { text: 'first benchmark\n\nvalid · cheaper\nquality: a tie?', size: 'l', dash: 'dotted', color: 'grey', id: 'a' })
		k.box(1130, 330, 640, 380, { text: 'extended study\n\nvalid · cheaper\nbetter domain fit\nno similarity gain', size: 'l', id: 'b' })
		k.arrow('a', 'b', { text: '+497 runs', color: 'red' })
		k.text(150, 800, 'more models helped more than more runs:', { size: 'm', scale: 1.15 })
		k.text(150, 860, 'the differences between models are larger than between runs', { size: 'm', scale: 1.15, color: 'red' })
	},
}
