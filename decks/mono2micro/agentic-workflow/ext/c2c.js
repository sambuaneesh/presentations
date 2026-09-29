// "Why C2C" from the TSE paper deck (presentations/tse-2026-paper, slide 21), brought into this deck.
// It reuses that deck's parts, copied into ext/tse/: drawers, clickable terms and citations, the study's
// metric code, and the benchmark data (PetClinic's reference and the workflow's final answer). The scene
// draws its own heading and shares its panels in live rooms, like the paper deck.
import { useRef } from 'react'
import { html, C, F, box, EASE, Stage, Term, Cite, Inside, SHIELD, P, List, Table, Formula, reveal, SlideSource, useShared, SlideCtx } from './tse/ui.js'
import { useAnnotate } from './tse/annotate.js'
import { SYSTEMS, PETCLINIC } from './tse/data/systems.js'
import { c2c, overlap } from './tse/metrics.js'

const f1 = (v) => (v == null ? '—' : (Math.round(v * 10) / 10).toFixed(1))
const FIN = PETCLINIC.final
const REF = SYSTEMS['spring-petclinic'].reference

function C2cBody({ b, still }) {
	const B = still ? 1 : b
	const [pick, setPick] = useShared('c2c:pick', Object.keys(FIN)[0])
	const produced = FIN[pick]
	const rows = Object.entries(REF).map(([g, cs]) => ({ g, cs, o: overlap(produced, cs), inter: produced.filter((c) => cs.includes(c)) }))
	const best = Math.max(...rows.map((r) => r.o))
	const selfRows = Object.entries(SYSTEMS).map(([id, s]) => [id, ...[0.1, 0.33, 0.5].map((t) => f1(c2c(s.disjoint, s.reference, t).value))])
	const drawer = {
		title: 'C2C in detail', kicker: '§III-D',
		tabs: [
			{ id: 'def', label: 'Definition', render: () => html`<div>
				${Formula(html`overlap(A, B) = |A ∩ B| / max(|A|, |B|)`)}
				${P('C2C-x is the share of produced services A for which some reference service B has overlap > x %. Services are compared as sets of classes, so a class the reference places in several services simply belongs to several sets.')}
				${List(['C2C-10: does a produced service correspond to any reference service at all?', 'C2C-33: does it capture a substantial part of one?', 'C2C-50: does it match one closely?'])}</div>` },
			{ id: 'self', label: 'The reference against itself', render: () => html`<div>
				${P('The reference scores 100 against itself at every threshold. A disjoint copy (each shared class kept only in the first service that lists it) agrees with the reference on every class:')}
				${Table(['system', 'C2C-10', 'C2C-33', 'C2C-50'], selfRows)}
				${P('C2C notices that a partition cannot reproduce a replicated design exactly, but counts the difference once per service, not once per shared class. Values recomputed here from the reference files; they match Table VI.', { fontSize: 19, color: C.dim })}</div>` },
			{ id: 'limits', label: 'Its limits', render: () => List(['it counts produced services, not classes, so services are not weighted by size', 'it does not penalise a decomposition for missing a reference service', 'the implementation needs strictly more than x % (the benchmark paper says "at least"), so a service overlapping by exactly half does not count at C2C-50', 'the thresholds do not always agree, so no conclusion rests on one cut-off']) },
			{ id: 'refs', label: 'Where it comes from', render: () => P(html`Introduced for comparing architecture-recovery results <${Cite} keys=${['garcia2013comparative', 'lutellier2018dependencies']} />, used by the benchmark <${Cite} k="wang2024comparison" /> and by MicroAgent <${Cite} k="su2026microagent" />.`) },
		],
		source: 'Source: §III-D, §VII, Table VI; vendor/legacy-metrics-engine/calculator/c2c.py.',
	}
	return html`<${Stage} still=${still}>
		<div style=${{ ...box(110, 245, 760, 220), fontFamily: F.hand, fontSize: 28, lineHeight: 1.35 }}>
			The references <${Term} k="overlap">overlap</${Term}>: shared classes sit in several services. A similarity measure must accept that.<br />
			<span style=${{ color: C.red }}><${Term} k="c2c" /> compares services as sets of classes.</span></div>
		<div style=${{ ...box(110, 480, 760, 460), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.hand, fontSize: 28, marginBottom: 10 }}>Try it: pick one of the workflow's PetClinic services</div>
			<div style=${{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
				${Object.keys(FIN).map((s) => html`<button key=${s} type="button" ...${SHIELD} onClick=${(e) => { e.stopPropagation(); setPick(s) }}
					style=${{ pointerEvents: 'all', cursor: 'pointer', padding: '8px 14px', borderRadius: 999, border: `2px solid ${s === pick ? C.red : C.ink}`, background: s === pick ? C.red : '#fffdf8', color: s === pick ? '#fff' : C.ink, fontFamily: F.sans, fontSize: 16, fontWeight: 600 }}>${s.replace('Service', '')} (${FIN[s].length})</button>`)}
			</div>
			<div style=${{ fontFamily: F.mono, fontSize: 15, color: C.dim, lineHeight: 1.5 }}>${produced.join(', ')}</div>
		</div>
		<div style=${{ ...box(930, 250, 880, 700), ...reveal(B >= 1, still) }}>
			<div style=${{ fontFamily: F.sans, fontSize: 17, fontWeight: 700, color: C.dim, marginBottom: 8 }}>overlap with each reference service</div>
			${rows.map((r) => html`<div key=${r.g} style=${{ marginBottom: 20 }}>
				<div style=${{ display: 'flex', justifyContent: 'space-between', fontFamily: F.sans, fontSize: 20 }}>
					<span>${r.g} <span style=${{ color: C.dim, fontSize: 16 }}>(${r.cs.length} classes, ${r.inter.length} shared with it)</span></span><b>${(r.o * 100).toFixed(0)} %</b></div>
				<div style=${{ position: 'relative', height: 22, background: C.paper2, borderRadius: 11, marginTop: 6 }}>
					<div style=${{ height: '100%', width: `${r.o * 100}%`, borderRadius: 11, background: r.o === best ? C.red : C.ink, opacity: r.o === best ? 0.85 : 0.35, transition: `width 600ms ${EASE}` }} />
					${[10, 33, 50].map((t) => html`<div key=${t} style=${{ position: 'absolute', left: `${t}%`, top: -6, bottom: -6, width: 2, background: C.ink, opacity: 0.5 }} />`)}
				</div></div>`)}
			<div style=${{ display: 'flex', gap: 14, marginTop: 10 }}>
				${[10, 33, 50].map((t) => html`<div key=${t} style=${{ flex: 1, padding: '10px 12px', borderRadius: 12, border: `2px solid ${best > t / 100 ? C.fix : C.red}`, textAlign: 'center', fontFamily: F.sans, fontSize: 18 }}>
					C2C-${t}: <b>${best > t / 100 ? 'counts ✓' : 'does not count ✗'}</b></div>`)}</div>
			<div style=${{ fontFamily: F.sans, fontSize: 18, color: C.dim, marginTop: 16 }}>C2C-x is the share of produced services that count. Over all four services here: ${[0.1, 0.33, 0.5].map((t) => f1(c2c(FIN, REF, t).value)).join(' / ')}.</div>
		</div>
		<${Inside} x=${1560} y=${200} w=${300} label="C2C in detail" drawer=${drawer} still=${still} />
		<${SlideSource}>§III-D · Table VI</${SlideSource}>
	</${Stage}>`
}

// The slide: heading, the scene, and the laser/highlighter over its panels.
export function C2cScene(props) {
	const ref = useRef(null)
	useAnnotate(ref)
	return html`<${SlideCtx.Provider} value="aw-c2c"><div ref=${ref} style=${{ position: 'absolute', inset: 0 }}>
		<div style=${{ ...box(60, 40, 1500, 110) }}>
			<div style=${{ fontFamily: F.sans, fontSize: 22, color: C.red, letterSpacing: 0.5 }}>Results · how similarity to the reference is measured</div>
			<div style=${{ fontFamily: F.hand, fontSize: 48, color: C.ink, marginTop: 4 }}>C2C: compare services as sets of classes</div>
		</div>
		<${C2cBody} ...${props} />
	</div></${SlideCtx.Provider}>`
}
