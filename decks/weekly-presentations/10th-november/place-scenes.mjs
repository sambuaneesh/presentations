// Puts each slide's animated scene back into its frame: `pres build` draws code slides as native shapes only and
// drops scene shapes. Slide NN-<id> gets scene <id> (registered in ext/index.js). Run after every `pres build`:
//   node presentations/10th-november/place-scenes.mjs
import { findDoc, exec } from '/home/stealthspectre/Work/tries/2026-09-24-weekly-presentation/presentation-pack/bin/tl.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const doc = await findDoc(path.join(here, '10th-november.tldraw'))
console.log(await exec(doc.id, `
	const out = []
	editor.run(() => {
		for (const f of editor.getCurrentPageShapes().filter((s) => s.type === 'frame')) {
			const m = String(f.id).match(/^shape:paper-\\d+-(.+)$/)
			if (!m) continue
			const kids = editor.getSortedChildIdsForParent(f.id).map((id) => editor.getShape(id))
			editor.deleteShapes(kids.filter((s) => s.type === 'scene').map((s) => s.id))
			editor.createShape({ type: 'scene', parentId: f.id, x: 0, y: 0, isLocked: true, props: { w: 1920, h: 1080, scene: m[1] }, meta: { role: 'scene' } })
			out.push(f.props.name + ' → ' + m[1])
		}
	}, { ignoreShapeLock: true })
	await helpers.saveDoc()
	return out
`))
