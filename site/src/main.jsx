import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)

// Repeat visits load from this device and opened decks work offline (public/sw.js).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}
