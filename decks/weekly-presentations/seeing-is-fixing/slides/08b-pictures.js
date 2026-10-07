// Same agent, same model, with and without the images (Table I): handing it the screenshots barely
// changes anything. One click adds the takeaway.

// One model's pair of bars: text-only SWE-agent, then SWE-agent Multimodal (with the images).
function pair(k, x, model, textOnly, withImages) {
	const BASE = 820, U = 5.0, BW = 170
	const bar = (bx, n, o) => {
		k.box(bx, BASE - n * U, BW, n * U, { fill: 'pattern', size: 'm', ...o })
		k.text(bx, BASE - n * U - 70, String(n), { size: 'xl', scale: 1.1, w: BW, align: 'middle', color: o.color })
	}
	bar(x, textOnly, { color: 'grey' })
	bar(x + BW + 50, withImages, { color: 'black' })
	k.text(x - 20, BASE + 18, 'text only', { size: 's', scale: 1.2, color: 'grey', w: BW + 40, align: 'middle' })
	k.text(x + BW + 30, BASE + 18, 'with images', { size: 's', scale: 1.2, w: BW + 40, align: 'middle' })
	k.text(x, BASE + 70, model, { size: 'l', scale: 1.1, w: 2 * BW + 50, align: 'middle' })
}

export default {
	name: 'Pictures didn\'t help',
	kicker: 'I · the problem',
	title: 'Handing it the pictures didn\'t help',
	source: 'Table I · resolved of 517 · the comparison is our reading',
	notes: "COVER\n• Same agent, same model: SWE-agent with text only vs SWE-agent Multimodal, which gets the images too\n• GPT-4o: 62 → 63 · Claude 3.5: 63 → 59 (worse)\n• So access to the screenshot isn't the bottleneck: the model can see the pixels but doesn't understand them, or connect them to code\n• Our observation from Table I; the paper doesn't say it in these words\n• Sets up the next slide: two blindnesses\nCLICKS\n1 · the takeaway\nREF · Table I",
	draw(k) {
		k.pen([[200, 822], [1700, 818]], { size: 's', color: 'grey', wob: 1 })
		k.text(200, 340, 'SWE-agent, same model, without and with the screenshots', { size: 'm', scale: 1.2, color: 'grey', w: 1520, align: 'middle' })
		pair(k, 330, 'GPT-4o', 62, 63)
		pair(k, 1010, 'Claude 3.5', 63, 59)
		k.text(1425, 560, '−4', { size: 'l', scale: 1.2, color: 'grey' })
		k.text(200, 230, 'seeing the pixels isn\'t understanding them', { size: 'xl', scale: 1.15, color: 'red', rot: -1.5, beat: 1, anim: 'fade', w: 1520, align: 'middle' })
	},
}
