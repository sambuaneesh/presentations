// Live slide thumbnails: re-rendered (debounced) whenever anything on the slide changes.
import { useEffect, useState } from 'react'
import { useValue } from 'tldraw'

const cache = new Map() // slideId -> { sig, url }

// Thumbnails are made one at a time, when the browser is idle, so opening a deck (or editing a
// slide) never waits for 40 pictures to render at once.
let queue = Promise.resolve()
const idle = () => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 1500 }) : setTimeout(r, 50)))
function inTurn(job) {
	const run = queue.then(idle).then(job)
	queue = run.catch(() => {})
	return run
}

function signature(editor, slideId) {
	let sig = ''
	for (const id of editor.getShapeAndDescendantIds([slideId])) {
		const s = editor.getShape(id)
		if (!s) continue
		sig += `${s.id}${s.x},${s.y},${s.rotation},${s.opacity}${JSON.stringify(s.props)}|`
	}
	return sig
}

export function useThumbnail(editor, slideId) {
	const sig = useValue('thumb:' + slideId, () => signature(editor, slideId), [editor, slideId])
	const [url, setUrl] = useState(() => cache.get(slideId)?.url ?? null)

	useEffect(() => {
		const cached = cache.get(slideId)
		if (cached && cached.sig === sig) {
			setUrl(cached.url)
			return
		}
		let cancelled = false
		const timer = setTimeout(() => inTurn(async () => {
			if (cancelled) return
			try {
				const { blob } = await editor.toImage([slideId], { format: 'png', scale: 0.18, background: true, padding: 0 })
				if (cancelled) return
				const next = URL.createObjectURL(blob)
				const old = cache.get(slideId)
				cache.set(slideId, { sig, url: next })
				setUrl(next)
				if (old?.url) setTimeout(() => URL.revokeObjectURL(old.url), 1000)
			} catch {}
		}), cached ? 450 : 300)
		return () => {
			cancelled = true
			clearTimeout(timer)
		}
	}, [editor, slideId, sig])

	return url
}
