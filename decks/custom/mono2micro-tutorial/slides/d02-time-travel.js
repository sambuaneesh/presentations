// The rules of the game before agents existed (ICSA §IV-A: ~128k-token budget), then "this is fine".
export default {
	name: 'Time travel',
	kicker: 'III · enter the LLM',
	title: 'Get in. We’re going back in time.',
	source: 'ICSA 2026 · §III-A, §IV-A',
	draw(k) {
		// the time machine
		k.box(110, 300, 470, 430, { size: 'm', id: 'tm' })
		k.circle(345, 480, 120, { size: 'm' })
		k.pen([[345, 480], [345, 395]], { size: 'l' }); k.pen([[345, 480], [290, 520]], { size: 'm' })
		k.pen([[480, 360], [430, 330], [380, 345]], { size: 'm', color: 'grey' })
		k.arrow([400, 345], [372, 352], { size: 's', color: 'grey' })
		k.box(150, 640, 390, 60, { text: 'BEFORE AGENTS', font: 'mono', size: 's' })
		// the rules, all on one click
		const rules = [['one plain LLM call', 'yellow', -2], ['no agents', 'yellow', 2], ['no tools,\nno file browsing', 'yellow', -1], ['a window of\n~128k tokens', 'yellow', 3]]
		rules.forEach(([t, c, r], i) => k.note(700 + (i % 2) * 270, 270 + Math.floor(i / 2) * 260, t, { color: c, size: 'm', rot: r, beat: 1, anim: 'drop', delay: i * 150 }))
		// this is fine
		k.image(1180, 300, 660, 321, 'meme-fine.jpg', { beat: 1, anim: 'fade', delay: 900, alt: 'This is fine: the whole repo on fire around my 128k window' })
		k.text(110, 830, 'so… are LLMs even good at this?', { size: 'xl', scale: 1.7, color: 'red', beat: 2, anim: 'zoom' })
	},
}
