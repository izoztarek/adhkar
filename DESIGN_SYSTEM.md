# رفيق v2 — Complete Product Design & Strategy Document

---

## 1. UX Audit: Current Experience

### Critical Issues
- **Zero first-impression moment.** The first thing the user sees is a raw `<select>`-style flow with no brand presence. There is no emotional tone, no identity.
- **4 taps to hear audio.** Open app → see "choose length" → tap length → audio starts. The NFC experience demands 1-tap-to-play.
- **Audio element is native browser control.** Ugly, inconsistent across iOS/Android, inaccessible for RTL.
- **Counter is meaningless.** "التزامك هذا الشهر: 1 من 30" — a number with no context, no history, no grid, no visual momentum.
- **No hierarchy.** Settings button and play button have the same visual weight.
- **No brand identity.** Arial/sans font, white background, black border. No personality.
- **No feedback loop.** User completes adhkar — nothing happens. No acknowledgement, no reinforcement.
- **localStorage abuse without protection.** No error handling, no fallback if storage is blocked.
- **Settings buried in same page.** No clear navigation model.

---

## 2. Redesign Philosophy

### Principles
1. **Zero friction to value.** From NFC tap to audio playing: ≤ 1 tap (after onboarding).
2. **Calm over stimulating.** No gamification badges, no points, no leaderboards. Just peaceful progression.
3. **Completion is its own reward.** The dot fills in the calendar. The streak number rises. That's enough.
4. **Arabic-first typography.** IBM Plex Sans Arabic is modern, clean, and designed for Arabic at screen sizes.
5. **Black/white/gold.** Three colors only. Gold for milestones and emphasis. Never decoration.

---

## 3. User Flow Diagram

```
[NFC Tap]
    │
    ▼
[First time?]
    ├── YES → Onboarding Screen
    │             │
    │          [Choose length: Short / Medium]
    │             │
    │          [Tap "ابدأ الآن"]
    │             │
    │          [Home Screen + Auto-play]
    │
    └── NO  → Home Screen
                  │
               [Auto-play if setting enabled]
                  │
              ┌───┴────────────────────────────────┐
              │                                    │
         [Player Card visible]            [Player Card hidden]
              │                                    │
         [Full controls]                    [Tap "تشغيل"]
              │
         [Audio Ends]
              │
         [Toast: "بارك الله فيك ✓"]
         [Day recorded in calendar]
         [Streak updated]
         [Milestone check]
```

---

## 4. Screen-by-Screen Breakdown

### Screen 1: Onboarding (first-time only)
**Purpose:** Set length preference, establish brand identity.
**Elements:**
- Large wordmark "رفيق." with gold dot
- Tagline: "أذكارك في لحظة واحدة"
- 2×2 grid: Short (5 min) / Medium (10 min) / Long (locked) / Full (locked)
- CTA: "ابدأ الآن"
**UX Notes:**
- "Short" pre-selected — zero friction path
- Locked options are visible but grayed — creates perceived value for future content
- No email, no account, no friction

### Screen 2: Home
**Purpose:** The entire value of the app in one view.
**Sections (top to bottom):**
1. **Top Bar** — Logo + Settings icon
2. **Hero Card (dark)** — Session type, time-aware badge, Play/Pause, streak counter
3. **Player Card** — Custom audio controls (appears when playing)
4. **Milestone Banner** — Gold banner on day milestones (3, 7, 14, 21, 30)
5. **Stats Row** — Streak days / This month total
6. **Monthly Calendar** — 31-dot grid, filled dots for completed days
7. **Quick Actions** — Travel dua + 3 locked cards (sleep, tasbih, prayer)

### Screen 3: Settings
**Purpose:** Non-critical configuration.
**Sections:**
1. Length selection (same 2×2 grid, persistent)
2. Reciter selection (locked, future)
3. Auto-play toggle
4. Notifications toggle
5. Stats read-only display
6. Reset progress (with confirmation)
7. Version number

---

## 5. UI Component System

### Typography Scale
```
Display:  IBM Plex Sans Arabic 600, 28–36px, tracking -0.02em
Title:    600, 20px, tracking -0.01em
Body:     400, 16px, line-height 1.6
Small:    400, 13px
Label:    500, 11px, tracking +0.06em, UPPERCASE
```

### Color Tokens
```
--ink:         #0a0a0a   (primary text, buttons, hero bg)
--ink-2:       #3a3a3a   (secondary text)
--ink-3:       #8a8a8a   (muted/placeholder)
--ink-4:       #c4c4c4   (disabled/empty states)
--paper:       #f7f6f3   (page background — warm white, not pure)
--card:        #ffffff   (card surfaces)
--border:      rgba(10,10,10,0.10)
--border-strong: rgba(10,10,10,0.18)
--gold:        #c9a84c   (milestones, brand accent)
--gold-light:  #f5edda   (milestone banner background)
--green:       #2e7d5e   (success states)
--green-light: #e6f3ed
```

### Component Inventory
- `hero-card` — Dark card with session context + main CTA
- `player-card` — Inline custom audio player
- `stat-card` — Number + label pair
- `month-card` — Calendar dot grid
- `quick-card` — 2-column action grid items (locked/unlocked states)
- `milestone` — Gold announcement banner
- `setting-row` — List row with label + right-side control
- `toggle` — On/Off switch (CSS-only, no library)
- `length-opt` — 2×2 selection grid items
- `toast` — Bottom floating notification
- `icon-btn` — Circular icon-only button
- `play-btn` — Pill-shaped hero play button
- `ctrl-btn` — Audio control buttons (skip, play/pause)

### Elevation System
- Level 0: `--paper` background (page)
- Level 1: `--card` + `border: 1px solid var(--border)` (cards)
- Level 2: Hero card (dark, inverted)
- Level 3: Toast (position:fixed, elevated)

---

## 6. Design System

### Spacing
Base unit: 4px
```
4px   — micro gaps within components
8px   — tight sibling spacing
12px  — card grid gaps
16px  — card internal padding (compact)
20px  — card internal padding (standard), page horizontal padding
24px  — section separation
32px  — major section breaks
```

### Border Radius
```
--radius-sm:  10px  (small elements, setting rows)
--radius-md:  16px  (cards, buttons, length options)
--radius-lg:  24px  (main cards, player)
--radius-xl:  32px  (hero card)
```

### Animation Principles
- Enter: `fadeUp` — 18px rise + fade, 350ms ease-out
- Interactions: 150-180ms transitions
- Audio pulse: 2s infinite (gentle, not distracting)
- Reduce motion: respected via `@media (prefers-reduced-motion)`

### Iconography
All icons are hand-crafted SVG inline (no icon font dependency). Stroke-based, 1.6–1.8px weight, linecap round. This ensures offline reliability.

---

## 7. Audio Architecture

### Current (v2)
```
audio/
  morning_short.mp3      — Morning adhkar, 5 min
  morning_medium.mp3     — Morning adhkar, 10 min
  evening_short.mp3      — Evening adhkar, 5 min
  evening_medium.mp3     — Evening adhkar, 10 min
  travel.mp3             — Travel dua
```

### Scalable Architecture (v3+)
```
audio/
  [session]/
    [length]/
      [reciter].mp3

  morning/short/default.mp3
  morning/short/reciter_2.mp3
  morning/medium/default.mp3
  morning/long/default.mp3       ← v3
  morning/full/default.mp3       ← v4
  evening/short/default.mp3
  evening/medium/default.mp3
  evening/long/default.mp3
  evening/full/default.mp3
  travel/default.mp3
  sleep/short/default.mp3        ← v3
  prayer/default.mp3             ← v3
  tasbih/default.mp3             ← v3
```

### Lock/Unlock System
Audio content is gated by `CONTENT_REGISTRY` — a JS object that maps content keys to:
- `available: true/false`
- `minStreak: number` (unlock at streak)
- `comingSoon: boolean`
- `premium: boolean` (future paid tier)

```javascript
const CONTENT_REGISTRY = {
  'morning/short':   { available: true },
  'morning/medium':  { available: true },
  'morning/long':    { available: false, comingSoon: true },
  'morning/full':    { available: false, comingSoon: true },
  'sleep/short':     { available: false, comingSoon: true },
  'travel':          { available: true },
  'tasbih':          { available: false, minStreak: 7 },  // Unlock at 7 days
  'prayer':          { available: false, comingSoon: true },
};
```

This structure supports: free tier, streak-unlocked content, premium content, and coming-soon placeholders — all without a redesign.

---

## 8. Feature Roadmap

### v2.0 (Current)
- ✅ Auto morning/evening detection
- ✅ Custom audio player (RTL-native)
- ✅ Monthly calendar with streak tracking
- ✅ Milestones (3, 7, 14, 21, 30 days)
- ✅ Travel dua quick action
- ✅ Offline-first service worker
- ✅ Audio caching
- ✅ PWA manifest (installable)
- ✅ 4-option length grid with locked previews
- ✅ Settings: auto-play, notifications, reset
- ✅ Onboarding screen (first-time only)

### v2.5 (3 months)
- [ ] Notification system (morning ~6am / evening ~5pm)
- [ ] Long & Full length options (audio production)
- [ ] Sleep adhkar section
- [ ] Streak-unlock: Tasbih counter at 7 days
- [ ] Share progress card (image export)

### v3.0 (6 months)
- [ ] Multiple reciters (2-3 voices)
- [ ] Prayer adhkar section
- [ ] Yearly calendar view
- [ ] Favorite / repeat single adhkar
- [ ] Haptic feedback on iOS

### v4.0 (12 months)
- [ ] Premium tier: extended content library
- [ ] Arabic text display alongside audio
- [ ] Family mode: multiple profiles per NFC tag
- [ ] Seasonal content (Ramadan pack, Hajj pack)
- [ ] Analytics dashboard for product team

---

## 9. Retention Strategy

### Habit Loop Design (based on Fogg Behavior Model)
```
Trigger    → NFC tap in car (external, physical, zero effort)
Ability    → One tap to play (minimum friction path)
Motivation → Streak counter, milestones, completion toast
```

### Retention Mechanics (non-gamified)

**1. The Calendar is the Product**
The monthly dot grid is not a feature — it is the core visual identity. Users *feel* the visual weight of an empty week vs a filled one. No points, no numbers, just filled/empty dots.

**2. Milestone Banners (not popups)**
Milestones appear as a quiet gold banner inline in the home screen. They don't interrupt the experience. They acknowledge without demanding attention.

**3. "بارك الله فيك" Toast**
When audio ends, a gentle religious acknowledgement toast ("بارك الله فيك ✓") appears. This is culturally resonant — it mirrors what a human would say. It makes the app feel present and caring, not cold.

**4. Streak Psychology**
The streak counter (days) triggers loss-aversion psychology — users don't want to break their chain. But unlike apps that punish, Rafiq just shows the number honestly. No warning, no shame. A broken streak means the number goes back to 0. That's enough.

**5. Locked Content Visibility**
Users can see "Sleep Adhkar" and other locked cards with a 🔒 badge. This creates perceived depth — the app feels like it has more to give. It generates anticipation without pressure.

**6. Physical Trigger (NFC)**
This is the most powerful retention mechanic in the product. The NFC tag in the car converts a passive moment (driving) into an active spiritual practice. No push notifications needed — the car IS the notification.

---

## 10. Technical Architecture

### File Structure
```
/
├── index.html          (shell + all JS inline)
├── sw.js               (service worker)
├── manifest.json       (PWA manifest)
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── shortcut-*.png
└── audio/
    ├── morning_short.mp3
    ├── morning_medium.mp3
    ├── evening_short.mp3
    ├── evening_medium.mp3
    └── travel.mp3
```

### Caching Strategy
| Asset Type | Strategy | Cache |
|---|---|---|
| index.html | Stale-while-revalidate | rafiq-v2 |
| SW itself | Network-first | Browser |
| Fonts | Cache-first | rafiq-v2 |
| Audio MP3s | Cache-first + store on first play | rafiq-audio-v2 |
| Icons | Cache on install | rafiq-v2 |

### State (localStorage keys)
```
rq_onboarded    "true"           — Has user completed onboarding?
rq_length       "short"/"medium" — Selected length
rq_days         JSON array       — ISO date strings of completed days
rq_streak       "7"              — Current streak (integer)
rq_lastDate     "2025-01-15"     — Last recorded day
rq_total        "14"             — All-time completion count
rq_autoplay     "true"/"false"   — Auto-play on open
rq_notif        "true"/"false"   — Notifications enabled
```

### Performance Targets
- **First Contentful Paint:** < 1.2s (fonts inlined or preloaded, no render-blocking JS)
- **Time to Interactive:** < 1.5s (all JS is inline, no bundles)
- **Audio start latency:** < 500ms on repeat visit (cached)
- **Lighthouse PWA:** 100
- **Lighthouse Performance:** 95+
- **Lighthouse Accessibility:** 95+

### Performance Techniques Applied
1. **Single HTML file** — no network round trips for JS/CSS
2. **Font preconnect** — `<link rel="preconnect">` before font request
3. **No dependencies** — zero npm, zero frameworks, zero runtime overhead
4. **SVG icons inline** — no icon font, no image requests
5. **CSS custom properties** — no preprocessor, tiny CSS
6. **requestAnimationFrame** for progress bar — smooth, no interval jank
7. **audio.preload="none"** — don't preload audio until requested
8. **Service worker install** — shell cached on first visit

### Accessibility
- All interactive elements have `aria-label`
- Keyboard navigation: all buttons are `<button>` elements
- Focus visible (browser default, not suppressed)
- Touch targets: minimum 44×44px
- RTL: native via `dir="rtl"` on `<html>`
- Color contrast: all text passes WCAG AA
- `prefers-reduced-motion` respected globally
- `lang="ar"` on html for correct screen reader pronunciation

---

## 11. Deployment Notes

### NFC Tag Configuration
Set the NFC tag URL to: `https://yourdomain.com/?src=nfc`
The `?src=nfc` parameter can be used for analytics to track NFC opens vs direct opens.

### Audio File Format
- Codec: MP3, 128kbps minimum, 192kbps recommended
- Sample rate: 44.1kHz
- Channels: Mono (smaller file, sufficient for voice)
- Normalization: -14 LUFS (streaming standard)
- Silence padding: 0.5s at start, 1s at end

### Hosting Recommendations
- Serve from CDN (Cloudflare, Vercel, Netlify)
- Enable HTTPS (required for Service Worker + NFC)
- Set `Cache-Control: max-age=31536000, immutable` for audio files
- Set `Cache-Control: no-cache` for index.html and sw.js

---

*رفيق v2 — Built to be the best NFC adhkar experience in the Arab world.*
