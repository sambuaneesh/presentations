// The first benchmark's paired differences with 95% intervals (re-analysed with the extension's script): wide, and
// nothing survives the correction for testing eight metrics.
export default {
	name: 'A tie, or too few runs?',
	kicker: 'I · where we were',
	title: 'A tie, or too few runs?',
	source: 'extension analysis §1: the first benchmark re-analysed · workflow − single-shot · 16 cells · 95% bootstrap intervals',
	draw(k) {
		const ROWS = [['domain independence (DI)', 8.71, 0.23, 18.78], ['business-capability purity (BCP)', 2.78, -1.57, 7.42], ['modularity (CMod)', 1.84, -3.26, 7.34], ['close match to reference (C2C-50)', 7.79, -1.17, 16.38]]
		const x = (v) => 980 + v * 38, Y = 330, P = 140
		k.pen([[x(0), 280], [x(0), 870]], { color: 'grey', size: 's' })
		k.text(x(0) - 70, 880, 'no difference', { size: 's', scale: 1.1, color: 'grey' })
		ROWS.forEach(([name, d, lo, hi], i) => {
			const y = Y + i * P
			k.text(150, y - 22, name, { size: 'm', scale: 1.15 })
			k.pen([[x(lo), y], [x(hi), y]], { color: 'grey', size: 'm' })
			k.pen([[x(lo), y - 14], [x(lo), y + 14]], { color: 'grey', size: 's' })
			k.pen([[x(hi), y - 14], [x(hi), y + 14]], { color: 'grey', size: 's' })
			k.circle(x(d), y, 13, { color: 'red', fill: 'solid', size: 's' })
			k.text(x(hi) + 24, y - 24, (d > 0 ? '+' : '') + d.toFixed(1), { size: 'm', scale: 1.1, color: 'red' })
		})
		k.text(150, 930, 'with mostly one run per cell the intervals are wide, and none survives the correction for 8 metrics', { size: 'm', scale: 1.05, color: 'red' })
	},
}
