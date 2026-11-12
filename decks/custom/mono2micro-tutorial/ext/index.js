// The deck's extensions: scenes placed by place-scenes.mjs after `pres build` (the live class board, and the
// agentic workflow traced live, copied from the tse-2026-paper deck), and the actions of the interactive
// slide "Try to win" (slides/e05-try-it.js).
import { BoardScene, EveryoneScene } from './classboard.js'
import { GameControl } from './control.js'
import { AgenticTrace, AGENTIC_BEATS } from './trace/agentic.js'
import { tryActions } from './actions.js'

export default {
	scenes: {
		'class-board': { name: 'Class board', beats: 0, render: BoardScene, safelight: false },
		'class-all': { name: 'Everyone who played', beats: 0, render: EveryoneScene, safelight: false },
		'game-control': { name: 'Game controls', beats: 0, render: GameControl, safelight: false },
		'workflow-trace': { name: 'The workflow, traced live', beats: AGENTIC_BEATS, render: AgenticTrace, safelight: false },
	},
	actions: tryActions,
}
