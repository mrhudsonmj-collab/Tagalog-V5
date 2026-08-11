TAGALOG TRAINER v2.0 — iPhone PWA

CORE PHRASES: 179
OPTIONAL DOWNLOADABLE PACKS: 48

IMPROVEMENTS IN v2
- Smoother iPhone-style bottom navigation and safe-area support
- Smarter spaced repetition: Again / Hard / Good / Easy
- Daily goal and progress counter
- Category-filtered learning sessions
- Tagalog→English or English→Tagalog flashcards
- Multiple-choice and typed-answer quizzes
- Slow pronunciation mode and adjustable speech speed
- Favourites
- Downloadable pack catalog plus custom pack URL import
- Add your own phrases
- Export/import backup for transfer to another device
- Better offline service worker and online/offline indicator
- PWA icons and Apple touch icon

INSTALL ON IPHONE
1. Upload the CONTENTS of this folder to an HTTPS web host (GitHub Pages, Netlify, Cloudflare Pages, or your own hosting).
2. Open the resulting URL in Safari on the iPhone.
3. Tap Share → Add to Home Screen.
4. Open Tagalog Trainer from the Home Screen.

ADDING PHRASE PACKS LATER
- Put new .json files in /packs on the hosted site.
- Add an entry to /packs/catalog.json.
- In the app, tap Packs → Refresh.
- You can also paste any direct HTTPS JSON pack URL into the app.

PHRASE PACK FORMAT
[
  {"tagalog":"Mahal kita","english":"I love you","category":"Social"}
]

NOTE ABOUT SPEECH
The Speak buttons use the iPhone/browser's installed text-to-speech voices. If a Filipino voice is not installed, iOS may use a fallback voice.


V3 NATURAL VOICE
See NATURAL_VOICE_SETUP.txt and cloudflare-worker.js.


V4 FILIPINO VOICE
See FILIPINO_VOICE_SETUP.txt. V4 uses locale-specific fil-PH Azure neural voices and does not silently fall back to Apple in Filipino mode.


V5 REALISTIC VOICE
Use ELEVENLABS_FREE_SETUP.txt and cloudflare-worker.js.
