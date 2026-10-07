// The two pictures from the OpenLayers report (the paper's Fig. 1), taped on as prints: what
// OpenLayers drew (symbols far too big, piled up, labels colliding) next to the reporter's Google Earth
// clipping (small, on their points). One click circles the pile-up.

// A picture from the paper, taped onto the slide like a print: a white mat, two strips of tape, a caption.
function taped(k, x, y, w, h, name, o = {}) {
	const { caption, alt, ...on } = o
	k.box(x - 14, y - 14, w + 28, h + 28, { fill: 'solid', color: 'white', size: 's', ...on })
	k.image(x, y, w, h, name, { alt: alt ?? name, ...on })
	k.box(x - 34, y - 28, 110, 34, { fill: 'solid', color: 'yellow', size: 's', dash: 'solid', rot: -10, opacity: 0.65, ...on })
	k.box(x + w - 76, y - 28, 110, 34, { fill: 'solid', color: 'yellow', size: 's', dash: 'solid', rot: 9, opacity: 0.65, ...on })
	const cw = Math.max(w + 80, 460)
	if (caption) k.text(x + w / 2 - cw / 2, y + h + 26, caption, { size: 'm', scale: 1.05, color: 'grey', w: cw, align: 'middle', ...on })
}

export default {
	name: 'In pixels',
	kicker: 'I · the problem',
	title: '…and here are the two pictures',
	source: 'openlayers task · the two images that came with the report (Fig. 1)',
	draw(k) {
		taped(k, 330, 270, 375, 458, 'ol-render.webp', { caption: 'what OpenLayers drew', alt: 'OpenLayers render: map symbols drawn huge and piled up' })
		taped(k, 1180, 270, 317, 458, 'ol-earth.webp', { caption: 'Google Earth: how it should look', alt: 'Google Earth: the same symbols, small and in place' })
		k.loop(568, 432, 120, 112, { beat: 1, anim: 'wipe' })
		k.text(360, 860, 'same symbols: wrong size, wrong place', { size: 'l', scale: 1.15, color: 'red', rot: -1.5, beat: 1, anim: 'fade', w: 1200, align: 'middle' })
	},
}
