

## Plan: Add Floating Contact/Experts Panel

### Summary
Create a new `FloatingContactButton` component that renders a fixed bottom-right button with a tooltip. Clicking it opens a slide-up panel showing expert contact cards with LinkedIn links. Add it once in `App.tsx` (inside providers, outside Routes) so it appears on all pages.

### Files to create

**`src/components/FloatingContactButton.tsx`**
- Fixed circular button at bottom-right (`fixed bottom-6 right-6 z-50`) with a `Headset` or `MessageCircleQuestion` icon
- Tooltip on hover: "Contact / Get Help"
- On click, opens a dialog/sheet panel with smooth animation
- Panel contains a scrollable list of expert cards from a static `experts` array
- Each card: avatar fallback with initials, name, role, short bio, and a "View Profile" button linking to LinkedIn (opens new tab)
- Uses existing UI primitives: `Dialog`, `Avatar`, `Button`, `Tooltip`
- Glassmorphism styling via `backdrop-blur` + soft shadow
- Responsive: full-width on mobile, max-w-md on desktop
- Data structured as a typed array so more experts can be added trivially later
- Position adjusted on mobile to avoid overlapping the bottom nav bar (`bottom-20 md:bottom-6`)

### Files to edit

**`src/App.tsx`**
- Import `FloatingContactButton`
- Add `<FloatingContactButton />` inside `<BrowserRouter>` but outside `<Routes>`, so it renders globally on every page

### No other files modified
All existing pages, layouts, and components remain untouched.

