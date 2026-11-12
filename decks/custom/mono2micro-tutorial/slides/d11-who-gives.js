// Who hands us the views? Nobody: "always has been" just the code. So the LLM must write them from the code.
export default {
	name: 'Who gives us the views?',
	kicker: 'III · enter the LLM',
	title: 'So… who gives us these views?',
	source: 'ICSA 2026 · §III-B: no external architectural documentation is provided',
	draw(k) {
		k.image(110, 240, 1000, 563, 'meme-always.jpg', { anim: 'fade', alt: 'Always has been meme: wait, the architecture docs are just the code? Always has been' })
		k.text(1200, 290, 'what we really have:', { size: 'l', beat: 1, anim: 'fade' })
		k.box(1200, 370, 520, 110, { text: 'the source repository', font: 'mono', size: 's', scale: 1.2, beat: 1, anim: 'pop', delay: 200 })
		k.text(1200, 510, 'that’s it.', { size: 'xl', color: 'red', beat: 1, anim: 'fade', delay: 500 })
		k.text(110, 880, 'so the LLM has to write the views itself, from the code', { size: 'l', beat: 1, anim: 'wipe', delay: 900 })
	},
}
