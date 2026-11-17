// While presenting, only the slide being shown (and, a moment later, its neighbours) is rendered.
//
// A deck keeps every slide on one page, so a 40-slide deck has thousands of shapes in the page;
// tldraw re-checks all of them on every click even though one slide is visible. Hiding the other
// slides (config.getShapeVisibility) takes them out of the page entirely, which makes a click a
// fraction of the work. The neighbours of the new slide are mounted only after it has painted,
// so the next click finds its slide ready and never waits for it to be built.
//
// Kept rendered all the same:
//   • slides with shape types of their own (scenes, a deck's ext/ shapes): they may hold state
//     in their components, which unmounting would reset;
//   • slides asked for with keepSlideMounted (e.g. to export a thumbnail of them).
import { atom, computed, react, unsafe__withoutCapture } from 'tldraw'
import { presentIndex } from '../ui/state.js'
import { getSlides } from './slides.js'

const warm = atom('pp:warm', -1) // the slide whose neighbours are rendered too (-1: none yet)
const kept = atom('pp:kept', new Map()) // slide id → how many requests keep it rendered
const stateful = atom('pp:stateful', new Set()) // slide ids with non-tldraw shapes (set when presenting starts)

const DEFAULT_TYPES = new Set(['frame', 'geo', 'text', 'draw', 'arrow', 'line', 'note', 'image', 'video', 'highlight', 'embed', 'bookmark', 'group'])

const indexCache = new WeakMap()
function slideIndex(editor) {
	let c = indexCache.get(editor)
	if (!c) {
		c = computed('pp:slideIndex', () => new Map(getSlides(editor).map((s, i) => [s.id, i])))
		indexCache.set(editor, c)
	}
	return c.get()
}

// For getShapeVisibility: 'hidden' for a slide that isn't needed right now, else null.
export function slideWindowVisibility(shape, editor) {
	if (shape.type !== 'frame' || shape.parentId !== editor.getCurrentPageId()) return null
	const i = presentIndex.get()
	if (i < 0) return null
	const k = slideIndex(editor).get(shape.id)
	if (k === undefined || k === i) return null
	const w = warm.get()
	if (w >= 0 && Math.abs(k - w) <= 1) return null
	if (kept.get().has(shape.id) || stateful.get().has(shape.id)) return null
	return 'hidden'
}

// Keep a slide rendered while presenting (until the returned function is called).
export function keepSlideMounted(slideId) {
	const next = new Map(kept.get())
	next.set(slideId, (next.get(slideId) ?? 0) + 1)
	kept.set(next)
	let done = false
	return () => {
		if (done) return
		done = true
		const m = new Map(kept.get())
		const n = (m.get(slideId) ?? 1) - 1
		if (n > 0) m.set(slideId, n)
		else m.delete(slideId)
		kept.set(m)
	}
}

function statefulSlides(editor) {
	const ids = new Set()
	for (const slide of getSlides(editor)) {
		for (const id of editor.getShapeAndDescendantIds([slide.id])) {
			const s = editor.getShape(id)
			if (s && !DEFAULT_TYPES.has(s.type)) {
				ids.add(slide.id)
				break
			}
		}
	}
	return ids
}

// Run once per editor where a deck is shown (BeatStyles does): follows the slide being presented
// and widens the window to its neighbours once it has painted.
export function watchSlideWindow(editor) {
	let timer = null
	let frame = null
	let wasPresenting = false
	const stop = react('pp:slideWindow', () => {
		const i = presentIndex.get()
		clearTimeout(timer)
		cancelAnimationFrame(frame)
		if (i < 0) {
			wasPresenting = false
			timer = setTimeout(() => warm.set(-1), 0)
			return
		}
		if (!wasPresenting) {
			wasPresenting = true
			// (read without subscribing: this reaction should only follow the slide index)
			stateful.set(unsafe__withoutCapture(() => statefulSlides(editor)))
		}
		// after the new slide's frame is painted, then once the browser is free
		frame = requestAnimationFrame(() => {
			timer = setTimeout(() => warm.set(presentIndex.get()), 30)
		})
	})
	return () => {
		stop()
		clearTimeout(timer)
		cancelAnimationFrame(frame)
	}
}
