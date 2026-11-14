// The phone interface. On a small screen (the shorter side under 600px) a deck page swaps the
// desktop editor for a layout made for thumbs: no tldraw toolbars, the slide as big as the screen
// allows, large ‹ › buttons, and everything else in one ⋯ menu.
//
//   portrait   header (back, title, ⋯) · the slide · ‹ 12 / 44 › with step dots · the slide's
//              title · what your role can do · the list of slides (tap to jump)
//   landscape  the slide fills the screen; a control pill floats at the bottom and fades when idle
//
// Three roles, the same as on a big screen (App.jsx, live.jsx):
//   solo       reading a deck on your own: always "presenting" locally, so taps step through it
//   viewer     in a live room: follows the presenter, nothing to steer
//   presenter  in a live room: browse privately, or "Present to everyone" and drive the room from
//              the phone (laser, highlighter, clear), plus copy link / reset / leave / end for everyone
//
// It only uses what every pack version's site-entry exports (newer packs add annotateMode,
// slideBeats and clearAnnotations; older ones get fallbacks), so every deck gets it.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useValue } from 'tldraw'
import { pack } from './pack.js'
import { SYNC_URL, roomId, roomUrl, hashPath, openRoom, endRoom, seedFromDeck, followPresenter } from './live.jsx'
import { ensureJoinSlide } from './joinSlide.js'

// ---------- when to use it ----------

// ?ui=phone or ?ui=desktop forces one (kept for this tab), e.g. to edit from a phone.
function uiOverride() {
	try {
		const asked = new URLSearchParams(location.search).get('ui')
		if (asked === 'phone' || asked === 'desktop') sessionStorage.setItem('pp-ui', asked)
		return sessionStorage.getItem('pp-ui')
	} catch {
		return null
	}
}
const smallScreen = () => Math.min(window.innerWidth, window.innerHeight) < 600

export function usePhone() {
	const [phone, setPhone] = useState(() => (uiOverride() ?? (smallScreen() ? 'phone' : 'desktop')) === 'phone')
	useEffect(() => {
		const on = () => setPhone((uiOverride() ?? (smallScreen() ? 'phone' : 'desktop')) === 'phone')
		window.addEventListener('resize', on)
		return () => window.removeEventListener('resize', on)
	}, [])
	return phone
}

// In the desktop view on a small screen (chosen from the phone menu): a way back.
export function PhoneViewLink() {
	if (!smallScreen() || uiOverride() !== 'desktop') return null
	const back = () => {
		try {
			sessionStorage.setItem('pp-ui', 'phone')
		} catch {}
		location.reload()
	}
	return (
		<button type="button" className="pp-phoneview" onPointerDown={(e) => e.stopPropagation()} onClick={back}>
			Phone view
			<style>{`.pp-phoneview { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); z-index: 500; pointer-events: all; padding: 8px 14px;
				border-radius: 999px; border: none; background: #0f1115; color: #eef1f5; font: 600 14px system-ui, sans-serif; box-shadow: 0 6px 18px rgba(0,0,0,.3); }`}</style>
		</button>
	)
}

function switchToDesktop() {
	try {
		sessionStorage.setItem('pp-ui', 'desktop')
	} catch {}
	location.reload()
}

// ---------- deck helpers (with fallbacks for older pack versions) ----------

const bare = (id) => id.replace(/^user:/, '')

function slideBeats(editor, slideId) {
	if (pack.slideBeats) return pack.slideBeats(editor, slideId)
	let n = 0
	for (const id of editor.getShapeAndDescendantIds([slideId])) {
		const m = editor.getShape(id)?.meta
		for (const k of ['beat', 'until', 'focus']) if (typeof m?.[k] === 'number') n = Math.max(n, m[k])
	}
	return n
}

function clearAnnotations(editor) {
	if (pack.clearAnnotations) return pack.clearAnnotations(editor)
	const slide = pack.getSlides(editor)[pack.presentIndex.get()]
	if (!slide) return
	const ids = editor.getSortedChildIdsForParent(slide.id).filter((id) => editor.getShape(id)?.meta?.annotation)
	if (ids.length) editor.deleteShapes(ids)
}

// "03 · Results at a glance" → "Results at a glance"
const slideTitle = (s) => (s?.props?.name ?? '').replace(/^\s*\d+\s*[·.:-]\s*/, '').trim()

const tool = (editor) => editor.getCurrentTool()
let switching = false // startPresenting is swapping the browse tool for the real one

// Small line icons (text arrows render too thin, and ⟲ is missing from some phone fonts).
const ICONS = {
	left: 'M15 5l-7 7 7 7',
	right: 'M9 5l7 7-7 7',
	close: 'M6 6l12 12M18 6L6 18',
	rotate: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5',
	play: 'M8 5.5v13l10.5-6.5z',
	stop: 'M7 7h10v10H7z',
}
function Icon({ name, size = 22 }) {
	if (name === 'dots')
		return (
			<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
				{[5, 12, 19].map((x) => <circle key={x} cx={x} cy="12" r="2" fill="currentColor" />)}
			</svg>
		)
	const solid = name === 'play' || name === 'stop'
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill={solid ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={solid ? 0 : 2.4} strokeLinecap="round" strokeLinejoin="round">
			<path d={ICONS[name]} />
		</svg>
	)
}
const presenting = (editor) => editor.getCurrentToolId() === 'present'

// ---------- the shell ----------

export function PhoneDeck({ editor, role, deck, entry, landscape, children }) {
	const rootRef = useRef(null)
	const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
	const [sheet, setSheet] = useState(null) // null · 'menu' · 'slides'
	const [form, setForm] = useState(null) // null · 'live' · 'login'
	const [toast, setToast] = useState(null)
	const [awake, setAwake] = useState(true) // landscape: controls shown (they fade after a while)

	useLayoutEffect(() => {
		const el = rootRef.current
		if (!el) return
		const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
		ro.observe(el)
		return () => ro.disconnect()
	}, [])
	const land = size.w > size.h

	// Landscape: show the controls on any touch, fade them 3.5 s later.
	useEffect(() => {
		if (!land) return void setAwake(true)
		let timer = setTimeout(() => setAwake(false), 3500)
		const wake = () => {
			setAwake(true)
			clearTimeout(timer)
			timer = setTimeout(() => setAwake(false), 3500)
		}
		const el = rootRef.current
		el?.addEventListener('pointerdown', wake, true)
		return () => (clearTimeout(timer), el?.removeEventListener('pointerdown', wake, true))
	}, [land])
	const keepAwake = sheet !== null

	const say = (text) => {
		setToast(text)
		setTimeout(() => setToast((t) => (t === text ? null : t)), 1800)
	}

	const state = usePhoneState(editor, role)
	useSoloPresenting(editor, role)
	usePresenterBrowsing(editor, role)
	useViewerResting(editor, role, state, size)

	// The slide's shape decides the stage's (16:9 for every deck so far).
	const aspect = useValue('phoneAspect', () => {
		const s = editor && pack.getSlides(editor)[0]
		return s ? s.props.w / s.props.h : 16 / 9
	}, [editor])

	// The stage: the largest box of the slide's shape that fits the space it has.
	const stageArea = land ? { w: size.w, h: size.h } : { w: size.w, h: Math.max(140, size.h * 0.42) }
	const stage = fit(stageArea, aspect)

	const back = folderOf()
	const header = (
		<header className="ph-head">
			<a className="ph-icon" href={`#/${back.path}`} aria-label={`Back to ${back.name}`}><Icon name="left" size={26} /></a>
			<div className="ph-headtext">
				<div className="ph-title">{entry.title}</div>
				{roomId ? <LiveChip editor={editor} role={role} /> : <div className="ph-sub">{back.name}</div>}
			</div>
			<button type="button" className="ph-icon" aria-label="Menu" onClick={() => setSheet('menu')}><Icon name="dots" size={24} /></button>
		</header>
	)

	const stageEl = (
		<div className="ph-stage" style={{ width: stage.w, height: stage.h }}>
			{children}
		</div>
	)

	return (
		<div ref={rootRef} className={`ph ${land ? 'ph-land' : 'ph-port'}${awake || keepAwake ? ' ph-awake' : ''}`}>
			<style>{PHONE_CSS}</style>
			{form && <PhoneForm kind={form} onCancel={() => setForm(null)} />}
			<div className="ph-body" style={form ? { display: 'none' } : undefined}>
				{/* The stage keeps one place in the tree in both layouts, so turning the phone never
				    remounts the editor (that would restart the deck, or reconnect a live room). */}
				{!land && header}
				<div className="ph-stagewrap">{stageEl}</div>
				<Progress state={state} />
				{land ? (
					<>
						<div className="ph-landtop">
							<a className="ph-pill ph-icon" href={`#/${back.path}`} aria-label={`Back to ${back.name}`}><Icon name="left" /></a>
							{roomId && <div className="ph-pill ph-chip"><LiveChip editor={editor} role={role} /></div>}
						</div>
						<div className="ph-landbar">
							<div className="ph-pill ph-row">
								<Controls editor={editor} role={role} state={state} compact />
								{state.canJump && <button type="button" className="ph-btn ph-ghost" onClick={() => setSheet('slides')}>Slides</button>}
								<button type="button" className="ph-btn ph-ghost ph-sq" aria-label="Menu" onClick={() => setSheet('menu')}><Icon name="dots" /></button>
							</div>
							<RoleBar editor={editor} role={role} state={state} compact say={say} />
						</div>
					</>
				) : (
					<div className="ph-panel">
						<Controls editor={editor} role={role} state={state} />
						{(role !== 'viewer' || state.mode === 'following') && <div className="ph-slidename">{state.title || '\u00a0'}</div>}
						<RoleBar editor={editor} role={role} state={state} say={say} />
						{landscape.canOffer && (
							<button type="button" className="ph-btn ph-wide ph-ghost" onClick={landscape.enter}><Icon name="rotate" size={18} /> Turn sideways for a bigger slide</button>
						)}
						<SlideList editor={editor} state={state} onPick={(i) => jump(editor, role, i)} />
					</div>
				)}
			</div>
			{sheet === 'menu' && (
				<Sheet title="Menu" onClose={() => setSheet(null)}>
					<Menu editor={editor} role={role} deck={deck} state={state} landscape={landscape} land={land} close={() => setSheet(null)} openForm={setForm} say={say} />
				</Sheet>
			)}
			{sheet === 'slides' && (
				<Sheet title="Slides" onClose={() => setSheet(null)}>
					<SlideList editor={editor} state={state} onPick={(i) => (jump(editor, role, i), setSheet(null))} />
				</Sheet>
			)}
			{toast && <div className="ph-toast">{toast}</div>}
		</div>
	)
}

function fit(area, aspect) {
	const w = Math.min(area.w, area.h * aspect)
	return { w: Math.floor(w), h: Math.floor(w / aspect) }
}

function folderOf() {
	const parts = hashPath().split('/').slice(0, -1)
	return { path: parts.join('/'), name: parts.length ? parts.at(-1).replace(/-/g, ' ') : 'all presentations' }
}

// ---------- state ----------

// Everything the controls need, as one reactive value.
function usePhoneState(editor, role) {
	return useValue('phoneState', () => {
		if (!editor) return { index: -1, count: 0, beat: 0, beats: 0, title: '', mode: 'loading', canStep: false, canJump: false }
		const slides = pack.getSlides(editor)
		const index = pack.presentIndex.get()
		const beat = pack.presentBeat.get()
		const slide = slides[index]
		// (older packs can't count a scene's steps: then the dots grow as the steps go by)
		const beats = Math.max(slide ? slideBeats(editor, slide.id) : 0, beat)
		const isPresenting = presenting(editor)
		const follower = isPresenting && !!tool(editor).follower
		const live = pack.getDeck(editor).live
		const me = bare(editor.user.getId())
		const here = (id) => id && editor.getCollaborators().some((c) => bare(c.userId) === id)
		// presenter: 'presenting' (driving the room) or 'browsing' (looking around privately)
		// viewer:    'following' (the presenter's slides), 'watching' (their screen), 'free' (stopped following)
		let mode = 'solo'
		if (role === 'presenter') mode = isPresenting && !follower ? 'presenting' : 'browsing'
		// viewer: 'following' the presenter's slides · 'watching' their screen (desktop presenters) ·
		//         'free' (stopped following one of those) · 'waiting' (nothing to follow yet)
		if (role === 'viewer') {
			if (follower) mode = 'following'
			else if (editor.getInstanceState().followingUserId) mode = 'watching'
			else if ((live && here(live.presenter)) || here(pack.getDeck(editor).host)) mode = 'free'
			else mode = 'waiting'
		}
		const otherPresenter = live && live.presenter !== me && here(live.presenter) ? live : null
		return {
			index, count: slides.length, beat, beats, title: slideTitle(slide), mode, otherPresenter,
			canStep: role !== 'viewer' && isPresenting,
			canJump: role !== 'viewer',
			readonly: editor.getIsReadonly(),
		}
	}, [editor, role])
}

// Solo: always presenting (locally), so taps and the buttons step through the deck. Presenting
// stops when fullscreen ends (e.g. leaving landscape), so start again where it was.
function useSoloPresenting(editor, role) {
	useEffect(() => {
		if (!editor || role !== 'solo') return
		let last = { index: 0, beat: 0 }
		const keep = () => {
			if (presenting(editor)) {
				last = { index: Math.max(0, pack.presentIndex.get()), beat: pack.presentBeat.get() }
				return
			}
			if (!pack.getSlides(editor).length) return
			editor.setCurrentTool('present', { startIndex: last.index, startBeat: last.beat })
		}
		keep()
		return editor.store.listen(keep)
	}, [editor, role])
}

// A presenter on a phone starts out browsing privately (a "follower" present tool that this shell
// moves itself, so nothing is published), until they tap "Present to everyone".
function usePresenterBrowsing(editor, role) {
	useEffect(() => {
		if (!editor || role !== 'presenter') return
		let last = { index: 0, beat: 0 }
		const keep = () => {
			if (switching) return
			if (presenting(editor)) {
				last = { index: Math.max(0, pack.presentIndex.get()), beat: pack.presentBeat.get() }
				return
			}
			if (!pack.getSlides(editor).length) return
			editor.setCurrentTool('present', { startIndex: last.index, startBeat: last.beat, follower: true })
		}
		keep()
		return editor.store.listen(keep)
	}, [editor, role])
}

// A viewer with nothing to follow sees the slide they were last shown (at first, the first one),
// framed to fill the stage, rather than wherever the canvas happens to be.
function useViewerResting(editor, role, state, size) {
	const last = useRef(0)
	if (state.index >= 0) last.current = state.index
	const waiting = role === 'viewer' && state.mode === 'waiting'
	useEffect(() => {
		if (!editor || !waiting) return
		const frame = requestAnimationFrame(() => {
			const slide = pack.getSlides(editor)[last.current] ?? pack.getSlides(editor)[0]
			const b = slide && editor.getShapePageBounds(slide.id)
			if (b) editor.zoomToBounds(b, { inset: 0, immediate: true })
		})
		return () => cancelAnimationFrame(frame)
	}, [editor, waiting, size.w, size.h, state.count])
}

function step(editor, role, dir) {
	if (!editor || !presenting(editor)) return
	const t = tool(editor)
	if (!t.follower) return dir > 0 ? t.next() : t.prev()
	if (role !== 'presenter') return
	// Browsing: move the follower tool ourselves (the same order the present tool uses).
	const i = pack.presentIndex.get()
	const b = pack.presentBeat.get()
	const slides = pack.getSlides(editor)
	if (dir > 0) {
		if (slides[i] && b < slideBeats(editor, slides[i].id)) t.followTo(i, b + 1)
		else if (i < slides.length - 1) t.followTo(i + 1, 0)
	} else if (b > 0) t.followTo(i, b - 1)
	else if (i > 0) t.followTo(i - 1, slideBeats(editor, slides[i - 1].id))
}

function jump(editor, role, i) {
	if (!editor || !presenting(editor) || role === 'viewer') return
	const t = tool(editor)
	if (t.follower) t.followTo(i, 0)
	else t.go(i)
}

function startPresenting(editor) {
	const index = Math.max(0, pack.presentIndex.get())
	const beat = pack.presentBeat.get()
	switching = true
	try {
		editor.setCurrentTool('select')
		editor.setCurrentTool('present', { startIndex: index, startBeat: beat })
	} finally {
		switching = false
	}
}

function stopPresenting(editor) {
	// Back to browsing (usePresenterBrowsing restarts the follower tool at the same slide).
	editor.setCurrentTool('select')
}

// ---------- pieces ----------

function LiveChip({ editor, role }) {
	const people = useValue('phonePeople', () => (editor ? editor.getCollaborators().length + 1 : 1), [editor])
	return (
		<div className="ph-sub ph-live">
			<span className="ph-dot" /> Live · {people} {people === 1 ? 'person' : 'people'} · {role === 'presenter' ? 'you present' : 'watching'}
		</div>
	)
}

function Progress({ state }) {
	const { index, count, beat, beats } = state
	const p = count > 1 && index >= 0 ? Math.min(1, (index + (beats ? beat / (beats + 1) : 0)) / (count - 1)) : 0
	return (
		<div className="ph-progress">
			<div style={{ width: `${p * 100}%` }} />
		</div>
	)
}

function Controls({ editor, role, state, compact }) {
	const { index, count, beat, beats, mode } = state
	const counter = (
		<div className="ph-counter">
			<b>{index >= 0 ? index + 1 : '–'}</b>
			<span> / {count || '–'}</span>
			{beats > 0 && (
				<div className="ph-dots" aria-label={`step ${beat} of ${beats}`}>
					{Array.from({ length: Math.min(beats, 12) + 1 }, (_, k) => <i key={k} className={k <= beat ? 'on' : ''} />)}
				</div>
			)}
		</div>
	)
	if (role === 'viewer') {
		const text = { following: null, watching: 'Showing the presenter’s screen', waiting: 'Waiting for the presenter to start', free: 'You stopped following' }[mode] ?? null
		return (
			<div className={`ph-controls${compact ? ' ph-compact' : ''}`}>
				{text ? <div className="ph-note">{text}</div> : counter}
			</div>
		)
	}
	const can = state.canStep
	return (
		<div className={`ph-controls${compact ? ' ph-compact' : ''}`}>
			<button type="button" className="ph-step" aria-label="Back" disabled={!can || (index <= 0 && beat <= 0)} onClick={() => step(editor, role, -1)}><Icon name="left" size={compact ? 24 : 30} /></button>
			{counter}
			<button type="button" className="ph-step ph-next" aria-label="Next" disabled={!can || (index >= count - 1 && beat >= beats)} onClick={() => step(editor, role, 1)}><Icon name="right" size={compact ? 24 : 30} /></button>
		</div>
	)
}

// What the role can do, under the controls (portrait) or above the pill (landscape).
function RoleBar({ editor, role, state, compact, say }) {
	const mode = useValue(pack.annotateMode ?? pack.presentIndex) // re-render on laser/highlight switch
	if (role === 'solo') return compact ? null : <div className="ph-hint">Tap the slide or › for the next step</div>
	if (role === 'viewer') {
		if (state.mode === 'following') return compact ? null : <div className="ph-hint">Following the presenter. Sit back.</div>
		if (state.mode === 'watching') return null
		if (state.mode === 'waiting') return compact ? null : <div className="ph-hint">Their slides appear here as soon as they present.</div>
		return (
			<div className={`ph-actions${compact ? ' ph-compact' : ''}`}>
				<button type="button" className="ph-btn ph-primary" onClick={() => followPresenter()}>Follow the presenter</button>
			</div>
		)
	}
	// presenter
	if (state.mode === 'browsing') {
		return (
			<div className={`ph-actions${compact ? ' ph-compact' : ''}`}>
				<button type="button" className="ph-btn ph-primary" onClick={() => startPresenting(editor)}><Icon name="play" size={18} /> Present to everyone</button>
				{!compact && (
					<div className="ph-hint">
						{state.otherPresenter ? `Someone is presenting from another device (slide ${state.otherPresenter.index + 1}). Presenting here takes over.` : 'Only you see this until you present.'}
					</div>
				)}
			</div>
		)
	}
	const annotate = pack.annotateMode
	const current = annotate ? mode : 'laser'
	return (
		<div className={`ph-actions${compact ? ' ph-compact' : ''}`}>
			<div className="ph-seg">
				<button type="button" className={current === 'laser' ? 'on' : ''} onClick={() => annotate?.set('laser')}>Laser</button>
				{annotate && <button type="button" className={current === 'highlight' ? 'on' : ''} onClick={() => annotate.set('highlight')}>Highlight</button>}
				<button type="button" onClick={() => (clearAnnotations(editor), say('Highlights cleared'))}>Clear</button>
			</div>
			<button type="button" className="ph-btn" onClick={() => stopPresenting(editor)}><Icon name="stop" size={16} /> Stop presenting</button>
			{!compact && <div className="ph-hint">Everyone sees your slide. Drag on it to point.</div>}
		</div>
	)
}

function Menu({ editor, role, deck, state, landscape, land, close, openForm, say }) {
	const copy = (url, what) =>
		navigator.clipboard?.writeText(url).then(() => say(`${what} copied`), () => say(url)) ?? say(url)
	const share = async (url, title) => {
		if (navigator.share) {
			try {
				await navigator.share({ url, title })
				return
			} catch (e) {
				if (e?.name === 'AbortError') return
			}
		}
		copy(url, 'Link')
	}
	const items = []
	const add = (label, onClick, extra = {}) => items.push({ label, onClick, ...extra })
	if (roomId) add('Share the room link', () => share(roomUrl(roomId), document.title))
	else add('Share this presentation', () => share(location.href, document.title))
	if (!land && landscape.canOffer) add('Turn sideways (bigger slide)', () => (close(), landscape.enter()))
	if (role === 'solo' && SYNC_URL) add('● Go live…', () => (close(), openForm('live')), { note: 'Present to several phones and screens' })
	if (role === 'viewer') {
		if (state.mode !== 'following' && state.mode !== 'watching') add('Follow the presenter', () => (close(), followPresenter()))
		add('Presenter login…', () => (close(), openForm('login')))
	}
	if (role === 'presenter') {
		add('Reset to deck', () => {
			if (!confirm('Reset this room to the published deck for everyone? Highlights and edits made here go.')) return
			seedFromDeck(editor, deck, { reset: true })
			ensureJoinSlide(editor, roomUrl(roomId))
			close()
			say('Room reset')
		})
	}
	if (roomId) add(role === 'presenter' ? 'Leave (the room stays open)' : 'Leave the room', () => (location.href = roomUrl(null)))
	if (role === 'presenter') {
		add('■ End for everyone', async () => {
			if (!confirm('End this live session for everyone?\n\nEveryone is disconnected and the room is deleted (highlights and edits made here are lost). The published deck is not changed.')) return
			try {
				await endRoom()
				location.href = roomUrl(null)
			} catch (err) {
				alert(err.message)
			}
		}, { danger: true, note: 'Disconnects everyone and deletes the room' })
	}
	add('Desktop view', () => switchToDesktop(), { note: 'The full editor (for bigger screens)' })
	const back = folderOf()
	add(`‹ Back to ${back.name}`, () => (location.hash = `#/${back.path}`))
	return (
		<div className="ph-menu">
			{items.map((it) => (
				<button key={it.label} type="button" className={`ph-item${it.danger ? ' ph-danger' : ''}`} onClick={it.onClick}>
					<span>{it.label}</span>
					{it.note && <small>{it.note}</small>}
				</button>
			))}
		</div>
	)
}

function Sheet({ title, onClose, children }) {
	useEffect(() => {
		const onKey = (e) => e.key === 'Escape' && onClose()
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [onClose])
	return (
		<div className="ph-sheetwrap" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
			<div className="ph-sheet" role="dialog" aria-label={title}>
				<div className="ph-sheethead">
					<b>{title}</b>
					<button type="button" className="ph-icon" aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button>
				</div>
				<div className="ph-sheetbody">{children}</div>
			</div>
		</div>
	)
}

// The deck's slides with small pictures, made one at a time as they scroll into view.
function SlideList({ editor, state, onPick }) {
	const slides = useValue('phoneSlides', () => (editor ? pack.getSlides(editor).map((s) => ({ id: s.id, title: slideTitle(s) })) : []), [editor])
	const listRef = useRef(null)
	useEffect(() => {
		const el = listRef.current?.querySelector('.ph-cur')
		el?.scrollIntoView({ block: 'nearest' })
	}, [state.index])
	if (!state.canJump) return null
	return (
		<ol className="ph-list" ref={listRef}>
			{slides.map((s, i) => (
				<li key={s.id}>
					<button type="button" className={i === state.index ? 'ph-cur' : ''} onClick={() => onPick(i)}>
						<Thumb editor={editor} id={s.id} />
						<span className="ph-num">{i + 1}</span>
						<span className="ph-name">{s.title || `Slide ${i + 1}`}</span>
					</button>
				</li>
			))}
		</ol>
	)
}

const thumbs = new WeakMap() // editor → Map(slide id → object URL)
let queue = Promise.resolve()

function Thumb({ editor, id }) {
	const ref = useRef(null)
	const cache = useMemo(() => {
		if (!thumbs.has(editor)) thumbs.set(editor, new Map())
		return thumbs.get(editor)
	}, [editor])
	const [src, setSrc] = useState(() => cache.get(id) ?? null)
	useEffect(() => {
		if (src || !ref.current) return
		let gone = false
		const io = new IntersectionObserver(([e]) => {
			if (!e.isIntersecting) return
			io.disconnect()
			queue = queue.then(async () => {
				if (gone || cache.has(id)) return !gone && setSrc(cache.get(id))
				try {
					const { blob } = await editor.toImage([id], { format: 'png', scale: 0.12, pixelRatio: 2, background: true, padding: 0 })
					const url = URL.createObjectURL(blob)
					cache.set(id, url)
					if (!gone) setSrc(url)
				} catch {}
			})
		}, { rootMargin: '200px' })
		io.observe(ref.current)
		return () => ((gone = true), io.disconnect())
	}, [editor, id, src])
	return <span ref={ref} className="ph-thumb">{src && <img src={src} alt="" />}</span>
}

// Going live / presenter login: a full page, with the deck kept (hidden) underneath.
function PhoneForm({ kind, onCancel }) {
	const [password, setPassword] = useState('')
	const [name, setName] = useState('')
	const [status, setStatus] = useState(null)
	const live = kind === 'live'
	const submit = async (e) => {
		e.preventDefault()
		setStatus('busy')
		const id = live ? name.trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || newRoomId() : roomId
		try {
			await openRoom(id, password)
			if (live) location.href = roomUrl(id)
			else location.reload()
		} catch (err) {
			setStatus(err.message)
		}
	}
	return (
		<form className="ph-form" onSubmit={submit}>
			<h2>{live ? 'Go live' : 'Presenter login'}</h2>
			<p>{live ? 'Everyone with the link follows your slides on their own screen. They can’t change anything.' : 'Enter the room password to present to this room.'}</p>
			<input type="password" autoFocus placeholder="Room password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
			{live && <input placeholder="Room name (optional, e.g. weekly)" value={name} onChange={(e) => setName(e.target.value)} autoCapitalize="off" autoCorrect="off" />}
			{status && status !== 'busy' && <div className="ph-error">{status}</div>}
			<button type="submit" className="ph-btn ph-primary ph-wide" disabled={!password || status === 'busy'}>{status === 'busy' ? '…' : live ? '● Go live' : 'Log in'}</button>
			<button type="button" className="ph-btn ph-ghost ph-wide" onClick={onCancel}>Cancel</button>
		</form>
	)
}

function newRoomId() {
	return crypto.getRandomValues(new Uint32Array(2)).reduce((a, n) => a + n.toString(36), '').slice(0, 10)
}

// The editor parts a phone needs: the deck's CSS and step animations (no toolbars or panels).
export function phoneComponents(P) {
	return {
		InFrontOfTheCanvas: () => (
			<>
				<style>{P.DECK_CSS + STAGE_CSS}</style>
				<P.BeatStyles />
			</>
		),
	}
}

const STAGE_CSS = `.ph-stage .tl-container { background: #fff; } .ph-stage .tl-watermark_SEE-LICENSE { transform: scale(.7); transform-origin: bottom right; }`

const PHONE_CSS = `
.ph { position: absolute; inset: 0; background: #0f1115; color: #eef1f5; font: 15px/1.35 system-ui, -apple-system, 'Segoe UI', sans-serif;
	-webkit-tap-highlight-color: transparent; overflow: hidden; user-select: none; -webkit-user-select: none; }
.ph button, .ph a { font: inherit; color: inherit; touch-action: manipulation; }
.ph-body { position: absolute; inset: 0; display: flex; flex-direction: column; }
.ph-port .ph-body { padding-top: env(safe-area-inset-top); }
.ph-head { display: flex; align-items: center; gap: 6px; padding: 6px 6px 8px; flex: none; }
.ph-headtext { flex: 1; min-width: 0; text-align: center; }
.ph-title { font: 700 17px/1.2 'Shantell Sans', system-ui, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ph-sub { font-size: 12.5px; color: #9aa4b2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: none; }
.ph-live { color: #c9f2f4; }
.ph-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #3fc1c9; margin-right: 2px; vertical-align: 1px; box-shadow: 0 0 0 3px rgba(63,193,201,.25); }
.ph-icon { flex: none; width: 44px; height: 44px; display: grid; place-items: center; border-radius: 12px; border: none; background: transparent; font-size: 26px; line-height: 1; text-decoration: none; cursor: pointer; }
.ph-icon:active { background: rgba(255,255,255,.1); }
.ph-stage { position: relative; flex: none; margin: 0 auto; background: #fff; overflow: hidden; }
.ph-port .ph-stage { box-shadow: 0 8px 30px rgba(0,0,0,.45); }
.ph-progress { height: 3px; background: rgba(255,255,255,.1); flex: none; }
.ph-progress > div { height: 100%; background: #3fc1c9; transition: width .25s ease; }
.ph-panel { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 10px 14px calc(10px + env(safe-area-inset-bottom)); gap: 10px; }
.ph-controls { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex: none; }
.ph-step { display: grid; place-items: center; width: 76px; height: 60px; border-radius: 18px; border: 1.5px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); font-size: 34px; line-height: 1; cursor: pointer; }
.ph-step.ph-next { background: #eef1f5; color: #0f1115 !important; border-color: #eef1f5; }
.ph-step:active { transform: scale(.96); }
.ph-step:disabled { opacity: .3; }
.ph-counter { flex: 1; text-align: center; font-variant-numeric: tabular-nums; }
.ph-counter b { font-size: 26px; }
.ph-counter span { color: #9aa4b2; font-size: 17px; }
.ph-dots { display: flex; gap: 5px; justify-content: center; margin-top: 4px; }
.ph-dots i { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.2); }
.ph-dots i.on { background: #fc5185; }
.ph-note { flex: 1; text-align: center; color: #9aa4b2; padding: 16px 0; }
.ph-slidename { text-align: center; font: 600 15px/1.3 'Shantell Sans', system-ui, sans-serif; color: #dfe5ec; min-height: 1.3em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: none; }
.ph-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; flex: none; }
.ph-hint { width: 100%; text-align: center; font-size: 12.5px; color: #8893a2; }
.ph-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); cursor: pointer; font-weight: 600; }
.ph-btn:active { transform: scale(.98); }
.ph-btn:disabled { opacity: .4; }
.ph-primary { background: #3fc1c9; border-color: #3fc1c9; color: #06272a !important; }
.ph-ghost { background: transparent; }
.ph-sq { padding: 0; width: 44px; }
.ph-row .ph-btn { border-color: transparent; }
.ph-wide { width: 100%; flex: none; }
.ph-seg { display: inline-flex; border: 1.5px solid rgba(255,255,255,.18); border-radius: 12px; overflow: hidden; }
.ph-seg button { min-height: 44px; padding: 0 14px; border: none; background: transparent; cursor: pointer; font-weight: 600; }
.ph-seg button + button { border-left: 1.5px solid rgba(255,255,255,.18); }
.ph-seg button.on { background: #eef1f5; color: #0f1115; }
.ph-list { list-style: none; margin: 0 -14px; padding: 2px 14px 4px; overflow-y: auto; flex: 1; min-height: 0; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
.ph-list li + li { margin-top: 6px; }
.ph-list button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 12px; border: 1.5px solid transparent; background: rgba(255,255,255,.04); cursor: pointer; text-align: left; }
.ph-list button.ph-cur { border-color: #3fc1c9; background: rgba(63,193,201,.12); }
.ph-thumb { flex: none; width: 88px; aspect-ratio: 16 / 9; border-radius: 6px; background: #fff; overflow: hidden; display: block; }
.ph-thumb img { width: 100%; height: 100%; object-fit: contain; display: block; }
.ph-num { flex: none; width: 26px; text-align: right; color: #8893a2; font-variant-numeric: tabular-nums; font-size: 13px; }
.ph-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

/* landscape: the slide fills the screen, controls float */
.ph-land { background: #000; }
.ph-stagewrap { flex: none; }
.ph-land .ph-stagewrap { position: absolute; inset: 0; display: grid; place-items: center; }
.ph-landtop { position: absolute; top: max(8px, env(safe-area-inset-top)); left: max(8px, env(safe-area-inset-left)); right: max(8px, env(safe-area-inset-right)); display: flex; gap: 8px; align-items: center; pointer-events: none; }
.ph-landbar { position: absolute; left: 0; right: 0; bottom: max(8px, env(safe-area-inset-bottom)); display: flex; flex-direction: column; align-items: center; gap: 6px; pointer-events: none; }
.ph-land .ph-progress { position: absolute; left: 0; right: 0; bottom: 0; }
.ph-pill { pointer-events: all; background: rgba(15,17,21,.78); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.12); border-radius: 16px; }
.ph-landtop .ph-icon { width: 40px; height: 40px; font-size: 24px; }
.ph-chip { padding: 8px 12px; }
.ph-row { display: flex; align-items: center; gap: 4px; padding: 4px; }
.ph-compact { gap: 6px; }
.ph-compact .ph-step { width: 52px; height: 44px; border-radius: 12px; font-size: 26px; }
.ph-compact .ph-counter { min-width: 72px; }
.ph-compact .ph-counter b { font-size: 18px; }
.ph-compact .ph-counter span { font-size: 14px; }
.ph-compact .ph-dots { margin-top: 2px; gap: 4px; }
.ph-compact .ph-dots i { width: 5px; height: 5px; }
.ph-compact .ph-note { padding: 0 12px; }
.ph-landbar .ph-actions { pointer-events: all; }
.ph-landbar .ph-actions > * { background: rgba(15,17,21,.78); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.ph-landbar .ph-actions .ph-primary { background: #3fc1c9; }
.ph-landtop, .ph-landbar { transition: opacity .35s ease; }
.ph-land:not(.ph-awake) .ph-landtop, .ph-land:not(.ph-awake) .ph-landbar { opacity: .12; }

/* sheets */
.ph-sheetwrap { position: absolute; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: flex-end; justify-content: center; z-index: 50; animation: ph-fade .18s ease-out; }
.ph-sheet { width: 100%; max-width: 560px; max-height: 86%; display: flex; flex-direction: column; background: #181b21; border-radius: 20px 20px 0 0; padding-bottom: env(safe-area-inset-bottom); animation: ph-up .22s cubic-bezier(.22,1,.36,1); }
.ph-land .ph-sheet { max-height: 100%; border-radius: 16px 16px 0 0; }
.ph-sheethead { display: flex; align-items: center; padding: 6px 6px 2px 18px; }
.ph-sheethead b { flex: 1; font-size: 16px; }
.ph-sheethead .ph-icon { font-size: 18px; }
.ph-sheetbody { overflow-y: auto; padding: 4px 14px 14px; display: flex; flex-direction: column; min-height: 0; overscroll-behavior: contain; }
.ph-sheetbody .ph-list { margin: 0; padding: 0; }
.ph-menu { display: flex; flex-direction: column; gap: 4px; }
.ph-item { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; min-height: 50px; justify-content: center; padding: 8px 14px; border-radius: 12px; border: none; background: rgba(255,255,255,.05); cursor: pointer; text-align: left; font-weight: 600; }
.ph-item small { font-weight: 400; color: #8893a2; font-size: 12.5px; }
.ph-item:active { background: rgba(255,255,255,.12); }
.ph-danger { color: #ff7a9a !important; }
.ph-toast { position: absolute; left: 50%; bottom: calc(24px + env(safe-area-inset-bottom)); transform: translateX(-50%); background: #eef1f5; color: #0f1115; padding: 10px 16px; border-radius: 12px; font-weight: 600; z-index: 60; box-shadow: 0 8px 24px rgba(0,0,0,.4); }

/* forms */
.ph-form { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 12px; padding: calc(32px + env(safe-area-inset-top)) 22px 22px; overflow-y: auto; max-width: 480px; margin: 0 auto; }
.ph-form h2 { margin: 0; font: 700 26px/1.2 'Shantell Sans', system-ui, sans-serif; }
.ph-form p { margin: 0 0 6px; color: #9aa4b2; }
.ph-form input { min-height: 48px; padding: 0 14px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,.2); background: #181b21; color: #eef1f5; font: inherit; font-size: 16px; user-select: text; -webkit-user-select: text; }
.ph-form input:focus { outline: none; border-color: #3fc1c9; }
.ph-error { color: #ff7a9a; }
@keyframes ph-fade { from { opacity: 0 } }
@keyframes ph-up { from { transform: translateY(40px); opacity: .4 } }
`
