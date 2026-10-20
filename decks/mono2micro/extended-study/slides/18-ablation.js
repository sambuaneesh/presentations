// Removing the self-referential score term, on identical LLM outputs, for each of the eight models.
export default {
	name: 'The design fix holds',
	kicker: 'V · the ablation',
	title: 'The design fix holds for all eight',
	source: 'Table XVII · Fig. 6 · 159 run pairs replayed, no model calls · final − V-measure version, mean per model',
	draw(k) {
		const M = [['DS v4.1', 7.4, 11.56], ['GLM-5.2', 7.1, 19.91], ['gpt-oss', 2.62, 3.71], ['gemma4', 3.01, 15.75], ['DS v4 Pro', 5.27, 15.53], ['Mistral L4', 7.19, 13.2], ['Kimi K2.7', 5.77, 13.79], ['Kimi K3', 7.63, 10.0]]
		const BASE = 820, U = 22, X = 220, CW = 190
		k.pen([[180, BASE], [1760, BASE + 2]], { color: 'grey', size: 's', wob: 1 })
		M.forEach(([m, cmod, di], i) => {
			const x = X + i * CW
			const o = {}
			k.box(x, BASE - cmod * U, 60, cmod * U, { fill: 'pattern', color: 'grey', size: 's', ...o })
			k.box(x + 70, BASE - di * U, 60, di * U, { fill: 'pattern', color: 'red', size: 's', ...o })
			k.text(x - 10, BASE + 20, m, { size: 's', scale: 1.15 })
		})
		k.text(180, 270, 'average over all pairs: CMod +5.7 · DI +12.9 · close match (C2C-50) +11.1, all significant', { size: 'm', scale: 1.05 })
		k.text(1200, 340, 'grey: CMod gain · red: DI gain', { size: 's', scale: 1.15, color: 'grey' })
		k.text(180, 930, 'removing it helps every model: first shown on 2 models, now on all 8', { size: 'm', scale: 1.1, color: 'red' })
	},
}
