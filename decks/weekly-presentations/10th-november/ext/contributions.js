// The contributions as the paper lists them (papers/tse-2026/manuscript/sections/01-introduction.tex): only the bold
// titles are drawn (the presenter explains the rest; the paper's wording is kept here for reference, minus the ablation,
// which this deck leaves out). One per click.
// 2 and 4 are greyed, with a tilted question mark: still open for discussion. Slide 4 (design.js) reuses Block.
import { html, C, F, EASE, box } from '@pack/scenes/kit.js'
import { useArrival } from './arrive.js'

export const ITEMS = [
	['An agentic decomposition workflow', 'in which LLM components construct evidence, infer provisional domain knowledge, and propose alternative candidates, while deterministic components repair, validate, select, and refine the result without access to reference data.'],
	['A controlled, multi-model evaluation', 'of the workflow against single-shot prompting, an autonomous coding agent, and traditional tools: seventeen LLMs, five runs per cell for eight of them, a strict separation between online selection and blinded evaluation, a declared analysis plan, and robustness checks for the treatment of failed runs, run-level variation, and models not used during development.', true],
	['Evidence on which design decisions matter', 'a documented sequence of design experiments.'],
	['Lessons for agentic AI in architectural refactoring', 'including the role of deterministic safeguards, model convergence on public benchmarks, and the need for repeated runs, which we show changes the conclusions of a comparison.', true],
	['An open research workbench', 'with all prompts, protocols, run artifacts, and analysis scripts, from which every reported number, table, and figure is regenerated.'],
]
export const CONTRIB_BEATS = ITEMS.length - 1
const GREY = '#a39d94'
// where block i sits in the list
export const SLOT = (i) => ({ x: 110, y: 62 + i * 196, w: 1700, h: 176 })

// One contribution block at rect r; `style` adds the caller's opacity, transform and transition.
export function Block({ i, r, style }) {
	const [title, , open] = ITEMS[i]
	return html`<div style=${{ ...box(r.x, r.y, r.w, r.h), display: 'flex', alignItems: 'center', gap: 34, padding: open ? '0 150px 0 34px' : '0 34px', boxSizing: 'border-box', borderRadius: 18,
			border: open ? `2.5px dashed ${GREY}` : `2.5px solid ${C.ink}`, background: open ? 'transparent' : '#fffdf8', ...style }}>
		<div style=${{ width: 70, flex: 'none', textAlign: 'center', fontFamily: F.hand, fontSize: 88, lineHeight: 1, color: open ? GREY : C.red }}>${i + 1}</div>
		<div style=${{ fontFamily: F.hand, fontSize: 52, lineHeight: 1.15, whiteSpace: 'nowrap', color: open ? GREY : C.ink }}>${title}</div>
		${open && html`<div style=${{ position: 'absolute', right: 34, top: 0, height: '100%', display: 'flex', alignItems: 'center', fontFamily: F.hand, fontSize: 190, lineHeight: 1, color: GREY, transform: 'rotate(12deg)' }}>?</div>`}
	</div>`
}

export function ContributionsScene({ b, still }) {
	const B = still ? CONTRIB_BEATS : Math.max(0, Math.min(CONTRIB_BEATS, b))
	const arrived = useArrival(still) // a hook: always called, never behind ||
	const quiet = still || !arrived
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		${ITEMS.map((_, i) => html`<${Block} key=${i} i=${i} r=${SLOT(i)} style=${{
			opacity: B >= i ? 1 : 0, transform: B >= i ? 'none' : 'translateY(18px)', transition: quiet ? 'none' : `opacity 600ms ${EASE}, transform 600ms ${EASE}` }} />`)}
	</div>`
}
