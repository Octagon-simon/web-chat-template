# Demo video

A 30-second, unnarrated screen tour of the chat template: title, chat hero,
composer detail, the six rail surfaces (including sign in), the light/dark
switch, the phone layout, end card.

Output: `renders/video.mp4` (1920x1080, 30fps, H.264, 7.8 MB) with
`renders/poster.jpg` for thumbnails.

## Rebuild

```bash
# 1. app running (vite on 5173)
npm run dev

# 2. capture the screens (Playwright)
cd videos/web-chat-template-demo
node scripts/capture.cjs
node scripts/capture-live.cjs      # typed / streaming chat states
node scripts/capture-composer.cjs  # 3x composer strip

# 3. check, preview, render
npx hyperframes check .
npx hyperframes preview --background
npx hyperframes render . --skill=motion-graphics -q high -o ./renders/video.mp4
```

Screens live in `assets/screens/` at 1440x810 @2x and 390x844 @3x. They are
real captures of the app, not mockups, so recapture them after UI changes.
`shot-plan.json` holds the beat sheet; `index.html` is the composition.
