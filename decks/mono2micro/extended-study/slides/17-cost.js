// Tokens per system: the workflow is cheaper in every cell and the most predictable.
export default {
	name: 'Cheaper everywhere',
	kicker: 'III · what we found',
	title: 'Cheaper than single-shot, in all 32 cells',
	source: 'Fig. 5 · tokens per system, range over the eight models · means: workflow 52.8k, single-shot 84.0k, OpenCode 168.3k',
	draw(k) {
		const R = [['workflow', 51, 59, 'red'], ['single-shot', 62, 103, 'black'], ['OpenCode', 40, 426, 'grey']]
		const x = (v) => 560 + v * 2.7, Y = 400, P = 160
		R.forEach(([name, lo, hi, c], i) => {
			const y = Y + i * P
			const o = i ? {} : {}
			k.text(150, y - 20, name, { size: 'l', scale: 1.05, color: c === 'grey' ? 'black' : c, ...o })
			k.pen([[x(lo), y], [x(hi), y]], { color: c, size: 'xl', ...o })
			k.text(x(hi) + 24, y - 30, lo + 'k–' + hi + 'k', { size: 'm', scale: 1.1, color: c, ...o })
		})
		k.text(150, 270, '37.2% fewer tokens than single-shot · cheaper than OpenCode in 27 of 32 cells', { size: 'xl', scale: 0.9, color: 'red' })
		k.text(150, 900, 'a fixed sequence of five calls costs about the same with every model', { size: 'm', scale: 1.1, color: 'grey' })
	},
}
