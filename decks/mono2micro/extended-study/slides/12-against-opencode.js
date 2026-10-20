// Against the autonomous agent: the same domain gains, and the price in transaction purity.
export default {
	name: 'Better fit, at a price',
	kicker: 'III · what we found',
	title: 'Better domain fit, at a price',
	source: 'Table XII · workflow − OpenCode · 32 cells · Holm-corrected p',
	draw(k) {
		const B = [['DI', 8.22, '0.023'], ['BCP', 4.64, '0.005'], ['DTP', -5.09, '0.005']]
		const BASE = 620, U = 26
		k.pen([[300, BASE], [1620, BASE + 2]], { color: 'grey', size: 's', wob: 1 })
		B.forEach(([m, d, p], i) => {
			const x = 420 + i * 430
			const up = d > 0
			const h = Math.abs(d) * U
			const o = {}
			k.box(x, up ? BASE - h : BASE, 170, h, { fill: 'pattern', color: up ? 'green' : 'red', size: 'm', ...o })
			k.text(x, up ? BASE - h - 90 : BASE + h + 20, (up ? '+' : '') + d.toFixed(1), { size: 'xl', scale: 1.0, color: up ? 'green' : 'red', ...o })
			k.text(x, BASE + (up ? 30 : -80), m, { size: 'l', scale: 1.1, ...o })
			k.text(x + 190, up ? BASE - h + 10 : BASE + h - 50, 'p ' + p, { size: 's', scale: 1.1, color: 'grey', ...o })
		})
		k.text(1380, 330, 'DTP: database\ntransaction purity', { size: 's', scale: 1.15, color: 'grey' })
		k.text(300, 940, 'the workflow splits classes that share database transactions more often', { size: 'm', scale: 1.1, color: 'red' })
	},
}
