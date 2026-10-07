// Step 5, sampling, explained: the model's best guess (T = 0), then 39 more tries with some randomness
// (T = 1), each a little different: up to 40 candidate fixes. Click 2: only one can be submitted
// (Pass@1), so which one? That question is what Code2Image answers next. Few shapes, plain fades.

// A small patch card: a removed line and an added one.
function card(k, x, y, w, h, fix, opts = {}) {
	const { id, big, ...o } = opts
	k.box(x, y, w, h, { fill: 'solid', color: 'white', size: 's', ...o, id })
	k.text(x + 14, y + 10, 'patch', { size: 's', color: 'grey', ...o })
	k.text(x + 16, y + h * 0.42, '- old', { font: 'mono', size: big ? 'm' : 's', color: 'red', ...o })
	k.text(x + 16, y + h * 0.68, '+ ' + fix, { font: 'mono', size: big ? 'm' : 's', color: 'green', ...o })
}

export default {
	name: 'Forty',
	kicker: 'II · the method · step 5 · patch generation',
	step: 5,
	title: 'Not one patch: a handful',
	source: '§III-C · §IV-D (1 greedy at T = 0, 39 sampled at T = 1) · Pass@1: §II-B, §III-D',
	draw(k) {
		// the model and its best guess
		k.box(150, 370, 200, 140, { text: 'LLM', size: 'l', id: 'llm' })
		card(k, 470, 330, 230, 210, 'fix A', { big: true, id: 'best' })
		k.arrow('llm', 'best', { size: 'm' })
		k.text(435, 570, 'its best guess', { size: 'l', w: 300, align: 'middle' })
		k.text(380, 630, 'T = 0: always its most likely answer', { size: 's', scale: 1.15, color: 'grey', w: 410, align: 'middle' })

		// click 1: 39 more, each a bit different
		const one = { beat: 1, anim: 'fade' }
		'BCDEF'.split('').forEach((c, i) => card(k, 830 + i * 112, 360, 100, 125, 'fix ' + c, { rot: i % 2 ? 3 : -3, ...one }))
		k.text(1395, 395, '…', { size: 'xl', color: 'grey', ...one })
		k.text(830, 525, '+ 39 more, each a bit different', { size: 'l', w: 620, align: 'middle', ...one })
		k.text(830, 585, 'T = 1: some randomness, so every try differs', { size: 's', scale: 1.15, color: 'grey', w: 620, align: 'middle', ...one })
		k.text(300, 740, 'up to 40 candidate fixes', { size: 'xl', scale: 1.15, color: 'red', w: 1150, align: 'middle', rot: -1.5, ...one })

		// click 2: only one can go in
		const two = { beat: 2, anim: 'fade' }
		k.arrow([1440, 430], [1515, 430], { dash: 'dashed', color: 'grey', size: 'm', ...two })
		k.box(1530, 340, 250, 190, { fill: 'solid', color: 'white', size: 'm', ...two })
		k.text(1530, 352, 'submit', { size: 's', color: 'grey', w: 250, align: 'middle', ...two })
		k.text(1530, 395, '1', { size: 'xl', scale: 1.7, w: 250, align: 'middle', ...two })
		k.text(1490, 570, 'which one?', { size: 'xl', scale: 1.15, color: 'red', w: 330, align: 'middle', rot: -3, ...two })
		k.text(1440, 660, 'only one gets submitted (Pass@1)', { size: 's', scale: 1.15, color: 'grey', w: 430, align: 'middle', ...two })
	},
}
