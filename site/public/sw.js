// The site's service worker: makes repeat visits quick and lets decks you've opened work offline.
//
//   assets/…, decks/media/…   named by their content (they never change under the same name):
//                             from the cache, no network at all once seen
//   fonts from Google         the same (their URLs are versioned)
//   the page, decks/*.json,   network first, so a publish shows up at once; the cached copy only
//   covers, everything else   when the network fails (offline)
//
// Only this site's own requests and Google Fonts are handled; the live-room server isn't.
// To retire it, replace this file with one that calls self.registration.unregister().
const VERSION = 'v1'
const STATIC = `pp-static-${VERSION}` // content-named files
const PAGES = `pp-pages-${VERSION}` // everything else, for offline
const MAX_STATIC = 400 // old builds' files are dropped beyond this many (oldest first)

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) if (key.startsWith('pp-') && key !== STATIC && key !== PAGES) await caches.delete(key)
			await self.clients.claim()
		})()
	)
})

const scope = new URL(self.registration.scope)
const immutable = (url) =>
	(url.origin === scope.origin && /\/(assets|decks\/media)\/[^/]+$/.test(url.pathname)) || url.origin === 'https://fonts.gstatic.com'

async function trim(cache) {
	const keys = await cache.keys()
	for (const k of keys.slice(0, Math.max(0, keys.length - MAX_STATIC))) await cache.delete(k)
}

async function cacheFirst(request) {
	const cache = await caches.open(STATIC)
	const hit = await cache.match(request)
	if (hit) return hit
	const response = await fetch(request)
	if (response.ok || response.type === 'opaque') {
		cache.put(request, response.clone()).then(() => trim(cache))
	}
	return response
}

async function networkFirst(request) {
	const cache = await caches.open(PAGES)
	try {
		const response = await fetch(request)
		if (response.ok) cache.put(request, response.clone())
		return response
	} catch (error) {
		const hit = await cache.match(request, { ignoreSearch: request.mode === 'navigate' })
		if (hit) return hit
		throw error
	}
}

self.addEventListener('fetch', (event) => {
	const { request } = event
	if (request.method !== 'GET') return
	const url = new URL(request.url)
	// video files are fetched in ranges; let the browser handle those
	if (request.headers.has('range')) return
	if (immutable(url)) return event.respondWith(cacheFirst(request))
	const ours = url.origin === scope.origin && url.pathname.startsWith(scope.pathname)
	if (ours || url.origin === 'https://fonts.googleapis.com') event.respondWith(networkFirst(request))
})
