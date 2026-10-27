// Workflow vs. single-shot (80k concat): the primary analysis, with the first benchmark's intervals underneath.
// Same layout and scale as slide 12 (workflow vs. OpenCode).
export default {
	name: 'vs. 80k: what became real',
	kicker: 'III · what we found · workflow vs. 80k concat (single-shot)',
	title: 'vs. 80k: three gains become real',
	source: 'Table XII · Fig. 3 · workflow − 80k concat · 32 cells · 95% bootstrap intervals · Holm-corrected p',
	draw(k) {
		const ROWS = [
			['domain independence (DI)', 9.01, 4.04, 14.55, '0.011', [0.23, 18.78]],
			['business-capability purity (BCP)', 4.37, 2.31, 6.46, '0.004', [-1.57, 7.42]],
			['modularity (CMod)', 4.54, 2.05, 7.1, '0.014', [-3.26, 7.34]],
			['transaction purity (DTP)', -2.98, -5.9, -0.14, null, [-14.7, -0.91]],
			['close match to reference (C2C-50)', 2.92, -1.66, 7.69, null, [-1.17, 16.38]],
		]
		const x = (v) => 1040 + v * 27, Y = 330, P = 122
		k.pen([[x(0), 275], [x(0), 905]], { color: 'grey', size: 's' })
		k.text(x(0) - 70, 232, 'no difference', { size: 's', scale: 1.05, color: 'grey' })
		ROWS.forEach(([name, d, lo, hi, p, old], i) => {
			const y = Y + i * P
			const sig = p !== null
			const sgn = (d > 0 ? '+' : '−') + Math.abs(d).toFixed(1)
			k.text(150, y - 44, name, { size: 'm', scale: 1.1 })
			k.pen([[x(old[0]), y + 24], [x(old[1]), y + 24]], { color: 'light-red', size: 's' })
			k.pen([[x(lo), y], [x(hi), y]], { color: sig ? 'black' : 'grey', size: 'l' })
			k.circle(x(d), y, 13, { color: sig ? 'red' : 'grey', fill: 'solid', size: 's' })
			k.text(1610, y - 26, sig ? sgn + '   p ' + p : sgn + '   n.s.', { size: 'm', scale: 1.05, color: sig ? 'red' : 'grey' })
		})
		k.text(150, 960, 'thin red: the first benchmark (16 cells, one run) · thick: now · CiD, C2C-10, C2C-33: no significant difference', { size: 's', scale: 1.1, color: 'grey' })
	},
}
