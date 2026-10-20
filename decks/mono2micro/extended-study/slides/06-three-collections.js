// The extension in the order it was run: three collections, same protocol.
export default {
	name: 'What we added',
	kicker: 'II · what we did',
	title: 'Three new collections',
	source: 'docs/side-studies SS-01..SS-03 · studies/final-benchmark-extension-v1 · Table X',
	draw(k) {
		const C = [
			['first', 'five seeds for the\nthree single-run models', 'GLM-5.2 · gpt-oss:120b · gemma4:31b', '3 models × 5 seeds × 12', '173 of 180 runs'],
			['then', 'one run for every\nother model', '13 more Ollama Cloud models', '13 models × 1 seed × 12', '133 of 156 runs'],
			['finally', 'seeds 2–5 for the four\nnew models valid in\nevery run so far', 'DeepSeek v4 Pro · Mistral Large 4\nKimi K2.7 Code · Kimi K3', '4 models × 4 seeds × 12', '191 of 192 runs'],
		]
		k.pen([[160, 420], [1760, 424]], { color: 'grey', size: 's', wob: 1 })
		C.forEach(([d, what, who, f, n], i) => {
			const x = 180 + i * 560
			k.circle(x + 40, 422, 16, { color: 'red', fill: 'solid', size: 's' })
			k.text(x, 330, d, { size: 'm', scale: 1.15, color: 'red' })
			k.text(x, 470, what, { size: 'l', scale: 1.0 })
			k.text(x, 650, who, { size: 's', scale: 1.15, color: 'grey' })
			k.text(x, 740, n, { size: 'l', scale: 1.1 })
			k.text(x, 800, f, { size: 's', scale: 1.15, color: 'grey' })
		})
		k.text(180, 860, '12 = 3 approaches × 4 systems · recorded of planned · the gap: answers that could not be parsed', { size: 's', scale: 1.15, color: 'grey' })
		k.text(180, 920, '497 recorded of 528 planned · plus the 96 runs of the first benchmark', { size: 'l', scale: 1.0, color: 'red' })
	},
}
