// The board slide: the live class board (GitHub Pages: sambuaneesh/cut-the-monolith, board.html) on the left, and on
// the right what the presenter needs while the game runs: the countdown, a ■ stop button and the QR code for
// latecomers. Secret: tap the minutes to add 1:00, the seconds to add 0:10 (or "time's up" to reopen for 1:00).
// While editing (and in thumbnails) only placeholders are drawn.
import { html, C, F, box } from '@pack/scenes/kit.js'
import { useGame, button, ROOM, SHIELD } from './control.js'
import { QR_GAME } from './data.js'

// A hidden tap target: no cursor, no hover, no highlight (only the presenter knows it is there).
const secret = (onTap) => ({ ...SHIELD, onClick: (e) => { e.stopPropagation(); onTap() }, style: { pointerEvents: 'all', cursor: 'default', userSelect: 'none', WebkitTapHighlightColor: 'transparent' } })

const BOARD_PAGE = 'https://sambuaneesh.github.io/cut-the-monolith/board.html?room='

export function BoardScene({ still, room = ROOM }) {
	const g = useGame(!still, room)
	const tone = g.phase === 'closed' ? '#d62839' : g.phase === 'running' && g.left < 30000 ? '#d62839' : C.ink
	return html`<div style=${{ position: 'absolute', inset: 0, background: '#ffffff' }}>
		${still
			? html`<div style=${{ ...box(40, 40, 1430, 1000), borderRadius: 16, border: `2.5px dashed ${C.faint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.hand, fontSize: 48, color: C.dim }}>the live class board appears here while presenting</div>`
			: html`<iframe src=${BOARD_PAGE + room} title="Class board" style=${{ ...box(40, 40, 1430, 1000), border: 0, borderRadius: 16, pointerEvents: 'none' }} />`}
		<div style=${{ ...box(1500, 60, 380, 960), display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 24, fontFamily: F.sans }}>
			<div style=${{ fontSize: 26, color: C.dim }}>${still ? 'time' : g.phase === 'running' ? 'time left' : ''}</div>
			<div style=${{ fontSize: g.phase === 'running' ? 120 : 52, fontWeight: 800, lineHeight: 1, color: tone, fontVariantNumeric: 'tabular-nums' }}>${still ? '5:00'
				: g.phase === 'running' ? html`<span ...${secret(() => g.extend(60))}>${g.mm}</span>:<span ...${secret(() => g.extend(10))}>${g.ss}</span>`
				: g.phase === 'closed' ? html`<span ...${secret(() => g.extend(60))}>${g.label}</span>`
				: g.label}</div>
			<div style=${{ fontSize: 28, color: C.dim }}>${still ? '' : g.players == null ? '' : `${g.sent ?? 0} of ${g.players} sent`}</div>
			${!still && g.phase === 'running' && html`<div style=${{ display: 'flex' }}>${button('■ stop', () => g.act('stop'), C.ink, 34)}</div>`}
			<div style=${{ fontSize: 18, color: '#d62839', minHeight: 22 }}>${g.msg}</div>
			<div style=${{ flex: 1 }} />
			<img src=${QR_GAME} style=${{ width: 300, height: 300, alignSelf: 'center' }} />
			<div style=${{ fontFamily: F.mono, fontSize: 18, color: C.dim, textAlign: 'center', lineHeight: 1.35 }}>sambuaneesh.github.io/<br />cut-the-monolith</div>
		</div>
	</div>`
}

// The next slide: everyone who joined, as tiles filling the slide (board.html?view=all): position and score,
// the rule-breakers with their reason, and those who never sent ("ran out of time").
export function EveryoneScene({ still, room = ROOM }) {
	return html`<div style=${{ position: 'absolute', inset: 0, background: '#ffffff' }}>
		${still
			? html`<div style=${{ ...box(40, 40, 1840, 1000), borderRadius: 16, border: `2.5px dashed ${C.faint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.hand, fontSize: 48, color: C.dim }}>everyone who played appears here while presenting</div>`
			: html`<iframe src=${BOARD_PAGE + room + '&view=all'} title="Everyone" style=${{ ...box(40, 40, 1840, 1000), border: 0, borderRadius: 16, pointerEvents: 'none' }} />`}
	</div>`
}
