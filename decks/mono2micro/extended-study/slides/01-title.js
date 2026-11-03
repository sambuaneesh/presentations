// Title: the name, and a decorative doodle of the repositories, circled and labelled as eye-candy.
export default {
	name: 'Title',
	draw(k) {
		k.text(160, 300, 'So... the past week', { size: 'xl', scale: 2.4 })
		// a late correction: one week was never one week
		k.pen([[890, 385], [1205, 368]], { color: 'red', size: 'xl' })
		k.text(915, 175, 'weeks', { size: 'xl', scale: 1.7, color: 'red', rot: -5 })
		k.underline(170, 480, 820, { color: 'red' })
		k.text(166, 540, 'we ran it, and ran it, and ran it again…\nuntil we could tell real gains from lucky ones', { size: 'l', scale: 1.1, color: 'grey' })
		k.text(166, 830, 'presented by', { size: 'm', scale: 1.1, color: 'grey' })
		k.text(166, 864, 'A Niche', { size: 'xl', scale: 1.1 })
		// doodle: 4 models (rows) x 4 repositories (columns, own colour and first letter), each stacked into five runs
		const REPO = [['D', 'blue'], ['J', 'violet'], ['P', 'orange'], ['S', 'yellow']]
		const X = 1380, Y = 300, P = 105
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
			for (let s = 4; s >= 1; s--) k.box(X + c * P + s * 6, Y + r * P - s * 6, 62, 62, { size: 's', fill: 'none', color: 'red' })
			k.box(X + c * P, Y + r * P, 62, 62, { size: 's', fill: 'solid', color: REPO[c][1], text: REPO[c][0] })
		}
		k.loop(X + 183, Y + 180, 300, 290, { color: 'red' })
		k.text(X - 40, Y + 4 * P + 100, 'just here to grab\nyour attention (lol)', { size: 'm', scale: 1.15, color: 'red', rot: -3 })
	},
}
