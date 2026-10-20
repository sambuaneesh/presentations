// The extension in the order it was run: three collections, same protocol.
export default {
	name: 'What we added',
	kicker: 'II · what we did',
	title: 'Three new collections',
	source: 'docs/side-studies SS-01..SS-03 · studies/final-benchmark-extension-v1 · Table X',
	draw(k) {
		const C = [
			['first', 'five seeds for the\nthree single-run models', 'GLM-5.2 · gpt-oss:120b · gemma4:31b', '173 of 180 runs'],
			['then', 'one run for every\nother model', '13 more Ollama Cloud models', '133 of 156 runs'],
			['finally', 'five seeds for the\nfour strongest new ones', 'DeepSeek v4 Pro · Mistral Large 4\nKimi K2.7 Code · Kimi K3', '191 of 192 runs'],
		]
		k.pen([[160, 420], [1760, 424]], { color: 'grey', size: 's', wob: 1 })
		C.forEach(([d, what, who, n], i) => {
			const x = 180 + i * 560
			k.circle(x + 40, 422, 16, { color: 'red', fill: 'solid', size: 's' })
			k.text(x, 330, d, { size: 'm', scale: 1.15, color: 'red' })
			k.text(x, 480, what, { size: 'l', scale: 1.0 })
			k.text(x, 640, who, { size: 's', scale: 1.15, color: 'grey' })
			k.text(x, 760, n, { size: 'l', scale: 1.1 })
		})
		k.text(180, 900, '497 new runs, plus the 96 of the first benchmark', { size: 'l', scale: 1.05, color: 'red' })
	},
}
