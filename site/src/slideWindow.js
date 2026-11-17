// While presenting, render only the slide being shown and (once it has painted) its neighbours.
// Packs from version 9 do this themselves (presentation-pack/script/lib/window.js, which explains
// why); for decks frozen to an older pack the site does the same here, so every deck on the
// website gets quick clicks. Everything below is only used when the pack lacks keepSlideMounted.
import { atom, computed, react, unsafe__withoutCapture } from 'tldraw'

const DEFAULT_TYPES = new Set(['frame', 'geo', 'text', 'draw', 'arrow', 'line', 'note', 'image', 'video', 'highlight', 'embed', 'bookmark', 'group'])

const warm = atom('site:warm', -1)
const kept = atom('site:kept', new Map())
const stateful = atom('site:stateful', new Set())
const indexCache = new WeakMap()

function slideIndex(P, editor) {
	let c = indexCache.get(editor)
	if (!c) {
		c = computed('site:slideIndex', () => new Map(P.getSlides(editor).map((s, i) => [s.id, i])))
		indexCache.set(editor, c)
	}
	return c.get()
}

// The getShapeVisibility to give tldraw for this pack version.
// (?window=off in the address turns the site's windowing off, to compare.)
export function shapeVisibilityFor(P) {
	if (P.keepSlideMounted || new URLSearchParams(location.search).get('window') === 'off') return P.getShapeVisibility
	return (shape, editor) => {
		if (shape.type === 'frame' && shape.parentId === editor.getCurrentPageId()) {
			const i = P.presentIndex.get()
			if (i >= 0) {
				const k = slideIndex(P, editor).get(shape.id)
				const w = warm.get()
				const near = k === undefined || k === i || (w >= 0 && Math.abs(k - w) <= 1)
				if (!near && !kept.get().has(shape.id) && !stateful.get().has(shape.id)) return 'hidden'
			}
		}
		return P.getShapeVisibility(shape, editor)
	}
}

// Keep one slide rendered while presenting (to export a picture of it); returns the release.
export function keepMounted(P, slideId) {
	if (P.keepSlideMounted) return P.keepSlideMounted(slideId)
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

// Follow the presented slide and widen to its neighbours after it has painted. Returns the stop
// function (nothing to do for packs that window themselves).
export function watchSlideWindow(P, editor) {
	if (P.keepSlideMounted) return () => {}
	let timer = null
	let frame = null
	let wasPresenting = false
	const stop = react('site:slideWindow', () => {
		const i = P.presentIndex.get()
		clearTimeout(timer)
		cancelAnimationFrame(frame)
		if (i < 0) {
			wasPresenting = false
			timer = setTimeout(() => warm.set(-1), 0)
			return
		}
		if (!wasPresenting) {
			wasPresenting = true
			stateful.set(
				unsafe__withoutCapture(() => {
					const ids = new Set()
					for (const slide of P.getSlides(editor))
						for (const id of editor.getShapeAndDescendantIds([slide.id]))
							if (!DEFAULT_TYPES.has(editor.getShape(id)?.type ?? 'frame')) {
								ids.add(slide.id)
								break
							}
					return ids
				})
			)
		}
		frame = requestAnimationFrame(() => {
			timer = setTimeout(() => warm.set(P.presentIndex.get()), 30)
		})
	})
	return () => {
		stop()
		clearTimeout(timer)
		cancelAnimationFrame(frame)
	}
}
