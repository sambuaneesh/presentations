// The first benchmark: 4 models x 3 arms x 4 systems; only DeepSeek ran five times.
export default {
	name: 'Where we left off',
	kicker: 'I · where we were',
	title: 'The first benchmark',
	source: 'earlier draft §IV-C · studies/final-benchmark-v1',
	draw(k) {
		const MODELS = [['DeepSeek v4.1 Flash', 5], ['GLM-5.2', 1], ['gpt-oss:120b', 1], ['gemma4:31b', 1]]
		const X = 720, Y = 330, P = 150, S = 52, G = 62
		const ARMS = ['80k concat', 'OpenCode', 'workflow']
		ARMS.forEach((a, i) => k.text(X + i * (4 * G + 40) + 40, Y - 70, a, { size: 's', scale: 1.15, color: 'grey' }))
		MODELS.forEach(([m, n], r) => {
			const y = Y + r * P
			k.text(150, y + 6, m, { size: 'm', scale: 1.25 })
			for (let a = 0; a < 3; a++) for (let s = 0; s < 4; s++) {
				const x = X + a * (4 * G + 40) + s * G
				k.box(x, y, S, S, { size: 's', fill: 'semi', color: 'grey' })
				if (n > 1) for (let t = 1; t < 5; t++) k.box(x + t * 5, y - t * 5, S, S, { size: 's', color: 'red' })
			}
			k.text(X + 3 * (4 * G + 40) + 10, y + 6, n > 1 ? '× 5 runs' : '× 1 run', { size: 'm', scale: 1.1, color: n > 1 ? 'red' : 'grey' })
		})
		k.text(150, 930, 'one square = one system · 4 systems × 3 arms per model · 96 runs in all', { size: 's', scale: 1.15, color: 'grey' })
	},
}
