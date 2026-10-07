// Build steps ("beats") inside a slide. A click while presenting reveals the next beat before it
// moves on to the next slide.
//
// A slide's beat count is the largest of:
//   • any shape on it with a numeric `meta.beat` (that shape stays hidden until beat n),
//   • any shape on it with a numeric `meta.until` (that shape disappears at beat n),
//   • any shape on it with a numeric `meta.focus` (a camera step: the view glides to it at beat n), and
//   • any scene shape on it (its scene declares how many beats it animates through).
//
// Beat 0 is the slide as it first appears. While editing, every slide shows all of its beats,
// unless the top bar's step preview is pinning one slide to a particular beat.
import { getSlides, slideOf } from './slides.js'
import { presentIndex, presentBeat, previewBeat } from '../ui/state.js'
import { SCENES } from '../scenes/registry.js'

export function slideBeats(editor, slideId) {
	let n = 0
	for (const id of editor.getShapeAndDescendantIds([slideId])) {
		const s = editor.getShape(id)
		if (!s || s.id === slideId) continue
		if (s.type === 'scene') n = Math.max(n, SCENES[s.props.scene]?.beats ?? 0)
		if (typeof s.meta?.beat === 'number') n = Math.max(n, s.meta.beat)
		if (typeof s.meta?.until === 'number') n = Math.max(n, s.meta.until)
		if (typeof s.meta?.focus === 'number') n = Math.max(n, s.meta.focus)
	}
	return n
}

// The beat a slide is showing right now in this window (Infinity = everything).
export function shownBeat(editor, slideId) {
	const i = presentIndex.get()
	if (i >= 0) return getSlides(editor)[i]?.id === slideId ? presentBeat.get() : Infinity
	const p = previewBeat.get()
	if (p && p.slideId === slideId) return p.beat
	// A slide can be pinned at a step (meta.previewBeat), e.g. by `pres shot --step` for screenshots.
	const pinned = editor.getShape(slideId)?.meta?.previewBeat
	return typeof pinned === 'number' ? pinned : Infinity
}

// For config.getShapeVisibility: hide shapes whose beat hasn't come yet, and those whose `until` has.
export function beatVisibility(shape, editor) {
	const beat = shape.meta?.beat
	const until = shape.meta?.until
	if (typeof beat !== 'number' && typeof until !== 'number') return 'inherit'
	const slide = slideOf(editor, shape.id)
	if (!slide) return 'inherit'
	const shown = shownBeat(editor, slide.id)
	if (typeof beat === 'number' && shown < beat) return 'hidden'
	if (typeof until === 'number' && shown >= until) return 'hidden'
	return 'inherit'
}
