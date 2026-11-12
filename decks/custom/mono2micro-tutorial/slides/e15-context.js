// Bet: did a bigger window or a smarter summary help? And which strategy cost the most tokens? (ICSA §V-D)
const BARS = [['30k concat', 226], ['30k LLM merge', 192], ['80k concat', 188], ['80k LLM merge', 184], ['hierarchical', 736]]
export default {
	name: 'Bet: context',
	kicker: 'IV · the ICSA results · bet first',
	title: 'Bigger window, better cut?',
	source: 'ICSA §V-C, §V-D · tokens per run, mean of the 4 LLMs',
	draw(k) {
		const opts = ['30k', '50k', '80k', 'hierarchical']
		opts.forEach((o, i) => k.note(130 + i * 300, 280, o, { color: 'yellow', size: 'l', rot: [-3, 2, -2, 3][i], anim: 'drop', delay: i * 150, until: 3 }))
		k.text(130, 560, 'which gave the best decompositions?', { size: 'l', until: 3 })
		k.text(130, 660, 'none of them.', { size: 'xl', scale: 1.6, color: 'red', beat: 1, anim: 'zoom', until: 3 })
		k.text(130, 820, 'no measurable difference on any metric, for any context size', { size: 'l', color: 'grey', beat: 1, anim: 'fade', delay: 300, until: 3 })
		// bet 2: tokens
		k.text(130, 900, 'and the four LLMs? remarkably similar, too', { size: 'l', beat: 1, anim: 'fade', delay: 900, until: 3 })
		k.text(130, 270, 'ok then: which one cost the most tokens?', { size: 'l', beat: 2, anim: 'fade', until: 3 })
		k.text(130, 260, 'tokens per run (thousands)', { size: 'm', color: 'grey', beat: 3, anim: 'fade' })
		BARS.forEach(([n, v], i) => {
			const y = 340 + i * 115, w = v * 1.75
			k.text(130, y + 10, n, { size: 'm', beat: 3, anim: 'fade', delay: i * 120 })
			k.box(470, y, w, 70, { fill: 'solid', color: i === 4 ? 'red' : 'grey', size: 's', beat: 3, anim: 'wipe', delay: i * 120 })
			k.text(i === 4 ? 470 + w - 200 : 490 + w, y + (i === 4 ? -2 : 10), String(v) + 'k', { size: i === 4 ? 'xl' : 'm', color: i === 4 ? 'red' : 'black', beat: 3, anim: 'fade', delay: 200 + i * 120 })
		})
		k.text(1000, 350, 'small chunks repeat the\ninstructions in every call', { size: 'm', color: 'grey', beat: 3, delay: 900, anim: 'fade' })
		k.text(130, 930, 'hierarchical: 3–4× the tokens, and no better', { size: 'l', beat: 3, delay: 1300, anim: 'wipe' })
	},
}
