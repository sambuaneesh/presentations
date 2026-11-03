// What the extension added, as a picture: one row per model, one dot per seed, coloured by the collection that ran it.
// Counts: Table X / extension analysis (recorded of planned runs). No clicks.
export default {
	name: 'What we added',
	kicker: 'II · what we did',
	title: 'Three new collections',
	draw(k) {
		const DOT = {
			before: { color: 'grey', fill: 'fill' },
			s1: { color: 'black', fill: 'fill' },
			s2: { color: 'red', fill: 'none' },
			s3: { color: 'red', fill: 'fill' },
		}
		const dot = (cx, cy, kind, r = 17) => k.circle(cx, cy, r, { size: 'm', ...DOT[kind] })

		// legend: what each colour of dot is
		const L = [
			['before', 'first benchmark', ''],
			['s1', '1 · five seeds for the\n3 single-run models', '173 / 180 runs'],
			['s2', '2 · one run for the\n13 other models', '133 / 156 runs'],
			['s3', '3 · seeds 2–5 for 4 of\nthose 13', '191 / 192 runs'],
		]
		L.forEach(([kind, what, n], i) => {
			const x = 150 + i * 430
			dot(x + 18, 262, kind)
			k.text(x + 52, 238, what, { size: 's', scale: 1.15 })
			if (n) k.text(x + 52, 306, n, { size: 's', scale: 1.15, color: 'grey' })
		})

		// the matrix: models x seeds
		const X = 720, DX = 86, Y = 482, DY = 52
		for (let s = 0; s < 5; s++) k.text(X + s * DX - 14, 418, 'seed ' + (s + 1), { size: 's', scale: 1.0, color: 'grey' })
		k.text(150, 372, 'one dot = one seed of a model = 12 runs (3 approaches × 4 repositories)', { size: 's', scale: 1.1, color: 'grey' })
		const ROWS = [
			['DeepSeek v4.1 Flash', ['before', 'before', 'before', 'before', 'before']],
			['GLM-5.2', ['s1', 's1', 's1', 's1', 's1']],
			['gpt-oss:120b', ['s1', 's1', 's1', 's1', 's1']],
			['gemma4:31b', ['s1', 's1', 's1', 's1', 's1']],
			['DeepSeek v4 Pro', ['s2', 's3', 's3', 's3', 's3']],
			['Mistral Large 4', ['s2', 's3', 's3', 's3', 's3']],
			['Kimi K2.7 Code', ['s2', 's3', 's3', 's3', 's3']],
			['Kimi K3', ['s2', 's3', 's3', 's3', 's3']],
			['9 more models', ['s2']],
		]
		ROWS.forEach(([m, dots], r) => {
			const y = Y + r * DY + (r === 8 ? 18 : 0)
			k.text(150, y - 20, m, { size: 'm', scale: 1.0, color: r === 8 ? 'grey' : 'black' })
			dots.forEach((d, s) => dot(X + s * DX + 16, y, d))
		})

		// side notes, next to the rows they explain
		const side = X + 5 * DX + 30
		k.text(side, Y - 22, 'reused from the first benchmark', { size: 's', scale: 1.05, color: 'grey' })
		k.text(side, Y + 2 * DY - 22, 'seed 1 run again (slide 5)', { size: 's', scale: 1.05, color: 'grey' })
		k.text(side, Y + 5.5 * DY - 22, 'picked: all 12 runs of\ntheir step-2 seed were valid', { size: 's', scale: 1.05, color: 'grey' })
		k.text(side, Y + 8 * DY - 4, 'one run each', { size: 's', scale: 1.05, color: 'grey' })

		// what the rows feed
		const bx = 1560
		k.pen([[bx, Y - 26], [bx + 18, Y - 26], [bx + 18, Y + 7 * DY + 26], [bx, Y + 7 * DY + 26]], { color: 'red', size: 'm' })
		k.text(bx + 40, Y + 2.6 * DY, '8 models ×\n5 seeds\n= the primary\nanalysis', { size: 'm', scale: 1.05, color: 'red' })
		k.text(150, 968, 'runs = recorded / planned: the missing ones returned output that could not be read', { size: 's', scale: 1.0, color: 'grey' })
	},
}
