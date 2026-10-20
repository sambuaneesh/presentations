// The analysis, declared in writing before the robustness checks.
export default {
	name: 'Written down first',
	kicker: 'II · what we did',
	title: 'One analysis, written down first',
	source: '§IV-I · declared 2026-10-19, after a first descriptive look (not pre-registered)',
	draw(k) {
		const S = [['5 runs', '→ one mean per cell'], ['32 cells', 'paired: same model,\nsame system'], ['Wilcoxon test', 'per metric'], ['Holm correction', 'for testing 8 metrics']]
		S.forEach(([a, b], i) => {
			const x = 150 + i * 430
			k.box(x, 360, 360, 220, { text: a, size: 'l', id: 's' + i})
			k.text(x + 10, 610, b, { size: 'm', scale: 1.05, color: 'grey'})
			if (i) k.arrow('s' + (i - 1), 's' + i, {})
		})
		k.text(150, 820, 'everything else is a check on this, never a source of claims', { size: 'l', scale: 1.05, color: 'red' })
	},
}
