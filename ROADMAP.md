# Qwirkle Companion App - Roadmap

A board game companion app for Qwirkle that helps players track scores, auto-calculate scores from photos, and get AI-powered move suggestions.

---

## Completed Features

- [x] Game setup with multiple players
- [x] Score tracking and turn history
- [x] AI Auto-Score: Photograph the board to calculate turn score automatically
- [x] AI Best Move Helper: Upload board + hand photos, receive top 3 move suggestions
  - [x] Board line analysis (horizontal/vertical detection)
  - [x] Player tile identification from hand photos
  - [x] Editable tile chips for correcting AI mistakes
  - [x] Recalculate button after user corrections
  - [x] Visual tile indicators with shape icons
  - [x] Collapsible explanations for each suggested move
- [x] Camera integration with native camera app fallback
- [x] Qwirkle celebration overlay animation (triggers on 12+ point scores)
- [x] Mobile-friendly responsive UI
- [x] ngrok HTTPS support for camera access during development

---

## In Progress

- [ ] Refining AI prompts for more consistent tile detection
- [ ] Testing across different lighting conditions and board setups

---

## Short-term Goals

### AI Accuracy Improvements

- [ ] **Improve board tile detection** - AI sometimes misidentifies tile colors or shapes; investigate prompt engineering, image preprocessing, or multi-shot examples
- [ ] **Improve hand tile detection** - Accuracy issues when tiles are overlapping, tilted, or in shadows; consider adding visual guides for photo capture
- [ ] Add confidence scores to AI responses so users know when manual verification is recommended
- [ ] Implement image quality checks before sending to AI (blur detection, lighting assessment)
- [ ] Add sample/reference images to help users take better photos

### User Experience

- [ ] Add undo/redo functionality for score entries
- [ ] Improve error messages when AI detection fails
- [ ] Add loading states and progress indicators during AI processing
- [ ] Support landscape orientation for tablet users
- [ ] Add haptic feedback for mobile interactions

### Game Features

- [ ] Game timer (optional per-turn time tracking)
- [ ] Statistics dashboard (high scores, average scores, games played)
- [ ] Export game history (CSV or shareable format)
- [ ] Support for 2-4 player color themes

---

## Long-term Goals

### Technical Improvements

- [ ] Offline mode with local storage for games in progress
- [ ] PWA (Progressive Web App) support for install-to-home-screen
- [ ] Optimize AI response times through caching common patterns
- [ ] Add unit and integration tests for scoring logic

### Advanced Features

- [ ] Game rules reference / tutorial mode
- [ ] Multiplayer sync (multiple devices viewing same game)
- [ ] Historical game replay
- [ ] AI difficulty modes for move suggestions (beginner-friendly vs optimal plays)
- [ ] Voice announcements for scores and Qwirkle celebrations

---

## Research Items

### Branding and Legal

- [ ] **Research trademark considerations** - "Qwirkle" is a registered trademark of MindWare; investigate:
  - Safe naming alternatives (e.g., "Tile Match Companion", "Q-Game Helper")
  - Fair use guidelines for companion/utility apps
  - Whether to seek licensing or partnership with MindWare
  - App store policies on companion apps for trademarked games

### Monetization and Distribution

- [ ] **Research app store distribution** - Investigate requirements for:
  - Apple App Store (requires Apple Developer account, $99/year)
  - Google Play Store (requires Google Play Developer account, $25 one-time)
  - PWA distribution as alternative to native apps
  - Using Capacitor or similar to wrap Next.js as native app
- [ ] **Research monetization strategies**:
  - Freemium model (basic scoring free, AI features paid)
  - One-time purchase vs subscription
  - Ad-supported free tier
  - API costs (Gemini usage) and sustainable pricing

---

## Known Issues

- [ ] Camera permissions occasionally fail on iOS Safari - needs investigation
- [ ] AI may struggle with non-standard board backgrounds or custom tile sets
- [ ] Large images can slow down AI processing - consider client-side compression

---

## Contributing

Ideas and feedback welcome! Priority is currently on improving AI detection accuracy to make the core features more reliable.

---

*Last updated: December 2024*
