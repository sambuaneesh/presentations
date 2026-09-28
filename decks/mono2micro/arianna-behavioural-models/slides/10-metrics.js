const ROWS = [ // [metric, without, with] — results.md
	['CMod', 55.4, 44.3], ['CiD', 100, 100], ['DTP', 100, 100], ['DI', 32.0, 32.0], ['BCP', 33.3, 33.3], ['C2C-33', 100, 80], ['C2C-50', 50, 20],
]
export default {
	name: 'PetClinic metrics',
	kicker: 'II · the numbers',
	title: 'PetClinic: nothing better, two scores worse',
	source: 'results.md · PartsUnlimited identical on every metric',
	notes: 'COVER\n• grey = without, red = with her four models (one call each)\n• unchanged: CiD 100, DTP 100, DI 32.0, BCP 33.3, C2C-10 100\n• worse: CMod 55.4 → 44.3 (−11.1), C2C-33 100 → 80, C2C-50 50 → 20 (the extra Bootstrap service matches no reference service closely)\n• PartsUnlimited: identical partition, so every metric identical (CMod 71.3, CiD 66.7, DTP 64.0, DI 12.7, BCP 29.3, C2C-50 83.3)\nCLICKS\n1 · the bars\nREF · results.md',
	draw(k) {
		const W = 6 // px per point
		ROWS.forEach(([m, a, b], i) => {
			const y = 270 + i * 100
			k.text(160, y + 8, m, { size: 'm' })
			k.box(460, y, a * W, 34, { color: 'grey', fill: 'semi', size: 's', beat: 1 })
			k.text(470 + a * W, y - 4, String(a), { size: 's', beat: 1 })
			k.box(460, y + 42, b * W, 34, { color: a === b ? 'grey' : 'red', fill: 'semi', size: 's', beat: 1 })
			k.text(470 + b * W, y + 38, String(b), { size: 's', color: a === b ? 'grey' : 'red', beat: 1 })
		})
	},
}
