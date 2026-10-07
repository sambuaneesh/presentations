// What the paper set out to answer, and what it found: its three research questions, each with its
// answer underneath. One click; the six notes pop in in reading order (meta.delay).
const RQS = [
	['RQ1 · How good is it, compared to the state of the art?', '157 / 517 with GPT-4o: more than any system on the leaderboard, at $0.29 an issue'],
	['RQ2 · Do Image2Code and Code2Image actually help?', 'Yes: +10 and +12 on their own, +21 together (136 → 157)'],
	['RQ3 · Does it work on other projects and models?', 'Yes: 14 of 102 on new repos (best of all), and 175 with o4-mini'],
]

export default {
	name: 'Recap',
	source: '§IV-A (questions) · Tables I, III, IV, V',
	draw(k) {
		k.text(160, 110, 'it may not seem like it, but so far we have answers to these:', { size: 'xl', scale: 1.05 })
		const x0 = 220, dx = 560
		RQS.forEach(([q, a], i) => {
			const x = x0 + i * dx
			k.note(x, 250, q, { size: 's', scale: 1.5, color: 'yellow', rot: i % 2 ? 1.5 : -1.5, beat: 1, anim: 'pop', delay: i * 600 })
			k.pen([[x + 150, 560], [x + 152, 600]], { size: 'm', beat: 1, anim: 'pop', delay: i * 600 + 200 })
			k.note(x, 610, a, { size: 's', scale: 1.5, color: 'light-green', rot: i % 2 ? -1.5 : 1.5, beat: 1, anim: 'pop', delay: i * 600 + 300 })
		})
	},
}
