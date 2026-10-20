// Each primary gain against single-shot, re-checked four ways.
export default {
	name: 'Checked four ways',
	kicker: 'IV · is it robust?',
	title: 'All four checks together',
	source: 'Table XIII · §V-A robustness · Holm-corrected p vs. single-shot',
	draw(k) {
		const COLS = ['DI', 'BCP', 'CMod']
		const ROWS = [
			['failed runs scored at the worst value', [true, true, true]],
			['every run, not cell means', [true, true, true]],
			['…and uncertainty grouped by model', [false, true, true]],
			['only the six held-out models', [true, true, true]],
		]
		const X = 1120, Y = 360, P = 130, CW = 180
		COLS.forEach((c, j) => k.text(X + j * CW + 20, Y - 90, c, { size: 'l', scale: 1.05 }))
		ROWS.forEach(([name, ok], r) => {
			const y = Y + r * P
			const o = {}
			k.text(150, y, name, { size: 'm', scale: 1.15, ...o })
			ok.forEach((v, j) => v ? k.tick(X + j * CW + 40, y + 20, 44, { color: 'green', ...o }) : k.cross(X + j * CW + 40, y + 20, 40, { color: 'red', ...o }))
		})
		k.text(150, 900, 'DI grows in most cells, but by amounts that differ a lot between models', { size: 'm', scale: 1.1, color: 'red' })
		k.text(1195, 596, 'p = 0.10', { size: 's', scale: 1.1, color: 'red' })
	},
}
