// First the paper's own Fig. 8, as printed. Click 1 swaps it for our hand-drawn version: five petals,
// only the unique counts and the five-way core. Click 2 circles the two 12s and says what they mean.
export default {
	name: 'Unique fixes',
	kicker: 'IV · results',
	title: 'Different eyes see different bugs',
	titleScale: 1.25,
	source: 'Fig. 8 · §V-A · only unique fixes and the five-way core shown',
	notes: "COVER\n• Overlap of the top five systems: 92 solved by all\n• Unique fixes: GUIRepair 12, Globant 12, Zencoder 11, Agentless Lite 3 / 2\n• Close totals (157 vs 153) but different bugs: complementary, not duplicative\nCLICKS\n1 · the two 12s circled\nREF · Fig. 8 · §V-A",
	draw(k) {
		// the figure as printed in the paper; gone at the click
		k.image(585, 240, 750, 641, 'fig8-venn.webp', { alt: 'Fig. 8 of the paper', until: 1 })

		const on = { beat: 1, anim: 'fade' }
		const cx = 700, cy = 585, off = 82, rx = 125, ry = 245
		const P = [
			['Zencoder', 'blue', 11],
			['AgentlessL-C', 'orange', 3],
			['AgentlessL-G', 'violet', 2],
			['GUIRepair', 'yellow', 12],
			['Globant', 'green', 12],
		]
		const petal = (px, py, deg, o) => {
			const t = (deg * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t)
			const x = px - (c * rx - s * ry), y = py - (s * rx + c * ry)
			return k.box(x, y, 2 * rx, 2 * ry, { geo: 'ellipse', rot: deg, ...o, ...on })
		}
		P.forEach(([name, color, n], i) => {
			const a = ((-90 + i * 72) * Math.PI) / 180
			const px = cx + Math.cos(a) * off, py = cy + Math.sin(a) * off
			petal(px, py, i * 72, { fill: 'solid', color, opacity: 0.4, size: 's' })
			petal(px, py, i * 72, { color, size: 'm', opacity: 0.9 })
		})
		P.forEach(([name, color, n], i) => {
			const a = ((-90 + i * 72) * Math.PI) / 180
			const nx = cx + Math.cos(a) * 250, ny = cy + Math.sin(a) * 250
			const big = n === 12
			k.text(nx - 60, ny - 34, String(n), { size: 'xl', scale: big ? 1.3 : 1.05, w: 120, align: 'middle', ...on })
			const lr = i === 0 ? 360 : 425
			const lx = cx + Math.cos(a) * lr, ly = cy + Math.sin(a) * lr
			k.text(lx - 130, ly - 20, name, { size: 'm', scale: 1.05, color: 'grey', w: 260, align: 'middle', ...on })
		})
		k.text(cx - 80, cy - 42, '92', { size: 'xl', scale: 1.6, w: 160, align: 'middle', ...on })
		k.text(1270, 290, 'fixed by all five', { size: 'l', scale: 1.15, color: 'grey', rot: -2, ...on })
		k.arrow([1260, 330], [cx + 100, cy - 45], { color: 'grey', bend: 25, ...on })
		// click 2: the two twelves circled, and what they mean
		const then = { beat: 2, anim: 'fade' }
		const g = ((-90 + 3 * 72) * Math.PI) / 180, b = ((-90 + 4 * 72) * Math.PI) / 180
		k.loop(cx + Math.cos(g) * 250, cy + Math.sin(g) * 250 - 2, 62, 50, { beat: 2, anim: 'wipe' })
		k.loop(cx + Math.cos(b) * 250, cy + Math.sin(b) * 250 - 2, 62, 50, { beat: 2, anim: 'wipe' })
		k.text(1260, 660, 'GUIRepair and Globant\neach solve 12\nthe others don\'t', { size: 'l', scale: 1.15, color: 'red', rot: -2, ...then })
		k.text(1270, 880, '(157 vs 153 in total)', { size: 'm', scale: 1.05, color: 'grey', ...then })
	},
}
