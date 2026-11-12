// The honest way to judge a cut is to build it. Why nobody can.
export default {
	name: 'Just build it?',
	kicker: 'IV · is it any good?',
	title: 'The honest answer: build it and run it',
	source: '112 = 7 summarisation strategies × 4 LLMs × 4 systems (ICSA §IV)',
	draw(k) {
		const steps = [['the cut', 'yellow'], ['rewrite into\nservices', 'light-blue'], ['deploy', 'light-green'], ['load-test,\nwatch it', 'light-violet']]
		steps.forEach(([t], i) => k.note(130 + i * 430, 300, t, { color: 'yellow', size: 'm', scale: 1.1, rot: [-3, 2, -2, 3][i], id: 'st' + i, anim: 'drop', delay: i * 250 }))
		for (let i = 0; i < 3; i++) k.arrow('st' + i, 'st' + (i + 1), { size: 'm', delay: 300 + i * 250 })
		k.text(1640, 330, 'latency\nfailures\ncost', { size: 'm', color: 'grey', anim: 'fade', delay: 1100 })
		// why not
		// Isotype: one dot per decomposition you would have to rewrite, deploy and load-test
		k.grid(130, 610, 16, 112, 34, 22, { color: 'black', fill: 'fill', beat: 1, anim: 'pop', each: (i) => ({ delay: (i % 16) * 25 + Math.floor(i / 16) * 60 }) })
		k.text(130, 860, '112 decompositions', { size: 'l', beat: 1, anim: 'fade', delay: 500 })
		k.text(760, 640, 'a rewrite for every model,\nevery strategy, every system', { size: 'l', beat: 1, anim: 'fade', delay: 250 })
		k.text(760, 780, 'and you’d measure how you coded it\n(network, caching, database), not the cut', { size: 'l', color: 'grey', beat: 1, delay: 600, anim: 'fade' })
		k.pen([[110, 280], [1800, 520]], { color: 'red', size: 'l', beat: 2, anim: 'wipe' })
		k.pen([[110, 520], [1800, 280]], { color: 'red', size: 'l', beat: 2, anim: 'wipe', delay: 250 })
		k.text(760, 930, 'so: judge the blueprint, not the building', { size: 'xl', beat: 2, delay: 500, anim: 'wipe' })
	},
}
