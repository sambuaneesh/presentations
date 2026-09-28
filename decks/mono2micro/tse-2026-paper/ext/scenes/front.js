// Front matter: the title, how to use the deck, and a clickable map of the paper.
import { useMaybeEditor } from 'tldraw'
import { useContext } from 'react'
import { html, C, F, box, EASE, Stage, Term, Cite, Inside, Card, SHIELD, P, H, List, Note, Code, rich, reveal, SubTabs, useStage, SlideCtx, registerDrawer } from '../ui.js'
import { PAPER } from '../data/paper.js'
import { PARTS, SLIDES } from '../deck.js'

// Jump to a slide while presenting (the present tool's go()); otherwise do nothing.
export function useGo() {
	const editor = useMaybeEditor?.()
	return (index) => {
		const tool = editor?.getCurrentTool?.()
		if (tool && typeof tool.go === 'function') tool.go(index)
	}
}

// ------------------------------------------------------------------ title
const KEYWORD_TERMS = { 'Microservices': 'microservice', 'monolith decomposition': 'decomposition', 'large language models': 'llm', 'LLM agents': 'agent', 'agentic workflows': 'agentic-workflow' }

export function TitleScene({ still }) {
	const abstract = {
		title: 'Abstract', kicker: 'the paper in 250 words',
		tabs: PAPER.abstract.map((a) => ({ id: a.head, label: a.head, render: () => P(rich(a.text), { fontSize: 24, lineHeight: 1.6 }) })),
		source: 'Source: the abstract of the TSE draft (papers/tse-2026/manuscript/sections/0.abstract.tex).',
	}
	const about = {
		title: 'Authors and context', kicker: 'who and where',
		tabs: [
			{ id: 'authors', label: 'Authors', render: () => html`<div>${List(PAPER.authors)}${PAPER.affiliations.map((a, i) => P(rich(a), { fontSize: 19, color: C.dim, key: i }))}</div>` },
			{ id: 'findings', label: 'Main findings', render: () => List(PAPER.findings.map(rich), { ordered: true }) },
			{ id: 'contrib', label: 'Contributions', render: () => List(PAPER.contributions.map(rich), { ordered: true }) },
			{ id: 'rqs', label: 'Research questions', render: () => List(PAPER.rqs.map(rich)) },
		],
		source: 'Source: §I of the TSE draft.',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(140, 190, 1640, 400), animation: still ? 'none' : `tp-in 800ms ${EASE} both` }}>
			<div style=${{ fontFamily: F.hand, fontSize: 30, color: C.red, marginBottom: 18 }}>IEEE TSE journal extension · draft</div>
			<div style=${{ fontFamily: F.hand, fontSize: 76, lineHeight: 1.08, color: C.ink }}>Agentic LLM Workflows for Monolith-to-Microservice Decomposition</div>
			<div style=${{ fontFamily: F.hand, fontSize: 40, lineHeight: 1.2, color: C.dim, marginTop: 18 }}>An Empirical Study of Quality, Validity, and Cost</div>
		</div>
		<div style=${{ ...box(140, 640, 1640, 60), fontFamily: F.sans, fontSize: 26, color: C.ink, ...reveal(true, still, { delay: 300 }) }}>${PAPER.authors.join(' · ')}</div>
		<div style=${{ ...box(140, 700, 1640, 50), fontFamily: F.sans, fontSize: 21, color: C.dim, ...reveal(true, still, { delay: 400 }) }}>
			IIIT Hyderabad · University of L'Aquila · University of Groningen · extends our ICSA 2026 paper <${Cite} k="sambu2026icsa" /></div>
		<div style=${{ ...box(140, 790, 1640, 60), display: 'flex', gap: 18, ...reveal(true, still, { delay: 500 }) }}>
			<${Inside} label="Read the abstract" drawer=${abstract} still=${still} />
			<${Inside} label="Findings, contributions, RQs" drawer=${about} still=${still} color=${C.ink} />
		</div>
		<div style=${{ ...box(140, 890, 1640, 60), fontFamily: F.sans, fontSize: 20, color: C.dim, ...reveal(true, still, { delay: 600 }) }}>
			<span style=${{ color: C.red, fontWeight: 600 }}>Press Ctrl+K (⌘K) anytime for the map of the deck: search any slide or term, Enter to go.</span><br />
			Keywords: ${PAPER.keywords.map((k, i) => html`<span key=${k}>${i ? ', ' : ''}${KEYWORD_TERMS[k] ? html`<${Term} k=${KEYWORD_TERMS[k]}>${k}</${Term}>` : k}</span>`)}</div>
	</${Stage}>`
}

// ------------------------------------------------------------------ how to read the deck
export function HowtoScene({ still }) {
	const demo = {
		title: 'A drawer', kicker: 'try it',
		tabs: [
			{ id: 'what', label: 'What drawers hold', render: () => html`<div>
				${P('Drawers hold the detail a slide leaves out: tables, verbatim prompts, derivations, the paper\'s exact wording, and where each number comes from.')}
				${P(html`Terms stay clickable in here too: <${Term} k="partition" />, <${Term} k="c2c" />. Sheets stack on top of drawers; × closes one.`)}</div>` },
			{ id: 'nested', label: 'Nested tabs', tabs: [
				{ id: 'a', label: 'A sub-tab', render: () => P('Some tabs split again into sub-tabs, like this one.') },
				{ id: 'b', label: 'Another', render: () => P('And sub-tabs can nest once more when a topic needs it.') },
			], render: () => P('This tab has sub-tabs:') },
			{ id: 'keys', label: 'Keys and live rooms', render: () => html`<div>
				${List(['wheel or ↑ ↓ PageUp PageDown Home End: scroll the open panel', '×: close that panel; a click on the dark background closes all', 'while a panel is open, arrow keys do not change slides'])}
				${Note('In a live room, panels open only on your own screen: followers see the slides and their build steps, not your open drawers.', C.faint)}</div>` },
		],
	}
	const row = (y, label, what, el, delay) => html`<div style=${{ ...box(200, y, 1520, 150), display: 'flex', alignItems: 'center', gap: 50, ...reveal(true, still, { delay }) }}>
		<div style=${{ width: 520, fontFamily: F.hand, fontSize: 44, color: C.ink, textAlign: 'right' }}>${el}</div>
		<div style=${{ width: 950 }}>
			<div style=${{ fontFamily: F.hand, fontSize: 34, color: C.red }}>${label}</div>
			<div style=${{ fontFamily: F.sans, fontSize: 22, color: C.dim, marginTop: 6, lineHeight: 1.4 }}>${what}</div></div></div>`
	return html`<${Stage} still=${still}>
		${row(250, 'a dotted word is a term', 'Click it for the definition, a formula, a worked example you can play with, and where it comes from.', html`a <${Term} k="monolith" />`, 100)}
		${row(430, 'a blue number is a citation', 'Click it for the full reference, every place the paper cites it, and a link.', html`a benchmark <${Cite} k="wang2024comparison" />`, 250)}
		${row(610, 'a red button opens a drawer', 'Tabs on the left, sometimes sub-tabs inside. Scroll with the wheel or keys.', html`<${Inside} label="Try a drawer" drawer=${demo} still=${still} />`, 400)}
		<div style=${{ ...box(200, 820, 1520, 120), fontFamily: F.sans, fontSize: 22, color: C.dim, lineHeight: 1.5, textAlign: 'center', ...reveal(true, still, { delay: 550 }) }}>
			Every number is generated from the paper and the study's run files, and each slide says where its content comes from (bottom right).<br />
			Interactive calculators recompute the study's metrics with the same formulas as its code.<br /><b style=${{ color: C.red }}>⌖</b> bottom left, or press <b>G</b>, <b>/</b> or <b>Ctrl+K</b>: the map of the deck; type to search, Enter to jump.</div>
	</${Stage}>`
}

// ------------------------------------------------------------------ map of the paper
const QUESTIONS = {
	p1: 'What is the problem, and what already exists?',
	p2: 'How does the workflow work, and how is it tested?',
	p3: 'Which design experiments shaped it?',
	p4: 'Quality, reliability, cost, design: RQ1–RQ4',
	p5: 'What it buys, what it does not, and what could be wrong',
	p6: 'The studies and trials behind the paper',
}

export function MapScene({ still }) {
	const go = useGo()
	const { open } = useStage()
	const slide = useContext(SlideCtx)
	const parts = PARTS.filter((p) => p.id !== 'front')
	const xs = parts.map((_, i) => 230 + i * 292)
	const ys = parts.map((_, i) => 470 + (i % 2 ? 46 : -10))
	// One hand-drawn road through all stops (a smooth curve through the node centres).
	const road = xs.map((x, i) => (i ? `S ${x - 146} ${ys[i]} ${x} ${ys[i]}` : `M 70 ${ys[0] + 40} Q ${x - 90} ${ys[0]} ${x} ${ys[0]}`)).join(' ') + ` S ${xs.at(-1) + 110} ${ys.at(-1) - 30} ${xs.at(-1) + 150} ${ys.at(-1) - 30}`
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		<svg width="1920" height="1080" style=${{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
			<path d=${road} fill="none" stroke=${C.ink} strokeWidth="5" strokeLinecap="round" strokeDasharray="2 16" style=${{ opacity: 0.55 }} />
		</svg>
		${parts.map((p, i) => {
			const slides = SLIDES.map((sl, j) => ({ ...sl, index: j })).filter((sl) => sl.part === p.id)
			const built = slides.length > 0
			const range = built ? (slides.length === 1 ? `slide ${slides[0].index + 1}` : `slides ${slides[0].index + 1}–${slides.at(-1).index + 1}`) : 'coming next'
			const drawer = {
				title: p.label, kicker: `${p.roman} · ${p.sec}`,
				tabs: [{ id: 'slides', label: 'Slides', render: () => html`<div>
					${P(QUESTIONS[p.id], { fontSize: 22, color: C.dim })}
					${built ? slides.map((sl) => html`<div key=${sl.scene} ...${SHIELD} onClick=${(e) => { e.stopPropagation(); go(sl.index) }} class="tp-btn"
						style=${{ pointerEvents: 'all', cursor: 'pointer', display: 'flex', gap: 18, alignItems: 'baseline', padding: '10px 14px', marginBottom: 6, borderRadius: 12, border: `2px solid ${C.line}`, background: '#fffdf8' }}>
						<span style=${{ fontFamily: F.hand, fontSize: 28, color: C.red, minWidth: 40, textAlign: 'right' }}>${sl.index + 1}</span>
						<span style=${{ fontFamily: F.sans, fontSize: 22 }}>${sl.name}</span>
						<span style=${{ marginLeft: 'auto', fontFamily: F.sans, fontSize: 16, color: C.dim }}>${sl.kicker ?? ''}</span></div>`)
					: P('These slides are still being made.', { color: C.dim })}
					${built && P('While presenting, click a slide to jump there.', { fontSize: 17, color: C.dim, marginTop: 14 })}</div>` }],
			}
			registerDrawer(slide, { ...drawer, id: 'drawer:map-' + p.id })
			return html`<div key=${p.id} style=${{ ...reveal(true, still, { delay: 90 * i }) }}>
				<div ...${SHIELD} class="tp-btn" onClick=${(e) => { e.stopPropagation(); open({ id: 'drawer:map-' + p.id, kind: 'drawer', ...drawer }) }}
					style=${{ ...box(xs[i] - 44, ys[i] - 44, 88, 88), pointerEvents: 'all', cursor: 'pointer', borderRadius: 44, border: `3.5px solid ${built ? C.ink : C.faint}`,
						background: built ? '#fffdf8' : C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.hand, fontSize: p.roman.length > 4 ? 22 : 32,
						color: built ? C.red : C.faint, boxShadow: built ? '0 4px 0 rgba(43,38,33,0.10)' : 'none', transition: 'all 150ms ease' }}>${p.roman}</div>
				<div style=${{ ...box(xs[i] - 135, ys[i] + 66, 270, 250), textAlign: 'center' }}>
					<div style=${{ fontFamily: F.hand, fontSize: 30, lineHeight: 1.15, color: built ? C.ink : C.dim }}>${p.label.replace('Appendix: ', '')}</div>
					<div style=${{ fontFamily: F.sans, fontSize: 18, lineHeight: 1.4, color: C.dim, marginTop: 10 }}>${QUESTIONS[p.id]}</div>
					<div style=${{ fontFamily: F.hand, fontSize: 24, color: built ? C.red : C.faint, marginTop: 12 }}>${range}</div>
				</div>
			</div>`
		})}
		<div style=${{ ...box(120, 250, 1680, 50), fontFamily: F.hand, fontSize: 30, color: C.dim, ...reveal(true, still) }}>the deck follows the paper, section by section · click a stop for its slides</div>
	</div>`
}
