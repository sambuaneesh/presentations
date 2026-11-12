// The hype and the plot twist on one canvas: Uber's 2,200 services; the Drake meme and an Urban-Dictionary-style
// entry (click 1); then the ones that came back: Segment 140+ → 1, Prime Video −90% (click 2).
export default {
	name: 'The hype, and the twist',
	kicker: '0 · it’s complicated · the hype',
	source: 'Uber Eng., 2020 · Segment, 2018 · Prime Video Tech blog, 2023',
	draw(k) {
		// 0: Uber, as a dot field (one dot = ten services)
		k.text(110, 240, '2,200', { size: 'xl', scale: 3.2, rot: -2, until: 1 })
		k.text(118, 470, 'microservices at Uber, 2020…', { size: 'l', color: 'grey', until: 1 })
		k.text(118, 530, '…then they grouped them\nback into domains', { size: 'l', until: 1 })
		k.grid(1000, 270, 20, 220, 38, 9, { color: 'grey', fill: 'fill', until: 1, each: (i) => ({ delay: (i % 20) * 20 }) })
		k.text(1000, 720, 'one dot = ten services', { size: 'm', color: 'grey', until: 1 })
		// 1: the hype: Drake is the focus, the dictionary card backs it up
		k.image(110, 240, 620, 620, 'meme-drake.jpg', { beat: 1, anim: 'pop', rot: -1.5, until: 2, alt: 'Drake meme: no to one app that works, yes to 200 services and 3 users' })
		k.box(860, 330, 760, 380, { fill: 'solid', color: 'white', size: 's', dash: 'solid', beat: 1, anim: 'pop', delay: 400, until: 2 })
		k.text(890, 350, 'TOP DEFINITION', { size: 'm', font: 'sans', color: 'grey', beat: 1, anim: 'fade', delay: 400, until: 2 })
		k.text(890, 395, 'microservices', { size: 'xl', font: 'sans', color: 'blue', beat: 1, anim: 'fade', delay: 400, until: 2 })
		k.text(890, 480, 'When one app that works becomes 200 services, 3 users and a pager that never sleeps.', { size: 'm', font: 'sans', w: 700, beat: 1, anim: 'fade', delay: 500, until: 2 })
		k.text(890, 640, '▲ 2,200   ▼ 140     by tired_sre', { size: 'm', font: 'sans', color: 'grey', beat: 1, anim: 'fade', delay: 600, until: 2 })
		// 2: the plot twist is the focus
		k.text(110, 250, 'plot twist:', { size: 'xl', scale: 1.3, color: 'red', beat: 2, anim: 'pop', rot: -3 })
		k.text(110, 420, '140+ → 1', { size: 'xl', scale: 2.6, beat: 2, anim: 'zoom', delay: 300 })
		k.text(118, 700, 'Segment, 2018: the operational overhead\nhad stopped their feature work', { size: 'm', color: 'grey', beat: 2, anim: 'fade', delay: 500 })
		k.text(1000, 420, '−90%', { size: 'xl', scale: 2.6, beat: 2, anim: 'zoom', delay: 900 })
		k.text(1008, 700, 'Prime Video, 2023: cost after moving\na monitoring service back into one process', { size: 'm', color: 'grey', beat: 2, anim: 'fade', delay: 1100 })
	},
}
