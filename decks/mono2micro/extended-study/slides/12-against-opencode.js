// Workflow vs. OpenCode: the primary analysis, in the same layout and scale as slide 11.
export default {
	name: 'vs. OpenCode: domain gains, at a price',
	kicker: 'III · what we found · workflow vs. OpenCode (autonomous agent)',
	title: 'vs. OpenCode: domain gains, at a price',
	source: 'Table XII · Fig. 3 · workflow − OpenCode · 32 cells · 95% bootstrap intervals · Holm-corrected p',
	draw(k) {
		const ROWS = [
			['domain independence (DI)', 8.22, 2.68, 13.86, '0.023'],
			['business-capability purity (BCP)', 4.64, 2.29, 7.05, '0.005'],
			['modularity (CMod)', 3.4, 0.5, 6.3, null],
			['transaction purity (DTP)', -5.09, -8.24, -2.28, '0.005'],
			['close match to reference (C2C-50)', 6.1, 1.04, 11.25, null],
		]
		const x = (v) => 1060 + v * 30, Y = 330, P = 122
		k.pen([[x(0), 275], [x(0), 905]], { color: 'grey', size: 's' })
		k.text(x(0) - 70, 232, 'no difference', { size: 's', scale: 1.05, color: 'grey' })
		ROWS.forEach(([name, d, lo, hi, p], i) => {
			const y = Y + i * P
			const sig = p !== null
			const sgn = (d > 0 ? '+' : '−') + Math.abs(d).toFixed(1)
			k.text(150, y - 44, name, { size: 'm', scale: 1.1 })
			k.pen([[x(lo), y], [x(hi), y]], { color: sig ? 'black' : 'grey', size: 'l' })
			k.circle(x(d), y, 13, { color: sig ? 'red' : 'grey', fill: 'solid', size: 's' })
			k.text(1610, y - 26, sig ? sgn + '   p ' + p : sgn + '   n.s.', { size: 'm', scale: 1.05, color: sig ? 'red' : 'grey' })
		})
		k.text(150, 960, 'DTP lower = worse: the workflow splits classes that share database transactions more often · CiD, C2C-10, C2C-33: no significant difference', { size: 's', scale: 1.1, color: 'grey' })
	},
}
