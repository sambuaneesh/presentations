// Contribution 3 opened up: the slide arrives looking like the end of slide 3, then block 3 glides up into the
// heading, the other blocks fade, and Table IV of the paper (the design experiments E1–E11; a 300 dpi crop of
// papers/tse-2026/manuscript/main.pdf, page 8) fills the rest of the slide. No clicks.
import { html, EASE } from '@pack/scenes/kit.js'
import { useArrival } from './arrive.js'
import { ITEMS, SLOT, Block } from './contributions.js'
import { TABLE4 } from './table4-paper.js'

const HEAD = { x: 110, y: 28, w: 1700, h: 150 }
const T = { x: 110, y: 200, w: 1700, h: 860 } // the table, scaled to fit

export function DesignScene({ still }) {
	const arrived = useArrival(still)
	const open = still || arrived // finished layout
	const t = (ms, delay = 0) => (still || !arrived ? 'none' : `all ${ms}ms ${EASE} ${delay}ms`)
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		${ITEMS.map((_, i) => i !== 2 && html`<${Block} key=${i} i=${i} r=${SLOT(i)} style=${{ opacity: open ? 0 : 1, transition: t(500) }} />`)}
		<${Block} i=${2} r=${open ? HEAD : SLOT(2)} style=${{ transition: t(1000, 200) }} />
		<div style=${{ position: 'absolute', left: T.x, top: T.y, width: T.w, height: T.h, display: 'flex', alignItems: 'center', justifyContent: 'center',
				opacity: open ? 1 : 0, transform: open ? 'none' : 'translateY(24px)', transition: t(700, 900) }}>
			<div style=${{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex' }}>
				<img src=${TABLE4} style=${{ maxWidth: T.w - 36, maxHeight: T.h - 36, display: 'block' }} />
			</div>
		</div>
	</div>`
}
