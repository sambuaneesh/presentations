// The workflow diagram, last week and this week, as one slide with ordinary clicks: clicks 0–7 replay the 10th-November
// build (ext/morph.js, under a "previously…" tag, ending on the previous paper figure); click 8 cross-fades to the same
// diagram with this week's changes in the centre (ext/revision.js); click 9 moves them up above it, clicks 10–12 apply
// them, and click 13 shows the revised paper figure.
import { html, C, F, EASE, box } from '@pack/scenes/kit.js'
import { useArrival } from './arrive.js'
import { MorphScene, MORPH_BEATS } from './morph.js'
import { RevisionScene, REVISION_BEATS } from './revision.js'

const SWITCH = MORPH_BEATS + 1 // the click that leaves last week's build
export const WORKFLOW_BEATS = SWITCH + REVISION_BEATS

export function WorkflowScene({ b, still }) {
	const B = still ? WORKFLOW_BEATS : Math.max(0, Math.min(WORKFLOW_BEATS, b))
	const arrived = useArrival(still) // a hook: always called, never behind ||
	const quiet = still || !arrived
	const now = B >= SWITCH
	const fade = (on) => ({ position: 'absolute', inset: 0, opacity: on ? 1 : 0, pointerEvents: on ? 'auto' : 'none', transition: quiet ? 'none' : `opacity 700ms ${EASE}` })
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		<div style=${fade(!now)}>
			<${MorphScene} b=${Math.min(B, MORPH_BEATS)} still=${still} />
			<div style=${{ position: 'absolute', left: 40, top: 14, padding: '2px 22px 6px', borderRadius: 12, background: 'rgba(240,228,66,0.55)', fontFamily: F.hand, fontSize: 56, lineHeight: 1.1, color: C.red }}>previously…</div>
		</div>
		<div style=${fade(now)}>
			<${RevisionScene} b=${now ? B - SWITCH : 0} still=${still} />
		</div>
	</div>`
}
