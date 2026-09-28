// The animated scene ('icsa-behavioural', in ext/icsa.js) is added into this slide's frame after it is built;
// its id carries this slide's prefix, so rebuilding the slide replaces it.
export default {
	name: 'Where her diagrams go',
	notes: 'COVER\n• only the final call changes; everything upstream is the stored DeepSeek v4.1 Flash run (repetition 1), byte-identical\n• her four model files are appended unchanged as a sixth artifact block, in Mermaid text\n• input tokens: PetClinic 18,380 → 46,227 · PartsUnlimited 41,745 → 143,901\n• both decompositions are scored by the same blinded evaluator\nCLICKS\n1 · reuse · 2 · her models join · 3 · evaluation · 4 · what came out\nREF · studies/behavioural-models-side-v1/run_side_study.py',
	draw(k) {
		setTimeout(() => editor.run(() => {
			const id = createShapeId('06-where-it-goes-scene')
			if (editor.getShape(id)) editor.deleteShapes([id])
			editor.createShape({ id, type: 'scene', parentId: createShapeId('paper-06-where-it-goes'), x: 0, y: 0, isLocked: true,
				props: { w: 1920, h: 1080, scene: 'icsa-behavioural' }, meta: { role: 'scene' } })
		}, { ignoreShapeLock: true }), 300)
	},
}
