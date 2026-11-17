// While a deck is presented, every slide but the current one renders its scene finished (b = Infinity, still); on
// arrival b drops to 0. Without care, CSS transitions would then play the finished state back to the start.
// useArrival(still) is false on the first live frame and true from the next one: scenes skip transitions until it is
// true, and a scene can use it to play an entrance (slide 4 morphs out of slide 3 this way).
import { useState, useEffect } from 'react'

export function useArrival(still) {
	const [ready, setReady] = useState(false)
	useEffect(() => {
		if (still) { setReady(false); return }
		// two frames, or a short timer when frames are paused (Electron throttles them while the window is in the background)
		let live = true
		const go = () => { if (live) setReady(true) }
		requestAnimationFrame(() => requestAnimationFrame(go))
		const timer = setTimeout(go, 80)
		return () => { live = false; clearTimeout(timer) }
	}, [still])
	return ready
}
