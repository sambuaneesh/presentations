// Robustness 3: only the six models that informed no design decision.
export default {
	name: 'Models we never tuned on',
	kicker: 'IV · is it robust?',
	title: 'Models we never tuned on',
	source: '§IV-I · Table XIII · extension analysis §11 · 6 models × 4 systems × 5 runs · Holm-corrected p',
	draw(k) {
		k.text(150, 270, 'why: the workflow was designed while watching DeepSeek (and GLM-5.2 for the last change)', { size: 'm', scale: 1.05, color: 'grey' })
		const M = ['gpt-oss:120b', 'gemma4:31b', 'DeepSeek v4 Pro', 'Mistral Large 4', 'Kimi K2.7 Code', 'Kimi K3']
		M.forEach((m, i) => k.box(150 + (i % 3) * 330, 360 + Math.floor(i / 3) * 130, 300, 100, { text: m, size: 's' }))
		k.text(1210, 340, 'vs. single-shot', { size: 'm', scale: 1.15, color: 'grey' })
		const R = [['DI', '+9.0', '0.041'], ['BCP', '+4.1', '0.019'], ['CMod', '+5.0', '0.013']]
		R.forEach(([m, d, p], i) => {
			const y = 410 + i * 90
			k.text(1210, y, m, { size: 'l', scale: 1.0 })
			k.text(1400, y, d, { size: 'l', scale: 1.0, color: 'red' })
			k.text(1580, y + 10, 'p ' + p, { size: 'm', scale: 1.1, color: 'grey' })
		})
		k.text(1210, 700, 'vs. OpenCode: only BCP stays significant', { size: 's', scale: 1.15, color: 'grey' })
		k.text(150, 860, 'the gains are not an artefact of tuning on the development models', { size: 'l', scale: 1.0, color: 'red' })
		k.text(150, 930, '(they share the four benchmark systems, though)', { size: 'm', scale: 1.05, color: 'grey' })
	},
}
