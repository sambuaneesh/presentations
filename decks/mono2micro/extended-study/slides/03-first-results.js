// What the first benchmark said: valid, cheaper, and a tie on quality.
export default {
	name: 'What it told us',
	kicker: 'I · where we were',
	title: 'Valid, cheaper, and a tie',
	source: 'earlier draft: abstract · §V-A–C',
	draw(k) {
		k.box(150, 330, 480, 300, { text: 'valid in\n32 of 32 runs', color: 'green', fill: 'semi', size: 'l' })
		k.box(720, 330, 480, 300, { text: '31.9% fewer\ntokens than\nsingle-shot', color: 'green', fill: 'semi', size: 'l' })
		k.box(1290, 330, 480, 300, { text: 'quality:\nno significant\ndifference', color: 'red', fill: 'semi', size: 'l', id: 'tie' })
		k.text(1290, 660, 'over 16 model–system pairs', { size: 'm', scale: 1.15, color: 'grey' })
		k.text(170, 860, 'our conclusion then: design quality "comparable to single-shot prompting"', { size: 'l', scale: 1.15, color: 'red', rot: -1.5 })
	},
}
