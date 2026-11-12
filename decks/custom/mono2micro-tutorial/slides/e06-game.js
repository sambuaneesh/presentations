// The game's QR code, filling the slide: phones join with their name and wait for the start. The presenter's
// controls (scene 'game-control', ext/control.js) sit small in the bottom-right corner, placed by place-scenes.mjs.
export default {
	name: 'Game: you are the architect',
	draw(k) {
		k.image(480, 20, 960, 960, 'qr-game.svg', { alt: 'QR code for the class game' })
		k.text(380, 990, 'sambuaneesh.github.io/cut-the-monolith', { size: 'l', font: 'mono', align: 'middle', w: 1160 })
	},
}
