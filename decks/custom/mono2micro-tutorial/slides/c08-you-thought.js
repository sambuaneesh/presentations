// The punchline of section II: Gru's plan (imgflip template, captions baked in), then the tool comparison's verdict
// (Wang, Bornais & Rubin, ASE 2024, §5: "none of the tools produces a runnable decomposition") and the lesson:
// every tool needed a human to run the use cases, feed the inputs, turn the knobs and pick K.
export default {
	name: 'You thought',
	kicker: 'II · it’s just clustering… right?',
	title: 'You, a couple of minutes ago',
	source: 'Wang, Bornais & Rubin, ASE 2024 · Table 1, §5',
	draw(k) {
		k.image(110, 240, 1040, 667, 'meme-gru.jpg', { anim: 'fade', alt: 'Gru’s plan: the monolith is a graph; just cluster it; but first: traces, tests, schema, git log, K' })
		k.text(1220, 300, 'it was never\njust clustering', { size: 'xl', scale: 1.15, color: 'red', beat: 1, anim: 'wipe' })
		k.text(1220, 640, 'and every one\nof them needed\na human', { size: 'xl', beat: 1, anim: 'fade', delay: 700 })
	},
}
