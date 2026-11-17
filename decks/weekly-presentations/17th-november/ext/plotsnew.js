// Two plots, last week and revised. Click 0 shows last week's card under a "previously…" tag; click 1 sets the revised
// chart beside it, and either can then be clicked open to the whole slide. The revised charts are drawn here (not
// images), so they stay crisp:
// - tokens: (a) per model, single-shot → workflow, with the saving; (b) the spread of each approach over the models;
// - per model: a grid of workflow-minus-baseline differences on one diverging scale, with "higher in k of 8 models".
// Data: the paper's generated figures (papers/tse-2026/manuscript/imgs/tokens.tex and permodel.tex), five-run means.
import { useState, useEffect } from 'react'
import { html, C, F, EASE, box } from '@pack/scenes/kit.js'
import { useArrival } from './arrive.js'
import { OLD_TOKENS, OLD_PERMODEL } from './plots-old.js'

const GREEN = '#009E73', ORANGE = '#E69F00', BLUE = '#56B4E9', VERM = '#D55E00', MUTED = '#6f675c', GRID = '#ebe6de', NEUTRAL = '#ece8e1'
const minus = (v, d = 1) => (v < 0 ? '−' : '+') + Math.abs(v).toFixed(d)

// ------------------------------------------------------------------ tokens
// model, single-shot, OpenCode, workflow: thousand tokens per system (five-run means), sorted by single-shot
const TOK = [
	['gpt-oss:120b', 102.7, 40.1, 58.7], ['Kimi K3', 98.2, 57.8, 51.8], ['Mistral Large 4', 93.7, 211.1, 52.8],
	['DeepSeek v4.1 Flash', 90.6, 171.7, 52.2], ['DeepSeek v4 Pro', 82.6, 158.1, 51.7], ['Kimi K2.7 Code', 77.7, 425.7, 50.8],
	['GLM-5.2', 64.3, 155.6, 50.6], ['gemma4:31b', 62.3, 126.7, 53.3],
]
const diamond = (cx, cy, s) => `${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`

function TokenChart() {
	// (a) dumbbells: x 350–1050 for 40–110k
	const ax = (k) => 350 + (k - 40) * 10, ry = (i) => 268 + i * 80
	// (b) spread: x 1330–1790 for 0–240k (OpenCode's 426k drawn at the break)
	const bx = (k) => 1330 + Math.min(k, 240) * 1.92, by = { ss: 400, oc: 540, wf: 680 }
	const range = (j) => [Math.min(...TOK.map((r) => r[j])), Math.max(...TOK.map((r) => r[j]))]
	const strip = (j, y, col, label, shape) => {
		const [lo, hi] = range(j)
		return html`<g>
			<rect x=${bx(lo) - 14} y=${y - 15} width=${bx(hi) - bx(lo) + 28} height="30" rx="15" fill=${col} opacity="0.22" />
			${TOK.map((r, i) => shape === 'd'
				? html`<polygon key=${i} points=${diamond(bx(r[j]), y, 11)} fill=${col} stroke="#fff" strokeWidth="2" />`
				: shape === 's'
				? html`<rect key=${i} x=${bx(r[j]) - 8} y=${y - 8} width="16" height="16" rx="3" fill=${col} stroke="#fff" strokeWidth="2" />`
				: html`<circle key=${i} cx=${bx(r[j])} cy=${y} r="9" fill=${col} stroke="#fff" strokeWidth="2" />`)}
			${label}
		</g>`
	}
	const t = (x, y, s, o = {}) => html`<text x=${x} y=${y} fontFamily=${F.sans} fontSize=${o.size ?? 22} fill=${o.fill ?? C.ink} textAnchor=${o.anchor ?? 'start'} fontWeight=${o.weight ?? 400}>${s}</text>`
	return html`<svg width="1800" height="920" viewBox="60 100 1800 920" style=${{ position: 'absolute', left: 0, top: 0 }}>
		${t(350, 196, '(a) per model', { size: 27, weight: 700 })}
		<circle cx="356" cy="225" r="9" fill=${ORANGE} />${t(374, 233, 'single-shot', { size: 21, fill: MUTED })}
		${t(500, 233, '→', { size: 21, fill: MUTED })}
		<polygon points=${diamond(538, 225, 11)} fill=${GREEN} />${t(556, 233, 'workflow', { size: 21, fill: MUTED })}
		${t(1080, 233, 'saving', { size: 21, fill: MUTED })}
		${[40, 50, 60, 70, 80, 90, 100, 110].map((k) => html`<g key=${k}><line x1=${ax(k)} y1="245" x2=${ax(k)} y2="850" stroke=${GRID} strokeWidth="2" />${t(ax(k), 884, k, { size: 20, fill: MUTED, anchor: 'middle' })}</g>`)}
		${TOK.map(([m, ss, , wf], i) => html`<g key=${m}>
			${t(330, ry(i) + 8, m, { anchor: 'end' })}
			<line x1=${ax(wf)} y1=${ry(i)} x2=${ax(ss)} y2=${ry(i)} stroke="#d6cfc4" strokeWidth="7" strokeLinecap="round" />
			<circle cx=${ax(ss)} cy=${ry(i)} r="12" fill=${ORANGE} stroke="#fff" strokeWidth="3" />
			<polygon points=${diamond(ax(wf), ry(i), 15)} fill=${GREEN} stroke="#fff" strokeWidth="3" />
			${t(1080, ry(i) + 8, '−' + Math.round(((ss - wf) / ss) * 100) + '%', { fill: GREEN, weight: 700 })}
		</g>`)}
		${t(700, 930, 'thousand tokens per system', { size: 21, fill: MUTED, anchor: 'middle' })}

		${t(1180, 196, '(b) spread over the eight models', { size: 27, weight: 700 })}
		${[0, 50, 100, 150, 200].map((k) => html`<g key=${k}><line x1=${bx(k)} y1="340" x2=${bx(k)} y2="730" stroke=${GRID} strokeWidth="2" />${t(bx(k), 764, k, { size: 20, fill: MUTED, anchor: 'middle' })}</g>`)}
		${t(1300, by.ss + 8, 'Single-shot', { anchor: 'end' })}${t(1300, by.oc + 8, 'OpenCode', { anchor: 'end' })}${t(1300, by.wf + 8, 'Workflow', { anchor: 'end', weight: 700 })}
		${strip(1, by.ss, ORANGE, t(bx(103) + 24, by.ss + 8, '62–103k', { fill: MUTED }), 'c')}
		${strip(2, by.oc, BLUE, html`<g>
			<line x1=${bx(240) - 22} y1=${by.oc - 24} x2=${bx(240) - 32} y2=${by.oc + 24} stroke="#fff" strokeWidth="8" />
			<line x1=${bx(240) - 18} y1=${by.oc - 24} x2=${bx(240) - 28} y2=${by.oc + 24} stroke=${MUTED} strokeWidth="2.5" />
			<line x1=${bx(240) - 30} y1=${by.oc - 24} x2=${bx(240) - 40} y2=${by.oc + 24} stroke=${MUTED} strokeWidth="2.5" />
			${t(bx(240), by.oc - 32, '40–426k', { fill: MUTED, anchor: 'end' })}</g>`, 's')}
		${strip(3, by.wf, GREEN, t(bx(59) + 26, by.wf + 8, '51–59k', { fill: GREEN, weight: 700 }), 'd')}
		${t(1560, 804, 'thousand tokens per system', { size: 21, fill: MUTED, anchor: 'middle' })}
	</svg>`
}

// ------------------------------------------------------------------ per model
// workflow minus baseline, metric points (five-run means over four systems); rows sorted by mean gain;
// columns: BCP, DI, CMod, C2C-50, each vs single-shot then vs OpenCode
const METRICS = ['BCP', 'DI', 'CMod', 'C2C-50']
const PM = [
	['gemma4:31b', [6.83, 7.74, 26.0, 22.83, 7.52, 7.48, 19.75, 20.61]],
	['GLM-5.2', [7.15, 7.36, 12.16, 14.69, 4.48, 2.69, 0.38, 2.95]],
	['gpt-oss:120b', [5.18, 3.45, 3.87, 4.94, 7.89, 8.33, 2.03, 9.46]],
	['Kimi K2.7 Code', [2.1, 2.43, 7.98, 5.98, 4.59, 1.36, 5.11, 5.09]],
	['DeepSeek v4 Pro', [1.83, 6.74, -0.5, 11.45, 3.86, 5.41, -3.5, 4.08]],
	['Kimi K3', [5.91, 3.92, 10.36, -1.49, 4.9, -0.52, 1.54, 1.91]],
	['Mistral Large 4', [2.78, 0.9, 6.33, 2.91, 0.96, 2.09, -1.8, 6.43]],
	['DeepSeek v4.1 Flash', [3.18, 4.58, 5.85, 4.48, 2.12, 0.34, -0.13, -1.74]],
]
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a, b, t) => 'rgb(' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t)).join(',') + ')'
// one diverging scale: green for workflow higher (full at +15), vermillion for lower (full at −5), grey within ±0.5
function shade(v) {
	if (Math.abs(v) < 0.5) return { fill: NEUTRAL, dark: false }
	const t = v > 0 ? Math.min(1, v / 15) : Math.min(1, -v / 5)
	return { fill: v > 0 ? mix('#e3f3ec', GREEN, t) : mix('#fbe7dc', VERM, t), dark: t > 0.55 }
}

function PerModelChart() {
	const X0 = 440, CW = 150, P = 158, GG = 26, Y0 = 290, RH = 64, RP = 72
	const cx = (j) => X0 + j * P + Math.floor(j / 2) * GG
	const t = (x, y, s, o = {}) => html`<text x=${x} y=${y} fontFamily=${F.sans} fontSize=${o.size ?? 22} fill=${o.fill ?? C.ink} textAnchor=${o.anchor ?? 'middle'} fontWeight=${o.weight ?? 400}>${s}</text>`
	const sumY = Y0 + 8 * RP + 26
	return html`<svg width="1800" height="920" viewBox="60 100 1800 920" style=${{ position: 'absolute', left: 0, top: 0 }}>
		<defs><linearGradient id="pm-key" x1="0" x2="1">
			<stop offset="0" stopColor=${VERM} /><stop offset="0.16" stopColor="#fbe7dc" /><stop offset="0.2" stopColor=${NEUTRAL} />
			<stop offset="0.24" stopColor="#e3f3ec" /><stop offset="1" stopColor=${GREEN} /></linearGradient></defs>
		${t(1300, 160, 'workflow − baseline, in metric points', { size: 19, fill: MUTED, anchor: 'end' })}
		${t(1336, 160, '−5', { size: 18, fill: MUTED })}
		<rect x="1360" y="146" width="360" height="16" rx="8" fill="url(#pm-key)" />
		<line x1="1432" y1="142" x2="1432" y2="166" stroke=${C.ink} strokeWidth="2" />
		${t(1432, 186, '0', { size: 16, fill: MUTED })}
		${t(1752, 160, '+15', { size: 18, fill: MUTED })}
		${METRICS.map((m, g) => html`<g key=${m}>
			${t(cx(2 * g) + (P + CW) / 2, 222, m, { size: 30, weight: 700 })}
			${t(cx(2 * g) + CW / 2, 262, 'vs single-shot', { size: 18, fill: MUTED })}
			${t(cx(2 * g + 1) + CW / 2, 262, 'vs OpenCode', { size: 18, fill: MUTED })}
			${g > 0 && html`<line x1=${cx(2 * g) - GG / 2 - 4} y1="200" x2=${cx(2 * g) - GG / 2 - 4} y2=${sumY + 66} stroke=${GRID} strokeWidth="2" />`}
		</g>`)}
		${PM.map(([model, vals], r) => html`<g key=${model}>
			${t(X0 - 20, Y0 + r * RP + RH / 2 + 8, model, { anchor: 'end' })}
			${vals.map((v, j) => {
				const s = shade(v), x = cx(j), y = Y0 + r * RP
				return html`<g key=${j}><rect x=${x} y=${y} width=${CW} height=${RH} rx="12" fill=${s.fill} />
					${t(x + CW / 2, y + RH / 2 + 8, minus(v), { fill: s.dark ? '#fff' : C.ink, weight: s.dark ? 700 : 500 })}</g>`
			})}
		</g>`)}
		${t(X0 - 20, sumY + 24, 'workflow higher in', { anchor: 'end', size: 21, fill: MUTED })}
		${PM[0][1].map((_, j) => {
			const k = PM.filter(([, v]) => v[j] > 0).length, x = cx(j) + CW / 2
			return html`<g key=${'s' + j}>
				${t(x, sumY + 24, k + ' of 8', { size: 24, weight: 700, fill: k === 8 ? GREEN : C.ink })}
				${PM.map(([, v], i) => html`<circle key=${i} cx=${x - 49 + i * 14} cy=${sumY + 50} r="5" fill=${v[j] > 0 ? GREEN : VERM} opacity=${v[j] > 0 ? 1 : 0.85} />`)}
			</g>`
		})}
	</svg>`
}

// ------------------------------------------------------------------ the two slides
// Click 0: last week's card on the whole slide, under "previously…"; click 1: it moves left and the revised chart
// comes in beside it. From then on, clicking a card zooms it to the whole slide; clicking again, clicking beside it, or
// Space or Esc puts it back (pointer events and those keys are kept from the canvas; the zoom is this viewer's own).
// Each card's content is laid out once at 1800×920 and scaled to the card, so it reads the same at any size.
const FULL = { x: 60, y: 100, w: 1800, h: 920 }
const half = (x) => ({ x, y: (1080 - 470) / 2, w: 920, h: 470 })
const LEFT = half(25), RIGHT = half(975)
const stop = (e) => e.stopPropagation()
const SHIELD = { onPointerDown: stop, onPointerUp: stop, onPointerMove: stop, onDoubleClick: stop, onTouchStart: stop, onTouchEnd: stop }

function Card({ r, z, dim, live, zoomed, onToggle, quiet, children }) {
	const t = quiet ? 'none' : `left 700ms ${EASE}, top 700ms ${EASE}, width 700ms ${EASE}, height 700ms ${EASE}, opacity 500ms ${EASE}, transform 700ms ${EASE}`
	return html`<div ...${live ? SHIELD : {}} onClick=${live ? (e) => { e.stopPropagation(); onToggle() } : undefined}
		style=${{ ...box(r.x, r.y, r.w, r.h), zIndex: z, background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflow: 'hidden',
			opacity: dim, pointerEvents: live ? 'all' : 'none', cursor: zoomed ? 'zoom-out' : 'zoom-in', transition: t }}>
		<div style=${{ position: 'absolute', left: 0, top: 0, width: FULL.w, height: FULL.h, transformOrigin: '0 0', transform: `scale(${r.w / FULL.w})`, transition: t }}>${children}</div>
	</div>`
}

function BeforeAfter({ b, still, img, oldTag, newTag, Chart }) {
	const B = still ? 1 : Math.max(0, Math.min(1, b))
	const arrived = useArrival(still) // a hook: always called, never behind ||
	const quiet = still || !arrived
	const [zoom, setZoom] = useState(null) // 'old' or 'new'
	useEffect(() => { if (still || B < 1) setZoom(null) }, [still, B])
	useEffect(() => {
		if (zoom === null) return
		const onKey = (e) => {
			if (e.key !== ' ' && e.key !== 'Escape') return
			e.stopPropagation(); e.preventDefault(); setZoom(null)
		}
		window.addEventListener('keydown', onKey, true)
		return () => window.removeEventListener('keydown', onKey, true)
	}, [zoom])
	const live = !still && B >= 1
	const toggle = (k) => () => setZoom((z) => (z === k ? null : k))
	const rOld = B === 0 || zoom === 'old' ? FULL : LEFT
	const rNew = zoom === 'new' ? FULL : B === 0 ? { ...RIGHT, x: 1960 } : RIGHT
	const dim = (k) => (zoom !== null && zoom !== k ? 0.08 : 1)
	const tag = (s) => html`<div style=${{ position: 'absolute', left: 26, top: 14, fontFamily: F.hand, fontSize: 46, color: C.red, whiteSpace: 'nowrap' }}>${s}</div>`
	const t = quiet ? 'none' : `left 700ms ${EASE}, top 700ms ${EASE}, opacity 500ms ${EASE}`
	return html`<div style=${{ position: 'absolute', inset: 0 }}>
		${zoom !== null && html`<div ...${SHIELD} onClick=${(e) => { e.stopPropagation(); setZoom(null) }} style=${{ ...box(0, 0, 1920, 1080), zIndex: 4, pointerEvents: 'all', cursor: 'zoom-out' }} />`}
		<${Card} r=${rOld} z=${zoom === 'old' ? 5 : 2} dim=${dim('old')} live=${live} zoomed=${zoom === 'old'} onToggle=${toggle('old')} quiet=${quiet}>
			<div style=${{ position: 'absolute', inset: 0, padding: '90px 40px 30px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<img src=${img.src} draggable=${false} style=${{ maxWidth: '100%', maxHeight: '100%', display: 'block', pointerEvents: 'none' }} />
			</div>
			${tag(oldTag)}
		</${Card}>
		<${Card} r=${rNew} z=${zoom === 'new' ? 5 : 2} dim=${B === 0 ? 0 : dim('new')} live=${live} zoomed=${zoom === 'new'} onToggle=${toggle('new')} quiet=${quiet}>
			${tag(newTag)}
			<${Chart} />
		</${Card}>
		<div style=${{ position: 'absolute', left: rOld.x - 20, top: Math.max(14, rOld.y - 86), zIndex: zoom === 'old' ? 6 : 3, padding: '2px 22px 6px', borderRadius: 12,
				background: 'rgba(240,228,66,0.55)', fontFamily: F.hand, fontSize: 56, lineHeight: 1.1, color: C.red, opacity: zoom === 'new' ? 0 : 1, transition: t }}>previously…</div>
	</div>`
}

export const TokensScene = (p) => html`<${BeforeAfter} ...${p} img=${OLD_TOKENS} oldTag="Token cost and time" newTag="Token cost" Chart=${TokenChart} />`
export const PerModelScene = (p) => html`<${BeforeAfter} ...${p} img=${OLD_PERMODEL} oldTag="Per model" newTag="Per model" Chart=${PerModelChart} />`
