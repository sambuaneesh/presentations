// Hand-over to the live web visualizer of the ICSA study (the paper's web artefact).
export default {
	name: 'See it all',
	kicker: 'IV · the ICSA results · live',
	title: 'Every decomposition, every score: explore it',
	source: 'ICSA web artefact: sambuaneesh.github.io/llms4arch',
	draw(k) {
		k.image(1240, 260, 560, 560, 'qr-visualizer.svg', { alt: 'QR code for the ICSA web visualizer' })
		k.text(1215, 850, 'sambuaneesh.github.io/llms4arch', { size: 'm', font: 'mono' })
		// a statement slide: one giant phrase, the QR, one short line
		k.text(130, 360, 'live demo', { size: 'xl', scale: 3.2, rot: -2, anim: 'zoom' })
		k.text(140, 700, '4 systems · 4 LLMs × 7 strategies · the tools ·\nthe developers’ reference · every service, every class', { size: 'm', color: 'grey', anim: 'fade', delay: 400 })
	},
}
