// The five LLM-generated architectural views of the ICSA pipeline's Phase 2 (§III-B): A1 component diagram,
// A2 component overview table, A3 API endpoints (when present), A4 technology map, A5 dynamic interaction views.
// §IV-B: A1–A4 were the "standard static views"; A5 captures temporal dependencies. Each note has a tiny sketch.
// Click 1–5 one view each, 6 the static / dynamic split.
export default {
	name: 'Five views',
	kicker: 'III · enter the LLM',
	title: 'What would an architect look at?',
	source: 'ICSA 2026 · §III-B (Phase 2) and §IV-B',
	draw(k) {
		const V = [
			['A1', 'component\ndiagram', 'light-blue'], ['A2', 'component\noverview\ntable', 'light-blue'], ['A3', 'API\nendpoints', 'light-blue'],
			['A4', 'technology\nmap', 'light-blue'], ['A5', 'dynamic\ninteractions', 'light-violet'],
		]
		V.forEach(([a, t, c], i) => {
			const x = 110 + i * 345, y = 330 + (i % 2) * 50, b = 1, d = i * 220
			k.note(x, y, '', { color: c, size: 'm', scale: 1.45, rot: [-2, 2, -1, 3, -2][i], beat: b, anim: 'drop', delay: d })
			k.text(x + 24, y + 18, a, { size: 'xl', color: i === 4 ? 'violet' : 'black', beat: b, anim: 'fade', delay: d + 150 })
			k.text(x + 24, y + 90, t, { size: 'l', beat: b, anim: 'fade', delay: d + 150 })
			// tiny sketches
			const sx = x + 40, sy = y + 205
			if (i === 0) { k.box(sx, sy, 70, 40, { size: 's', beat: b, anim: 'fade', delay: d + 300 }); k.box(sx + 140, sy, 70, 40, { size: 's', beat: b, anim: 'fade', delay: d + 300 }); k.arrow([sx + 72, sy + 20], [sx + 138, sy + 20], { size: 's', beat: b, delay: d + 300 }) }
			if (i === 1) for (let r = 0; r < 2; r++) k.pen([[sx, sy + 50 + r * 16], [sx + 210, sy + 50 + r * 16]], { size: 's', beat: b, anim: 'wipe', delay: d + 300 + r * 80 })
			if (i === 2) k.text(sx, sy - 6, 'GET /owners\nGET /vets', { font: 'mono', size: 'm', beat: b, anim: 'fade', delay: d + 300 })
			if (i === 3) k.text(sx, sy - 6, 'Spring · JPA\nThymeleaf', { font: 'mono', size: 'm', beat: b, anim: 'fade', delay: d + 300 })
			if (i === 4) for (let r = 0; r < 3; r++) k.arrow([sx + r * 10, sy + r * 18], [sx + 200 - r * 30, sy + r * 18], { size: 's', color: 'violet', beat: b, delay: d + 300 + r * 120 })
		})
		k.pen([[120, 720], [1430, 720]], { size: 'm', beat: 2, anim: 'wipe' })
		k.text(560, 740, 'static: what the system IS', { size: 'l', beat: 2, anim: 'fade' })
		k.pen([[1495, 720], [1800, 720]], { size: 'm', color: 'violet', beat: 2, anim: 'wipe', delay: 300 })
		k.text(1495, 740, 'dynamic:\nwhat it DOES', { size: 'l', color: 'violet', beat: 2, anim: 'fade', delay: 300 })
	},
}
