// Actions for the interactive slide "Try to win" (slides/16-try-it.js). Class cards (meta.cls) are dragged
// between service zones (tags z1–z5, meta.svc); after every drop the cards are tidied into their zones and the
// scores are recomputed with ext/metrics.js, the code that reproduces the study's recorded values.
//   rescore      a card was dropped on a zone, or anywhere else
//   oneService   the trap: one zone grows over the others and takes every class
//   packages     back to the Java packages (the starting state)
import { toRichText } from 'tldraw'
import { PC, EDGES } from './data.js'
import { cmod, cid, labelPurity, bcp, c2c } from './metrics.js'

const ZONES = ['z1', 'z2', 'z3', 'z4', 'z5']
const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1)

function cards(editor, slide) {
	return editor.getSortedChildIdsForParent(slide.id).map((id) => editor.getShape(id)).filter((s) => s?.meta?.cls)
}
function setText(editor, s, text, color) {
	if (s) editor.updateShape({ id: s.id, type: s.type, props: { richText: toRichText(text), ...(color && { color }) } })
}
const inside = (z, x, y) => x >= z.x && x <= z.x + z.props.w && y >= z.y && y <= z.y + z.props.h

// Which zone holds each card (by its centre); visible zones only.
function assignment(editor, slide, find) {
	const zones = ZONES.map(find).filter((z) => z && z.opacity > 0)
	const dec = {}, where = new Map(), loose = []
	for (const c of cards(editor, slide)) {
		const z = zones.find((z) => inside(z, c.x + c.props.w / 2, c.y + c.props.h / 2))
		if (z) { (dec[z.meta.svc] ??= []).push(c.meta.cls); where.set(c.id, z) } else loose.push(c)
	}
	return { dec, where, zones, loose }
}

// Stack each zone's cards neatly (one column, or several in a wide zone), keeping their order.
function tidy(editor, slide, find) {
	const { where, zones } = assignment(editor, slide, find)
	for (const z of zones) {
		const mine = cards(editor, slide).filter((c) => where.get(c.id) === z).sort((a, b) => a.y - b.y || a.x - b.x)
		const cols = Math.max(1, Math.floor((z.props.w - 12) / 310))
		mine.forEach((c, i) => editor.updateShape({ id: c.id, type: c.type, x: z.x + 12 + (i % cols) * 310, y: z.y + 56 + Math.floor(i / cols) * 54 }))
	}
}

function score(editor, slide, find) {
	const { dec, loose } = assignment(editor, slide, find)
	const n = Object.keys(dec).length
	const valid = loose.length === 0 && n >= 3
	const s = n ? { cmod: cmod(dec, EDGES).value, cid: cid(dec, EDGES).value, di: labelPurity(dec, PC.usecases).value, bcp: bcp(dec, PC.usecases).value, dtp: labelPurity(dec, PC.tables).value, c2c: c2c(dec, PC.reference, 0.5).value } : null
	setText(editor, find('s-valid'), valid ? 'valid ✓' : 'not valid', valid ? 'green' : 'red')
	setText(editor, find('s-n'), `${n} service${n === 1 ? '' : 's'}`)
	for (const [k, label] of [['cmod', 'CMod'], ['cid', 'CiD'], ['di', 'DI'], ['bcp', 'BCP'], ['dtp', 'DTP'], ['c2c', 'C2C-50']])
		setText(editor, find('s-' + k), `${label} ${s ? f1(s[k]) : '–'}`, n === 1 && k !== 'bcp' && k !== 'c2c' ? 'red' : 'black')
	const msg = n === 1 ? 'perfect scores,\nnothing was split'
		: loose.length ? `${loose.length} class${loose.length > 1 ? 'es' : ''} in no service`
		: n < 3 ? 'fewer than three services' : ''
	setText(editor, find('s-msg'), msg, 'red')
}

export const tryActions = {
	rescore(editor, { slide, find }) {
		tidy(editor, slide, find)
		score(editor, slide, find)
	},
	oneService(editor, { slide, find }) {
		const z1 = find('z1')
		const last = find('z5')
		if (!z1 || !last) return
		editor.updateShape({ id: z1.id, type: z1.type, props: { w: last.x + last.props.w - z1.x } })
		for (const t of ['z2', 'z3', 'z4', 'z5', 'zl2', 'zl3', 'zl4', 'zl5']) { const s = find(t); if (s) editor.updateShape({ id: s.id, type: s.type, opacity: 0 }) }
		setText(editor, find('zl1'), 'PetClinic, all of it')
		cards(editor, slide).forEach((c, i) => editor.updateShape({ id: c.id, type: c.type, x: z1.x + 12 + (i % 5) * 310, y: z1.y + 56 + Math.floor(i / 5) * 54 }))
		score(editor, slide, find)
	},
	packages(editor, { slide, find }) {
		for (const id of editor.getSortedChildIdsForParent(slide.id)) {
			const s = editor.getShape(id)
			if (!s?.meta?.home) continue
			editor.updateShape({ id, type: s.type, x: s.meta.home.x, y: s.meta.home.y, opacity: 1, ...(s.meta.homeProps && { props: s.meta.homeProps }) })
		}
		setText(editor, find('zl1'), 'petclinic')
		score(editor, slide, find)
	},
}
