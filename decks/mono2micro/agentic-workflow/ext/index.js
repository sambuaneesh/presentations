// Agentic workflow: one animated scene (the live trace) and the template that lays out the deck.
import { AgenticTrace, AGENTIC_BEATS } from './agentic.js'
import { AGENTIC_SLIDES } from './agenticDeck.js'
import { C2cScene } from './c2c.js'
import { ModelsScene, MethodsScene, MainScene, PairedScene, ToolsScene, StabilityScene, AblationScene, RefinerScene } from './results.js'

export default {
	scenes: {
		agentic: { name: 'Agentic workflow · live trace', beats: AGENTIC_BEATS, render: AgenticTrace, safelight: false },
		'res-models': { name: 'Results · models', ...ModelsScene, safelight: false },
		'res-methods': { name: 'Results · methods', ...MethodsScene, safelight: false },
		'res-c2c': { name: 'Results · C2C (from the TSE deck)', beats: 1, render: C2cScene, safelight: false },
		'res-main': { name: 'Results · main table', ...MainScene, safelight: false },
		'res-paired': { name: 'Results · paired comparison', ...PairedScene, safelight: false },
		'res-tools': { name: 'Results · vs tools', ...ToolsScene, safelight: false },
		'res-stability': { name: 'Results · repeatability', ...StabilityScene, safelight: false },
		'res-ablation': { name: 'Results · ablation', ...AblationScene, safelight: false },
		'res-refiner': { name: 'Results · refinement', ...RefinerScene, safelight: false },
	},
	templates: {
		'agentic-workflow': { name: 'Agentic workflow (live trace)', theme: 'ink', slides: AGENTIC_SLIDES },
	},
}
