// Workflow vs. OpenCode: the primary analysis, with the first benchmark's intervals underneath; same layout as the vs. 80k slide.
export default {
	name: 'vs. OpenCode: domain gains, at a price',
	kicker: 'III · what we found · workflow vs. OpenCode (autonomous agent)',
	title: 'vs. OpenCode: domain gains, at a price',
	source: 'Table XII · Fig. 3 · workflow − OpenCode · 32 cells · 95% bootstrap intervals · Holm-corrected p',
	draw(k) {
		const ROWS = [
			['domain independence (DI)', 8.22, 2.68, 13.86, '0.023', [-1.33, 15.7]],
			['business-capability purity (BCP)', 4.64, 2.29, 7.05, '0.005', [-1.41, 7.47]],
			['modularity (CMod)', 3.4, 0.5, 6.3, null, [-3.03, 8.59]],
			['transaction purity (DTP)', -5.09, -8.24, -2.28, '0.005', [-17.16, -1.17]],
			['close match to reference (C2C-50)', 6.1, 1.04, 11.25, null, [-2.22, 20.65]],
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
		k.text(150, 960, 'thin red: the first benchmark (14 cells; 2 OpenCode runs were invalid) · thick: now · DTP lower = worse · CiD, C2C-10, C2C-33: no significant difference', { size: 's', scale: 1.1, color: 'grey' })
	},
}
