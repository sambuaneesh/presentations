// While a deck is presented, every slide but the current one renders its scene finished (b = Infinity, still); on
// arrival b drops to 0. Without care, CSS transitions would then play the finished state back to the start.
// useArrival(still) is false on the first live frame and true from the next one: scenes skip transitions until it is
// true, and a scene can use it to play an entrance (slide 4 morphs out of slide 3 this way).
import { useState, useEffect } from 'react'

export function useArrival(still) {
	const [ready, setReady] = useState(false)
	useEffect(() => {
		if (still) { setReady(false); return }
		let live = true
		requestAnimationFrame(() => requestAnimationFrame(() => { if (live) setReady(true) }))
		return () => { live = false }
	}, [still])
	return ready
}
