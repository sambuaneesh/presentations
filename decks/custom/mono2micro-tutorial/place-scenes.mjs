// Post-build step. Puts the scenes back into their slides (class board, workflow trace), and repaints the section
// kickers grey (red is reserved for the cut). `pres build` draws code slides as native shapes only and
// drops scene shapes. Slide NN-<id> gets scene <id> (registered in ext/index.js). Run after every `pres build`:
//   node presentations/mono2micro-tutorial/place-scenes.mjs
import { findDoc, exec } from '/home/stealthspectre/Work/tries/2026-09-24-weekly-presentation/presentation-pack/bin/tl.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const doc = await findDoc(path.join(here, 'mono2micro-tutorial.tldraw'))
console.log(await exec(doc.id, `
	const out = []
	editor.run(() => {
		for (const f of editor.getCurrentPageShapes().filter((s) => s.type === 'frame')) {
			const m = String(f.id).match(/^shape:paper-[^-]+-(.+)$/)
			const SCENE = { 'class-board': 'class-board', 'class-all': 'class-all', 'workflow-trace': 'workflow-trace', game: 'game-control' }[m?.[1]]
			if (!SCENE) continue // only the board slides carry a scene
			const kids = editor.getSortedChildIdsForParent(f.id).map((id) => editor.getShape(id))
			editor.deleteShapes(kids.filter((s) => s.type === 'scene').map((s) => s.id))
			const small = SCENE === 'game-control' // the control panel sits small in the slide's bottom-right corner, beside the QR code
			editor.createShape({ type: 'scene', parentId: f.id, x: small ? 1480 : 0, y: small ? 820 : 0, isLocked: true, props: { w: small ? 400 : 1920, h: small ? 225 : 1080, scene: SCENE }, meta: { role: 'scene' } })
			out.push(f.props.name + ' → ' + SCENE)
		}
	}, { ignoreShapeLock: true })
	// the design rule "red is only the cut": the template draws section kickers in the accent colour; repaint them grey
	editor.run(() => {
		const ks = editor.getCurrentPageShapes().filter((s) => s.meta?.role === 'kicker' && s.props.color !== 'grey')
		editor.updateShapes(ks.map((s) => ({ id: s.id, type: s.type, props: { color: 'grey' } })))
		out.push(ks.length + ' kickers → grey')
	}, { ignoreShapeLock: true })
	await helpers.saveDoc()
	return out
`))
