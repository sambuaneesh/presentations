// The first benchmark's biggest similarity gain shrinks as runs and models are added: single-run gains for GLM-5.2 and
// gpt-oss:120b vanish with five runs; only gemma4:31b keeps one.
// C2C-50, workflow − single-shot (Table XIII); per-model means from the extension analysis (8 models × 5 runs).
export default {
	name: 'The headline that faded',
	kicker: 'III · what we found',
	title: 'The old headline faded',
	draw(k) {
		const B = [['first benchmark', '4 models, 1 run', 7.8], ['+ more runs', 'same 4 models, 5 runs', 5.5], ['+ more models', '8 models, 5 runs', 2.9], ['+ every model', '17 models, 1 run', 0.6]]
		const BASE = 760, U = 46
		k.pen([[200, BASE], [1700, BASE + 2]], { color: 'grey', size: 's', wob: 1 })
		B.forEach(([a, b, d], i) => {
			const x = 260 + i * 380
			k.box(x, BASE - d * U, 200, d * U, { fill: 'pattern', color: i ? 'grey' : 'red', size: 'm' })
			k.text(x + 30, BASE - d * U - 90, '+' + d.toFixed(1), { size: 'xl', scale: 1.0, color: i ? 'black' : 'red' })
			k.text(x - 10, BASE + 20, a, { size: 'm', scale: 1.1, color: i ? 'black' : 'red' })
			k.text(x - 10, BASE + 66, b, { size: 's', scale: 1.1, color: 'grey' })
		})
		k.text(200, 250, 'how much more often the workflow\'s services closely match the developers\' (C2C-50), vs. single-shot', { size: 'm', scale: 1.0, color: 'grey' })
		k.text(200, 880, 'none of the four is significant: with one run, 3 of 4 models looked better; with five runs, only one still does', { size: 'm', scale: 1.1, color: 'red' })
		k.text(200, 935, 'one run: GLM-5.2 +11.3 · gpt-oss:120b +13.5 · gemma4:31b +12.2 → five runs: +0.4 · +2.0 · +19.8', { size: 'm', scale: 1.0, color: 'grey' })
	},
}
