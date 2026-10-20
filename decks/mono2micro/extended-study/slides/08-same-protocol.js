// Nothing that could change a result was changed.
export default {
	name: 'Nothing else changed',
	kicker: 'II · what we did',
	title: 'Same experiment, more of it',
	source: 'extension README: pre-run checks (2026-10-15) · §IV-H',
	draw(k) {
		const T = [['same benchmark scope', 'identical fingerprints'], ['same prompts', 'byte-identical'], ['same agent', 'OpenCode 1.18.32'], ['same code', 'no pipeline change']]
		T.forEach(([a, b], i) => {
			const x = 170 + (i % 2) * 820, y = 330 + Math.floor(i / 2) * 270
			const o = {}
			k.tick(x + 40, y + 50, 60, { color: 'green', ...o })
			k.text(x + 130, y, a, { size: 'l', scale: 1.1, ...o })
			k.text(x + 132, y + 80, b, { size: 'm', scale: 1.1, color: 'grey', ...o })
		})
	},
}
