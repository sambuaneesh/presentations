// Seed 1, run twice three weeks apart with everything else identical: did the same decomposition come back?
// One mark per model and repository, from the stored runs (extension analysis §5). No clicks.
export default {
	name: 'Repeatability (same seed)',
	kicker: 'I · where we were',
	title: 'Let’s talk about repeatability (same seed)',
	draw(k) {
		// the experiment: one setup, run twice
		k.box(150, 280, 300, 110, { text: 'run 1', size: 'l' })
		k.text(478, 312, 'vs', { size: 'l', scale: 1.0, color: 'grey' })
		k.box(560, 280, 300, 110, { text: 'run 2', size: 'l' })
		k.text(920, 282, 'same model · same repository · same approach · seed 1 · same inputs\n→ did the identical decomposition come back the second time?', { size: 'm', scale: 1.0 })

		const REPO = [['D', 'blue'], ['J', 'violet'], ['P', 'orange'], ['S', 'yellow']]
		const MODELS = ['GLM-5.2', 'gpt-oss:120b', 'gemma4:31b']
		// 1 = identical decomposition both times, 0 = a different one, null = second run unreadable; order: model, then D J P S
		const ROWS = [
			['80k concat', [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0]],
			['OpenCode', [0, 1, 1, 0, 0, 0, null, 0, 1, 1, 1, 0]],
			['workflow', [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1]],
		]
		const X = 560, G = 64, GAP = 44, Y = 580, P = 90
		const xOf = (i) => X + Math.floor(i / 4) * (4 * G + GAP) + (i % 4) * G
		MODELS.forEach((m, j) => k.text(xOf(j * 4), 450, m, { size: 's', scale: 1.15, color: 'grey' }))
		k.text(xOf(11) + G + 50, 460, 'pairs per approach:\n3 models × 4 repositories', { size: 's', scale: 1.05, color: 'grey' })
		for (let i = 0; i < 12; i++) k.box(xOf(i) + 8, 492, 40, 40, { size: 's', fill: 'solid', color: REPO[i % 4][1], text: REPO[i % 4][0] })
		ROWS.forEach(([name, cells], r) => {
			const y = Y + r * P
			const same = cells.filter((c) => c === 1).length, n = cells.filter((c) => c !== null).length
			k.text(150, y - 18, name, { size: 'm', scale: 1.2, color: r === 2 ? 'red' : 'black' })
			cells.forEach((c, i) => {
				const cx = xOf(i) + 28
				if (c === null) k.pen([[cx - 16, y - 6], [cx + 16, y - 6]], { color: 'grey', size: 'm' })
				else if (c) k.tick(cx, y - 14, 34, { color: 'green' })
				else k.cross(cx, y - 12, 28, { color: 'red' })
			})
			k.text(xOf(11) + G + 50, y - 22, 'same in ' + same + ' of ' + n, { size: 'm', scale: 1.1, color: r === 2 ? 'red' : 'black' })
		})
		k.text(150, 850, '✓ the identical decomposition came back · ✗ a different one · – second run unreadable', { size: 'm', scale: 1.05, color: 'red' })
		k.text(150, 905, 'OpenCode has no seed setting: its row is the same setup run twice · workflow: its first LLM answer already differed in all 12', { size: 's', scale: 1.05, color: 'grey' })
		k.text(150, 945, 'D 7ep Demo · J JPetStore · P PartsUnlimitedMRP · S Spring PetClinic', { size: 's', scale: 1.05, color: 'grey' })
	},
}
