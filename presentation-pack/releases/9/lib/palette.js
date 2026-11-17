// A deck's own colours. tldraw draws with named colours (black, grey, red, …); a deck can repaint
// them by storing a palette in its deck meta (`pp.palette`, see deck.js), so the colours travel
// with the .tldraw file and show the same on the desktop, the website and in live rooms.
//
//   pp.palette = { background: '#f1ebda', black: '#1f3b3f', red: { solid: '#c4553f', semi: '#f6dccf' }, … }
//
// A colour given as one hex gets its other variants (light tint, pattern, note) mixed from it; give
// an object to set variants yourself. Only light mode is repainted. The change is per editor
// (editor.updateThemes), so other decks open at the same time keep their colours.

const ORIGINAL = new WeakMap() // editor → the light colours before any palette

function mix(a, b, t) {
	const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
	const [x, y] = [p(a), p(b)]
	return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

function variants(base, hex, paper) {
	return {
		...base,
		solid: hex,
		fill: hex,
		linedFill: mix(hex, paper, 0.25),
		semi: mix(hex, paper, 0.8),
		pattern: mix(hex, paper, 0.2),
		noteFill: mix(hex, '#ffffff', 0.35),
		highlightSrgb: hex,
		highlightP3: hex,
	}
}

export function applyPalette(editor, palette) {
	if (typeof editor.updateThemes !== 'function') return
	if (!ORIGINAL.has(editor)) ORIGINAL.set(editor, structuredClone(editor.getThemes().default.colors.light))
	const original = ORIGINAL.get(editor)
	editor.updateThemes((themes) => {
		const light = structuredClone(original)
		if (palette) {
			const paper = palette.paper ?? '#ffffff'
			for (const [name, value] of Object.entries(palette)) {
				if (name === 'paper') continue
				if (typeof light[name] === 'string') light[name] = value
				else if (light[name] && typeof value === 'string') light[name] = variants(light[name], value, paper)
				else if (light[name] && value && typeof value === 'object') {
					const v = value.solid ? variants(light[name], value.solid, paper) : light[name]
					light[name] = { ...v, ...value }
				}
			}
		}
		themes.default.colors.light = light
		return themes
	})
}
