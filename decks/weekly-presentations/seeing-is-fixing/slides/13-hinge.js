// The hinge, told with a twist. Click 1: the clean story (Image2Code writes the repro code, Code2Image
// replays it, a fixed picture). Click 2: the catch: the same code on the same library gives the same bug.
// Click 3: the truth: each candidate patch goes into the library, it's rebuilt, and the same repro code
// runs again: one render per patched build. The code never changes, only the library under it (§III-D1).
// Workaround: helpers.createArrowBetweenShapes drops color/size/dash, so restyle bound arrows by tag
// right after the kit creates them (a microtask queued here runs once buildSlide has finished).
function styleArrows(k, styles) {
	queueMicrotask(() => {
		const want = new Map(Object.entries(styles).map(([t, p]) => [k.tag(t), p]))
		const all = editor.getCurrentPageShapes().filter((s) => s.type === 'arrow' && s.meta?.tag && want.has(k.tag(s.meta.tag)))
		editor.run(() => editor.updateShapes(all.map((s) => ({ id: s.id, type: 'arrow', props: want.get(k.tag(s.meta.tag)) }))), { ignoreShapeLock: true })
	})
}

// A little print of the picture: mountain, plus a sun (the bug as reported) or nothing.
function print(k, x, y, o = {}) {
	const { sun = true, rot = 0, ...rest } = o
	k.box(x, y, 360, 260, { fill: 'solid', color: 'white', size: 'm', rot, ...rest, id: rest.id })
	const id = rest.id ? { id: undefined } : {}
	const pass = { ...rest, ...id }
	delete pass.id
	k.pen([[x + 35, y + 225], [x + 120, y + 120], [x + 170, y + 175], [x + 235, y + 95], [x + 330, y + 225]], { size: 'l', wob: 3, ...pass })
	if (sun) k.circle(x + 290, y + 70, 26, { size: 'm', ...pass })
}

export default {
	name: 'The hinge',
	kicker: 'II · the method · the idea',
	title: 'The hinge',
	source: '§III-D1 · §IV-D · §V-B4',
	draw(k) {
		// the bug, as reported, and the repro code with its hinge doodle
		print(k, 150, 400, { rot: -2, id: 'pic' })
		k.text(150, 690, 'the bug, as seen', { size: 'l', color: 'grey', align: 'middle', w: 360 })
		k.box(760, 360, 400, 340, { fill: 'solid', color: 'white', size: 'l', id: 'code' })
		k.text(800, 400, '<script>\n  render(\n    <Bug />\n  )\n</script>', { font: 'mono', size: 'm', scale: 1.1, color: 'blue' })
		k.text(760, 730, 'repro code', { size: 'xl', align: 'middle', w: 400 })
		k.box(1030, 560, 44, 110, { size: 's' })
		k.box(1084, 560, 44, 110, { size: 's' })
		k.pen([[1079, 548], [1079, 684]], { size: 'l' })
		for (const [x, y] of [[1052, 585], [1052, 645], [1106, 585], [1106, 645]]) k.circle(x, y, 5, { size: 's', fill: 'fill', color: 'black' })

		// click 1: the clean story
		const one = { beat: 1, anim: 'fade' }
		k.arrow('pic', 'code', { ...one, id: 'i2c', bend: -60 })
		k.text(470, 280, 'Image2Code writes it', { size: 'l', color: 'red', align: 'middle', w: 440, rot: -3, ...one })
		k.arrow([1175, 520], [1395, 520], { ...one, id: 'c2i', color: 'green', size: 'xl', bend: -40 })
		k.text(1030, 280, 'Code2Image replays it', { size: 'l', color: 'green', align: 'middle', w: 440, rot: 3, ...one, until: 3 })
		print(k, 1410, 400, { sun: false, rot: 2, beat: 1, anim: 'drop', until: 2 })
		k.tick(1680, 430, 50, { beat: 1, until: 2 })
		k.text(1410, 690, 'the fix, rendered', { size: 'l', color: 'grey', align: 'middle', w: 360, beat: 1, until: 2 })

		// click 2: the catch: same code, same library, same bug
		print(k, 1410, 400, { rot: 2, beat: 2, anim: 'pop', until: 3 })
		k.text(1330, 690, 'same code + same library\n= same bug', { size: 'l', color: 'red', align: 'middle', w: 520, rot: -2, beat: 2, anim: 'fade', until: 3 })

		// click 3: the truth: a patch goes in, the library is rebuilt, the same code runs again, per patch
		const three = { beat: 3, anim: 'fade' }
		k.text(980, 250, 'Code2Image re-runs it\non each patched build', { size: 'l', color: 'green', align: 'middle', w: 600, rot: 3, ...three })
		k.box(1205, 600, 190, 130, { fill: 'solid', color: 'white', size: 's', rot: -3, beat: 3, anim: 'drop' })
		k.text(1225, 610, 'a patch', { size: 'm', rot: -3, ...three })
		k.text(1228, 655, '- old', { font: 'mono', size: 'm', color: 'red', rot: -3, ...three })
		k.text(1228, 688, '+ new', { font: 'mono', size: 'm', color: 'green', rot: -3, ...three })
		k.arrow([1300, 595], [1300, 535], { size: 'm', ...three })
		print(k, 1450, 360, { sun: false, rot: 4, beat: 3, anim: 'drop' })
		print(k, 1430, 380, { rot: -1, beat: 3, anim: 'drop' })
		print(k, 1410, 400, { sun: false, rot: 2, beat: 3, anim: 'drop' })
		k.text(1390, 690, 'one render\nper patched build', { size: 'l', color: 'grey', align: 'middle', w: 400, ...three })
		k.text(160, 860, 'the code never changes; only the library under it does', { size: 'xl', align: 'middle', w: 1600, ...three })

		styleArrows(k, { i2c: { color: 'red', size: 'xl' } })
	},
}
