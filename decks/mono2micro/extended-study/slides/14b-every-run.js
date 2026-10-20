// Robustness 2: every individual run in one regression, uncertainty grouped by cell and by model.
export default {
	name: 'Every run, every model',
	kicker: 'IV · is it robust?',
	title: 'Every run, and every model',
	source: '§V-A robustness · Table XIII · extension analysis §9 · 467 runs · one baseline per cell · Holm-corrected p vs. single-shot',
	draw(k) {
		k.text(150, 270, 'why: averaging five runs could hide spread; and would a new model show the same gain?', { size: 'm', scale: 1.05, color: 'grey' })
		const H = [['', 'grouped by cell', 'grouped by model'], ['DI', '0.009', '0.10'], ['BCP', '< 0.001', '0.006'], ['CMod', '0.004', '0.008']]
		H.forEach((row, r) => row.forEach((c, j) => {
			const x = 260 + j * 460, y = 380 + r * 110
			const bad = r === 1 && j === 2
			k.text(x, y, c, { size: r === 0 ? 'm' : 'l', scale: r === 0 ? 1.15 : 1.0, color: r === 0 ? 'grey' : bad ? 'red' : 'black' })
			if (r > 0 && j > 0) bad ? k.cross(x + 230, y + 30, 36, { color: 'red' }) : k.tick(x + 230, y + 30, 40, { color: 'green' })
		}))
		k.text(150, 860, 'BCP and CMod hold for new models; the DI gain is real, but its size depends on the model', { size: 'l', scale: 0.95, color: 'red' })
	},
}
