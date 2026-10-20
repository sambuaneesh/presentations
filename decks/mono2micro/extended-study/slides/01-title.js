// Title: the name, and a doodle of the benchmark growing: 16 cells of one run become many cells of five.
export default {
	name: 'Title',
	draw(k) {
		k.text(160, 300, 'The Extended Study', { size: 'xl', scale: 2.4 })
		k.underline(170, 480, 820, { color: 'red' })
		k.text(166, 540, 'more seeds, more models:\nwhat changed since the first benchmark', { size: 'l', scale: 1.1, color: 'grey' })
		k.text(166, 830, 'presented by', { size: 'm', scale: 1.1, color: 'grey' })
		k.text(166, 864, 'Aneesh S', { size: 'xl', scale: 1.1 })
		// doodle: a 4 x 4 grid of single squares, then each one stacks into five (click 1)
		const X = 1380, Y = 300, P = 105
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
			k.box(X + c * P, Y + r * P, 62, 62, { size: 's', fill: 'semi', color: 'grey' })
			for (let s = 1; s < 5; s++) k.box(X + c * P + s * 6, Y + r * P - s * 6, 62, 62, { size: 's', fill: 'none', color: 'red'})
		}
		k.text(X - 10, Y + 4 * P + 10, 'one run per cell  →  five', { size: 'm', scale: 1.1, color: 'red' })
	},
}
