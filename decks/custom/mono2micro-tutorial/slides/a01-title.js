// Title: "Terms of Separation" (how to break up with your monolith), with the SA4S and SERC logos, with the other kind of separation on show (Anakin & Padme breakup meme). Click 1:
// not that one, this one (Distracted Boyfriend: the dev team eyeing microservices). Memes: imgflip templates, captions baked in.
export default {
	name: 'Terms of Separation',
	draw(k) {
		k.text(110, 250, 'Terms of Separation', { size: 'xl', scale: 2.1 })
		k.text(118, 470, 'how to break up with your monolith\n(and can an LLM do it for you?)', { size: 'l', scale: 1.2, color: 'grey' })
		k.text(118, 820, 'Aneesh', { size: 'l', scale: 1.2 })
		// the group, the centre and the institute: SA4S (sa4s-serc.github.io), SERC, IIIT Hyderabad. One row, one height
		// (the logos are trimmed to their ink), starting at the name's left edge
		const H = 110, Y = 905
		k.image(124, Y, Math.round(H * 361 / 415), H, 'logo-sa4s.png', { alt: 'SA4S logo' })
		k.image(124 + 96 + 48, Y, Math.round(H * 1024 / 656), H, 'logo-serc.png', { alt: 'SERC, Software Engineering Research Centre logo' })
		k.image(124 + 96 + 48 + 172 + 48, Y, Math.round(H * 372 / 186), H, 'logo-iiit.png', { alt: 'IIIT Hyderabad logo' })
		k.image(1260, 430, 540, 540, 'meme-separating.jpg', { rot: 2, until: 1, alt: 'Anakin and Padme meme: it is not you, it is me. We can still be friends, right?' })
		k.image(1150, 450, 690, 460, 'meme-distracted.jpg', { beat: 1, anim: 'pop', rot: -1.5, alt: 'Distracted boyfriend: our dev team looking at microservices, the monolith that pays the bills glaring' })
		k.text(1160, 935, 'not that separation. this one.', { size: 'l', color: 'red', beat: 1, anim: 'fade', delay: 300 })
	},
}
