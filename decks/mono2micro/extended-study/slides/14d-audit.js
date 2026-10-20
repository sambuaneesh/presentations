// Integrity check: did the autonomous agent read anything it should not have?
export default {
	name: 'Did the agent peek?',
	kicker: 'IV · is it robust?',
	title: 'Did the agent peek?',
	source: '§IV-J workspace audit · studies/final-benchmark-extension-v1/analysis/opencode_workspace_audit.py',
	draw(k) {
		k.text(150, 270, 'why: OpenCode ran unsandboxed, in a folder inside the repository that holds the answers', { size: 'm', scale: 1.05, color: 'grey' })
		k.box(150, 360, 560, 360, { dash: 'dotted', size: 'm', text: '', id: 'repo' })
		k.text(180, 380, 'repository', { size: 's', scale: 1.15, color: 'grey' })
		k.box(230, 470, 260, 160, { text: 'agent\nworkspace', size: 'm', id: 'ws' })
		k.box(520, 470, 160, 160, { text: 'reference\nanswers', size: 's', color: 'red', id: 'ref' })
		k.text(860, 400, 'we read every tool call of every OpenCode run', { size: 'm', scale: 1.1 })
		k.text(860, 500, '11 of 176 reached outside their folder', { size: 'l', scale: 1.0 })
		k.text(860, 580, 'none read a reference, a score or another run', { size: 'l', scale: 1.0, color: 'green' })
		k.text(860, 680, 'first benchmark: 0 of 28', { size: 'm', scale: 1.1, color: 'grey' })
		k.text(150, 860, 'the agent baseline is clean', { size: 'l', scale: 1.0, color: 'red' })
	},
}
