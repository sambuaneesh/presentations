// Five runs of the same cell: how many different partitions come back.
export default {
	name: 'Still not stable',
	kicker: 'III · what we found',
	title: 'Still not stable',
	source: 'Table XVI · 8 models × 4 systems · mean distinct partitions among five runs',
	draw(k) {
		const R = [['single-shot', 2.5], ['OpenCode', 2.38], ['workflow', 2.91]]
		const X = 620, Y = 380, P = 170, U = 250
		R.forEach(([name, v], i) => {
			const y = Y + i * P
			const me = i === 2
			k.text(150, y + 8, name, { size: 'l', scale: 1.05, color: me ? 'red' : 'black' })
			k.box(X, y, v * U, 70, { fill: 'pattern', color: me ? 'red' : 'grey', size: 'm'})
			k.text(X + v * U + 30, y, v.toFixed(2), { size: 'l', scale: 1.05, color: me ? 'red' : 'black' })
		})
		k.pen([[X + U, Y - 40], [X + U, Y + 2 * P + 110]], { color: 'grey', size: 's', dash: 'dashed' })
		k.text(X + U - 60, Y + 2 * P + 120, '1 = always the same', { size: 's', scale: 1.1, color: 'grey' })
		k.text(150, 270, 'distinct partitions among five runs of the same cell', { size: 'm', scale: 1.1, color: 'grey' })
		k.text(150, 930, 'five LLM calls feed each other, and selection can flip between close candidates', { size: 'm', scale: 1.05, color: 'red' })
	},
}
