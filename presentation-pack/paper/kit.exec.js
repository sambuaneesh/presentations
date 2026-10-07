// Paper kit: draws a slide out of REAL tldraw shapes (geo, text, note, draw strokes, bound arrows),
// the way you would by hand with tldraw's own tools. Runs inside a tldraw Desktop /exec snippet
// (bin/paper.mjs prepends it); `editor` and `helpers` are in scope there.
//
// A slide file (decks/<slug>/slides/NN-name.js) is `export default { name, kicker?, title?, notes, draw(k) }`.
// `draw(k)` places shapes in frame-local coordinates (1920×1080). Every maker takes options:
//   id     a tag, so actions/arrows can find the shape again (meta.tag); ids are stable per slide
//   beat   the click step that reveals it (0 = with the slide; omit = always there)
//   anim   entrance when revealed: 'pop' (default) | 'wipe' | 'drop' | 'wiggle' | 'fade' | 'zoom' (out of the screen) | 'none'
//   origin [x, y] frame-local centre for the entrance, so several shapes animate as one drawing
//   meta   extra meta (e.g. { drag: true }, { press: 'actionName' }, { slot: 'actionName' }, { home: … })
// Colours are tldraw's: black grey red green blue yellow orange violet light-red light-green light-blue light-violet white.
// Fonts: 'draw' (handwriting, default) | 'mono' | 'sans' | 'serif'. Sizes: 's' 'm' 'l' 'xl' (+ scale).

const TL = await import('tldraw')
const { createShapeId, toRichText, compressLegacySegments } = TL

function hash(s) {
	let h = 2166136261
	for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
	return h >>> 0
}
function rng(seed) {
	let a = seed >>> 0
	return () => {
		a = (a + 0x6d2b79f5) >>> 0
		let t = a
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

function makeKit(frameId, key) {
	const shapes = []
	const arrows = []
	const assets = []
	const byTag = new Map()
	let n = 0
	const rand = rng(hash(key))
	const jit = (a) => (rand() - 0.5) * 2 * a

	const meta = (o) => ({
		...(o.id != null && { tag: String(o.id) }),
		...(typeof o.beat === 'number' && { beat: o.beat }),
		...(typeof o.until === 'number' && { until: o.until }), // gone from that click on (needs template 3+)
		...(typeof o.delay === 'number' && { delay: o.delay }), // ms before its entrance plays (needs template 4+)
		...(typeof o.focus === 'number' && { focus: o.focus }), // camera step: the view glides to it at that click (template 5+)
		...(o.advance && { advance: true }), // with focus: once the glide lands, go on to the next slide (template 6+)
		...(o.anim && { anim: o.anim }),
		...(o.origin && { origin: o.origin }), // a shared zoom/pop centre (frame-local [x, y]) for multi-shape drawings
		...(o.meta ?? {}),
	})
	function put(type, x, y, props, o = {}) {
		const id = createShapeId(`${key}-${o.id != null ? o.id : '_' + n++}`) // '_': never clashes with a slide's own ids
		const rec = { id, type, parentId: frameId, x, y, rotation: ((o.rot ?? 0) * Math.PI) / 180, opacity: o.opacity ?? 1, isLocked: !!o.locked, props, meta: meta(o) }
		shapes.push(rec)
		if (o.id != null) byTag.set(String(o.id), rec)
		return id
	}
	const rt = (s) => toRichText(String(s ?? ''))

	const k = {
		W: 1920,
		H: 1080,
		rand,
		// Handwritten (or mono) words. Give `w` to wrap / centre (align 'middle').
		text(x, y, s, o = {}) {
			const scale = o.scale ?? 1
			return put('text', x, y, {
				richText: rt(s), size: o.size ?? 'm', scale, color: o.color ?? 'black', font: o.font ?? 'draw',
				textAlign: o.align ?? 'start', autoSize: o.w == null, ...(o.w != null && { w: o.w / scale }),
			}, o)
		},
		// A sketchy box / shape, optionally with a label inside.
		box(x, y, w, h, o = {}) {
			return put('geo', x, y, {
				geo: o.geo ?? 'rectangle', w, h, color: o.color ?? 'black', fill: o.fill ?? 'none', dash: o.dash ?? 'draw',
				size: o.size ?? 'm', font: o.font ?? 'draw', richText: rt(o.text ?? ''), align: o.align ?? 'middle',
				verticalAlign: o.valign ?? 'middle', labelColor: o.labelColor ?? o.color ?? 'black', scale: o.scale ?? 1,
			}, o)
		},
		circle(cx, cy, r, o = {}) {
			return k.box(cx - r, cy - r, 2 * r, 2 * r, { ...o, geo: 'ellipse' })
		},
		// A sticky note.
		// A picture from the deck's slides/assets/ folder (png, jpg, gif, webp, svg), embedded in the deck,
		// so it shows in tldraw and on the website alike. Animated gif/webp play.
		image(x, y, w, h, name, o = {}) {
			const a = (typeof ASSETS !== 'undefined' ? ASSETS : {})[name]
			if (!a) throw new Error(`no picture "${name}" in slides/assets/`)
			const assetId = `asset:${key}-${String(name).replace(/[^\w-]/g, '_')}`
			if (!assets.some((r) => r.id === assetId)) assets.push({ id: assetId, typeName: 'asset', type: 'image', props: { name, src: a.src, w, h, mimeType: a.mime, isAnimated: a.animated, fileSize: a.size }, meta: {} })
			return put('image', x, y, { assetId, w, h, playing: true, url: '', crop: null, flipX: false, flipY: false, altText: o.alt ?? '' }, o)
		},
		note(x, y, s, o = {}) {
			return put('note', x, y, { color: o.color ?? 'yellow', richText: rt(s), size: o.size ?? 'm', font: o.font ?? 'draw', align: o.align ?? 'middle', verticalAlign: o.valign ?? 'middle', scale: o.scale ?? 1 }, o)
		},
		// A freehand pen stroke through points [[x,y],…] (frame-local). `wob` adds hand wobble.
		pen(points, o = {}) {
			const wob = o.wob ?? 0
			const pts = points.map(([x, y]) => [x + jit(wob), y + jit(wob)])
			const minX = Math.min(...pts.map((p) => p[0]))
			const minY = Math.min(...pts.map((p) => p[1]))
			const free = pts.map(([x, y]) => ({ x: x - minX, y: y - minY, z: 0.5 }))
			return put('draw', minX, minY, {
				segments: compressLegacySegments([{ type: 'free', points: free }]), color: o.color ?? 'black', size: o.size ?? 'm',
				isComplete: true, isClosed: !!o.closed, fill: o.fill ?? 'none', dash: 'draw', scale: o.scale ?? 1,
			}, o)
		},
		// Pen strokes that read as marks.
		loop(cx, cy, rx, ry, o = {}) {
			const start = rand() * Math.PI * 2
			const pts = []
			for (let i = 0; i <= 46; i++) {
				const t = start + (i / 40) * Math.PI * 2
				const w = 1 + jit(0.04) + (i > 40 ? 0.06 : 0)
				pts.push([cx + rx * w * Math.cos(t), cy + ry * w * Math.sin(t)])
			}
			return k.pen(pts, { color: 'red', size: 'l', ...o })
		},
		underline(x, y, w, o = {}) {
			const pts = []
			for (let i = 0; i <= 12; i++) pts.push([x + (w * i) / 12, y + Math.sin(i * 0.9) * 3 + jit(1.5)])
			return k.pen(pts, { color: 'red', size: 'l', ...o })
		},
		cross(x, y, s, o = {}) {
			const a = k.pen([[x, y], [x + s * 0.5, y + s * 0.52], [x + s, y + s]], { color: 'red', size: 'l', wob: 2, ...o })
			const b = k.pen([[x + s, y], [x + s * 0.48, y + s * 0.5], [x, y + s]], { color: 'red', size: 'l', wob: 2, ...o, id: o.id != null ? o.id + '-b' : undefined })
			return [a, b]
		},
		tick(x, y, s, o = {}) {
			return k.pen([[x, y + s * 0.55], [x + s * 0.35, y + s], [x + s, y]], { color: 'green', size: 'l', wob: 1.5, ...o })
		},
		// A hand-drawn arrow between two shape ids (bound, follows them) or points [x,y] (frame-local).
		arrow(from, to, o = {}) {
			arrows.push({ from, to, o })
		},
		// Many small shapes quickly: a grid of dots/squares. Returns ids.
		grid(x, y, cols, count, pitch, size, o = {}) {
			const ids = []
			for (let i = 0; i < count; i++) {
				const cx = x + (i % cols) * pitch
				const cy = y + Math.floor(i / cols) * pitch
				const oi = typeof o.each === 'function' ? o.each(i) : {}
				ids.push(k.box(cx, cy, size, size, { geo: o.geo ?? 'ellipse', size: 's', dash: 'draw', ...o, ...oi, id: o.id != null ? `${o.id}-${i}` : undefined }))
			}
			return ids
		},
		tag: (t) => createShapeId(`${key}-${t}`),
	}
	return { k, shapes, arrows, byTag, assets }
}

// Build one slide into a frame at slide position `index` (replacing an earlier build of the same slide).
async function buildSlide(SLIDE, key, index, deckMeta) {
	const W = 1920
	const H = 1080
	const GAP = 240
	const pageId = editor.getCurrentPageId()
	const old = editor.getSortedChildIdsForParent(pageId).map((id) => editor.getShape(id)).filter((s) => s?.type === 'frame' && s.meta?.paper === key)
	// Also sweep up any stray shape from an earlier build of this slide (ids are `shape:<key>-…`).
	const prefix = `shape:${key}-`
	const strays = editor.getCurrentPageShapes().filter((s) => s.id.startsWith(prefix)).map((s) => s.id)
	if (old.length || strays.length) {
		editor.run(() => editor.deleteShapes([...old.map((s) => s.id), ...strays]), { ignoreShapeLock: true })
		// Let the canvas unmount the old shapes first: a rebuilt id can come back as a different type.
		await new Promise((r) => setTimeout(r, 150))
	}

	// A slide inserted between slides already built: make room by moving every slide from this position on
	// one place to the right (a rebuild of an existing slide finds its place empty, so nothing moves).
	const slotX = index * (W + GAP)
	const frames = editor.getSortedChildIdsForParent(pageId).map((id) => editor.getShape(id)).filter((s) => s?.type === 'frame' && !s.meta?.joinSlide)
	if (frames.some((f) => Math.abs(f.x - slotX) < W / 2)) {
		const later = frames.filter((f) => f.x > slotX - W / 2)
		editor.run(() => editor.updateShapes(later.map((f) => ({ id: f.id, type: 'frame', x: f.x + W + GAP }))), { ignoreShapeLock: true })
	}

	const frameId = createShapeId(`paper-${key}`)
	const { k, shapes, arrows, assets } = makeKit(frameId, key)
	const role = (r, extra = {}) => ({ role: r, ...extra })
	const chrome = [
		{ id: createShapeId(`${key}-bg`), type: 'geo', parentId: frameId, x: 0, y: 0, isLocked: true, props: { geo: 'rectangle', w: W, h: H, color: 'yellow', fill: 'semi', dash: 'solid', size: 's' }, meta: role('bg') },
	]
	if (SLIDE.kicker) chrome.push({ id: createShapeId(`${key}-kicker`), type: 'text', parentId: frameId, x: 120, y: 58, props: { richText: toRichText(SLIDE.kicker), size: 's', scale: 1.25, color: 'red', font: 'draw', autoSize: false, w: 1680 / 1.25 }, meta: role('kicker') })
	if (SLIDE.title) chrome.push({ id: createShapeId(`${key}-title`), type: 'text', parentId: frameId, x: 120, y: 96, props: { richText: toRichText(SLIDE.title), size: 'xl', scale: SLIDE.titleScale ?? 1.45, color: 'black', font: 'draw', autoSize: false, w: 1680 / (SLIDE.titleScale ?? 1.45) }, meta: role('title') })
	chrome.push(
		{ id: createShapeId(`${key}-footer`), type: 'text', parentId: frameId, x: 120, y: H - 76, props: { richText: toRichText(''), size: 's', scale: 1.3, color: 'grey', font: 'draw', autoSize: false, w: 1100 / 1.3 }, meta: role('footer') },
		{ id: createShapeId(`${key}-number`), type: 'text', parentId: frameId, x: W - 360, y: H - 76, props: { richText: toRichText(''), size: 's', scale: 1.3, color: 'grey', font: 'draw', autoSize: false, w: 240 / 1.3, textAlign: 'end' }, meta: role('number') },
	)
	// Where we are in a multi-step method: SLIDE.step = n (and SLIDE.steps, default 7) draws a small
	// strip of numbered boxes top right: steps done hatched, the current one solid red, the rest outlined.
	if (typeof SLIDE.step === 'number') {
		const N = SLIDE.steps ?? 7, bw = 44, bh = 34, gap = 8
		const x0 = W - 120 - (N * bw + (N - 1) * gap)
		for (let i = 1; i <= N; i++) {
			const done = i < SLIDE.step, now = i === SLIDE.step
			chrome.push({
				id: createShapeId(`${key}-progress-${i}`), type: 'geo', parentId: frameId, x: x0 + (i - 1) * (bw + gap), y: 52, isLocked: true,
				props: { geo: 'rectangle', w: bw, h: bh, color: now ? 'red' : 'grey', fill: now ? 'fill' : done ? 'pattern' : 'none', dash: 'draw', size: 's', font: 'draw', richText: toRichText(String(i)), labelColor: now ? 'white' : 'grey', align: 'middle', verticalAlign: 'middle' },
				meta: role('progress'),
			})
		}
	}
	if (SLIDE.source) chrome.push({ id: createShapeId(`${key}-source`), type: 'text', parentId: frameId, x: 860, y: H - 70, props: { richText: toRichText(SLIDE.source), size: 's', scale: 0.95, color: 'grey', font: 'draw', autoSize: false, w: 820 / 0.95, textAlign: 'end' }, meta: role('source') })

	SLIDE.draw(k)

	editor.run(() => {
		editor.createShape({ id: frameId, type: 'frame', x: index * (W + GAP), y: 0, props: { w: W, h: H, name: `${String(index + 1).padStart(2, '0')} · ${SLIDE.name}` }, meta: { paper: key, layout: 'paper', notes: SLIDE.notes ?? '' } })
		// pictures first (a rebuild replaces them), then the shapes that show them
		const stale = assets.map((a) => a.id).filter((id) => editor.getAsset(id))
		if (stale.length) editor.deleteAssets(stale)
		if (assets.length) editor.createAssets(assets)
		editor.createShapes([...chrome, ...shapes])
		for (const { from, to, o } of arrows) {
			const resolve = (e) => (typeof e === 'string' ? (e.startsWith('shape:') ? e : k.tag(e)) : e)
			const a = resolve(from)
			const b = resolve(to)
			const props = { color: o.color ?? 'black', dash: o.dash ?? 'draw', size: o.size ?? 'm', bend: o.bend ?? 0, font: 'draw', arrowheadEnd: o.head ?? 'arrow', arrowheadStart: o.tail ?? 'none', ...(o.text ? { richText: toRichText(o.text) } : {}) }
			const m = { ...(o.id != null && { tag: String(o.id) }), ...(typeof o.beat === 'number' && { beat: o.beat }), ...(typeof o.until === 'number' && { until: o.until }), ...(typeof o.delay === 'number' && { delay: o.delay }), ...(typeof o.focus === 'number' && { focus: o.focus }), anim: o.anim ?? 'wipe', ...(o.meta ?? {}) }
			let id
			if (typeof a === 'string' && typeof b === 'string') {
				id = helpers.createArrowBetweenShapes(a, b, props)
				editor.reparentShapes([id], frameId)
				// The helper keeps only its own defaults; apply the arrow's look afterwards.
				const { richText, ...look } = props
				editor.updateShape({ id, type: 'arrow', props: { ...look, ...(richText && { richText }) }, meta: m })
			} else {
				// Free arrow between points (or point↔shape centre); decorative, so opt out of the lint.
				const pt = (e) => {
					if (Array.isArray(e)) return { x: e[0], y: e[1] }
					const s = editor.getShape(e)
					const bb = editor.getShapeGeometry(s).bounds
					return { x: s.x + bb.w / 2, y: s.y + bb.h / 2 }
				}
				const p0 = pt(a)
				const p1 = pt(b)
				id = createShapeId(`${key}-${o.id != null ? o.id : 'a' + Math.round(p0.x) + '-' + Math.round(p0.y) + '-' + Math.round(p1.x)}`)
				editor.createShape({ id, type: 'arrow', parentId: frameId, x: p0.x, y: p0.y, props: { ...props, start: { x: 0, y: 0 }, end: { x: p1.x - p0.x, y: p1.y - p0.y } }, meta: { ...m, lintIgnore: ['friendless-arrow'] } })
			}
		}
	}, { ignoreShapeLock: true })
	return { key, shapes: shapes.length + chrome.length, arrows: arrows.length }
}
