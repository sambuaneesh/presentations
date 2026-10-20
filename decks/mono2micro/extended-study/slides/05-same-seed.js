// Seed 1 run twice, three weeks apart: often a different partition.
export default {
	name: 'Same seed, different answer',
	kicker: 'I · where we were',
	title: 'Same seed, different answer',
	source: 'extension analysis §5 · seed 1 on 2026-09-25 and 2026-10-15 · GLM-5.2, gpt-oss:120b, gemma4:31b',
	draw(k) {
		const ROWS = [['80k concat', 7, 12], ['OpenCode', 5, 11], ['workflow', 4, 12]]
		const X = 620, Y = 360, P = 170, S = 56, G = 70
		ROWS.forEach(([name, same, n], r) => {
			const y = Y + r * P
			k.text(150, y + 8, name, { size: 'm', scale: 1.3 })
			for (let i = 0; i < n; i++) k.box(X + i * G, y, S, S, { size: 's', fill: i < same ? 'solid' : 'none', color: i < same ? 'black' : 'grey'})
			k.text(X + 12 * G + 30, y + 4, same + ' of ' + n, { size: 'l', scale: 1.05, color: r === 2 ? 'red' : 'black' })
		})
		k.text(150, 255, 'GLM-5.2 · gpt-oss:120b · gemma4:31b: seed 1 run again three weeks later, same inputs and settings', { size: 'm', scale: 1.05, color: 'grey' })
		k.text(150, 300, 'one square = one model on one system (3 × 4 = 12) · OpenCode 11: one re-run was unreadable', { size: 's', scale: 1.15, color: 'grey' })
		k.text(150, 900, 'filled = the identical partition came back · one run per cell can mislead', { size: 'm', scale: 1.1, color: 'red' })
	},
}
