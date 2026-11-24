# Pastel Dreamland — Birthday Surprise

A self-contained, mobile-friendly interactive birthday experience made with HTML, CSS and vanilla JavaScript.

## Folder structure

```text
birthday-dreamland/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   ├── images/
│   ├── gifs/
│   │   ├── 1000272074.gif   # primary baking animation
│   │   ├── 1000272075.gif
│   │   ├── 1000272077.gif
│   │   └── 1000272080.gif
│   └── music/
└── README.md
```

## Run in SPCK Editor

1. Extract/import the `birthday-dreamland` folder.
2. Open `index.html` in SPCK Preview.
3. Test the complete sequence from the opening screen.
4. For microphone testing, use a secure context supported by the browser. SPCK Preview may impose browser permission rules depending on how it serves the preview.
5. Microphone access is optional; **Extinguish Candles Manually** is always available after lighting the candles.

## Baking GIF

The primary local GIF is:

`assets/gifs/1000272074.gif`

It was selected because it most clearly shows the supplied cat baking scene. To replace it, copy another GIF into `assets/gifs/` and change the `src` on `#bakerGif` in `index.html`.

## Music

The birthday melody is generated in `js/main.js` with the Web Audio API. There is no visible music player. It starts after the visitor taps **Open Your Surprise**, which satisfies normal browser user-gesture audio rules. If Web Audio is unavailable, the rest of the experience continues normally.

## Customize the birthday text

Most visible copy is in `index.html`. The long letter text is in `js/main.js` in the `letterText` constant.

Gift messages are directly inside the four `.gift-surprise` elements in `index.html`.

## GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this folder to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select the main branch and the `/ (root)` folder.
6. Save. GitHub Pages will publish `index.html`.

No build step, Node.js, npm, backend, database, or environment variables are required.

## Browser / performance notes

- The project uses a small Three.js CDN script for a subtle background starfield.
- If Three.js/WebGL is unavailable, the canvas is simply hidden and the CSS/HTML experience continues.
- The Three.js particle count is deliberately low for Android.
- `prefers-reduced-motion` is respected.
- No microphone recording is stored.
- Microphone tracks are stopped immediately after detection, timeout, cancellation, or error.
- No audio begins before the visitor interacts.

## Accessibility

Buttons have clear labels, visible keyboard focus states, semantic sectioning, reduced-motion support, and touch-friendly sizing.

## Deployment

All project assets use relative paths, so the folder can be opened from SPCK and deployed directly to GitHub Pages.


## Recent mobile cake fixes

- The candle stage now uses a full layered cake matching the reveal cake style, with three clearly visible candles.
- Candle flames are hidden until the candles are lit and extinguish cleanly after a successful blow/manual action.
- Microphone detection now calibrates the ambient noise floor, checks sustained broadband breath-like audio, uses a longer timeout, and always leaves a manual fallback.
- The cake-cutting stage starts with one intact cake. The cake only separates after **Cut the Cake** is pressed.
- Large headings are constrained on Android portrait screens so they no longer run off the edges.
- Continuous heartbeat/pulsing/floating character animations were removed; staged entrance effects remain.
