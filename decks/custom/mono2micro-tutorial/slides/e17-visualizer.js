// Hand-over to the live web visualizer of the ICSA study (the paper's web artefact): one line and the QR code,
// filling the slide.
export default {
	name: 'See it all',
	draw(k) {
		k.text(0, 40, 'wanna browse the results? check it out here', { size: 'xl', align: 'middle', w: 1920 })
		k.image(545, 180, 830, 830, 'qr-visualizer.svg', { alt: 'QR code for the ICSA web visualizer (sambuaneesh.github.io/mono2micro)' })
	},
}
