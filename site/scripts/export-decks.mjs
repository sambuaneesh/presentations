#!/usr/bin/env node
// Export everything in ../decks for the website:
//   public/decks/index.json          folders and decks (from folder.json / deck.json), for the gallery
//   public/decks/<path>.json         each deck, a tldraw store snapshot the site loads on demand
//   public/decks/<path>.webp         its cover, if the deck folder has one, made small for the gallery
//   public/decks/media/<hash>.<ext>  the deck's pictures, as files of their own (see below)
// <path> is the deck's place in the tree, e.g. mono2micro/agentic-workflow. Needs Node 22.13+
// (node:sqlite). Reads the saved .tldraw files; works whether or not tldraw Desktop is open.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { walk } from '../../bin/pres.mjs'
import { readRecords } from '../../bin/lib/tldraw-file.mjs'

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(SITE, 'public', 'decks')
const KEEP = new Set(['document', 'page', 'shape', 'binding', 'asset'])

// ---------- media ----------
// A .tldraw keeps its pictures inside it (data: URLs). On the website they're separate files:
// the deck's own file stays small and starts quickly, the pictures download in parallel and only
// when their slide comes near, and each one is cached on its own. Animated pictures without
// transparency become looping videos (several times smaller than an animated WebP or GIF).
// Covers are shrunk to the size the gallery shows them.
//
// Conversions need ffmpeg. Their results are kept in media-cache/ (committed), keyed by the
// source's hash, so the website build (CI) never needs ffmpeg; run `npm run export` after adding
// pictures or covers and commit media-cache/. Without ffmpeg or a cached result, the original is used.
const CACHE = path.join(SITE, 'media-cache')
const MEDIA = path.join(OUT, 'media')
const usedCache = new Set()
let ffmpeg = null
function hasFfmpeg() {
	if (ffmpeg === null) {
		try {
			execFileSync('ffmpeg', ['-hide_banner', '-version'], { stdio: 'ignore' })
			ffmpeg = true
		} catch {
			ffmpeg = false
		}
	}
	return ffmpeg
}
const sha = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 20)

// The converted file for `src` (cached), or null if it can't be made here.
function converted(src, kind, ext, args) {
	const name = `${sha(src)}-${kind}.${ext}`
	const file = path.join(CACHE, name)
	usedCache.add(name)
	if (fs.existsSync(file)) return file
	if (!hasFfmpeg()) return null
	fs.mkdirSync(CACHE, { recursive: true })
	const tmp = path.join(CACHE, `.in-${process.pid}`)
	fs.writeFileSync(tmp, src)
	try {
		execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', tmp, ...args, file], { stdio: ['ignore', 'ignore', 'pipe'] })
	} catch (e) {
		console.warn(`  warning: ffmpeg could not make ${kind}: ${String(e.stderr ?? e.message).trim().split('\n')[0]}`)
		fs.rmSync(file, { force: true })
		return null
	} finally {
		fs.rmSync(tmp, { force: true })
	}
	return file
}

// Is this picture animated? (WebP: the VP8X animation flag; GIF: the looping extension.)
function isAnimated(buf, mime) {
	if (mime === 'image/webp') return buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 12, 16) === 'VP8X' && !!(buf[20] & 0x02)
	if (mime === 'image/gif') return buf.includes(Buffer.from('NETSCAPE2.0'))
	return false
}

// Does every pixel of every frame have full opacity? (Encoders often set the alpha flag anyway.)
function opaque(buf) {
	const tmp = path.join(CACHE, `.probe-${process.pid}`)
	fs.mkdirSync(CACHE, { recursive: true })
	fs.writeFileSync(tmp, buf)
	try {
		const out = execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', tmp, '-vf', 'alphaextract,signalstats,metadata=print:key=lavfi.signalstats.YMIN:file=-', '-f', 'null', '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
		const mins = [...out.matchAll(/YMIN=(\d+)/g)].map((m) => Number(m[1]))
		return mins.length > 0 && Math.min(...mins) >= 250
	} catch {
		return false // no alpha plane to extract: alphaextract fails, but then it is opaque… stay safe
	} finally {
		fs.rmSync(tmp, { force: true })
	}
}

// An animated picture as a looping MP4 (cached), or null: kept as it is if it has transparency
// (MP4 has none) or this machine can't convert it.
function asVideo(buf) {
	const name = `${sha(buf)}-loop.mp4`
	if (fs.existsSync(path.join(CACHE, name))) {
		usedCache.add(name)
		return path.join(CACHE, name)
	}
	if (!hasFfmpeg() || !opaque(buf)) return null
	// H.264 in MP4 plays everywhere; even dimensions are required.
	return converted(buf, 'loop', 'mp4', ['-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-preset', 'slow', '-movflags', '+faststart', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'])
}

const EXT = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm' }

// Write a media file once (named by its content, so decks share identical pictures).
function publish(buf, ext) {
	const name = `${sha(buf)}.${ext}`
	fs.mkdirSync(MEDIA, { recursive: true })
	const file = path.join(MEDIA, name)
	if (!fs.existsSync(file)) fs.writeFileSync(file, buf)
	return `./decks/media/${name}`
}

// Move a deck's pictures out of its snapshot; animated ones without transparency become videos.
function externalise(store) {
	const toVideo = new Set()
	for (const a of Object.values(store)) {
		if (a.typeName !== 'asset' || !a.props?.src?.startsWith('data:')) continue
		const m = /^data:([^;,]+)(;base64)?,/.exec(a.props.src)
		if (!m || !m[2]) continue
		const mime = m[1]
		const buf = Buffer.from(a.props.src.slice(m[0].length), 'base64')
		if (a.type === 'image' && isAnimated(buf, mime)) {
			const mp4 = asVideo(buf)
			if (mp4) {
				const out = fs.readFileSync(mp4)
				store[a.id] = { ...a, type: 'video', props: { w: a.props.w, h: a.props.h, name: (a.props.name ?? 'video').replace(/\.\w+$/, '.mp4'), isAnimated: true, mimeType: 'video/mp4', src: publish(out, 'mp4'), fileSize: out.length } }
				toVideo.add(a.id)
				continue
			}
		}
		store[a.id] = { ...a, props: { ...a.props, src: publish(buf, EXT[mime] ?? 'bin') } }
	}
	// image shapes showing a picture that became a video become video shapes (muted, looping, autoplay)
	for (const s of Object.values(store)) {
		if (s.typeName !== 'shape' || s.type !== 'image' || !toVideo.has(s.props.assetId)) continue
		if (s.props.crop || s.props.flipX || s.props.flipY) continue // a video can't be cropped or flipped
		store[s.id] = { ...s, type: 'video', props: { w: s.props.w, h: s.props.h, time: 0, playing: true, autoplay: true, url: s.props.url ?? '', assetId: s.props.assetId, altText: s.props.altText ?? '' } }
	}
	// a video asset still shown by a cropped/flipped image shape can't be a video after all
	for (const s of Object.values(store)) {
		if (s.typeName === 'shape' && s.type === 'image' && toVideo.has(s.props.assetId)) console.warn(`  warning: ${s.id} is cropped or flipped; its animation can't become a video`)
	}
}

// The gallery shows covers about 360px wide: 800px covers a 2× screen.
function coverFile(src) {
	const buf = fs.readFileSync(src)
	const webp = converted(buf, 'cover800', 'webp', ['-vf', 'scale=800:-2', '-c:v', 'libwebp', '-quality', '82', '-frames:v', '1'])
	return webp ? { buf: fs.readFileSync(webp), ext: 'webp' } : { buf, ext: path.extname(src).slice(1) }
}

function exportDeck(file) {
	const { schema, records } = readRecords(file)
	const store = {}
	for (const r of records) if (KEEP.has(r.typeName)) store[r.id] = r
	externalise(store)
	const local = Object.values(store).filter((r) => r.typeName === 'asset' && r.props?.src && !/^(https?:|data:|\.\/decks\/media\/)/.test(r.props.src))
	if (local.length) console.warn(`  warning: ${local.length} image/video asset(s) in ${path.basename(file)} reference local files and won't show on the site`)
	const pages = Object.values(store).filter((r) => r.typeName === 'page').map((p) => p.id)
	const slides = Object.values(store).filter((r) => r.type === 'frame' && pages.includes(r.parentId)).length
	return { snapshot: { store, schema }, slides }
}

const { folders, decks } = walk()
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })
const index = { generated: new Date().toISOString(), folders: folders.map(({ path: p, folder, title, description }) => ({ path: p, folder, title, description })), decks: [] }
// Pack versions the site bundles (see vite.config.js); a deck frozen to one that's missing can't show.
const RELEASES = path.resolve(SITE, '../presentation-pack/releases')
const versions = [...fs.readdirSync(RELEASES).filter((n) => /^\d+$/.test(n)).sort((a, b) => a - b), 'dev']
const latest = versions.at(-2)
let skipped = 0
for (const d of decks) {
	// A deck that can't be exported is left off the site (with a warning) rather than taking the others down.
	try {
		if (d.metaError) throw new Error(d.metaError)
		if (!d.hasFile) throw new Error(`no ${d.name}.tldraw`)
		const pack = String(d.meta.pack ?? latest)
		if (!versions.includes(pack)) throw new Error(`deck.json asks for pack ${pack}, which isn't in presentation-pack/releases/`)
		const { snapshot, slides } = exportDeck(d.file)
		const out = path.join(OUT, `${d.path}.json`)
		fs.mkdirSync(path.dirname(out), { recursive: true })
		fs.writeFileSync(out, JSON.stringify(snapshot))
		let cover = null
		if (d.cover) {
			const c = coverFile(d.cover)
			cover = `decks/${d.path}.${c.ext}`
			fs.writeFileSync(path.join(SITE, 'public', cover), c.buf)
		}
		index.decks.push({ path: d.path, folder: d.folder, title: d.meta.title ?? d.name, description: d.meta.description ?? '', date: d.meta.date ?? '', listed: d.meta.listed !== false, slides, cover, pack })
		console.log(`exported ${d.path}: ${slides} slides, pack ${pack}${cover ? ', cover' : ''}`)
	} catch (e) {
		skipped++
		console.warn(`SKIPPED ${d.path}: ${e.message}`)
	}
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1))
// Forget cached conversions no deck uses any more (only after a complete export).
if (!skipped && fs.existsSync(CACHE))
	for (const f of fs.readdirSync(CACHE)) if (!f.startsWith('.') && !usedCache.has(f)) fs.rmSync(path.join(CACHE, f))
console.log(`${index.folders.length} folder(s), ${index.decks.length} deck(s)${skipped ? `, ${skipped} skipped` : ''} → ${path.relative(process.cwd(), OUT)}`)
