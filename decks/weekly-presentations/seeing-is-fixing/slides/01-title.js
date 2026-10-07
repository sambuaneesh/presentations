// Title: the name, hand-lettered; a little robot squinting through a magnifier at a broken page; and a finger that comes out of the screen at the presenter.
export default {
	name: 'Title',
	notes: "COVER\n• Paper: Seeing is Fixing (Huang, Zhang, Xie, Chen · TUM, NTU, SMU · arXiv 2506.16136, 2025)\n• One line: GUIRepair fixes bugs in GUI libraries by looking at them\n• Say who you are\nCLICKS\n1 · the finger pops out of the screen at you: \"presented by me\"\nREF · title page",
	draw(k) {
		k.text(160, 330, 'Seeing is Fixing', { size: 'xl', scale: 2.6 })
		k.underline(170, 520, 900, { color: 'red' })
		k.text(166, 580, 'cross-modal reasoning with multimodal LLMs\nfor visual software issue fixing', { size: 'l', scale: 1.1, color: 'grey' })
		k.text(166, 760, 'Kai Huang · Jian Zhang · Xiaofei Xie · Chunyang Chen', { size: 'm', scale: 1.1 })
		k.text(166, 810, 'arXiv 2506.16136 · June 2025', { size: 's', scale: 1.2, color: 'grey' })

		// a little robot squinting through a magnifying glass at a browser whose button has slid off the edge
		const wx = 1440, wy = 240, ww = 400, wh = 270
		k.box(wx, wy, ww, wh, { fill: 'solid', color: 'white', size: 'm', rot: 1 })
		k.pen([[wx + 4, wy + 48], [wx + ww - 4, wy + 50]], { size: 's', color: 'grey' })
		for (let i = 0; i < 3; i++) k.circle(wx + 30 + i * 26, wy + 25, 8, { size: 's', color: 'grey', fill: 'solid' })
		for (const [dy, w] of [[95, 230], [135, 290], [175, 180]]) k.pen([[wx + 40, wy + dy], [wx + 40 + w, wy + dy + 2]], { size: 's', color: 'grey', wob: 1 })
		k.box(wx + 300, wy + 205, 170, 62, { text: 'Submit', size: 's', fill: 'solid', color: 'blue', rot: 14 })
		k.text(wx + 330, wy + 300, 'oops', { size: 's', color: 'red', rot: -8 })
		// the robot
		const rx = 1215, ry = 300
		k.pen([[rx + 60, ry - 10], [rx + 62, ry - 50]], { size: 's' })
		k.circle(rx + 62, ry - 60, 10, { size: 's', color: 'red', fill: 'solid' })
		k.box(rx, ry - 10, 125, 100, { geo: 'rectangle', size: 'm', fill: 'semi', color: 'grey' })
		k.circle(rx + 38, ry + 32, 11, { size: 's', fill: 'fill', color: 'black' })
		k.box(rx + 70, ry + 30, 34, 8, { size: 's', fill: 'fill', color: 'black', rot: -6 })
		k.pen([[rx + 40, ry + 68], [rx + 62, ry + 74], [rx + 86, ry + 66]], { size: 's' })
		k.box(rx + 15, ry + 95, 95, 120, { geo: 'rectangle', size: 'm', fill: 'semi', color: 'grey' })
		// its arm, holding the magnifier up to the screen
		k.pen([[rx + 105, ry + 130], [rx + 165, ry + 115], [rx + 215, ry + 95]], { size: 'm' })
		k.pen([[rx + 215, ry + 95], [rx + 250, ry + 70]], { size: 'l', color: 'black' })
		k.circle(wx + 50, wy + 120, 62, { size: 'm', fill: 'semi', color: 'light-blue' })

		// presented by… and a finger that comes out of the screen, pointing at the presenter
		k.text(166, 862, 'presented by', { size: 'm', scale: 1.1, color: 'grey' })
		k.text(166, 894, 'Aneesh S', { size: 'xl', scale: 1.1 })
		k.underline(170, 962, 240, { color: 'red', size: 'm' })

		// Foreshortened hand, index finger pointing straight out of the screen (Uncle-Sam style).
		// Everything shares one origin (the fingertip) so it zooms out as one drawing.
		const FX = 1440, FY = 740
		const O = { beat: 1, anim: 'zoom', origin: [FX, FY] }
		// skin = a peach wash under an ink outline
		const skin = (x, y, w, h, geo, id) => {
			k.box(x, y, w, h, { geo, color: 'orange', fill: 'semi', dash: 'solid', size: 's', ...O, id: id + '-skin' })
			k.box(x, y, w, h, { geo, color: 'black', fill: 'none', dash: 'draw', size: 'm', ...O, id })
		}
		// cuff and wrist, going off to the lower right
		k.box(FX + 150, FY + 150, 190, 120, { geo: 'rectangle', color: 'blue', fill: 'semi', dash: 'draw', size: 'm', rot: -28, ...O, id: 'cuff' })
		// back of the fist
		skin(FX - 40, FY + 10, 290, 230, 'ellipse', 'fist')
		// three curled fingers, stacked under the index finger
		for (let i = 0; i < 3; i++) skin(FX - 60 + i * 12, FY + 60 + i * 52, 250 - i * 30, 62, 'oval', 'curl-' + i)
		// the thumb folded across them
		skin(FX - 120, FY + 70, 190, 58, 'oval', 'thumb')
		// the index finger seen end-on: the fingertip nearest to us, nail on top
		skin(FX - 92, FY - 92, 184, 184, 'ellipse', 'tip')
		k.box(FX - 40, FY - 84, 80, 44, { geo: 'oval', color: 'black', fill: 'none', dash: 'draw', size: 's', ...O, id: 'nail' })
		k.pen([[FX - 34, FY + 34], [FX - 8, FY + 48], [FX + 22, FY + 46]], { size: 's', color: 'grey', ...O, id: 'crease' })
		// motion rays on the open side: it's coming at you
		for (let i = 0; i < 8; i++) {
			const a = Math.PI * 0.92 + (i / 7) * Math.PI * 0.85
			const r0 = 125, r1 = 180
			k.pen([[FX + r0 * Math.cos(a), FY + r0 * Math.sin(a)], [FX + r1 * Math.cos(a), FY + r1 * Math.sin(a)]], { size: 'm', color: 'red', ...O, id: 'ray-' + i })
		}
		k.text(FX - 330, FY + 190, '(yes, him.)', { size: 'm', scale: 1.1, color: 'red', rot: -6, beat: 1, anim: 'fade', id: 'him' })
	},
}
