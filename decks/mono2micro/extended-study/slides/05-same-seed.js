// Seed 1 run twice, three weeks apart: often a different partition. One square per model and repository, placed
// by the real per-repository result (extension analysis §5); one click shows which repository each square is.
export default {
	name: 'Same seed, different answer',
	kicker: 'I · where we were',
	title: 'Same seed, different answer',
	source: 'extension analysis §5 · seed 1 on 2026-09-25 and 2026-10-15 · GLM-5.2, gpt-oss:120b, gemma4:31b',
	draw(k) {
		const REPO = [['D', 'blue', '7ep Demo'], ['J', 'violet', 'JPetStore'], ['P', 'orange', 'PartsUnlimitedMRP'], ['S', 'yellow', 'Spring PetClinic']]
		const MODELS = ['GLM-5.2', 'gpt-oss:120b', 'gemma4:31b']
		// 1 = the identical partition came back, 0 = a different one, null = re-run unreadable; order: model, then D J P S
		const ROWS = [
			['80k concat', [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0]],
			['OpenCode', [0, 1, 1, 0, 0, 0, null, 0, 1, 1, 1, 0]],
			['workflow', [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1]],
		]
		const X = 560, Y = 400, P = 150, S = 54, G = 64, GAP = 40
		const xOf = (i) => X + Math.floor(i / 4) * (4 * G + GAP) + (i % 4) * G
		MODELS.forEach((m, j) => k.text(xOf(j * 4), Y - 60, m, { size: 's', scale: 1.15, color: 'grey' }))
		ROWS.forEach(([name, cells], r) => {
			const y = Y + r * P
			const same = cells.filter((c) => c === 1).length, n = cells.filter((c) => c !== null).length
			k.text(150, y + 8, name, { size: 'm', scale: 1.3 })
			cells.forEach((c, i) => {
				const x = xOf(i), [l, col] = REPO[i % 4]
				if (c === null) {
					k.box(x, y, S, S, { size: 's', dash: 'dotted', color: 'grey', text: '–' })
					return
				}
				k.box(x, y, S, S, { size: 's', fill: c ? 'solid' : 'none', color: c ? 'black' : 'grey', until: 1 })
				k.box(x, y, S, S, { size: 's', fill: c ? 'solid' : 'none', dash: c ? 'draw' : 'dashed', color: col, text: l, beat: 1, anim: 'pop', delay: (r * 12 + i) * 15 })
			})
			k.text(xOf(11) + G + 40, y + 4, same + ' of ' + n, { size: 'l', scale: 1.05, color: r === 2 ? 'red' : 'black' })
		})
		k.text(150, 255, 'GLM-5.2 · gpt-oss:120b · gemma4:31b: seed 1 run again three weeks later, same inputs and settings', { size: 'm', scale: 1.05, color: 'grey' })
		k.text(150, 860, 'filled = the identical partition came back · dashed = a different one · – = re-run unreadable', { size: 'm', scale: 1.05, color: 'red' })
		REPO.forEach(([l, c, name], i) => {
			k.box(150 + i * 420, 925, 40, 40, { size: 's', fill: 'solid', color: c, text: l, beat: 1, anim: 'fade' })
			k.text(205 + i * 420, 927, name, { size: 's', scale: 1.15, beat: 1, anim: 'fade' })
		})
	},
}
