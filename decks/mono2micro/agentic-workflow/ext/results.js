// Results slides: each is one table shown whole, then zoomed part by part.
//
// Beat 0 shows the full table. On every later beat the table shrinks to a thumbnail (top left) with
// a red frame around the part being discussed, that part is re-drawn large as a "lens" (bottom left),
// and the right side shows a chart of exactly those numbers plus what they mean. All numbers come
// from ./resultsData.js, generated from studies/final-benchmark-v1/analysis/final-benchmark-analysis.json.
import { html, C, F, EASE, box } from '@pack/scenes/kit.js'
import { R } from './resultsData.js'

// ------------------------------------------------------------------ vocabulary
const ARM = {
	'80k': { label: 'Single-shot (80k)', color: C.ink },
	oc: { label: 'OpenCode agent', color: '#9a948a' },
	wf: { label: 'Agentic workflow', color: C.red },
	tools: { label: 'Traditional tools', color: '#3f6fc4' },
}
const MODEL = { 'deepseek-v4.1-flash': 'DeepSeek v4.1 Flash', 'glm-5.2': 'GLM-5.2', 'gpt-oss:120b': 'gpt-oss:120b', 'gemma4:31b': 'gemma4:31b' }
const MODELS = Object.keys(MODEL)
const SYS = { demo: '7ep Demo', jpetstore: 'JPetStore', partsunlimited: 'PartsUnlimited', 'spring-petclinic': 'PetClinic' }
const f1 = (v) => (v === null || v === undefined ? '–' : Number(v).toFixed(1))
const sgn = (v, d = 1) => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(d)
const pfmt = (p) => (p === null || p === undefined ? '–' : p < 0.001 ? '<0.001' : p.toFixed(p < 0.01 ? 4 : 2))
const SLOW = 900

// ------------------------------------------------------------------ table rendering
const ROW_H = 54
const HEAD_H = 70

function tableGeometry(spec) {
	let x = 0
	const cols = spec.columns.map((c) => {
		const col = { ...c, x }
		x += c.w
		return col
	})
	return { cols, width: x, height: HEAD_H + spec.rows.length * ROW_H }
}

function Cell({ col, row, big }) {
	const v = row[col.key]
	const txt = col.fmt ? col.fmt(v, row) : v
	const best = col.best && col.best(row)
	const style = {
		width: col.w, textAlign: col.align ?? 'center', padding: '0 10px', boxSizing: 'border-box',
		fontFamily: col.mono ? F.mono : F.sans, fontSize: big ? 24 : col.size ?? 21,
		fontWeight: best ? 700 : 400, color: best ? C.red : col.color ? col.color(row) : C.ink,
		whiteSpace: col.wrap ? 'normal' : 'nowrap', lineHeight: col.wrap ? 1.15 : 'normal', overflow: 'hidden',
	}
	return html`<div style=${style}>${txt}</div>`
}

function Table({ spec, geo, dimCols, dimRows, big }) {
	const cols = geo.cols
	return html`<div style=${{ position: 'relative', width: geo.width, height: geo.height, fontFamily: F.sans, color: C.ink }}>
		<div style=${{ display: 'flex', height: HEAD_H, alignItems: 'flex-end', borderBottom: `3px solid ${C.ink}` }}>
			${cols.map((c) => html`<div key=${c.key} style=${{ width: c.w, textAlign: c.align ?? 'center', padding: '0 10px 10px', boxSizing: 'border-box', fontSize: big ? 22 : 19, fontWeight: 700, color: c.firewall ? C.red : C.dim, opacity: dimCols?.has(c.key) ? 0.25 : 1, lineHeight: 1.1, whiteSpace: 'pre-line' }}>${c.label}</div>`)}
		</div>
		${spec.rows.map((row, i) => html`<div key=${i} style=${{
				display: 'flex', height: ROW_H, alignItems: 'center',
				borderTop: row.sep ? `2px solid ${C.line}` : 'none',
				background: row.tint ? row.tint : 'transparent',
				opacity: dimRows?.has(i) ? 0.2 : 1,
			}}>
			${cols.map((c) => html`<div key=${c.key} style=${{ opacity: dimCols?.has(c.key) ? 0.25 : 1 }}><${Cell} col=${c} row=${row} big=${big} /></div>`)}
		</div>`)}
		${spec.firewallBefore && (() => {
			const c = cols.find((k) => k.key === spec.firewallBefore)
			return html`<div style=${{ position: 'absolute', left: c.x - 2, top: 0, height: geo.height, borderLeft: `3px dashed ${C.red}` }} />`
		})()}
	</div>`
}

// A smaller table with only the chosen columns (row-label columns always kept).
function lensSpec(spec, cols, rows) {
	const keep = new Set([...(spec.labelCols ?? []), ...cols])
	return {
		...spec,
		columns: spec.columns.filter((c) => keep.has(c.key)),
		rows: rows ? rows.map((i) => spec.rows[i]) : spec.rows,
		firewallBefore: cols.includes(spec.firewallBefore) ? spec.firewallBefore : null,
	}
}

// ------------------------------------------------------------------ charts (SVG)
// Grouped vertical bars: groups = [{ label, bars: [{ key, v, color, label? }] }].
function Bars({ groups, w = 880, h = 420, max, unit = '', fmt = f1, baseline = 0 }) {
	const pad = { l: 20, r: 10, t: 36, b: 70 }
	const gw = (w - pad.l - pad.r) / groups.length
	const nb = Math.max(...groups.map((g) => g.bars.length))
	const bw = Math.min(64, (gw - 30) / nb)
	const top = max ?? Math.max(...groups.flatMap((g) => g.bars.map((b) => b.v ?? 0))) * 1.12
	const y = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v - baseline) / (top - baseline))
	return html`<svg width=${w} height=${h} style=${{ overflow: 'visible' }}>
		<line x1=${pad.l} x2=${w - pad.r} y1=${y(baseline)} y2=${y(baseline)} stroke=${C.ink} strokeWidth="2" />
		${groups.map((g, gi) => {
			const x0 = pad.l + gi * gw + (gw - nb * bw - (nb - 1) * 8) / 2
			return html`<g key=${gi}>
				${g.bars.map((b, bi) => {
					const x = x0 + bi * (bw + 8)
					if (b.v === null || b.v === undefined) return html`<text key=${bi} x=${x + bw / 2} y=${y(baseline) - 10} textAnchor="middle" fontSize="18" fill=${C.dim} fontFamily=${F.sans}>n/a</text>`
					return html`<g key=${bi}>
						<rect x=${x} y=${y(b.v)} width=${bw} height=${Math.max(1, y(baseline) - y(b.v))} rx="4" fill=${b.color} opacity=${b.faint ? 0.35 : 0.9} />
						<text x=${x + bw / 2} y=${y(b.v) - 8} textAnchor="middle" fontSize="17" fontWeight=${b.bold ? 700 : 500} fill=${b.bold ? C.red : C.ink} fontFamily=${F.sans}>${fmt(b.v)}${unit}</text>
					</g>`
				})}
				<text x=${pad.l + gi * gw + gw / 2} y=${h - pad.b + 30} textAnchor="middle" fontSize="19" fill=${C.ink} fontFamily=${F.sans}>${g.label}</text>
			</g>`
		})}
	</svg>`
}

// Horizontal bars around zero: items = [{ label, v, strong, note }].
function Diverging({ items, w = 880, rowH = 44, max, fmt = (v) => sgn(v), leftLabel, rightLabel }) {
	const lw = 190, nw = 170
	const span = max ?? Math.max(...items.map((i) => Math.abs(i.v))) * 1.1
	const cw = w - lw - nw
	const x0 = lw + cw / 2
	const sx = (v) => (v / span) * (cw / 2)
	const h = items.length * rowH + 50
	return html`<svg width=${w} height=${h} style=${{ overflow: 'visible' }}>
		${leftLabel && html`<text x=${x0 - 12} y="18" textAnchor="end" fontSize="17" fill=${C.dim} fontFamily=${F.sans}>◀ ${leftLabel}</text>`}
		${rightLabel && html`<text x=${x0 + 12} y="18" fontSize="17" fill=${C.dim} fontFamily=${F.sans}>${rightLabel} ▶</text>`}
		<line x1=${x0} x2=${x0} y1="30" y2=${h - 6} stroke=${C.ink} strokeWidth="2" />
		${items.map((it, i) => {
			const yy = 40 + i * rowH
			const bw = sx(it.v)
			return html`<g key=${i}>
				<text x=${lw - 14} y=${yy + rowH / 2 + 2} textAnchor="end" fontSize="20" fill=${C.ink} fontFamily=${F.sans}>${it.label}</text>
				<rect x=${bw >= 0 ? x0 : x0 + bw} y=${yy + 8} width=${Math.max(2, Math.abs(bw))} height=${rowH - 16} rx="4"
					fill=${it.strong ? C.red : it.v >= 0 ? C.ink : '#9a948a'} opacity=${it.strong ? 0.95 : 0.55} />
				<text x=${bw >= 0 ? x0 + bw + 8 : x0 + bw - 8} y=${yy + rowH / 2 + 2} textAnchor=${bw >= 0 ? 'start' : 'end'} fontSize="18" fontWeight=${it.strong ? 700 : 500} fill=${it.strong ? C.red : C.ink} fontFamily=${F.sans}>${fmt(it.v)}</text>
				${it.note && html`<text x=${w - 4} y=${yy + rowH / 2 + 2} textAnchor="end" fontSize="16" fill=${C.dim} fontFamily=${F.sans}>${it.note}</text>`}
			</g>`
		})}
	</svg>`
}

function Legend({ arms }) {
	return html`<div style=${{ display: 'flex', gap: 22, fontFamily: F.sans, fontSize: 18, margin: '4px 0 6px' }}>
		${arms.map((a) => html`<span key=${a} style=${{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
			<span style=${{ width: 16, height: 16, borderRadius: 4, background: ARM[a].color }} />${ARM[a].label}</span>`)}
	</div>`
}

// One square per observation: 32 per arm.
function ValidityGrid() {
	const arms = ['80k', 'oc', 'wf']
	return html`<div style=${{ display: 'flex', gap: 60, fontFamily: F.sans }}>
		${arms.map((a) => {
			const v = R.validity[a]
			return html`<div key=${a}>
				<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(8, 22px)', gap: 6 }}>
					${Array.from({ length: v.n }, (_, i) => html`<div key=${i} style=${{ width: 22, height: 22, borderRadius: 4, background: i < v.valid ? '#2e8b7e' : C.red, opacity: i < v.valid ? 0.8 : 1 }} />`)}
				</div>
				<div style=${{ fontSize: 34, fontWeight: 700, marginTop: 12, color: v.valid === v.n ? '#2e8b7e' : C.red }}>${v.valid} / ${v.n}</div>
				<div style=${{ fontSize: 19, color: C.dim }}>${ARM[a].label}</div>
			</div>`
		})}
	</div>`
}

// ------------------------------------------------------------------ the generic scene
function Panel({ step, still }) {
	return html`<div key=${step.title} style=${{ ...box(960, 190, 920, 860), animation: still ? 'none' : `rs-in 500ms ${EASE} 250ms both` }}>
		${step.chart && html`<div style=${{ marginBottom: 14 }}>${step.chart()}</div>`}
		${step.facts && html`<div style=${{ fontFamily: F.sans, fontSize: 21, lineHeight: 1.4, color: C.ink, marginBottom: 14 }}>
			${step.facts.map((t, i) => html`<div key=${i} style=${{ display: 'flex', gap: 10 }}><span style=${{ color: C.red }}>▸</span><span>${t}</span></div>`)}
		</div>`}
		${step.means && html`<div style=${{ padding: '14px 18px', borderLeft: `5px solid ${C.red}`, background: C.paper2, borderRadius: 8, fontFamily: F.sans, fontSize: 20, lineHeight: 1.4 }}>
			<div style=${{ fontWeight: 700, marginBottom: 4 }}>What it means</div>${step.means}
		</div>`}
	</div>`
}

export function makeTableScene(spec) {
	const steps = [{ title: spec.title }, ...spec.steps]
	const beats = steps.length - 1
	function Scene({ b, still }) {
		const B = still ? 0 : Math.max(0, Math.min(beats, b))
		const step = steps[B]
		const zoomed = B > 0
		const geo = tableGeometry(spec)
		// Full view: fit the table into 1800 × 800 under the heading.
		const sFull = Math.min(1800 / geo.width, 820 / geo.height, 1.25)
		const full = { x: 960 - (geo.width * sFull) / 2, y: 200, s: sFull }
		// Thumbnail: 560 wide in the top-left corner.
		const sThumb = Math.min(800 / geo.width, 250 / geo.height)
		const thumb = { x: 60, y: 185, s: sThumb }
		const t = zoomed ? thumb : full
		const cols = step.cols ?? []
		const colGeo = geo.cols.filter((c) => cols.includes(c.key))
		const rowIdx = step.rows
		let hl = null
		if (zoomed && colGeo.length) {
			const x0 = Math.min(...colGeo.map((c) => c.x)), x1 = Math.max(...colGeo.map((c) => c.x + c.w))
			const y0 = rowIdx ? HEAD_H + Math.min(...rowIdx) * ROW_H : 0
			const y1 = rowIdx ? HEAD_H + (Math.max(...rowIdx) + 1) * ROW_H : geo.height
			hl = { x: t.x + x0 * t.s - 6, y: t.y + y0 * t.s - 6, w: (x1 - x0) * t.s + 12, h: (y1 - y0) * t.s + 12 }
		}
		const lens = zoomed && cols.length ? lensSpec(spec, cols, rowIdx) : null
		const lensGeo = lens && tableGeometry(lens)
		const lensTop = thumb.y + geo.height * sThumb + 40
		const sLens = lens ? Math.min(820 / lensGeo.width, (1030 - lensTop) / lensGeo.height, 1.35) : 1
		return html`<div style=${{ position: 'absolute', inset: 0 }}>
			<div style=${{ ...box(60, 40, 1800, 130) }}>
				<div style=${{ fontFamily: F.sans, fontSize: 22, color: C.red, letterSpacing: 0.5 }}>${spec.kicker}</div>
				<div key=${B} style=${{ fontFamily: F.hand, fontSize: 48, color: C.ink, marginTop: 4, animation: still ? 'none' : `rs-in 400ms ${EASE} both` }}>${step.title}</div>
			</div>
			${beats > 0 && html`<div style=${{ ...box(1560, 52, 300, 30), display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
				${steps.map((_, i) => html`<div key=${i} style=${{ width: i === B ? 26 : 11, height: 11, borderRadius: 6, background: i <= B ? C.red : C.faint }} />`)}
			</div>`}
			<div style=${{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, transition: still ? 'none' : `transform ${SLOW}ms ${EASE}` }}>
				<${Table} spec=${spec} geo=${geo} />
			</div>
			${hl && html`<div style=${{ ...box(hl.x, hl.y, hl.w, hl.h), border: `3px solid ${C.red}`, borderRadius: 6, animation: still ? 'none' : `rs-in 400ms ${EASE} 500ms both` }} />`}
			${lens && html`<div key=${'lens' + B} style=${{ position: 'absolute', left: 60, top: lensTop, animation: still ? 'none' : `rs-in 500ms ${EASE} 450ms both` }}>
				<div style=${{ transformOrigin: '0 0', transform: `scale(${sLens})` }}>
					<${Table} spec=${lens} geo=${lensGeo} big=${true} />
				</div>
			</div>`}
			${zoomed && !lens && step.chart && html`<div />`}
			${zoomed && html`<${Panel} step=${step} still=${still} />`}
			${!zoomed && spec.footnote && html`<div style=${{ ...box(60, 1010, 1800, 40), fontFamily: F.sans, fontSize: 18, color: C.dim }}>${spec.footnote}</div>`}
			<style>${`@keyframes rs-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }`}</style>
		</div>`
	}
	return { beats, render: Scene }
}

// ------------------------------------------------------------------ helpers for the data
const main = R.main
const row = (m, a) => main.find((r) => r.model === m && r.arm === a)
const bestOf = (key, lower = false) => (r) => {
	if (r.arm === undefined || !MODELS.includes(r.model)) return false
	const vals = main.filter((x) => x.model === r.model && x[key] !== null).map((x) => x[key])
	const best = lower ? Math.min(...vals) : Math.max(...vals)
	return r[key] === best
}
const perModelBars = (key, { lower = false } = {}) => MODELS.map((m) => {
	const vals = ['80k', 'oc', 'wf'].map((a) => row(m, a)[key])
	const best = lower ? Math.min(...vals) : Math.max(...vals)
	return { label: MODEL[m].replace(' v4.1 Flash', ''), bars: ['80k', 'oc', 'wf'].map((a) => ({ key: a, v: row(m, a)[key], color: ARM[a].color, bold: row(m, a)[key] === best })) }
})

// ================================================================== 1 · models
const MODEL_ROWS = [
	{ model: 'deepseek-v4.1-flash', dev: 'DeepSeek', arch: 'MoE, 763B', ctx: '1M', aa: '39', role: 'development', runs: '5 per system and arm' },
	{ model: 'glm-5.2', dev: 'Z.ai', arch: 'MoE, 756B', ctx: '1M', aa: 'n/l', role: 'development', runs: '1 (replayed)' },
	{ model: 'gpt-oss:120b', dev: 'OpenAI', arch: 'MoE, 117B (5.1B active)', ctx: '131K', aa: '12', role: 'confirmation', runs: '1 (fresh)' },
	{ model: 'gemma4:31b', dev: 'Google', arch: 'dense, 31B', ctx: '262K', aa: '19', role: 'confirmation', runs: '1 (fresh)' },
].map((r, i) => ({ ...r, sep: i === 2 }))

export const ModelsScene = makeTableScene({
	kicker: 'Results · the models',
	title: 'Four LLMs from four developers',
	labelCols: ['model'],
	columns: [
		{ key: 'model', label: 'Model', w: 300, align: 'left', mono: true, fmt: (v) => v },
		{ key: 'dev', label: 'Developer', w: 180 },
		{ key: 'arch', label: 'Architecture', w: 330 },
		{ key: 'ctx', label: 'Context', w: 130 },
		{ key: 'aa', label: 'AA index', w: 140 },
		{ key: 'role', label: 'Role in the study', w: 240, color: (r) => (r.role === 'confirmation' ? '#2e8b7e' : C.ink) },
		{ key: 'runs', label: 'Runs per system × arm', w: 300 },
	],
	rows: MODEL_ROWS,
	footnote: 'All served by Ollama Cloud · temperature 0.2 · reasoning off where supported · 16,384 max output tokens · AA: Artificial Analysis Intelligence Index (n/l: not listed)',
	steps: [
		{
			title: 'Two models to develop on, two to confirm',
			cols: ['role', 'runs'],
			facts: [
				'The workflow was designed while looking at DeepSeek results; GLM-5.2 ran the version just before the last change and was replayed.',
				'gpt-oss:120b and gemma4:31b ran only after the design was frozen: fresh, untouched confirmation.',
				'DeepSeek ran 5 times (seeds 1–5) to measure run-to-run variation: 60 + 3 × 12 = 96 observations.',
			],
			means: 'Results on gpt-oss and gemma are the fairest test of the design: it was never tuned on them.',
		},
	],
})

// ================================================================== 2 · methods
export const MethodsScene = makeTableScene({
	kicker: 'Results · what we compared',
	title: 'Four ways to decompose the same monolith',
	labelCols: ['name'],
	columns: [
		{ key: 'name', label: 'Method', w: 300, align: 'left', fmt: (v, r) => html`<span style=${{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><span style=${{ width: 14, height: 14, borderRadius: 3, background: ARM[r.arm].color }} />${v}</span>` },
		{ key: 'gets', label: 'Receives', w: 380, wrap: true, size: 19 },
		{ key: 'how', label: 'How it decides', w: 470, wrap: true, size: 19 },
		{ key: 'calls', label: 'LLM calls\nper system', w: 150 },
		{ key: 'guar', label: 'Complete\nby construction?', w: 200 },
	],
	rows: [
		{ arm: '80k', name: 'Single-shot (80k)', gets: 'source, dependency graph, class inventory', how: 'summarise → 5 architectural views → one call writes the decomposition', calls: '7', guar: 'no' },
		{ arm: 'oc', name: 'OpenCode agent', gets: 'same, as files in a workspace', how: 'an autonomous agent decides what to read and when to stop', calls: 'varies', guar: 'no' },
		{ arm: 'wf', name: 'Agentic workflow', gets: 'same', how: 'LLMs propose 3 candidates; code gates, scores and refines them', calls: '5', guar: 'yes' },
		{ arm: 'tools', name: 'Traditional tools', gets: 'as run by Wang et al. (ASE 2024)', how: 'deterministic clustering: DataCentric, HyDec, Mono2Micro ×2, Log2MS', calls: '0', guar: '–', sep: true },
	],
	footnote: 'All LLM arms use the same model per comparison, the same 23–53-class inventory, and no reference information.',
	steps: [
		{
			title: 'Same inputs; the difference is who decides',
			cols: ['how', 'calls', 'guar'],
			rows: [0, 1, 2],
			facts: [
				'Single-shot: one big final call decides everything.',
				'OpenCode (prompt "baseline-3", chosen for information parity): the agent decides its own process.',
				'Agentic workflow: the LLM only proposes; deterministic code checks, scores and improves.',
			],
			means: 'Any difference in results comes from the paradigm, not from what information each method saw.',
		},
		{
			title: 'The traditional tools are context, with two caveats',
			cols: ['gets', 'how'],
			rows: [3],
			facts: [
				'Tool results are the ones measured by the benchmark authors; we did not rerun them.',
				'Mono2Micro (and other tools that need it) was given the reference number of services.',
				'Log2MS produced decompositions only for JPetStore and PetClinic.',
			],
			means: 'The tools had a small advantage (the service count), so LLM gains over them are conservative.',
		},
	],
})

// ================================================================== 3 · the main table
const MAIN_ROWS = main.map((r, i) => ({ ...r, modelLabel: r.arm === '80k' ? MODEL[r.model] : '', sep: i > 0 && r.arm === '80k', tint: r.arm === 'wf' ? C.redGlow : null }))
const num = (key, lower) => ({ fmt: (v) => f1(v), best: bestOf(key, lower) })

export const MainScene = makeTableScene({
	kicker: 'Results · the main table',
	title: 'Every model, every method: means over the four systems',
	labelCols: ['modelLabel', 'arm'],
	firewallBefore: 'C2C10',
	columns: [
		{ key: 'modelLabel', label: 'Model', w: 250, align: 'left' },
		{ key: 'arm', label: 'Method', w: 230, align: 'left', fmt: (v) => html`<span style=${{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style=${{ width: 12, height: 12, borderRadius: 3, background: ARM[v].color }} />${ARM[v].label}</span>` },
		{ key: 'valid', label: 'Valid', w: 90, color: (r) => (r.valid === '4/4' ? '#2e8b7e' : C.red) },
		{ key: 'CMod', label: 'CMod', w: 100, ...num('CMod') },
		{ key: 'CiD', label: 'CiD', w: 100, ...num('CiD') },
		{ key: 'DTP', label: 'DTP', w: 100, ...num('DTP') },
		{ key: 'DI', label: 'DI', w: 100, ...num('DI') },
		{ key: 'BCP', label: 'BCP', w: 100, ...num('BCP') },
		{ key: 'C2C10', label: 'C2C\n10', w: 90, firewall: true, ...num('C2C10') },
		{ key: 'C2C33', label: 'C2C\n33', w: 90, firewall: true, ...num('C2C33') },
		{ key: 'C2C50', label: 'C2C\n50', w: 90, firewall: true, ...num('C2C50') },
		{ key: 'services', label: 'Services', w: 110, fmt: f1 },
		{ key: 'tokensK', label: 'Tokens\n(k)', w: 110, ...num('tokensK', true) },
	],
	rows: MAIN_ROWS,
	footnote: 'Repetition 1 · valid observations only (OpenCode with gpt-oss averages its 2 valid runs) · red = best per model · C2C columns (right of the dashed line) use the reference, computed only after each result was frozen.',
	steps: [
		{
			title: 'Validity: did each run give a usable answer?',
			cols: ['valid'],
			chart: () => ValidityGrid(),
			facts: [
				'Valid = every class exactly once, no unknown class, at least 3 services.',
				'OpenCode failed twice, both with gpt-oss:120b: all 53 PartsUnlimited classes in ONE service, and 3 PetClinic classes (BaseEntity, NamedEntity, Person) silently dropped.',
			],
			means: 'Single-shot happened to be valid too; only the workflow guarantees completeness by construction (repair), which matters most with weaker models.',
		},
		{
			title: 'Cost: tokens per system',
			cols: ['tokensK'],
			chart: () => html`<div><${Legend} arms=${['80k', 'oc', 'wf']} /><${Bars} groups=${perModelBars('tokensK', { lower: true })} unit="k" h=${380} /></div>`,
			facts: [
				'Workflow 53.7k vs single-shot 78.9k per system on average: −31.9 %, cheaper in all 16 model–system cells (p < 0.001).',
				'Workflow cost is stable across models (50–59k); OpenCode ranges 44–157k because the agent decides how much to read.',
			],
			means: 'The workflow is the cheapest option for three of four models, and its cost is predictable. (gpt-oss: OpenCode\'s low figure excludes 139k tokens of abandoned retry sessions.)',
		},
		{
			title: 'Domain independence: highest for every model',
			cols: ['DI'],
			chart: () => html`<div><${Legend} arms=${['80k', 'oc', 'wf']} /><${Bars} groups=${perModelBars('DI')} h=${380} /></div>`,
			facts: [
				'DI measures whether each business use case stays inside few services.',
				'Workflow 23.6–38.2 vs 22.4–22.5 for the other two methods, with every model.',
			],
			means: 'The clearest design gain. Caveat: DI is coarse here (few traced classes); single-shot scores exactly 22.4 with all four models.',
		},
		{
			title: 'Structure: modularity and cycles',
			cols: ['CMod', 'CiD'],
			chart: () => html`<div><${Legend} arms=${['80k', 'oc', 'wf']} /><${Bars} groups=${perModelBars('CMod')} h=${380} baseline=${40} max=${72} /></div>`,
			facts: [
				'CMod (chart): the workflow is highest with GLM-5.2, gpt-oss and gemma; DeepSeek is the exception (57.3 vs 62.3).',
				'CiD: all methods are near 85–95; the workflow is slightly lower with three models.',
			],
			means: 'Structure is comparable; the reference-free score keeps CMod high without collapsing services.',
		},
		{
			title: 'Data and business purity: the trade-off',
			cols: ['DTP', 'BCP'],
			chart: () => html`<div><${Legend} arms=${['80k', 'oc', 'wf']} /><${Bars} groups=${perModelBars('DTP')} h=${380} /></div>`,
			facts: [
				'DTP (chart, database transaction purity): the workflow is lower with DeepSeek, GLM-5.2 and gpt-oss.',
				'BCP (business context purity): higher with three models, lower with GLM-5.2.',
			],
			means: 'The workflow optimises code structure, not data ownership; refinement can pull entities away from their tables. This is its main weakness.',
		},
		{
			title: 'Past the firewall: similarity to the reference',
			cols: ['C2C10', 'C2C33', 'C2C50'],
			chart: () => html`<div><${Legend} arms=${['80k', 'oc', 'wf']} /><${Bars} groups=${perModelBars('C2C50')} h=${380} max=${100} /></div>`,
			facts: [
				'C2C-x = share of produced services that overlap a reference service by more than x %. Computed only after freezing.',
				'C2C-50 (chart): workflow highest with GLM-5.2, gpt-oss and gemma (67.1–71.2 vs 54.9–57.7 for single-shot).',
				'At 10 % and 33 % all methods are close: almost every service matches something in the reference.',
			],
			means: 'The workflow\'s services tend to match real services more closely, but the effect is not significant across all models.',
		},
		{
			title: 'Granularity: how many services?',
			cols: ['services'],
			chart: () => html`<div><${Legend} arms=${['80k', 'oc', 'wf']} /><${Bars} groups=${perModelBars('services')} h=${380} max=${7} /></div>`,
			facts: [
				'With gpt-oss and gemma the workflow produces fewer services (4.5 vs 5.2–5.8).',
				'Reference decompositions have 3–5 services.',
			],
			means: 'The gains are not bought by fragmenting into many tiny services, consistent with MF and the gate keeping granularity in range.',
		},
	],
})

// ================================================================== 4 · paired comparison
const PM = [['CMod', 'CMod'], ['CiD', 'CiD'], ['DTP', 'DTP'], ['DI', 'DI'], ['BCP', 'BCP'], ['C2C10', 'C2C-10'], ['C2C33', 'C2C-33'], ['C2C50', 'C2C-50'], ['tokens', 'Tokens (k)']]
const pairedRows = PM.map(([k, label], i) => {
	const a = R.pairedVs80k[k], o = R.pairedVsOC[k]
	return { label, k, sep: k === 'C2C10' || k === 'tokens', aw: `${a.w}/${a.t}/${a.l}`, ad: a.delta, ap: a.p, acd: a.cd, ow: `${o.w}/${o.t}/${o.l}`, od: o.delta, op: o.p, ocd: o.cd }
})
const sigCol = (pk) => ({ fmt: (v) => pfmt(v), color: (r) => (r[pk] !== null && r[pk] < 0.05 ? C.red : C.ink) })

export const PairedScene = makeTableScene({
	kicker: 'Results · paired comparison',
	title: 'Workflow minus baseline, over 16 model–system pairs',
	labelCols: ['label'],
	firewallBefore: null,
	columns: [
		{ key: 'label', label: 'Metric', w: 200, align: 'left' },
		{ key: 'aw', label: 'vs 80k\nW / T / L', w: 150 },
		{ key: 'ad', label: 'Δ', w: 120, fmt: (v) => sgn(v, 2) },
		{ key: 'ap', label: 'p', w: 120, ...sigCol('ap') },
		{ key: 'acd', label: "Cliff's δ", w: 130, fmt: (v) => sgn(v, 2) },
		{ key: 'ow', label: 'vs OpenCode\nW / T / L', w: 170 },
		{ key: 'od', label: 'Δ', w: 120, fmt: (v) => sgn(v, 2) },
		{ key: 'op', label: 'p', w: 120, ...sigCol('op') },
		{ key: 'ocd', label: "Cliff's δ", w: 130, fmt: (v) => sgn(v, 2) },
	],
	rows: pairedRows,
	footnote: 'W/T/L: model–system cells where the workflow wins / ties / loses · Δ: mean difference · p: two-sided Wilcoxon signed-rank · 14 pairs vs OpenCode (both outputs valid) · Tokens Δ in thousands (negative = cheaper).',
	steps: [
		{
			title: 'Direction of the differences vs single-shot',
			cols: ['aw', 'ad'],
			chart: () => Diverging({
				items: PM.filter(([k]) => k !== 'tokens').map(([k, label]) => ({ label, v: R.pairedVs80k[k].delta, note: `${R.pairedVs80k[k].w}/${R.pairedVs80k[k].t}/${R.pairedVs80k[k].l}` })),
				leftLabel: 'single-shot better', rightLabel: 'workflow better',
			}),
			facts: ['Largest gains: DI +8.7 (8 wins, 2 losses) and C2C-50 +7.8 (9 wins, 4 losses).', 'Largest loss: DTP −7.0 (2 wins, 5 losses).'],
			means: 'The workflow shifts the design, better on domain structure, worse on data purity, rather than improving everything.',
		},
		{
			title: 'Is any of it significant?',
			cols: ['ap', 'acd'],
			facts: [
				'No design or similarity difference reaches p < 0.05; all effect sizes are small (|δ| ≤ 0.28).',
				'Only cost differs clearly: 16 of 16 cells cheaper, δ = −0.56, p < 0.001.',
				'16 pairs give limited power, so "not significant" means no evidence either way, not "equal".',
			],
			means: 'Honest verdict: comparable design quality at a third lower cost.',
		},
		{
			title: 'Against the autonomous agent: the same picture',
			cols: ['ow', 'od', 'op'],
			chart: () => Diverging({
				items: PM.filter(([k]) => k !== 'tokens').map(([k, label]) => ({ label, v: R.pairedVsOC[k].delta, note: `${R.pairedVsOC[k].w}/${R.pairedVsOC[k].t}/${R.pairedVsOC[k].l}` })),
				leftLabel: 'OpenCode better', rightLabel: 'workflow better',
			}),
			facts: ['Gains in DI (+6.3) and C2C-50 (+8.9), loss in DTP (−8.3); none significant.', 'Cost: 56.6k fewer tokens per system, 13 of 14 cells, p < 0.001.'],
			means: 'Versus an agent that plans for itself, the fixed workflow is as good, cheaper, and always well-formed.',
		},
	],
})

// ================================================================== 5 · traditional tools
const TK = [['CMod', 'CMod'], ['CiD', 'CiD'], ['DTP', 'DTP'], ['DI', 'DI'], ['BCP', 'BCP'], ['C2C10', 'C2C-10'], ['C2C33', 'C2C-33'], ['C2C50', 'C2C-50']]
const toolRows = R.vsTools.map((r) => ({ ...r, name: r.arm, tint: r.arm === 'wf' ? C.redGlow : null }))
const bestTool = (k) => (r) => r[k] === Math.max(...R.vsTools.map((x) => x[k]))
export const ToolsScene = makeTableScene({
	kicker: 'Results · against traditional tools',
	title: 'LLM methods vs five established tools',
	labelCols: ['name'],
	firewallBefore: 'C2C10',
	columns: [
		{ key: 'name', label: 'Method', w: 300, align: 'left', fmt: (v) => html`<span style=${{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><span style=${{ width: 14, height: 14, borderRadius: 3, background: ARM[v].color }} />${ARM[v].label}</span>` },
		...TK.map(([k, label]) => ({ key: k, label: label.replace('-', '\n'), w: 130, fmt: f1, best: bestTool(k), firewall: k.startsWith('C2C') })),
	],
	rows: toolRows,
	footnote: 'Means over the four systems; LLM rows averaged over the four models. Tools: DataCentric, HyDec, Mono2Micro (2 configurations), Log2MS, as measured by Wang et al. (ASE 2024).',
	steps: [
		{
			title: 'Where LLMs are far ahead: cycles and close matches',
			cols: ['CiD', 'C2C33', 'C2C50'],
			chart: () => html`<div><${Legend} arms=${['tools', '80k', 'wf']} /><${Bars} max=${100} h=${380} groups=${[['CiD', 'CiD'], ['C2C33', 'C2C-33'], ['C2C50', 'C2C-50']].map(([k, l]) => ({ label: l, bars: R.vsTools.map((r) => ({ v: r[k], color: ARM[r.arm].color, bold: bestTool(k)(r) })) }))} /></div>`,
			facts: ['Cyclic independence ≈ 89 vs 64: LLM services rarely depend on each other in both directions.', 'C2C-50: 58–66 vs 28; C2C-33: ≈ 80 vs 57.'],
			means: 'Both LLM methods produce cleaner and more reference-like service boundaries than the tools, even though the tools were given the target number of services.',
		},
		{
			title: 'Where the tools still lead: domain independence',
			cols: ['DI'],
			chart: () => html`<div><${Legend} arms=${['tools', '80k', 'wf']} /><${Bars} max=${40} h=${340} groups=${[{ label: 'DI', bars: R.vsTools.map((r) => ({ v: r.DI, color: ARM[r.arm].color, bold: bestTool('DI')(r) })) }]} /></div>`,
			facts: ['Tools 35.0 · workflow 31.1 · single-shot 22.4.', 'CMod and BCP are similar across all three.'],
			means: 'The workflow closes most of the gap single-shot prompting leaves on domain independence.',
		},
	],
})

// ================================================================== 6 · stability and convergence
const stabRows = R.stability.map((r) => ({ ...r, name: r.arm, tint: r.arm === 'wf' ? C.redGlow : null }))
export const StabilityScene = makeTableScene({
	kicker: 'Results · repeatability',
	title: 'Five DeepSeek runs: how often do we get the same answer?',
	labelCols: ['name'],
	columns: [
		{ key: 'name', label: 'Method', w: 300, align: 'left', fmt: (v) => html`<span style=${{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><span style=${{ width: 14, height: 14, borderRadius: 3, background: ARM[v].color }} />${ARM[v].label}</span>` },
		...Object.entries(SYS).map(([k, l]) => ({ key: k, label: l, w: 170 })),
		{ key: 'mean', label: 'Mean distinct\npartitions', w: 190, fmt: (v) => v.toFixed(2) },
		{ key: 'nvi', label: 'Mean pairwise\ndistance (NVI)', w: 200, fmt: (v) => v.toFixed(3) },
	],
	rows: stabRows,
	footnote: 'Distinct partitions among 5 repetitions per system (1 = always identical, 5 = always different) · NVI: normalised variation of information (0 = identical).',
	steps: [
		{
			title: 'No method is repeatable',
			cols: [...Object.keys(SYS), 'mean'],
			chart: () => html`<div><${Legend} arms=${['80k', 'oc', 'wf']} /><${Bars} max=${5.5} h=${360} fmt=${(v) => String(v)} groups=${Object.entries(SYS).map(([k, l]) => ({ label: l, bars: R.stability.map((r) => ({ v: r[k], color: ARM[r.arm].color })) }))} /></div>`,
			facts: ['Every method produced more than one partition on at least half the systems; on 7ep Demo every workflow and OpenCode run differed.', 'The workflow varies slightly more (3.0 vs 2.75 and 2.25), but the partitions stay close (NVI 0.044).'],
			means: 'Several candidates and deterministic refinement do not make an LLM pipeline repeatable. Single runs are not enough to judge any method.',
		},
		{
			title: 'A surprise: different models, identical single-shot answers',
			cols: [],
			chart: () => html`<div><${Legend} arms=${['80k', 'wf']} /><${Bars} max=${4.5} h=${360} fmt=${(v) => String(v)} groups=${Object.entries(SYS).map(([k, l]) => ({ label: l, bars: [{ v: R.convergence[k].k80, color: ARM['80k'].color }, { v: R.convergence[k].wf, color: ARM.wf.color }] }))} /></div>`,
			facts: ['Chart: number of distinct partitions across the 4 models (repetition 1).', 'Single-shot gave the identical partition for all four models on JPetStore and PartsUnlimited.', 'The workflow never reproduced its own model\'s single-shot partition (0 of 16).'],
			means: 'On well-known public systems the models share a strong prior (memorisation cannot be excluded), so benchmark scores may overstate what to expect on a private monolith.',
		},
	],
})

// ================================================================== 7 · ablation
const AK = [['CMod', 'CMod'], ['DI', 'DI'], ['C2C50', 'C2C-50'], ['CiD', 'CiD'], ['DTP', 'DTP'], ['BCP', 'BCP'], ['C2C33', 'C2C-33'], ['C2C10', 'C2C-10'], ['services', 'Services']]
const ablRows = AK.map(([k, label]) => ({ label, k, ...R.ablation[k], sep: k === 'C2C33' }))
export const AblationScene = makeTableScene({
	kicker: 'Results · the key design decision',
	title: 'Removing the self-referential score, on identical LLM outputs',
	labelCols: ['label'],
	columns: [
		{ key: 'label', label: 'Metric', w: 220, align: 'left' },
		{ key: 'delta', label: 'Δ (final − old)', w: 220, fmt: (v) => sgn(v, 2) },
		{ key: 'w', label: 'wins', w: 130 },
		{ key: 'l', label: 'losses', w: 130 },
		{ key: 'p', label: 'p', w: 150, fmt: pfmt, color: (r) => (r.p !== null && r.p < 0.05 ? C.red : C.ink) },
	],
	rows: ablRows,
	footnote: '24 pairs: DeepSeek repetitions 1–5 and GLM-5.2, each re-selected and re-refined by both versions from the same recorded LLM outputs · p: two-sided Wilcoxon signed-rank.',
	steps: [
		{
			title: 'Same LLM outputs, only the selection changed',
			cols: ['delta', 'w', 'l', 'p'],
			chart: () => Diverging({ items: AK.map(([k, label]) => ({ label, v: R.ablation[k].delta, strong: R.ablation[k].p !== null && R.ablation[k].p < 0.05, note: R.ablation[k].p === null ? 'no change' : `p ${pfmt(R.ablation[k].p)}` })), leftLabel: 'old better', rightLabel: 'final better' }),
			facts: ['The old score rewarded agreement with the LLM\'s capability map, but one candidate is built from that map, so it won by construction.', 'Removing it: CMod +7.6 (13 wins, 0 losses), DI +10.8 (12/0), C2C-50 +13.9 (7/0); C2C-33 −4.9.'],
			means: 'Never grade a candidate by its own recipe. With Bonferroni over 8 metrics, CMod and DI stay significant, C2C-50 does not; the ablation uses development data only.',
		},
	],
})

// ================================================================== 8 · refinement
const RK = [['CMod', 'CMod'], ['CiD', 'CiD'], ['DI', 'DI'], ['C2C50', 'C2C-50'], ['C2C10', 'C2C-10'], ['BCP', 'BCP'], ['DTP', 'DTP'], ['C2C33', 'C2C-33']]
const refRows = RK.map(([k, label]) => ({ label, k, delta: R.refiner.delta[k] }))
export const RefinerScene = makeTableScene({
	kicker: 'Results · what refinement does',
	title: 'Before vs after the deterministic refiner',
	labelCols: ['label'],
	columns: [
		{ key: 'label', label: 'Metric', w: 240, align: 'left' },
		{ key: 'delta', label: `mean change (${R.refiner.runsWithMoves} runs with accepted moves)`, w: 560, fmt: (v) => sgn(v, 1), color: (r) => (r.delta > 0 ? C.ink : r.delta < 0 ? C.red : C.dim) },
	],
	rows: refRows,
	footnote: `The refiner accepted at least one move in ${R.refiner.runsWithMoves} of ${R.refiner.runs} benchmark runs; changes are relative to the selected candidate, measured by the blinded evaluator after freezing.`,
	steps: [
		{
			title: 'Structure goes up, data purity goes down',
			cols: ['delta'],
			chart: () => Diverging({ items: RK.map(([k, label]) => ({ label, v: R.refiner.delta[k] })), leftLabel: 'worse after', rightLabel: 'better after' }),
			facts: ['CMod +4.7, CiD +3.3, DI +2.7 and C2C-50 +6.3.', 'DTP −4.3, BCP −1.1, C2C-33 −8.8; C2C-10 unchanged.'],
			means: 'Local search does what it is told, improving the structural proxies, and can trade away data ownership. Its moves are proposals for an architect to review, not final truth.',
		},
	],
})
