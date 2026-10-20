// The first benchmark's biggest similarity gain shrinks as data grows.
export default {
	name: 'The headline that faded',
	kicker: 'III · what we found',
	title: 'The old headline faded',
	source: 'Table XIII · C2C-50, workflow − single-shot · none significant',
	draw(k) {
		const B = [['first benchmark', '4 models, 1 run', 7.8], ['same 4 models', '5 runs', 5.5], ['primary', '8 models, 5 runs', 2.9], ['all models', '17 models, 1 run', 0.6]]
		const BASE = 820, U = 52
		k.pen([[200, BASE], [1700, BASE + 2]], { color: 'grey', size: 's', wob: 1 })
		B.forEach(([a, b, d], i) => {
			const x = 260 + i * 380
			const o = i ? {} : {}
			k.box(x, BASE - d * U, 200, d * U, { fill: 'pattern', color: i ? 'grey' : 'red', size: 'm', ...o })
			k.text(x + 30, BASE - d * U - 90, '+' + d.toFixed(1), { size: 'xl', scale: 1.0, color: i ? 'black' : 'red', ...o })
			k.text(x - 10, BASE + 24, a, { size: 'm', scale: 1.1, ...o })
			k.text(x - 10, BASE + 74, b, { size: 's', scale: 1.1, color: 'grey', ...o })
		})
		k.text(200, 280, 'close match to the developers\' decomposition (C2C-50)', { size: 'm', scale: 1.1, color: 'grey' })
	},
}
