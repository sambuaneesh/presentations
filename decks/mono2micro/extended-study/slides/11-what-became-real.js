// The same four differences as slide 4, now on 32 cells of five runs: narrower, and three significant.
export default {
	name: 'What became real',
	kicker: 'III · what we found',
	title: 'Three gains become real',
	source: 'Table XII · Fig. 3 · workflow − single-shot · 32 cells · 95% bootstrap intervals · Holm-corrected p',
	draw(k) {
		const ROWS = [['domain independence (DI)', 9.01, 4.04, 14.55, '0.011'], ['business-capability purity (BCP)', 4.37, 2.31, 6.46, '0.004'], ['modularity (CMod)', 4.54, 2.05, 7.1, '0.014'], ['close match to reference (C2C-50)', 2.92, -1.66, 7.69, null]]
		const OLD = [[0.23, 18.78], [-1.57, 7.42], [-3.26, 7.34], [-1.17, 16.38]]
		const x = (v) => 980 + v * 38, Y = 330, P = 140
		k.pen([[x(0), 280], [x(0), 870]], { color: 'grey', size: 's' })
		ROWS.forEach(([name, d, lo, hi, p], i) => {
			const y = Y + i * P
			const sig = p !== null
			k.text(150, y - 22, name, { size: 'm', scale: 1.15 })
			k.pen([[x(OLD[i][0]), y + 26], [x(OLD[i][1]), y + 26]], { color: 'light-red', size: 's', dash: 'dotted' })
			k.pen([[x(lo), y], [x(hi), y]], { color: sig ? 'black' : 'grey', size: 'l', beat: 1, anim: 'wipe' })
			k.circle(x(d), y, 13, { color: sig ? 'red' : 'grey', fill: 'solid', size: 's', beat: 1 })
			k.text(x(16) + 70, y - 24, sig ? '+' + d.toFixed(1) + '   p ' + p : '+' + d.toFixed(1) + '   n.s.', { size: 'm', scale: 1.1, color: sig ? 'red' : 'grey', beat: 1, anim: 'fade' })
		})
		k.text(150, 930, 'thin red: the first benchmark\'s intervals · thick: now', { size: 's', scale: 1.15, color: 'grey' })
	},
}
