// The seven steps of GUIRepair (Fig. 4, §III), one box per click, joined by real bound arrows.
// Workaround: helpers.createArrowBetweenShapes drops color/size/dash, so restyle bound arrows by tag
// right after the kit creates them (a microtask queued here runs once buildSlide has finished).
function styleArrows(k, styles) {
	queueMicrotask(() => {
		const want = new Map(Object.entries(styles).map(([t, p]) => [k.tag(t), p]))
		const all = editor.getCurrentPageShapes().filter((s) => s.type === 'arrow' && s.meta?.tag && want.has(k.tag(s.meta.tag)))
		editor.run(() => editor.updateShapes(all.map((s) => ({ id: s.id, type: 'arrow', props: want.get(k.tag(s.meta.tag)) }))), { ignoreShapeLock: true })
	})
}

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
	name: 'Seven steps',
	kicker: 'II · the method',
	title: 'Seven steps',
	source: 'Fig. 4 · §III',
	notes: "COVER\n• Classic APR pipeline, agentless (a fixed workflow, not an agent loop)\n• 1–2 Image2Code (comprehension) · 3–5 agentless core (localize, generate) · 6–7 Code2Image (validation)\n• Only the top-ranked patch is submitted (Pass@1)\nCLICKS\n1–7 · one step each; brackets appear with their steps\nREF · §III · Fig. 4",
	draw(k) {
		// the paper's own overview (Fig. 4), as printed; gone at click 1
		taped(k, 210, 250, 1500, 650, 'fig4.webp', { alt: 'Fig. 4: the overview of GUIRepair', caption: 'Fig. 4, as printed', until: 1 })

		const first = { beat: 1, anim: 'fade' }
		const steps = ['knowledge mining', 'repro generation', 'file localization', 'hunk localization', 'patch generation', 'GUI rendering', 'patch selection']
		const w = 200, gap = 45, y = 520, h = 170, x0 = 125
		const X = (i) => x0 + i * (w + gap)
		// click 3: the camera dives into steps 1–2; everything from step 3 on steps aside
		const rest = (i) => (i >= 2 ? { until: 3 } : {})
		steps.forEach((s, i) => {
			const inI2C = i < 2, inC2I = i > 4
			k.box(X(i), y, w, h, { text: s, size: 'm', color: 'black', rot: (i % 2 ? 1 : -1) * 0.8, id: 's' + i, ...first, ...rest(i) })
			k.text(X(i), y - 60, String(i + 1), { size: 'l', color: inI2C || inC2I ? 'red' : 'grey', align: 'middle', w, id: 'num' + i, ...first, ...rest(i) })
			if (i > 0) k.arrow('s' + (i - 1), 's' + i, { id: 'a' + i, ...first, ...rest(i) })
		})
		const on = { beat: 2, anim: 'fade' }
		// the four APR stages from the previous slide, over their steps
		const stage = (i0, i1, label, o = {}) => {
			const a = X(i0), b = X(i1) + w, yy = y - 150
			k.pen([[a, yy + 24], [a + 4, yy + 8], [b - 4, yy + 8], [b, yy + 24]], { color: 'grey', size: 's', wob: 1, ...on, ...o })
			k.text(a - 30, yy - 46, label, { size: 'm', scale: 1.1, color: 'grey', align: 'middle', w: b - a + 60, ...on, ...o })
		}
		stage(0, 1, 'understand the bug')
		stage(2, 3, 'find where', rest(2))
		stage(4, 4, 'write the fix', rest(2))
		stage(5, 6, 'check it', rest(2))
		// brackets under the boxes: what GUIRepair adds, and the agentless core in between
		const bracket = (i0, i1, label, color, id, sub, o = {}) => {
			const a = X(i0), b = X(i1) + w, yy = y + h + 50
			k.pen([[a, yy - 18], [a + 4, yy], [(a + b) / 2 - 12, yy + 2], [(a + b) / 2, yy + 20], [(a + b) / 2 + 12, yy + 2], [b - 4, yy], [b, yy - 18]], { color, size: 'l', wob: 2, id, ...on, ...o })
			k.text(a - 40, yy + 40, label, { size: 'xl', color, align: 'middle', w: b - a + 80, id: id + '-t', ...on, ...o })
			if (sub) k.text(a - 40, yy + 110, sub, { size: 's', scale: 1.15, color: 'grey', align: 'middle', w: b - a + 80, ...on, ...o })
		}
		bracket(0, 1, 'Image2Code', 'red', 'b-i2c')
		bracket(2, 4, 'agentless core', 'grey', 'b-core', 'agentless: fixed steps, no agent loop', rest(2))
		bracket(5, 6, 'Code2Image', 'red', 'b-c2i', undefined, rest(2))
		// the camera frame for the dive: steps 1–2 with their stage and bracket, 16:9; once it lands,
		// the talk carries on into step 1 by itself
		k.box(40, 320, 900, 506, { color: 'white', opacity: 0, size: 's', focus: 3, advance: true })
		const st = {}
		for (let i = 1; i < 7; i++) st['a' + i] = { color: 'black', size: 'm' }
		styleArrows(k, st)
	},
}
