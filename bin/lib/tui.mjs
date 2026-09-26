// A small terminal UI kit for `pres` (no dependencies): full-screen pages with a header, a body and
// key hints, plus the pieces the app is made of: menu, input, run (a command with live output) and
// pager. Everything is async: each piece draws itself, waits for keys, and resolves with the answer.
import readline from 'node:readline'
import { spawn } from 'node:child_process'

const out = process.stdout
const inp = process.stdin

// ---------- text ----------
const sgr = (a, b) => (s) => `\x1b[${a}m${s}\x1b[${b}m`
export const c = {
	bold: sgr(1, 22),
	dim: sgr(2, 22),
	italic: sgr(3, 23),
	under: sgr(4, 24),
	inverse: sgr(7, 27),
	red: sgr(31, 39),
	green: sgr(32, 39),
	yellow: sgr(33, 39),
	grey: sgr(90, 39),
}
const ANSI = /\x1b\[[0-9;?]*[A-Za-z]/g
export const width = (s) => s.replace(ANSI, '').length

// Cut a line to `w` visible characters, keeping escape codes whole.
export function fit(s, w) {
	if (width(s) <= w) return s
	let seen = 0
	let res = ''
	for (let i = 0; i < s.length; ) {
		const m = /^\x1b\[[0-9;?]*[A-Za-z]/.exec(s.slice(i))
		if (m) {
			res += m[0]
			i += m[0].length
			continue
		}
		if (seen >= w - 1) break
		res += s[i++]
		seen++
	}
	return res + '…\x1b[0m'
}
export const pad = (s, w) => s + ' '.repeat(Math.max(0, w - width(s)))

// Wrap plain text to `w` columns (keeps leading indentation on continuation lines).
export function wrap(text, w) {
	const lines = []
	for (const raw of String(text).split('\n')) {
		if (width(raw) <= w) {
			lines.push(raw)
			continue
		}
		const indent = /^\s*/.exec(raw)[0]
		let line = ''
		for (const word of raw.trim().split(/\s+/)) {
			if (line && width(line) + 1 + width(word) > w) {
				lines.push(line)
				line = indent + word
			} else line = line ? `${line} ${word}` : indent + word
		}
		lines.push(line)
	}
	return lines
}

// ---------- fuzzy matching ----------
// Score how well `query` matches `text` as a subsequence: consecutive letters, word starts and an
// early start score higher. Returns { score, at: [matched indexes] } or null.
export function fuzzy(query, text) {
	const q = query.toLowerCase().replace(/\s+/g, '')
	const t = text.toLowerCase()
	if (!q) return { score: 0, at: [] }
	const at = []
	let score = 0
	let from = 0
	for (const ch of q) {
		// prefer a word start for this letter if there is one ahead, else the next occurrence
		let i = t.indexOf(ch, from)
		if (i < 0) return null
		for (let j = i; j >= 0 && j < t.length; j = t.indexOf(ch, j + 1)) {
			if (j === 0 || /[\s/\-_.·:]/.test(t[j - 1])) {
				if (j - i < 12) i = j
				break
			}
		}
		const start = i === 0 || /[\s/\-_.·:]/.test(t[i - 1])
		score += 1 + (start ? 3 : 0) + (at.length && i === at[at.length - 1] + 1 ? 4 : 0)
		at.push(i)
		from = i + 1
	}
	if (t.includes(query.toLowerCase().trim())) score += 8
	return { score: score - at[0] * 0.05 - t.length * 0.01, at }
}
// Items ordered by best match over their `fields(item)` strings (best field counts).
export function rank(query, items, fields) {
	if (!query.trim()) return items
	return items
		.map((it) => ({ it, s: Math.max(...fields(it).map((f) => fuzzy(query, f)?.score ?? -Infinity)) }))
		.filter((x) => x.s > -Infinity)
		.sort((a, b) => b.s - a.s)
		.map((x) => x.it)
}
// Highlight matched letters.
export function mark(text, at) {
	if (!at?.length) return text
	const set = new Set(at)
	return [...text].map((ch, i) => (set.has(i) ? c.red(c.bold(ch)) : ch)).join('')
}

// ---------- the screen ----------
let active = false
let paintFn = null

export function start() {
	if (active) return
	active = true
	readline.emitKeypressEvents(inp)
	inp.setRawMode(true)
	inp.resume()
	out.write('\x1b[?1049h\x1b[?25l')
	out.on('resize', repaint)
	inp.on('keypress', onKey)
}
export function stop() {
	if (!active) return
	active = false
	out.off('resize', repaint)
	inp.off('keypress', onKey)
	try {
		inp.setRawMode(false)
	} catch {}
	inp.pause()
	out.write('\x1b[?25h\x1b[?1049l')
}
process.on('exit', stop)

const size = () => ({ cols: Math.max(40, out.columns || 80), rows: Math.max(12, out.rows || 24) })
function repaint() {
	if (!active || !paintFn) return
	const { cols, rows } = size()
	const lines = paintFn({ cols, rows })
	out.write('\x1b[H' + lines.slice(0, rows).map((l) => fit(l, cols) + '\x1b[0m\x1b[K').join('\r\n') + '\x1b[0m\x1b[J')
}

// One page: header (brand + where you are), body, key hints on the last line.
// `body({ cols, height })` returns the body's lines.
export function page({ crumbs = [], body, hints = [] }) {
	paintFn = ({ cols, rows }) => {
		const trail = crumbs.filter(Boolean).map((x) => c.grey(' › ') + x).join('')
		const head = ` ${c.bold(c.red('✎ pres'))}${trail}`
		const height = rows - 4
		const lines = body({ cols: cols - 4, height }).slice(0, height)
		while (lines.length < height) lines.push('')
		const keys = hints.map(([k, what]) => `${c.bold(k)} ${c.grey(what)}`).join(c.grey('  ·  '))
		return [head, c.grey(' ' + '─'.repeat(cols - 2)), ...lines.map((l) => '  ' + l), '', ' ' + keys]
	}
	repaint()
}

// Keys arrive in bursts (fast typing, paste, held arrows): queue them so none are lost.
const queue = []
let waiting = null
function onKey(str, k = {}) {
	if (k.ctrl && k.name === 'c') {
		stop()
		process.exit(0)
	}
	// Esc and then a key, pressed quickly, arrives as one Alt+key: it was meant as two keys.
	const seq = k.sequence ?? str
	if (k.meta && !k.ctrl && typeof seq === 'string' && seq.length === 2 && seq[0] === '\x1b') {
		onKey(undefined, { name: 'escape' })
		return onKey(seq[1], { name: k.name, shift: k.shift, sequence: seq[1] })
	}
	const ev = { str, name: k.name, ctrl: k.ctrl, meta: k.meta, shift: k.shift }
	if (waiting) {
		const w = waiting
		waiting = null
		w(ev)
	} else queue.push(ev)
}
function key() {
	if (queue.length) return Promise.resolve(queue.shift())
	return new Promise((resolve) => (waiting = resolve))
}
export const anyKey = key

// ---------- menu ----------
// items: { label, hint?, about?, value, key?, heading?, disabled? }. A heading is a section title.
// Resolves with the chosen item's value, or null (esc / ←).
export async function menu({ crumbs, intro = [], items, hints = [], search = false, start: first, back = true }) {
	let filter = null // null: not searching; '' or text: searching
	const pickable = (it) => !it.heading && !it.disabled
	const shown = () => {
		if (!filter) return items
		return rank(filter, items.filter((it) => !it.heading), (it) => [it.label, it.search ?? '', it.hint ?? ''])
	}
	let list = shown()
	const same = (a, b) => a === b || (a && b && typeof a === 'object' && JSON.stringify(a) === JSON.stringify(b))
	let sel = Math.max(0, list.findIndex((it) => pickable(it) && (first === undefined || same(it.value, first))))
	const move = (d) => {
		if (!list.some(pickable)) return
		let i = sel
		do i = (i + d + list.length) % list.length
		while (!pickable(list[i]))
		sel = i
	}
	if (list[sel] && !pickable(list[sel])) move(1)
	const introLines = (cols) => (typeof intro === 'function' ? intro(cols) : intro).flatMap((l) => (width(l) > cols ? wrap(l, cols) : [l]))
	for (;;) {
		const cur = list[sel]
		page({
			crumbs,
			hints: filter !== null ? [['type', 'to search'], ['↑↓', 'move'], ['enter', 'choose'], ['esc', 'stop searching']] : [['↑↓', 'move'], ['enter', 'choose'], ...hints, ...(search ? [['/', 'search']] : []), ...(back ? [['esc', 'back']] : [])],
			body: ({ cols, height }) => {
				const top = introLines(cols)
				if (top.length) top.push('')
				if (filter !== null) top.push(`${c.red('/')} ${filter}${c.inverse(' ')}`, '')
				const about = cur?.about ? ['', ...wrap(cur.about, cols).map((l) => c.grey(l))] : []
				const room = Math.max(3, height - top.length - about.length)
				const rows = list.map((it, i) => {
					if (it.heading) return c.grey(c.bold(it.label.toUpperCase()))
					const text = filter ? mark(it.label, fuzzy(filter, it.label)?.at) : it.label
					const label = it.disabled ? c.grey(it.label) : i === sel ? c.bold(text) : text
					const lead = i === sel ? c.red('❯ ') : '  '
					const hint = it.hint ? '  ' + c.grey(it.hint) : ''
					const hot = it.key && filter === null ? c.grey(`  [${it.key}]`) : ''
					return `${lead}${label}${hint}${hot}`
				})
				// headings above the first item stay visible when scrolled to the top
				let from = 0
				if (rows.length > room) from = Math.min(Math.max(0, sel - Math.floor(room / 2)), rows.length - room)
				const view = rows.slice(from, from + room)
				if (from > 0) view[0] = c.grey('  ↑ more')
				if (from + room < rows.length) view[view.length - 1] = c.grey('  ↓ more')
				if (!list.length) view.push(c.grey('  nothing matches'))
				return [...top, ...view, ...about]
			},
		})
		const k = await key()
		if (k.name === 'up' || (filter === null && k.str === 'k')) move(-1)
		else if (k.name === 'down' || k.name === 'tab' || (filter === null && k.str === 'j')) move(1)
		else if (k.name === 'pageup') for (let i = 0; i < 8; i++) move(-1)
		else if (k.name === 'pagedown') for (let i = 0; i < 8; i++) move(1)
		else if (k.name === 'return' || k.name === 'enter' || (filter === null && k.name === 'right')) {
			if (cur && pickable(cur)) return cur.value
		} else if (k.name === 'escape' || (filter === null && (k.name === 'left' || k.name === 'backspace'))) {
			if (filter !== null) {
				filter = null
				list = shown()
				sel = Math.max(0, list.indexOf(cur))
				if (list[sel] && !pickable(list[sel])) move(1)
			} else if (back) return null
		} else if (filter !== null) {
			if (k.name === 'backspace') filter = filter.slice(0, -1)
			else if (k.str && k.str >= ' ' && !k.ctrl && !k.meta) filter += k.str
			list = shown()
			sel = 0
			if (list[sel] && !pickable(list[sel])) move(1)
		} else if (search && k.str === '/') {
			filter = ''
			list = shown()
			sel = 0
			if (list[sel] && !pickable(list[sel])) move(1)
		} else if (k.str && !k.ctrl && !k.meta) {
			const hit = items.find((it) => pickable(it) && it.key === k.str)
			if (hit) return hit.value
		}
	}
}

export const confirm = async ({ crumbs, question, detail = [], yes = 'Yes', no = 'No, go back' }) =>
	(await menu({ crumbs, intro: [c.bold(question), ...(detail.length ? ['', ...detail] : [])], items: [{ label: yes, value: true }, { label: no, value: false }] })) === true

// ---------- input ----------
// Resolves with the text (trimmed), or null on esc. `check(text)` returns an error message or null.
export async function input({ crumbs, question, detail = [], initial = '', placeholder = '', check, optional = false }) {
	let text = initial
	let at = text.length
	let error = null
	for (;;) {
		page({
			crumbs,
			hints: [['enter', optional ? 'ok (empty to skip)' : 'ok'], ['esc', 'cancel']],
			body: ({ cols }) => {
				const before = text.slice(0, at)
				const under = text[at] ?? ' '
				const field = text ? `${before}${c.inverse(under)}${text.slice(at + 1)}` : `${c.inverse(' ')}${c.grey(placeholder)}`
				return [...wrap(c.bold(question), cols), ...detail.flatMap((d) => wrap(d, cols).map((l) => c.grey(l))), '', `${c.red('❯')} ${field}`, '', error ? c.red(error) : '']
			},
		})
		const k = await key()
		if (k.name === 'escape') return null
		if (k.name === 'return' || k.name === 'enter') {
			const v = text.trim()
			error = !v && !optional ? 'Type something first (or esc to cancel).' : v && check ? check(v) : null
			if (!error) return v
		} else if (k.name === 'backspace') {
			if (at > 0) (text = text.slice(0, at - 1) + text.slice(at)), at--
		} else if (k.name === 'delete') text = text.slice(0, at) + text.slice(at + 1)
		else if (k.name === 'left') at = Math.max(0, at - 1)
		else if (k.name === 'right') at = Math.min(text.length, at + 1)
		else if (k.name === 'home' || (k.ctrl && k.name === 'a')) at = 0
		else if (k.name === 'end' || (k.ctrl && k.name === 'e')) at = text.length
		else if (k.ctrl && k.name === 'u') (text = ''), (at = 0)
		else if (k.str && !k.ctrl && !k.meta && k.str >= ' ') {
			text = text.slice(0, at) + k.str + text.slice(at)
			at += k.str.length
			error = null
		}
	}
}

// ---------- pick (type to search, with suggestions) ----------
// options: { label, value, hint?, search? } in suggestion order (best guess first). Typing narrows
// them fuzzily; `create(text)` may offer a new entry ({ label, value, hint }) when the text doesn't
// name an existing one. Resolves with the chosen value, or null on esc.
export async function pick({ crumbs, question, detail = [], options, create, placeholder = 'type to search' }) {
	let text = ''
	let sel = 0
	for (;;) {
		const found = rank(text, options, (o) => [o.label, o.search ?? ''])
		const exact = options.some((o) => o.label.toLowerCase() === text.trim().toLowerCase() || String(o.value).toLowerCase() === text.trim().toLowerCase())
		const extra = text.trim() && !exact && create ? create(text.trim()) : null
		const list = extra ? [...found, { ...extra, isNew: true }] : found
		sel = Math.min(sel, Math.max(0, list.length - 1))
		page({
			crumbs,
			hints: [['type', 'to search'], ['↑↓', 'move'], ['tab', 'complete'], ['enter', 'choose'], ['esc', 'cancel']],
			body: ({ cols, height }) => {
				const top = [...wrap(c.bold(question), cols), ...detail.flatMap((d) => wrap(d, cols).map((l) => c.grey(l))), '', `${c.red('›')} ${text}${c.inverse(' ')}${text ? '' : c.grey(' ' + placeholder)}`, '']
				const room = Math.max(3, height - top.length)
				let from = Math.min(Math.max(0, sel - Math.floor(room / 2)), Math.max(0, list.length - room))
				const rows = list.slice(from, from + room).map((o, k) => {
					const i = from + k
					const lead = i === sel ? c.red('❯ ') : '  '
					const label = o.isNew ? c.green(o.label) : mark(o.label, fuzzy(text, o.label)?.at)
					return `${lead}${i === sel ? c.bold(label) : label}${o.hint ? '  ' + c.grey(o.hint) : ''}`
				})
				if (!list.length) rows.push(c.grey('  nothing matches'))
				return [...top, ...rows]
			},
		})
		const k = await key()
		if (k.name === 'escape') return null
		else if (k.name === 'up') sel = Math.max(0, sel - 1)
		else if (k.name === 'down') sel = Math.min(list.length - 1, sel + 1)
		else if (k.name === 'tab') {
			if (list[sel] && !list[sel].isNew) (text = list[sel].label), (sel = 0)
		} else if (k.name === 'return' || k.name === 'enter') {
			if (list[sel]) return list[sel].value
		} else if (k.name === 'backspace') (text = text.slice(0, -1)), (sel = 0)
		else if (k.ctrl && k.name === 'u') (text = ''), (sel = 0)
		else if (k.str && !k.ctrl && !k.meta && k.str >= ' ') (text += k.str), (sel = 0)
	}
}

// ---------- running a command ----------
// Runs `cmd args` and shows its output live, then a result menu: `after` items plus "Done".
// Resolves with { ok, output, choice }.
export async function run({ crumbs, title, cmd, args, cwd, after = () => [] }) {
	const lines = ['']
	let done = null
	let frame = 0
	const spin = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
	const show = () =>
		page({
			crumbs,
			hints: done ? [] : [['', 'working… (ctrl+c quits pres)']],
			body: ({ cols, height }) => {
				const status = done ? (done.ok ? c.green('✓ ') : c.red('✗ ')) + c.bold(title) : c.red(spin[frame % spin.length] + ' ') + c.bold(title)
				const text = lines.flatMap((l) => wrap(l, cols))
				while (text.length && text[text.length - 1] === '') text.pop()
				return [status, '', ...text.slice(-(height - 2))]
			},
		})
	const timer = setInterval(() => (frame++, show()), 100)
	const ok = await new Promise((resolve) => {
		const p = spawn(cmd, args, { cwd, env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' } })
		const add = (buf) => {
			const parts = buf.toString('utf8').replace(ANSI, '').split('\n')
			lines[lines.length - 1] += parts[0]
			lines.push(...parts.slice(1))
			for (let i = 0; i < lines.length; i++) if (lines[i].includes('\r')) lines[i] = lines[i].split('\r').filter(Boolean).at(-1) ?? ''
		}
		p.stdout.on('data', add)
		p.stderr.on('data', add)
		p.on('error', (e) => (add(Buffer.from(e.message)), resolve(false)))
		p.on('close', (code) => resolve(code === 0))
	})
	clearInterval(timer)
	queue.length = 0 // keys pressed while it ran shouldn't answer what comes next
	done = { ok }
	const output = lines.join('\n').trim()
	const extra = ok ? after(output) : []
	const text = output ? output.split('\n') : [c.grey(ok ? '(done)' : '(no output)')]
	const choice = await menu({
		crumbs,
		intro: () => [(ok ? c.green('✓ ') : c.red('✗ ')) + c.bold(ok ? title : `${title}: it didn't work`), '', ...text.slice(-14)],
		items: [...extra, { label: extra.length ? 'Back' : 'OK', value: null }],
	})
	return { ok, output, choice }
}

// ---------- pager ----------
export async function pager({ crumbs, text, style = (l) => l }) {
	let top = 0
	for (;;) {
		let max = 0
		page({
			crumbs,
			hints: [['↑↓', 'scroll'], ['space', 'page down'], ['esc', 'back']],
			body: ({ cols, height }) => {
				const all = wrap(text, cols).map(style)
				max = Math.max(0, all.length - height)
				top = Math.min(top, max)
				return all.slice(top, top + height)
			},
		})
		const k = await key()
		const h = size().rows - 5
		if (k.name === 'up' || k.str === 'k') top = Math.max(0, top - 1)
		else if (k.name === 'down' || k.str === 'j') top = Math.min(max, top + 1)
		else if (k.name === 'pagedown' || k.name === 'space' || k.str === ' ') top = Math.min(max, top + h)
		else if (k.name === 'pageup' || k.str === 'b') top = Math.max(0, top - h)
		else if (k.name === 'home' || k.str === 'g') top = 0
		else if (k.name === 'end' || k.str === 'G') top = max
		else if (k.name === 'escape' || k.name === 'q' || k.name === 'return' || k.name === 'left') return
	}
}
