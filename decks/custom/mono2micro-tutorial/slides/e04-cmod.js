// CMod: keep dependencies inside a service. A worked example (schematic numbers).
export default {
	name: 'CMod',
	kicker: 'IV · game · the reveal',
	title: 'The mystery score was… CMod',
	source: 'CMod (TurboMQ, Mitchell & Mancoridis) as in the benchmark’s metric code',
	draw(k) {
		const dot = (x, y, id) => k.circle(x, y, 22, { fill: 'fill', color: 'black', id })
		k.box(120, 280, 560, 420, { size: 'm', color: 'blue', text: '', id: 'A' }); k.text(140, 290, 'service A', { size: 'm', color: 'blue' })
		k.box(900, 280, 440, 420, { size: 'm', color: 'violet', id: 'B' }); k.text(920, 290, 'service B', { size: 'm', color: 'violet' })
		dot(260, 420, 'a1'); dot(480, 400, 'a2'); dot(360, 590, 'a3'); dot(1040, 430, 'b1'); dot(1200, 600, 'b2')
		k.arrow('a1', 'a2', { color: 'green', size: 'm', beat: 1 }); k.arrow('a2', 'a3', { color: 'green', size: 'm', beat: 1, delay: 150 }); k.arrow('a3', 'a1', { color: 'green', size: 'm', beat: 1, delay: 300 })
		k.arrow('b1', 'b2', { color: 'green', size: 'm', beat: 1, delay: 450 }); k.arrow('b2', 'b1', { color: 'green', size: 'm', bend: 40, beat: 1, delay: 600 })
		k.text(140, 720, 'inside: 3', { size: 'l', color: 'green', beat: 1, anim: 'fade' }); k.text(920, 720, 'inside: 2', { size: 'l', color: 'green', beat: 1, anim: 'fade' })
		k.arrow('a2', 'b1', { color: 'red', size: 'm', dash: 'dashed', beat: 1, delay: 700 })
		k.text(700, 450, 'crossing:\na network call', { size: 'm', color: 'red', beat: 1, delay: 700, anim: 'fade' })
		k.text(140, 790, 'crossing: 1', { size: 'l', color: 'red', beat: 1, delay: 700, anim: 'fade' }); k.text(920, 790, 'crossing: 1', { size: 'l', color: 'red', beat: 1, delay: 700, anim: 'fade' })
		// the formula and the numbers
		k.text(1420, 300, 'per service', { size: 'm', color: 'grey', beat: 2, anim: 'fade' })
		k.text(1420, 350, '2·in\n────────\n2·in + out', { size: 'l', font: 'mono', beat: 2, anim: 'fade' })
		k.text(1420, 560, 'A: 6/7 = 0.86\nB: 4/5 = 0.80', { size: 'm', font: 'mono', beat: 2, anim: 'fade', delay: 400 })
		k.text(1420, 680, 'CMod = 83', { size: 'xl', scale: 1.1, color: 'red', beat: 2, anim: 'pop', delay: 700 })
		k.text(140, 900, 'zero crossings scores 100. so… what if everything sits in ONE service?', { size: 'l', beat: 3, anim: 'wipe' })
	},
}
