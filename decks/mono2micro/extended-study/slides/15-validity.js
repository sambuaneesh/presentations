// Validity over all 16 models of the extension, including models that struggle with the output format.
export default {
	name: 'Valid even with weak models',
	kicker: 'III · what we found',
	title: 'Valid, even with weaker models',
	source: 'Table XV · 16 models re-run or added · 176 attempts per approach · unreadable = failed',
	draw(k) {
		const B = [['single-shot', 85.8, '151 / 176'], ['OpenCode', 90.3, '159 / 176'], ['workflow', 93.8, '165 / 176']]
		const X = 520, Y = 360, P = 160, U = 11
		B.forEach(([name, v, n], i) => {
			const y = Y + i * P
			const me = i === 2
			k.text(150, y + 10, name, { size: 'l', scale: 1.05, color: me ? 'red' : 'black' })
			k.box(X, y, v * U, 80, { fill: 'pattern', color: me ? 'red' : 'grey', size: 'm'})
			k.text(X + v * U + 30, y + 8, v.toFixed(1) + '%', { size: 'l', scale: 1.05, color: me ? 'red' : 'black' })
			k.text(X + v * U + 230, y + 22, n, { size: 's', scale: 1.15, color: 'grey' })
		})
		k.text(150, 880, 'every decomposition it produced was valid: its 11 failures were answers that could not be parsed', { size: 'm', scale: 1.05, color: 'red' })
		k.text(150, 255, 'primary set (8 models × 5 seeds × 4 systems = 160): workflow 159 · single-shot 157 · OpenCode 151', { size: 'm', scale: 1.05, color: 'grey' })
		k.text(150, 300, 'bars: all 16 models of the extension, every attempt: 3 × 5 × 4 + 13 × 1 × 4 + 4 × 4 × 4 = 176 per approach', { size: 'm', scale: 1.05, color: 'red' })
	},
}
