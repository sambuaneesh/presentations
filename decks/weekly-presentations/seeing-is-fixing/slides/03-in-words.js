// The OpenLayers report from Fig. 1, in the reporter's own words, on a sticky note. Its last line gives
// up on words and points at a picture; one click circles that line.
export default {
	name: 'In words',
	kicker: 'I · the problem',
	title: 'Here is a bug report…',
	source: 'openlayers task · Fig. 1 (report text as shown there)',
	notes: "COVER\n• A real SWE-bench M task, in OpenLayers (a web mapping library), shown in the paper's Fig. 1\n• Read the report aloud\n• Then ask, and pause: which symbols? off by how much, in which direction? bigger? smaller? shifted?\n• Nobody can draw it from this, and neither could the reporter\nCLICKS\n1 · the last sentence circled: they stopped describing and attached a picture\nREF · Fig. 1 (openlayers)",
	draw(k) {
		// the report, as a card: each line placed by hand so the click can circle the right one
		const x = 170, y = 260
		k.box(x, y, 1130, 650, { fill: 'solid', color: 'yellow', size: 's', rot: -1, id: 'card' })
		const line = (dy, t, o = {}) => k.text(x + 60, y + dy, t, { size: 'm', scale: 1.4, ...o })
		line(50, 'KML Symbol Align/Placement/Size', { size: 'l', scale: 1.3 })
		line(170, 'There is a bug with the anchor point for some symbols')
		line(245, '[Left Image]', { color: 'grey' })
		line(350, 'I\'ve attached a screen clipping from Google Earth')
		line(410, 'to show how it is supposed to look.')
		line(500, '[Right Image] …', { color: 'grey' })

		k.loop(x + 530, y + 410, 545, 95, { beat: 1, anim: 'wipe' })
		k.text(1380, 470, 'even the reporter\ngave up on words', { size: 'xl', scale: 1.15, color: 'red', rot: -3, beat: 1, anim: 'fade' })
		k.arrow([1420, 640], [1250, 690], { color: 'red', size: 'm', bend: -20, beat: 1, anim: 'fade' })
	},
}
