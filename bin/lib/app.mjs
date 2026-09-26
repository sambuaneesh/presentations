// The `pres` screen: what you get when you type `pres` in a terminal. Everything the commands do,
// found by moving around instead of remembered: your presentations (this project's first), a page
// per presentation with what you can do with it, and smart pickers that suggest the right folder.
// Work is done by running `pres <command>` underneath (shown live), so the screen and the commands
// always behave the same.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { c, start, stop, menu, input, pick, confirm, run, pager, page, fit } from './tui.mjs'
import { readRecords } from './tldraw-file.mjs'

let A // the API from pres.mjs
const home = os.homedir()
const tilde = (p) => (p.startsWith(home) ? '~' + p.slice(home.length) : p)
const words = (s) => String(s ?? '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOP.has(w))
const STOP = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'about', 'presentation', 'presentations', 'talk', 'talks', 'slides', 'deck', 'what', 'how', 'our', 'your', 'new'])
const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

// ---------- where am I ----------
// The project you're in: the nearest folder up with a presentations/ folder, else the git root, else
// here. Inside the presentations repo itself it's the repo.
function whereAmI() {
	const cwd = process.cwd()
	if (cwd === A.ROOT || cwd.startsWith(A.ROOT + path.sep)) return { repo: true, root: A.ROOT, name: 'presentations', here: cwd }
	for (let d = cwd; ; d = path.dirname(d)) {
		if (fs.existsSync(path.join(d, A.LOCAL_DIR)) && fs.statSync(path.join(d, A.LOCAL_DIR)).isDirectory()) return { repo: false, root: d, name: path.basename(d), here: cwd }
		if (d === path.dirname(d) || d === home) break
	}
	const top = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' })
	const root = top.status === 0 ? top.stdout.trim() : cwd
	return { repo: false, root, name: path.basename(root), here: cwd }
}

// Other names a project goes by: its GitHub repo names (a folder called "decomplab" may be the
// repo "mono2micro-research"), so it can be matched to the right website folder.
function aliases(where) {
	const names = new Set([where.name])
	const remotes = spawnSync('git', ['remote', '-v'], { cwd: where.root, encoding: 'utf8' })
	for (const m of (remotes.stdout ?? '').matchAll(/[/:]([^/\s]+?)(?:\.git)?\s/g)) names.add(m[1])
	return [...names]
}

// The deck you're standing in, if any (cd into a deck folder, then `pres`).
function deckHere(where) {
	for (let d = where.here; d.startsWith(where.root) && d !== path.dirname(d); d = path.dirname(d)) {
		if (d !== A.ROOT && d !== A.DECKS && A.isDeckDir(d)) return A.deckAt(d)
		if (d === where.root) break
	}
	return null
}

// ---------- facts about decks ----------
const git = (args) => A.git(args)
function published(deck) {
	// → { at: 'folder/name' | null, state: 'live' | 'changed' | 'never' }
	const target = deck.local ? (deck.meta.publish?.folder !== undefined ? [deck.meta.publish.folder, deck.name].filter(Boolean).join('/') : null) : deck.path
	if (!target) return { at: null, state: 'never' }
	const remote = git(['rev-parse', '--verify', '--quiet', `origin/main:decks/${target}/${deck.name}.tldraw`])
	if (remote.status !== 0) return { at: target, state: 'never' }
	const mine = git(['hash-object', deck.file]).stdout.trim()
	const meta = git(['rev-parse', '--verify', '--quiet', `origin/main:decks/${target}/deck.json`]).stdout.trim()
	const myMeta = fs.existsSync(path.join(deck.dir, 'deck.json')) ? git(['hash-object', path.join(deck.dir, 'deck.json')]).stdout.trim() : ''
	const same = mine === remote.stdout.trim() && (deck.local || meta === myMeta)
	return { at: target, state: same ? 'live' : 'changed' }
}
const stateText = (p) => (p.state === 'live' ? c.green('on the website') : p.state === 'changed' ? c.yellow('changed since publishing') : c.grey('not on the website yet'))

const slideCache = new Map()
function slideCount(deck) {
	try {
		const key = `${deck.file}:${fs.statSync(deck.file).mtimeMs}`
		if (!slideCache.has(key)) {
			const { records } = readRecords(deck.file)
			const pages = new Set(records.filter((r) => r.typeName === 'page').map((r) => r.id))
			slideCache.set(key, records.filter((r) => r.type === 'frame' && pages.has(r.parentId)).length)
		}
		return slideCache.get(key)
	} catch {
		return null
	}
}
const manifest = (deck) => (deck.hasSlides ? (A.readJson(path.join(deck.dir, 'slides', 'manifest.json')) ?? []) : [])

async function openInTldraw(deck) {
	const docs = await Promise.race([A.openDocs(), new Promise((r) => setTimeout(() => r(null), 1200))])
	return docs?.find((d) => d.filePath && path.resolve(d.filePath) === deck.file) ?? null
}

// Folders on the website that look like they belong with this project or deck, best first.
function folderGuesses({ deck, project, title, moving = false } = {}) {
	const { folders, decks } = A.walk()
	const hereRel = process.cwd().startsWith(A.DECKS + path.sep) ? path.relative(A.DECKS, process.cwd()).split(path.sep).join('/') : null
	const scored = folders.map((f) => {
		let score = 0
		let why = ''
		const add = (n, reason) => {
			score += n
			if (!why) why = reason
		}
		if (deck?.meta.publish?.folder === f.path) add(100, 'used last time')
		if (deck && !deck.local && deck.folder === f.path) {
			if (moving) return { f, score: -1000, why: 'where it is now' }
			add(100, 'where it is now')
		}
		if (hereRel && (hereRel === f.path || hereRel.startsWith(f.path + '/'))) add(90, "you're in it")
		const names = [f.name, f.title].map(norm)
		for (const alias of [project].flat().filter(Boolean)) {
			const pn = norm(alias)
			if (pn && names.some((n) => n && n.length >= 3 && (pn.includes(n) || n.includes(pn)))) {
				add(60, `matches the project “${alias}”`)
				break
			}
		}
		const tw = new Set([...words(title ?? deck?.meta.title), ...words(deck?.meta.description)])
		const fw = new Set([...words(f.name), ...words(f.title), ...words(f.description)])
		const inside = decks.filter((d) => d.folder === f.path || d.folder.startsWith(f.path + '/'))
		for (const d of inside) for (const w of words(d.meta.title)) fw.add(w)
		const overlap = [...tw].filter((w) => fw.has(w)).length
		if (overlap) add(25 * overlap, 'similar to the talks in it')
		score += inside.length * 0.5
		return { f, score, why }
	})
	return scored.sort((a, b) => b.score - a.score || a.f.path.localeCompare(b.f.path))
}

// Pick a website folder: existing ones first (best guess on top, fuzzy search), a new one only if
// you type a name that isn't there. Resolves with the folder path ('' = the top), or null.
async function chooseFolder({ crumbs, question, deck, project, title, allowTop = true, moving = false }) {
	const guesses = folderGuesses({ deck, project, title, moving })
	const options = guesses.map(({ f, score, why }, i) => ({
		label: f.path,
		value: f.path,
		search: `${f.title} ${f.description}`,
		hint: [f.title !== A.titleFromName(f.name) ? f.title : '', score < 0 ? why : i === 0 && score >= 20 ? `suggested · ${why}` : score >= 20 ? why : ''].filter(Boolean).join(' · '),
	}))
	if (allowTop) options.push({ label: '(top level)', value: '', search: 'top root none', hint: 'not in a folder' })
	const choice = await pick({
		crumbs,
		question,
		detail: ['Type to search the folders already on the website. A name that doesn’t exist yet becomes a new folder.'],
		options,
		create: (text) => {
			const p = text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9/-]/g, '').replace(/\/+/g, '/').replace(/^\/|\/$/g, '')
			if (!p || !p.split('/').every((x) => A.NAME.test(x))) return { label: `“${text}” can’t be a folder name`, value: { bad: true }, hint: 'use letters, digits, dashes and /' }
			return { label: `＋ New folder: ${p}`, value: { create: p }, hint: 'made when it’s needed' }
		},
	})
	if (choice === null) return null
	if (typeof choice === 'object') return choice.bad ? chooseFolder({ crumbs, question, deck, project, title, allowTop, moving }) : choice.create
	return choice
}

// ---------- small helpers ----------
const pres = (crumbs, title, args, after) => run({ crumbs, title, cmd: process.execPath, args: [A.PRES, ...args], cwd: W.root, after })
function openPath(target) {
	const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open'
	try {
		spawn(opener, [target], { detached: true, stdio: 'ignore' }).on('error', () => {}).unref()
		return true
	} catch {
		return false
	}
}
function copy(text) {
	for (const [cmd, args] of [['wl-copy', []], ['pbcopy', []], ['xclip', ['-selection', 'clipboard']], ['xsel', ['--clipboard', '--input']], ['clip.exe', []]]) {
		// (wl-copy stays behind to serve the clipboard: don't wait on its output)
		const r = spawnSync(cmd, args, { input: text, stdio: ['pipe', 'ignore', 'ignore'], timeout: 3000 })
		if (r.status === 0) return true
	}
	return false
}
async function message(crumbs, lines, items = [{ label: 'OK', value: null }]) {
	return menu({ crumbs, intro: lines, items })
}
const siteUrl = (p) => (A.remoteSite() ? `${A.remoteSite()}#/${p}` : null)

// ---------- screens ----------
let W // where we are

export async function runApp(api) {
	A = api
	W = whereAmI()
	W.aliases = W.repo ? [] : aliases(W)
	start()
	try {
		const here = deckHere(W)
		if (here) await deckScreen(here)
		await homeScreen()
	} finally {
		stop()
	}
}

async function homeScreen() {
	let last
	for (;;) {
		const local = W.repo ? [] : localDecksOf(W.root)
		const { folders, decks } = A.walk()
		const related = W.repo ? [] : folderGuesses({ project: W.aliases }).filter((g) => g.why.startsWith('matches the project')).map((g) => g.f)
		// A project presentation and its copy on the website are one presentation: list it once.
		const twins = new Set(local.map((d) => (d.meta.publish?.folder !== undefined ? [d.meta.publish.folder, d.name].filter(Boolean).join('/') : null)).filter(Boolean))
		const visible = decks.filter((d) => !twins.has(d.path))
		const items = []
		const deckItem = (d, where) => {
			const p = published(d)
			const n = slideCount(d)
			return { label: d.meta.title || d.name, value: { deck: d.dir }, search: `${d.name} ${d.path ?? ''} ${where}`, hint: [where, n !== null ? `${n} slide${n === 1 ? '' : 's'}` : '', p.state === 'live' ? '' : p.state === 'changed' ? 'changed since publishing' : 'not published'].filter(Boolean).join(' · ') }
		}
		if (!W.repo) {
			items.push({ heading: true, label: `In this project · ${W.name}` })
			if (local.length) for (const d of local) items.push(deckItem(d, `./${A.LOCAL_DIR}/${d.name}`))
			else items.push({ label: 'No presentations here yet', disabled: true })
		}
		items.push({ label: '＋ New presentation', value: 'new', key: 'n', about: W.repo ? 'Make a presentation in one of the website’s folders. It starts with three hand-drawn slides.' : `Make a presentation inside this project (./${A.LOCAL_DIR}/). Only it is yours to change; publishing puts a copy on the website.` })
		items.push({ label: '✦ Ask an agent to make one', value: 'agent', key: 'a', about: 'Describe the talk; you get a ready-made request to paste into Claude Code, Codex, Cursor or any agent (copied to the clipboard).' })
		for (const f of related) {
			const inside = visible.filter((d) => d.folder === f.path || d.folder.startsWith(f.path + '/'))
			if (!inside.length) continue
			items.push({ heading: true, label: `Related on the website · ${f.path}` })
			for (const d of inside) items.push(deckItem(d, d.folder))
		}
		items.push({ heading: true, label: related.length ? 'Everything else on the website' : `On the website · ${decks.length} presentation${decks.length === 1 ? '' : 's'}` })
		const shownRelated = new Set(related.flatMap((f) => visible.filter((d) => d.folder === f.path || d.folder.startsWith(f.path + '/')).map((d) => d.dir)))
		for (const d of visible) if (!shownRelated.has(d.dir)) items.push(deckItem(d, d.folder || 'top level'))
		items.push({ heading: true, label: 'More' })
		items.push({ label: 'Open the website', value: 'site', key: 'w', hint: A.remoteSite() ?? '' })
		items.push({ label: 'Folders on the website', value: 'folders', key: 'f', about: 'See the folders, rename their titles, make new ones.' })
		items.push({ label: 'Check every presentation', value: 'check', about: 'Looks for missing files, broken slide files and slides without notes.' })
		items.push({ label: 'Template versions', value: 'pack', about: 'Each presentation keeps the template version it was made with. Release template changes and update presentations here.' })
		items.push({ label: 'The studio (web page)', value: 'studio', about: 'The same things in your browser, at localhost:4321.' })
		items.push({ label: 'Read the guide', value: 'guide', key: 'g', about: 'The style, the rules and the workflow: what an agent follows.' })
		const setupNeeded = !fs.existsSync(path.join(home, '.local', 'bin', 'pres'))
		const skillNeeded = !fs.existsSync(path.join(home, '.claude', 'skills', 'presentations'))
		if (setupNeeded || skillNeeded) items.push({ label: setupNeeded ? 'Set up: use pres from any folder' : 'Set up: teach Claude Code about pres', value: 'setup' })
		items.push({ label: 'Quit', value: 'quit', key: 'q' })

		const intro = (cols) => [
			fit(W.repo ? `${c.bold('Your presentations')}  ${c.grey(tilde(A.ROOT))}` : `${c.bold(W.name)}  ${c.grey(tilde(W.root))}`, cols),
			W.repo ? c.grey(`${decks.length} on the website, in ${folders.length} folder${folders.length === 1 ? '' : 's'}.`) : c.grey(local.length ? `${local.length} presentation${local.length === 1 ? '' : 's'} in this project${related.length ? ` · related to ${related.map((f) => f.path).join(', ')} on the website` : ''}.` : related.length ? `Nothing here yet · this project looks related to ${related.map((f) => f.path).join(', ')} on the website: open one of its talks to bring it here.` : 'Nothing here yet. Make one, or ask an agent to.'),
		]
		const choice = await menu({ crumbs: [], intro, items, search: true, start: last, back: false, hints: [['q', 'quit']] })
		last = choice
		if (choice === 'quit' || choice === null) return
		if (choice?.deck) await deckScreen(A.deckAt(choice.deck))
		else if (choice === 'new') {
			const made = await newFlow()
			if (made) await deckScreen(A.deckAt(made))
		} else if (choice === 'agent') await agentFlow()
		else if (choice === 'site') {
			const url = A.remoteSite()
			if (url && openPath(url)) await message(['Website'], [`Opening ${url}`])
		} else if (choice === 'folders') await foldersScreen()
		else if (choice === 'check') await pres(['Check'], 'Checking every presentation', ['check'])
		else if (choice === 'pack') await packScreen()
		else if (choice === 'studio') await studio()
		else if (choice === 'guide') await guide()
		else if (choice === 'setup') await pres(['Set up'], 'Setting up pres', ['setup', '--claude'])
	}
}

function localDecksOf(root) {
	const dir = path.join(root, A.LOCAL_DIR)
	if (!fs.existsSync(dir)) return []
	return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && !/^[._]/.test(e.name) && A.isDeckDir(path.join(dir, e.name))).map((e) => A.deckAt(path.join(dir, e.name)))
}

// ---------- one presentation ----------
async function deckScreen(deck) {
	let last
	for (;;) {
		if (!fs.existsSync(deck.dir)) return
		deck = A.deckAt(deck.dir)
		const title = deck.meta.title || deck.name
		const crumbs = [title]
		const p = published(deck)
		const n = slideCount(deck)
		const doc = await openInTldraw(deck)
		const versions = A.packVersions()
		const pack = deck.meta.pack ?? A.latestPack()
		const newer = pack !== 'dev' && versions.length && Number(pack) < versions.at(-1) ? versions.at(-1) : null
		const slides = manifest(deck)
		const where = deck.local ? tilde(deck.dir) : `decks/${deck.path}`
		const home = deck.local ? null : A.homeOf(deck)
		const homeHere = home && fs.existsSync(home) ? home : null
		const url = p.at && p.state !== 'never' ? siteUrl(p.at) : null
		const intro = (cols) => [
			c.bold(title) + (deck.meta.description ? c.grey('  ' + deck.meta.description) : ''),
			'',
			`${c.grey('where    ')} ${where}`,
			...(homeHere ? [`${c.grey('edited in')} ${c.yellow(tilde(homeHere))}  ${c.grey('(this is its website copy: change it there)')}`] : []),
			`${c.grey('slides   ')} ${n ?? '?'}${deck.hasSlides ? c.grey(` · drawn from code (${slides.length} in slides/)`) : c.grey(' · drawn by hand')}`,
			`${c.grey('website  ')} ${stateText(p)}${!url && deck.local && p.at ? c.grey(`  · will go to ${p.at}`) : ''}`,
			...(url ? [`${c.grey('link     ')} ${c.grey(url)}`] : []),
			`${c.grey('tldraw   ')} ${doc ? (doc.unsavedChanges ? c.yellow('open, unsaved changes') : 'open') : c.grey('closed')}`,
			`${c.grey('template ')} version ${pack}${newer ? c.yellow(`  · version ${newer} is available`) : ''}`,
		].map((l, i) => (i ? fit(l, cols) : l))
		const bringable = !deck.local && !W.repo && !homeHere
		const items = [
			...(homeHere ? [{ heading: true, label: 'Worked on elsewhere' }, { label: 'Go to the copy you work on', value: 'home', key: 'h', about: `${tilde(homeHere)}: publishing from there updates this website copy.` }] : []),
			...(bringable ? [{ heading: true, label: 'This project' }, { label: 'Work on it in this project', value: 'bring', key: 'h', about: `Copies it into ./${A.LOCAL_DIR}/${deck.name}/ in ${W.name}. You (and this project's agent) edit it there; publishing sends it back to ${deck.path}.` }] : []),
			{ heading: true, label: 'Make it' },
			{ label: doc ? 'Show it in tldraw' : 'Open it in tldraw', value: 'open', key: 'o', about: 'Draw and edit by hand in tldraw Desktop.' },
			...(deck.hasSlides
				? [
						{ label: 'Build the slides from code', value: 'build', key: 'b', about: 'Draws slides/*.js into the deck and saves it. Hand-drawn slides are left alone.' },
						{ label: 'Rebuild one slide…', value: 'build-one', about: 'Pick a slide file to redraw.' },
					]
				: []),
			{ label: '✦ Ask an agent to work on it', value: 'agent', key: 'a', about: 'Say what to change; you get a request to paste into any agent (copied to the clipboard).' },
			{ heading: true, label: 'Look at it' },
			{ label: 'Screenshots of every slide', value: 'shots', key: 'l', about: 'Pictures of each slide, fully revealed, to check for overlaps and clipping.' },
			{ label: 'One slide, click by click…', value: 'steps', about: 'Pictures of one slide after each click.' },
			{ label: 'Check it', value: 'check', key: 'c', about: 'Missing files, broken slide files, slides without notes.' },
			{ heading: true, label: 'Share it' },
			{ label: p.state === 'live' ? 'Publish again' : p.state === 'changed' ? 'Publish the changes' : 'Publish it on the website…', value: 'publish', key: 'p', about: 'Commits and pushes just this presentation to GitHub; the website updates in about a minute. Nothing else comes along.' },
			...(url ? [{ label: 'Open it on the website', value: 'view', key: 'w', hint: url }, { label: 'Copy its link', value: 'copy-link' }] : []),
			{ label: deck.cover ? 'Remake the cover from slide 1' : 'Make the cover from slide 1', value: 'cover', about: 'The picture on its card on the website (publishing makes one if it has none).' },
			{ heading: true, label: 'Organise' },
			{ label: 'Change the title or description', value: 'edit' },
			deck.local
				? { label: p.at !== null ? `Website folder: ${deck.meta.publish?.folder || '(top level)'} · change…` : 'Choose its website folder…', value: 'folder', about: 'Where it appears on the website when you publish.' }
				: { label: `Move to another folder… ${c.grey('(now: ' + (deck.folder || 'top level') + ')')}`, value: 'move' },
			...(newer ? [{ label: `Update to template version ${newer}`, value: 'upgrade', about: 'Newer template features. Look at the slides afterwards.' }] : []),
			{ label: 'Open its folder', value: 'reveal', about: tilde(deck.dir) },
			{ label: 'Copy its folder path', value: 'copy-path' },
			{ label: 'Delete…', value: 'delete' },
			{ label: 'Back', value: null, key: 'q' },
		]
		const choice = await menu({ crumbs, intro, items, start: last })
		last = choice
		if (choice === null) return
		const target = deck.dir
		if (choice === 'home') await deckScreen(A.deckAt(homeHere))
		else if (choice === 'bring') {
			const ok = await confirm({ crumbs, question: `Work on “${title}” in ${W.name}?`, detail: [`It's copied to ${tilde(path.join(W.root, A.LOCAL_DIR, deck.name))}/ and publishes back to ${deck.path}.`, 'The website copy is marked as edited there, so it isn’t changed in two places.'], yes: 'Yes, bring it here' })
			if (ok) {
				const r = await pres(crumbs, 'Bringing it into this project', ['bring', deck.dir, '--into', W.root])
				if (r.ok) return deckScreen(A.deckAt(path.join(W.root, A.LOCAL_DIR, deck.name)))
			}
		} else if (choice === 'open') await pres(crumbs, 'Opening it in tldraw', ['open', target])
		else if (choice === 'build') await pres(crumbs, 'Building the slides', ['build', target])
		else if (choice === 'build-one') {
			const which = await pick({ crumbs, question: 'Which slide?', options: slides.map((s, i) => ({ label: s, value: s, hint: `slide ${i + 1}` })) })
			if (which) await pres(crumbs, `Rebuilding ${which}`, ['build', target, '--only', which])
		} else if (choice === 'shots') await shots(crumbs, target, ['--all'], 'Taking a picture of every slide')
		else if (choice === 'steps') {
			const count = n ?? slides.length
			const options = Array.from({ length: count }, (_, i) => ({ label: `${i + 1}${slides[i] ? ' · ' + slides[i].replace(/^\d+-/, '').replace(/-/g, ' ') : ''}`, value: i + 1 }))
			const which = options.length ? await pick({ crumbs, question: 'Which slide?', options }) : null
			if (which) await shots(crumbs, target, ['--slide', String(which), '--steps'], `Slide ${which}, click by click`)
		} else if (choice === 'check') await pres(crumbs, 'Checking it', ['check', target])
		else if (choice === 'publish') await publishFlow(deck, crumbs)
		else if (choice === 'view') openPath(url)
		else if (choice === 'copy-link') await message(crumbs, [copy(url) ? `${c.green('✓')} Copied ${url}` : `Couldn’t reach the clipboard. The link: ${url}`])
		else if (choice === 'cover') await pres(crumbs, 'Making the cover', ['cover', target])
		else if (choice === 'edit') await editFlow(deck, crumbs)
		else if (choice === 'folder') {
			const f = await chooseFolder({ crumbs, question: 'Where should it appear on the website?', deck, project: W.aliases })
			if (f !== null) {
				deck.meta.publish = { folder: f }
				fs.writeFileSync(path.join(deck.dir, 'deck.json'), JSON.stringify(deck.meta, null, '\t') + '\n')
			}
		} else if (choice === 'move') {
			const f = await chooseFolder({ crumbs, question: `Move “${title}” to which folder?`, deck, moving: true })
			if (f !== null && f !== deck.folder) {
				const r = await pres(crumbs, 'Moving it', ['move', deck.path, f || '.'])
				if (r.ok) deck = A.deckAt(path.join(A.DECKS, f, deck.name))
			}
		} else if (choice === 'upgrade') {
			if (await confirm({ crumbs, question: `Update “${title}” to template version ${newer}?`, detail: ['It gets the newer template (presenting, reveals, slide panel). The slides stay as they are.', 'Look at it afterwards; version ' + pack + ' stays available if you want to go back.'] }))
				await pres(crumbs, 'Updating the template', ['upgrade', target])
		} else if (choice === 'reveal') openPath(deck.dir)
		else if (choice === 'copy-path') await message(crumbs, [copy(deck.dir) ? `${c.green('✓')} Copied ${deck.dir}` : deck.dir])
		else if (choice === 'agent') await agentFlow(deck)
		else if (choice === 'delete') {
			if (await deleteFlow(deck, crumbs, doc)) return
		}
	}
}

async function shots(crumbs, target, args, title) {
	const r = await pres(crumbs, title, ['shot', target, ...args], (output) => {
		const files = output.split('\n').map((l) => l.trim()).filter((l) => l.endsWith('.jpg'))
		if (!files.length) return []
		return [{ label: `Open the pictures (${files.length})`, value: { open: path.dirname(files[0]) } }, { label: 'Open the first one', value: { open: files[0] } }]
	})
	if (r.choice?.open) openPath(r.choice.open)
}

async function publishFlow(deck, crumbs) {
	const title = deck.meta.title || deck.name
	let folder
	if (deck.local) {
		folder = deck.meta.publish?.folder
		if (folder === undefined) {
			folder = await chooseFolder({ crumbs, question: `Where on the website should “${title}” go?`, deck, project: W.aliases })
			if (folder === null) return
		}
	}
	const at = deck.local ? [folder, deck.name].filter(Boolean).join('/') : deck.path
	const ok = await confirm({
		crumbs,
		question: `Publish “${title}”?`,
		detail: [`It goes to ${c.bold(at)}${siteUrl(at) ? c.grey('  ' + siteUrl(at)) : ''}.`, 'This commits and pushes only this presentation to GitHub. Nothing else in the repo comes along.'],
		yes: 'Yes, publish it',
		no: deck.local ? 'No (or pick another folder from its page)' : 'No, go back',
	})
	if (!ok) return
	const url = siteUrl(at)
	const r = await pres(crumbs, `Publishing ${at}`, ['publish', deck.dir, ...(deck.local ? ['--to', folder || '.'] : [])], () =>
		url ? [{ label: 'Open it on the website', value: 'view' }, { label: 'Copy its link', value: 'copy' }] : []
	)
	if (r.choice === 'view') openPath(url)
	if (r.choice === 'copy') copy(url)
}

async function editFlow(deck, crumbs) {
	const t = await input({ crumbs, question: 'Title', detail: ['The name on its card on the website. (The title drawn on slide 1 is part of the drawing; change it there too.)'], initial: deck.meta.title ?? '' })
	if (t === null) return
	const d = await input({ crumbs, question: 'Description', detail: ['One line on its card. Optional.'], initial: deck.meta.description ?? '', optional: true })
	if (d === null) return
	deck.meta.title = t
	deck.meta.description = d
	fs.writeFileSync(path.join(deck.dir, 'deck.json'), JSON.stringify(deck.meta, null, '\t') + '\n')
}

async function deleteFlow(deck, crumbs, doc) {
	if (doc) {
		await message(crumbs, [c.bold('Close it in tldraw first.'), c.grey('tldraw would keep saving it back.')])
		return false
	}
	const p = published(deck)
	const typed = await input({
		crumbs,
		question: `Delete “${deck.meta.title || deck.name}”? Type its name, ${c.red(deck.name)}, to confirm.`,
		detail: [`This removes ${tilde(deck.dir)}.`, p.state !== 'never' && deck.local ? 'The copy on the website stays until you remove it there.' : !deck.local ? 'It leaves the website at the next push (git can bring it back).' : ''].filter(Boolean),
		check: (v) => (v === deck.name ? null : `That isn’t “${deck.name}”.`),
	})
	if (typed !== deck.name) return false
	fs.rmSync(deck.dir, { recursive: true, force: true })
	await message(crumbs, [`${c.green('✓')} Deleted.`])
	return true
}

// ---------- making one ----------
async function newFlow() {
	const crumbs = ['New presentation']
	const title = await input({ crumbs, question: 'What’s it called?', detail: ['A title for the talk. You can change it later.'], placeholder: W.repo ? 'e.g. Seeing is Fixing' : `e.g. ${A.titleFromName(W.name)}: what we built` })
	if (title === null) return null
	let place
	if (W.repo) place = { folder: await chooseFolder({ crumbs: [...crumbs, title], question: 'Which folder on the website?', title }) }
	else {
		const guess = folderGuesses({ project: W.aliases, title })[0]
		const choice = await menu({
			crumbs: [...crumbs, title],
			intro: [c.bold('Where should it live while you make it?')],
			items: [
				{ label: `Here, in this project`, hint: `./${A.LOCAL_DIR}/${A.slugify(title)}`, value: 'here', about: 'Best when the talk is about this project: you and its agent work on just this one. Publish it to the website when it’s ready.' },
				{ label: 'In the presentations repo', hint: guess && guess.score >= 20 ? `suggested folder: ${guess.f.path}` : '', value: 'repo', about: 'Straight into a folder of the website’s tree.' },
			],
		})
		if (choice === null) return null
		place = choice === 'here' ? { here: true } : { folder: await chooseFolder({ crumbs: [...crumbs, title], question: 'Which folder on the website?', project: W.aliases, title }) }
	}
	if (place.folder === null) return null
	const description = await input({ crumbs: [...crumbs, title], question: 'A one-line description?', detail: ['Shown on its card. Optional: press enter to skip.'], optional: true })
	if (description === null) return null
	const name = A.slugify(title)
	const args = ['new', title, '--name', name, ...(place.here ? ['--here'] : ['--in', place.folder || '.']), ...(description ? ['--description', description] : [])]
	const r = await pres(crumbs, `Making “${title}”`, args)
	if (!r.ok) return null
	return place.here ? path.join(W.root, A.LOCAL_DIR, name) : path.join(A.DECKS, place.folder, name)
}

async function agentFlow(deck) {
	const crumbs = deck ? [deck.meta.title || deck.name, 'Ask an agent'] : ['Ask an agent']
	const what = await input({
		crumbs,
		question: deck ? 'What should the agent do?' : 'What’s the talk about?',
		detail: deck ? ['e.g. “add three slides on the evaluation, from the paper in ./paper.pdf”'] : ['e.g. “the paper in ./paper.pdf, for the weekly meeting”, or “what this project does and how”'],
	})
	if (!what) return
	let text
	if (deck) {
		const rel = path.relative(W.root, deck.dir) || deck.dir
		text = `Work on the presentation in ${rel}: ${what}. First run \`pres guide\` and follow it exactly (the house style, the facts rules, the workflow). Rebuild what you change with \`pres build ${rel} --only <slide>\`, look at every changed slide with \`pres shot ${rel} --slide <n> --steps\`, and finish with \`pres check ${rel}\`. Don't publish it.`
	} else if (W.repo) {
		const folder = await chooseFolder({ crumbs, question: 'Which folder on the website should it go in?', title: what })
		if (folder === null) return
		text = `Make a presentation about ${what}. First run \`pres guide\` and follow it exactly (the house style, the facts rules, the workflow). Create it with \`pres new "<title>" --in ${folder || '.'}\`, one idea per slide, build it, look at every slide with \`pres shot <deck> --all\`, and finish with \`pres check <deck>\`. Don't publish it.`
	} else text = `Make a presentation about ${what}. First run \`pres guide\` and follow it exactly (the house style, the facts rules, the workflow). Create it in this project with \`pres new "<title>" --here\`, one idea per slide, build it, look at every slide with \`pres shot <deck> --all\`, and finish with \`pres check <deck>\`. Don't publish it.`
	const copied = copy(text)
	await message(crumbs, [copied ? `${c.green('✓')} Copied. Paste it into your agent:` : 'Paste this into your agent:', '', text, '', c.grey('Works with any agent that can run commands: Claude Code, Codex, Cursor, Gemini, …')])
}

// ---------- the rest ----------
async function foldersScreen() {
	for (;;) {
		const { folders, decks } = A.walk()
		const crumbs = ['Folders']
		const items = folders.map((f) => {
			const count = decks.filter((d) => d.folder === f.path).length
			return { label: f.path, value: f.path, hint: `${f.title}${count ? ` · ${count} presentation${count === 1 ? '' : 's'}` : ' · empty'}`, search: f.title }
		})
		items.push({ label: '＋ New folder', value: 'new', key: 'n' }, { label: 'Back', value: null })
		const choice = await menu({ crumbs, intro: [c.bold('Folders on the website'), c.grey('Choose one to rename its title. Presentations move from their own page.')], items, search: true })
		if (choice === null) return
		if (choice === 'new') {
			const p = await input({ crumbs, question: 'Folder name', detail: ['Lowercase letters, digits and dashes; use / for a folder inside a folder (e.g. talks/2026).'], check: (v) => (v.split('/').every((x) => A.NAME.test(x)) ? (folders.some((f) => f.path === v) ? 'That folder exists already.' : null) : 'Use lowercase letters, digits, dashes and /.') })
			if (!p) continue
			const t = await input({ crumbs, question: 'Its title on the website', initial: A.titleFromName(path.basename(p)) })
			if (t !== null) await pres(crumbs, `Making ${p}`, ['folder', p, '--title', t])
		} else {
			const f = folders.find((x) => x.path === choice)
			const t = await input({ crumbs: [...crumbs, f.path], question: 'Title shown on the website', initial: f.title })
			if (t) {
				const file = path.join(A.DECKS, f.path, 'folder.json')
				const meta = A.readJson(file) ?? {}
				fs.writeFileSync(file, JSON.stringify({ ...meta, title: t }, null, '\t') + '\n')
			}
		}
	}
}

async function packScreen() {
	const crumbs = ['Template versions']
	for (;;) {
		const status = spawnSync(process.execPath, [A.PRES, 'pack'], { cwd: W.root, encoding: 'utf8' }).stdout.trim()
		const changed = /changed since the last release/.test(status)
		const choice = await menu({
			crumbs,
			intro: [c.bold('Template versions'), c.grey('Each presentation keeps the version it was made with, so template changes never break old talks.'), '', ...status.split('\n')],
			items: [
				{ label: changed ? 'Release the template changes as a new version' : 'Nothing new to release', value: 'release', disabled: !changed, about: 'Freezes presentation-pack/script/ as the next version. New presentations get it; update others from their page.' },
				{ label: 'Back', value: null },
			],
		})
		if (choice === null) return
		if (choice === 'release' && (await confirm({ crumbs, question: 'Release a new template version?', detail: ['It never changes after this. Existing presentations keep theirs until you update them.'] })))
			await pres(crumbs, 'Releasing', ['pack', 'release'])
	}
}

async function studio() {
	const crumbs = ['Studio']
	const up = async () => {
		try {
			return (await fetch('http://127.0.0.1:4321/api/state', { signal: AbortSignal.timeout(800) })).ok
		} catch {
			return false
		}
	}
	if (!(await up())) {
		spawn(process.execPath, [path.join(A.ROOT, 'studio', 'server.mjs'), '--no-open'], { cwd: A.ROOT, detached: true, stdio: 'ignore' }).unref()
		page({ crumbs, body: () => ['Starting the studio…'] })
		for (let i = 0; i < 20 && !(await up()); i++) await new Promise((r) => setTimeout(r, 250))
	}
	openPath('http://localhost:4321/')
	await message(crumbs, [`${c.green('✓')} The studio is at ${c.bold('http://localhost:4321/')}`, c.grey('It keeps running in the background after you quit pres.')])
}

async function guide() {
	const text = fs.readFileSync(A.GUIDE, 'utf8').replaceAll('{{REPO}}', tilde(A.ROOT))
	let code = false
	await pager({
		crumbs: ['Guide'],
		text,
		style: (l) => {
			if (l.startsWith('```')) return (code = !code), c.grey('─'.repeat(20))
			if (code) return c.grey(l)
			if (/^#{1,3} /.test(l)) return c.bold(c.red(l.replace(/^#+ /, '')))
			return l.replace(/\*\*(.+?)\*\*/g, (_, x) => c.bold(x)).replace(/`([^`]+)`/g, (_, x) => c.yellow(x))
		},
	})
}

