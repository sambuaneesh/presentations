// Robustness 1: score every failed run at the worst value seen on that system.
export default {
	name: 'Failures at their worst',
	kicker: 'IV · is it robust?',
	title: 'What if every failure scored the worst?',
	source: '§V-A robustness · Table XIII · extension analysis §8 · workflow − single-shot',
	draw(k) {
		k.text(150, 270, 'why: the approaches fail differently, so leaving failures out could favour one of them', { size: 'm', scale: 1.05, color: 'grey' })
		k.box(150, 380, 380, 200, { text: '13 of 480 runs\nfailed in the\nprimary set', color: 'red', fill: 'semi', size: 'm', id: 'f' })
		k.box(640, 380, 470, 200, { text: 'give each one the\nworst score seen\non its system', size: 'm', id: 'w' })
		k.arrow('f', 'w', { color: 'red' })
		const R = [['DI', '+9.0', '+8.9'], ['BCP', '+4.4', '+4.2'], ['CMod', '+4.5', '+4.5']]
		k.text(1260, 330, 'as before      worst case', { size: 's', scale: 1.15, color: 'grey' })
		R.forEach(([m, a, b], i) => {
			const y = 400 + i * 100
			k.text(1180, y, m, { size: 'l', scale: 1.0 })
			k.text(1340, y, a, { size: 'l', scale: 1.0, color: 'grey' })
			k.text(1560, y, b, { size: 'l', scale: 1.0, color: 'red' })
		})
		k.text(150, 860, 'all three stay significant: the gains do not come from dropping failures', { size: 'l', scale: 1.0, color: 'red' })
	},
}
