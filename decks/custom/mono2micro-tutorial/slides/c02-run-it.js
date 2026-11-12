// Tools that watch the app run (Wang, Bornais & Rubin, ASE 2024, §2.2, §4):
// Mono2Micro (IBM, commercial): use-case execution traces (tests, or a person clicking each use case) → hierarchical
// clustering of classes alike in code AND used by the same use cases; the number of services K is an input (default 5).
// HyDec: calls, variable dependencies, inheritance (static + dynamic) plus every word inside each class → hierarchical
// clustering; related but differently named things split apart: 8 candidates for JPetStore (reference 3) and 7ep-demo (4).
// Click 1 brings in HyDec.
export default {
	name: 'Tools that watch it run',
	kicker: 'II · it’s just clustering… right?',
	title: 'Some tools need the app running',
	source: 'Wang, Bornais & Rubin, ASE 2024 · §2.2, §4',
	draw(k) {
		// Mono2Micro: use cases → traces → a clustering tree cut at K
		k.text(140, 265, 'Mono2Micro (IBM)', { size: 'xl' })
		const L = [330, 410, 490, 570, 650, 730]
		L.forEach((x) => k.circle(x, 640, 14, { fill: 'fill', color: 'black', size: 's' }))
		const u = (x1, x2, y1, y2, h) => k.pen([[x1, y1], [x1, h], [x2, h], [x2, y2]], { size: 'm' })
		u(330, 410, 626, 626, 570); u(490, 570, 626, 626, 580); u(650, 730, 626, 626, 560); u(370, 530, 570, 580, 480); u(450, 690, 480, 560, 400)
		k.pen([[290, 530], [780, 530]], { color: 'red', size: 'm', dash: 'dashed' })
		k.text(800, 505, 'K', { size: 'xl', color: 'red' })
		k.text(140, 720, 'runs every use case, clusters the traces', { size: 'l' })
		k.text(140, 790, 'you pick the number of services', { size: 'l' })
		// HyDec: code + traces + every word in each class
		k.pen([[960, 270], [960, 860]], { size: 's', color: 'grey', dash: 'dotted', beat: 1, anim: 'wipe' })
		k.text(1020, 265, 'HyDec', { size: 'xl', beat: 1, anim: 'fade' })
		const P = [[1100, 450], [1230, 390], [1200, 540], [1360, 480], [1460, 400]]
		P.forEach(([x, y], i) => k.circle(x, y, 18, { fill: 'fill', color: 'black', size: 's', id: `h${i}`, beat: 1, anim: 'pop', delay: 150 }))
		;[[0, 1], [0, 2], [1, 2], [2, 3], [3, 4]].forEach(([a, b]) => k.arrow(`h${a}`, `h${b}`, { size: 'm', head: 'none', color: 'grey', beat: 1, delay: 300 }))
		k.text(1530, 420, '+ names', { size: 'l', color: 'grey', beat: 1, anim: 'fade', delay: 300 })
		k.text(1020, 620, 'JPetStore: 8 services', { size: 'xl', color: 'red', beat: 1, anim: 'zoom', delay: 700 })
		k.text(1020, 720, 'the developers’ answer: 3', { size: 'l', beat: 1, anim: 'fade', delay: 900 })
		k.text(1020, 790, 'reads code, traces and every name', { size: 'l', color: 'grey', beat: 1, anim: 'fade', delay: 500 })
	},
}
