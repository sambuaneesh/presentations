// Title: "Terms of Separation", with the other kind of separation on show (Anakin & Padme breakup meme). Click 1:
// not that one, this one (Distracted Boyfriend: the dev team eyeing microservices). Memes: imgflip templates, captions baked in.
export default {
	name: 'Terms of Separation',
	draw(k) {
		k.text(110, 250, 'Terms of Separation', { size: 'xl', scale: 2.1 })
		k.text(118, 470, 'monoliths, microservices,\nand what LLMs can (and can’t) do', { size: 'l', scale: 1.2, color: 'grey' })
		k.text(118, 820, 'Aneesh Sambu', { size: 'l', scale: 1.2 })
		k.text(120, 905, 'SERC, IIIT Hyderabad · 12 Nov 2026', { size: 'm', color: 'grey' })
		k.image(1260, 430, 540, 540, 'meme-separating.jpg', { rot: 2, until: 1, alt: 'Anakin and Padme meme: it is not you, it is me. We can still be friends, right?' })
		k.image(1150, 450, 690, 460, 'meme-distracted.jpg', { beat: 1, anim: 'pop', rot: -1.5, alt: 'Distracted boyfriend: our dev team looking at microservices, the monolith that pays the bills glaring' })
		k.text(1160, 935, 'not that separation. this one.', { size: 'l', color: 'red', beat: 1, anim: 'fade', delay: 300 })
	},
}
