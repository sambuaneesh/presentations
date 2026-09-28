// Shared UI state for live rooms. In a room (the deck meta has a `host`), the presenter's panels, tabs,
// scroll positions, searches and widget choices are written to the document meta (`meta.tp`) and every
// viewer (read-only) renders from it, so followers see exactly what the presenter sees. Outside a room
// (tldraw Desktop, or a website visitor on their own) this is plain local state and writes nothing.
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useMaybeEditor, useValue } from 'tldraw'

export const SlideCtx = createContext('deck')

function read(editor, k) {
	return editor?.getDocumentSettings?.().meta?.tp?.[k]
}
function write(editor, k, v) {
	if (!editor) return
	const meta = editor.getDocumentSettings().meta ?? {}
	if (JSON.stringify(meta.tp?.[k]) === JSON.stringify(v)) return
	editor.run(() => editor.updateDocumentSettings({ meta: { ...meta, tp: { ...(meta.tp ?? {}), [k]: v } } }), { history: 'ignore' })
}

// { editor, room, viewer }: are we in a live room, and are we a (read-only) follower in it?
export function useRoom() {
	const editor = useMaybeEditor?.()
	const room = useValue('tp-room', () => !!editor?.getDocumentSettings?.().meta?.pp?.host, [editor])
	const viewer = room && !!editor?.getIsReadonly?.()
	return { editor, room, viewer }
}

// Like useState, but shared through the room. `key` is unique within a slide; the slide is added here.
export function useShared(key, initial) {
	const { editor, room, viewer } = useRoom()
	const slide = useContext(SlideCtx)
	const k = `${slide}|${key}`
	const remote = useValue(`tp-${k}`, () => (room ? read(editor, k) : undefined), [editor, room, k])
	const [local, setLocal] = useState(() => read(editor, k) ?? initial)
	const latest = useRef(local)
	latest.current = local
	const set = useCallback((v) => {
		if (viewer) return
		const next = typeof v === 'function' ? v(latest.current) : v
		latest.current = next
		setLocal(next)
		if (room) write(editor, k, next)
	}, [viewer, room, editor, k])
	return [viewer ? (remote === undefined ? initial : remote) : local, set, viewer]
}

// Scroll position of one scrollable panel, shared the same way (presenter writes at most ~8 per second).
export function useSharedScroll(key) {
	const { editor, room, viewer } = useRoom()
	const slide = useContext(SlideCtx)
	const k = `${slide}|scroll:${key}`
	const remote = useValue(`tp-${k}`, () => (room ? read(editor, k) : undefined), [editor, room, k])
	const el = useRef(null)
	const timer = useRef(null)
	useEffect(() => {
		const node = el.current
		if (!node || !room || viewer) return
		const onScroll = () => {
			if (timer.current) return
			timer.current = setTimeout(() => { timer.current = null; write(editor, k, Math.round(node.scrollTop)) }, 120)
		}
		node.addEventListener('scroll', onScroll, { passive: true })
		return () => { node.removeEventListener('scroll', onScroll); clearTimeout(timer.current); timer.current = null }
	}, [room, viewer, editor, k])
	useEffect(() => {
		if (viewer && el.current && typeof remote === 'number') el.current.scrollTo({ top: remote, behavior: 'smooth' })
	}, [viewer, remote])
	return el
}

// Drawers carry render functions, which cannot be synced: they are registered by id when rendered, and
// the shared state carries only the id.
const DRAWERS = new Map()
export function registerDrawer(slide, drawer) {
	DRAWERS.set(`${slide}|${drawer.id ?? 'drawer:' + drawer.title}`, drawer)
}
export function drawerFor(slide, id) {
	return DRAWERS.get(`${slide}|${id}`)
}
