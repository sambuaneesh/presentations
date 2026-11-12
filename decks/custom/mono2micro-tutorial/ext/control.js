// The class game's controls, talking to the class-board store (start a 5-minute timer, stop, reset).
//   GameControl  on the QR slide (scene 'game-control', a small box in the corner): ▶ start 5:00 starts the
//                timer and moves the talk on to the board slide; ↺ reset (tap twice) clears the room for a new round.
//   useGame      shared state for the board slide (classboard.js), which shows the countdown and a ■ stop button.
// Buttons work while presenting; in the editor and thumbnails only a quiet placeholder is drawn.
import { useEffect, useRef, useState } from 'react'
import { useEditor } from 'tldraw'
import { html, C, F } from '@pack/scenes/kit.js'
import { ADMIN_KEY, STORE } from './admin.js'

export const ROOM = 'nov12'
const stop = (e) => e.stopPropagation()
export const SHIELD = { onPointerDown: stop, onPointerUp: stop, onPointerMove: stop, onDoubleClick: stop, onTouchStart: stop, onTouchEnd: stop }
const mmss = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }

// Poll the room (state, who joined, who sent) while `live`; act(action) calls the admin API.
// players = everyone who joined (or sent), sent = how many cuts are in.
export function useGame(live, room = ROOM) {
	const [st, setSt] = useState(null)
	const [players, setPlayers] = useState(null)
	const [sent, setSent] = useState(null)
	const [msg, setMsg] = useState('')
	const [, tick] = useState(0)
	const offset = useRef(0)
	const refresh = async () => {
		try {
			const get = (path) => fetch(`${STORE}/${path}?room=${room}`).then((r) => r.json())
			const [s, cuts, joined] = await Promise.all([get('state'), get('cuts'), get('players')])
			offset.current = s.now - Date.now(); setSt(s); setMsg('')
			const senders = new Set(cuts.map((c) => c.device ?? c.group))
			setSent(senders.size); setPlayers(new Set([...senders, ...joined.map((p) => p.device)]).size)
		} catch { setMsg('cannot reach the store') }
	}
	useEffect(() => {
		if (!live) return
		refresh()
		const a = setInterval(refresh, 2000), b = setInterval(() => tick((t) => t + 1), 250)
		return () => { clearInterval(a); clearInterval(b) }
	}, [live, room])
	// quiet: no '…' while it runs (the hidden extend leaves no trace on screen unless it fails)
	const act = async (action, extra = {}, quiet = false) => {
		if (!quiet) setMsg('…')
		try {
			const r = await fetch(`${STORE}/admin`, { method: 'POST', body: JSON.stringify({ room, key: ADMIN_KEY, action, ...extra }) })
			const j = await r.json()
			if (!r.ok) throw new Error(j.error)
			offset.current = j.now - Date.now(); setSt(j); setMsg(''); refresh()
			return true
		} catch (e) { setMsg('failed: ' + e.message); return false }
	}
	const left = st?.endsAt ? st.endsAt - (Date.now() + offset.current) : null
	const phase = !st ? 'unknown' : st.status === 'waiting' ? 'waiting' : st.status === 'closed' || (left != null && left <= 0) ? 'closed' : left != null ? 'running' : 'open'
	const label = { unknown: '…', waiting: 'waiting to start', closed: "time's up", running: mmss(left), open: 'open' }[phase]
	const [mm, ss] = phase === 'running' ? label.split(':') : [null, null]
	// the presenter's secret: tap the minutes for +1:00, the seconds for +0:10 (also reopens a timer that just ran out)
	const extend = (seconds) => act('extend', { seconds }, true)
	return { st, players, sent, msg, act, phase, label, left, mm, ss, extend }
}

// The next slide, as if the presenter pressed → (the present tool's own step).
function nextSlide(editor) {
	if (editor.getCurrentToolId() === 'present') editor.getCurrentTool().next?.()
}

export const button = (label, onClick, tone, size = 66) => html`<button type="button" ...${SHIELD} onClick=${(e) => { e.stopPropagation(); onClick() }}
	style=${{ pointerEvents: 'all', cursor: 'pointer', fontFamily: F.sans, fontSize: size, fontWeight: 700, padding: `${size * 0.45}px ${size * 0.6}px`, borderRadius: size * 0.55,
		border: `${Math.max(3, size / 11)}px solid ${tone}`, background: '#fff', color: tone, flex: 1 }}>${label}</button>`

// The QR slide's corner box (drawn on the full 1920×1080 design area, shown at about a fifth of that size).
export function GameControl({ still }) {
	const editor = useEditor()
	const g = useGame(!still)
	const [armed, setArmed] = useState(false)
	// white underneath the rounded corners too (the scene backdrop is paper-coloured)
	const wrap = (children) => html`<div style=${{ position: 'absolute', inset: 0, background: '#fff' }}><div style=${{ position: 'absolute', inset: 0, border: `10px solid ${C.faint}`, borderRadius: 80, boxSizing: 'border-box', padding: '80px 100px',
		display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: F.sans }}>${children}</div></div>`
	if (still) return wrap(html`<div style=${{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 130, color: C.dim }}>game controls</div>`)
	const joined = g.players == null ? '–' : g.phase === 'waiting' ? `${g.players} joined` : `${g.sent ?? 0} / ${g.players} sent`
	return wrap(html`
		<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 120, color: C.ink }}>
			<b>${g.label}</b><span style=${{ fontSize: 100 }}>${joined}</span>
		</div>
		<div style=${{ display: 'flex', gap: 60 }}>
			${button('▶ start 5:00', async () => { if (await g.act('start', { minutes: 5 })) nextSlide(editor) }, '#1f9e89', 100)}
			${button(armed ? 'tap again' : '↺ reset', () => { if (armed) { setArmed(false); g.act('reset') } else { setArmed(true); setTimeout(() => setArmed(false), 3000) } }, '#d62839', 100)}
		</div>
		<div style=${{ fontSize: 84, color: g.msg ? '#d62839' : C.dim }}>${g.msg || 'start also moves on to the board'}</div>`)
}
