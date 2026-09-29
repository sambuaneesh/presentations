// Laser and highlighter over the deck's own interactive parts. While presenting, the pack's present tool
// turns a press-and-drag on the canvas into a laser scribble or a highlighter stroke. Presses on this
// deck's buttons, terms, drawers and sheets never reach the canvas (they must not advance the slide), so
// this does the same drawing itself when such a press turns into a drag, following the pack's
// Laser / Highlight setting, and swallows the click that ends the drag. Plain clicks are untouched.
import { useEffect } from 'react'
import { useMaybeEditor, createShapeId, compressLegacySegments } from 'tldraw'
import { annotateMode } from '@pack/ui/state.js'

export function useAnnotate(ref) {
	const editor = useMaybeEditor?.()
	useEffect(() => {
		const root = ref.current
		if (!root || !editor) return
		let d = null
		let swallowClick = false
		const page = (e) => editor.screenToPage({ x: e.clientX, y: e.clientY })
		const frameAt = (p) => editor.getCurrentPageShapes().find((s) => s.type === 'frame' && editor.getShapePageBounds(s.id)?.containsPoint(p))

		const start = (p) => {
			if (annotateMode.get() === 'highlight') {
				const frame = frameAt(p)
				const ox = frame ? frame.x : 0, oy = frame ? frame.y : 0
				const id = createShapeId()
				d.stroke = { id, x: p.x - ox, y: p.y - oy, ox, oy, points: [{ x: 0, y: 0, z: 0.5 }] }
				editor.createShape({ id, type: 'highlight', parentId: frame?.id, x: p.x - ox, y: p.y - oy,
					props: { color: 'yellow', size: 'l', scale: 2, segments: compressLegacySegments([{ type: 'free', points: d.stroke.points }]) }, meta: { annotation: true } })
			} else {
				d.scribble = editor.scribbles.addScribble({ color: 'laser', opacity: 0.7, size: 12, delay: 1200, shrink: 0.05, taper: true }).id
			}
		}
		const extend = (p) => {
			if (d.stroke) {
				const s = d.stroke
				s.points.push({ x: p.x - s.ox - s.x, y: p.y - s.oy - s.y, z: 0.5 })
				editor.updateShape({ id: s.id, type: 'highlight', props: { segments: compressLegacySegments([{ type: 'free', points: s.points }]) } })
			} else if (d.scribble) editor.scribbles.addPoint(d.scribble, p.x, p.y, 0.5)
		}
		const move = (e) => {
			if (!d) return
			if (!d.started) {
				if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return
				d.started = true
				window.getSelection?.()?.removeAllRanges()
				start(d.first)
			}
			e.preventDefault()
			extend(page(e))
		}
		const up = () => {
			window.removeEventListener('pointermove', move, true)
			window.removeEventListener('pointerup', up, true)
			if (d?.started) {
				if (d.scribble) editor.scribbles.stop(d.scribble)
				if (d.stroke) editor.updateShape({ id: d.stroke.id, type: 'highlight', props: { isComplete: true } })
				swallowClick = true
				setTimeout(() => (swallowClick = false), 400)
			}
			d = null
		}
		// Only presses on the deck's own interactive elements land here: everything else on a scene lets
		// pointer events through to the canvas, where the present tool draws as usual.
		const down = (e) => {
			if (e.button !== 0 || editor.getCurrentToolId() !== 'present' || editor.getIsReadonly()) return
			if (/^(input|textarea|select)$/i.test(e.target?.tagName ?? '')) return
			d = { x: e.clientX, y: e.clientY, first: page(e), started: false }
			window.addEventListener('pointermove', move, true)
			window.addEventListener('pointerup', up, true)
		}
		const click = (e) => {
			if (!swallowClick) return
			swallowClick = false
			e.stopPropagation()
			e.preventDefault()
		}
		root.addEventListener('pointerdown', down, true)
		root.addEventListener('click', click, true)
		return () => {
			root.removeEventListener('pointerdown', down, true)
			root.removeEventListener('click', click, true)
			window.removeEventListener('pointermove', move, true)
			window.removeEventListener('pointerup', up, true)
		}
	}, [editor, ref])
}
