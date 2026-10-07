// The two pictures from the OpenLayers report (Fig. 1), redrawn as a schematic: what OpenLayers drew
// (symbols huge and piled up, labels colliding) next to Google Earth's clipping (small, on their points).
// One click circles the pile-up.

// A map panel: an outline, the shaded area, two range circles, and the symbols, at a given symbol scale.
function map(k, x, y, o) {
	const W = 700, H = 520
	k.box(x, y, W, H, { fill: 'solid', color: 'white', size: 's', id: o.id })
	const P = (px, py) => [x + px, y + py]
	// the shaded service area (two lobes, as in the screenshots)
	k.box(x + 60, y + 60, 200, 300, { geo: 'cloud', fill: 'semi', color: 'light-blue', size: 's' })
	k.box(x + 250, y + 210, 320, 180, { geo: 'cloud', fill: 'semi', color: 'light-blue', size: 's' })
	k.circle(x + 400, y + 160, 140, { color: 'red', size: 's' })
	k.circle(x + 330, y + 370, 140, { color: 'red', size: 's' })
	const s = o.scale
	const star = (cx, cy) => k.box(cx - 17 * s, cy - 17 * s, 34 * s, 34 * s, { geo: 'star', color: 'grey', fill: 'solid', size: 's' })
	const sq = (cx, cy) => k.box(cx - 8 * s, cy - 8 * s, 16 * s, 16 * s, { color: 'red', fill: 'semi', size: s > 1.5 ? 'm' : 's' })
	const label = (lx, ly, t) => k.text(lx, ly, t, { size: 's', scale: o.labelScale, color: 'black' })
	for (const [sx, sy] of o.stars) star(x + sx, y + sy)
	for (const [qx, qy] of o.squares) sq(x + qx, y + qy)
	for (const [lx, ly, t] of o.labels) label(x + lx, y + ly, t)
	k.text(x, y + H + 22, o.caption, { size: 'm', scale: 1.2, color: o.captionColor ?? 'black', w: W, align: 'middle' })
}

export default {
	name: 'In pixels',
	kicker: 'I · the problem',
	title: '…and here are the two pictures',
	source: 'openlayers task · Fig. 1 · schematic redraw, not the real screenshots',
	notes: "COVER\n• The two images that came with the report (Fig. 1), redrawn as a schematic\n• Left: what OpenLayers drew: the symbols are far too big and pile on top of each other, labels collide\n• Right: the reporter's Google Earth clipping: same symbols, small, sitting on their points\n• \"Now you see it in a second\": the picture says what the sentence couldn't\nCLICKS\n1 · the pile-up circled: same symbols, wrong size, wrong place (the issue's title: Align/Placement/Size)\nREF · Fig. 1 (openlayers); schematic, not the real screenshots",
	draw(k) {
		// OpenLayers: big symbols, piled up around the centre
		map(k, 170, 270, {
			id: 'ol', scale: 2.6, labelScale: 1.15, caption: 'what OpenLayers drew',
			stars: [[400, 95], [330, 440]],
			squares: [[360, 200], [395, 230], [440, 215], [420, 265], [380, 290], [455, 300]],
			labels: [[410, 175, 'AJ3672'], [430, 205, 'AJ3653 AJ3740'], [440, 240, 'DU2092'], [470, 290, 'AJ3742']],
		})
		// Google Earth: the same symbols, small and on their points
		map(k, 1050, 270, {
			id: 'ge', scale: 0.9, labelScale: 0.8, caption: 'Google Earth: how it should look', captionColor: 'grey',
			stars: [[400, 120], [330, 420]],
			squares: [[300, 180], [345, 235], [470, 225], [385, 285], [330, 330], [450, 300]],
			labels: [[415, 105, 'AZUP'], [240, 162, 'AJ3672'], [480, 212, 'AJ3740'], [395, 300, 'AJ3742'], [345, 410, 'AZST']],
		})

		k.loop(170 + 410, 270 + 245, 150, 130, { beat: 1, anim: 'wipe' })
		k.text(360, 900, 'same symbols: wrong size, wrong place', { size: 'l', scale: 1.15, color: 'red', rot: -1.5, beat: 1, anim: 'fade', w: 1200, align: 'middle' })
	},
}
