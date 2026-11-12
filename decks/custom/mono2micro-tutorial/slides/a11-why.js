// Why split at all: a balance (buy on the left pan, pay on the right); then it clears for Fowler's
// MonolithFirst line and the question of the talk: where do you cut, and who decides?
export default {
	name: 'Why split',
	kicker: '0 · it’s complicated · so why bother?',
	source: 'Fowler, MonolithFirst, 2015',
	draw(k) {
		// the balance: post, beam, two pans
		k.pen([[960, 960], [960, 330]], { until: 3, size: 'l' })
		k.pen([[700, 980], [1220, 980]], { until: 3, size: 'l' })
		k.pen([[420, 360], [960, 330], [1500, 360]], { until: 3, size: 'l', wob: 0.6 })
		k.circle(960, 330, 14, { until: 3, fill: 'solid', color: 'black' })
		for (const x of [420, 1500]) {
			k.pen([[x, 360], [x - 150, 560]], { until: 3, size: 's' }); k.pen([[x, 360], [x + 150, 560]], { until: 3, size: 's' })
			k.pen([[x - 190, 560], [x - 120, 600], [x + 120, 600], [x + 190, 560]], { until: 3, size: 'm' })
		}
		const buy = ['ship one part\nalone', 'one team,\none service', 'scale one\npart']
		const pay = ['every call\ncan fail', 'no shared\ntransactions', 'more to deploy\nand watch']
		// notes land on the pans (scale 0.8: 160 px each)
		buy.forEach((t, i) => k.note(180 + i * 160, 396 - (i % 2) * 14, t, { until: 3, color: 'light-green', size: 'm', scale: 0.8, rot: -4 + i * 3, beat: 1, anim: 'drop', delay: i * 250 }))
		pay.forEach((t, i) => k.note(1260 + i * 160, 396 - (i % 2) * 14, t, { until: 3, color: 'light-red', size: 'm', scale: 0.8, rot: 3 - i * 3, beat: 1, anim: 'drop', delay: 750 + i * 250 }))
		k.text(330, 640, 'buy', { until: 3, size: 'xl', scale: 1.3, color: 'green', beat: 1, anim: 'fade' })
		k.text(1420, 640, 'pay', { until: 3, size: 'xl', scale: 1.3, color: 'red', beat: 1, anim: 'fade', delay: 750 })
		k.box(300, 790, 800, 130, { until: 3, fill: 'solid', color: 'white', size: 'l', dash: 'dotted', text: 'worth it only when the monolith hurts', labelColor: 'black', beat: 2, anim: 'pop' })
		ud(k, 1250, 750, 580, 235, 'resume-driven development', 'Splitting a perfectly fine monolith into microservices because it looks great on your CV.', '▲ 4,096   ▼ 2', { until: 3, beat: 2, anim: 'pop', delay: 500 })
		// click 3: the balance goes; the question of the talk
		k.text(110, 95, 'What you buy, and what you pay', { size: 'xl', scale: 1.15, until: 3 })
		k.text(140, 250, '“Almost all the successful microservice stories have started\nwith a monolith that got too big and was broken up.”', { size: 'xl', scale: 0.95, beat: 3, anim: 'fade', until: 4 })
		k.text(150, 420, 'Martin Fowler, 2015', { size: 'm', color: 'grey', beat: 3, anim: 'fade', until: 4 })
		k.text(260, 560, 'So where do you cut?', { size: 'xl', scale: 2.2, beat: 3, anim: 'fade', delay: 700, until: 4 })
		k.text(270, 790, 'And who decides?', { size: 'xl', scale: 1.7, color: 'red', beat: 3, anim: 'zoom', delay: 1300, until: 4 })
		k.underline(272, 930, 640, { color: 'grey', beat: 3, anim: 'wipe', delay: 1600, until: 4 })
		// click 4: the promise and the one idea of the talk
		k.text(140, 250, 'in the next hour, you’ll learn to', { size: 'xl', color: 'grey', beat: 4, anim: 'fade' })
		const P = [['judge a cut', 'yellow'], ['catch a gamed\nmetric', 'yellow'], ['know where\ntools stop', 'yellow']]
		P.forEach(([t, c], i) => k.note(160 + i * 420, 380, t, { color: c, size: 'l', rot: [-3, 2, -2][i], beat: 4, anim: 'drop', delay: 300 + i * 200 }))
		k.text(140, 800, 'tools and LLMs propose cuts.', { size: 'xl', scale: 1.1, beat: 4, anim: 'fade', delay: 1100 })
		k.text(140, 890, 'judging and owning them is engineering.', { size: 'xl', scale: 1.1, color: 'red', beat: 4, anim: 'fade', delay: 1500 })
	},
}

// an Urban-Dictionary-style entry (a parody card, in the deck's colours)
function ud(k, x, y, w, h, word, def, votes, o) {
	k.box(x, y, w, h, { fill: 'solid', color: 'white', size: 's', dash: 'solid', ...o })
	k.text(x + 24, y + 14, 'TOP DEFINITION', { size: 's', font: 'sans', color: 'grey', ...o })
	k.text(x + 24, y + 44, word, { size: 'l', font: 'sans', color: 'blue', ...o })
	k.text(x + 24, y + 104, def, { size: 's', font: 'sans', w: w - 48, ...o })
	k.text(x + 24, y + h - 44, votes, { size: 's', font: 'sans', color: 'grey', ...o })
}
