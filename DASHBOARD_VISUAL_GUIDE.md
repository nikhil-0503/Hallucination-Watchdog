# Admin Dashboard - Visual Layout Guide

## Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVBAR (64px)                            │
│  WATCHDOG Logo              |           User Info | Logout Btn  │
└─────────────────────────────────────────────────────────────────┘
┌──────────┬─────────────────────────────────────────────────────┐
│          │                                                     │
│          │  ┌─ Stats Grid (4 Cards) ─────────────────────┐    │
│ SIDEBAR  │  │ Card 1  │ Card 2  │ Card 3  │ Card 4     │    │
│          │  └────────────────────────────────────────────┘    │
│  • Dashboard  │                                                 │
│  • Logs       │  ┌─ Content Card ────────────────────────────┐ │
│  • Current    │  │ Title  [Search] [Filter] [Export] [Refresh] │
│               │  │ ────────────────────────────────────────── │ │
│               │  │ ┌─ Table ────────────────────────────────┐ │ │
│               │  │ │ Timestamp│Prompt│Answer│Confidence│RAG│ │ │
│               │  │ │ ─────────────────────────────────────── │ │ │
│               │  │ │ Row 1                                    │ │ │
│               │  │ │ Row 2                                    │ │ │
│               │  │ │ Row 3                                    │ │ │
│               │  │ └────────────────────────────────────────┘ │ │
│               │  └────────────────────────────────────────────┘ │
│               │                                                 │
└──────────┴─────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Navigation Bar
```
┌────────────────────────────────────────────────────────────┐
│ 🛡️ WATCHDOG  [Spacing]        👤 John Doe  |Admin  [Logout] │
└────────────────────────────────────────────────────────────┘
  │ Icon + Text              │ User Info + Role     │ Button
```
- Height: 64px
- Background: #111827 with bottom border
- Fixed at top, z-index: 1000

### 2. Sidebar Navigation
```
┌──────────────┐
│ 📊 Dashboard │ ← Active (blue highlight + left border)
├──────────────┤
│ 📝 Logs      │
├──────────────┤
│ ⚠️  Current   │
└──────────────┘
Width: 240px
Fixed position, left: 0, top: 64px
```

### 3. Stats Grid (Responsive)
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Card 1    │   Card 2    │   Card 3    │   Card 4    │
│             │             │             │             │
│ 🔵  ↑ 12%   │ ✕  ↓ 8%    │ 📈 ↑ 2%    │ 🛡️  ↔ 99ms  │
│             │             │             │             │
│  1,234      │     156     │   87.3%     │   99.9%     │
│ Total       │   Blocked   │  Avg        │   System    │
│ Prompts     │   Prompts   │ Confidence  │  Uptime     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```
- 4 columns on desktop
- 1 column on mobile
- Horizontal cards with icon + value + label + trend

### 4. Content Card Layout
```
┌────────────────────────────────────────────────────────────┐
│ Prompt Activity  [Search] [Status ▼] [Time ▼] [Export] [↻]│
├────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Timestamp    │ Prompt   │ Answer   │ Conf. │ RAG │ ... │  │
│ ├───────────────────────────────────────────────────────┤  │
│ │ 10:45:32 AM  │ What is  │ The      │ 92%  │ Yes │ 👁️  │  │
│ │ 10:44:15 AM  │ Explain  │ Quantum  │ 87%  │ Par │ 👁️  │  │
│ │ 10:43:02 AM  │ How do   │ Machine  │ 71%  │ No  │ 👁️  │  │
│ └───────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Color Palette

```
Primary Colors:
├── Background: #0B0F14 (near-black)
├── Cards: #111827 (dark slate)
├── Borders: #1F2937 (subtle gray)
└── Accent: #4F8CFF (muted blue)

Text Colors:
├── Primary: #E5E7EB (light gray)
├── Secondary: #9CA3AF (medium gray)
└── Tertiary: #6B7280 (darker gray)

Status Colors:
├── Success: #10B981 (green)
├── Warning: #F59E0B (amber)
└── Error: #EF4444 (red)
```

## Typography

```
Title (Card Header):         18px, Bold, Light Gray
Section Title:              16px, Semibold, Light Gray
Body Text:                  14px, Regular, Medium Gray
Small Text (Labels):        12px, Medium, Dark Gray
Timestamp (Monospace):      13px, Regular, Monospace Font
```

## Spacing Scale

```
xs: 4px    (0.25rem)
sm: 8px    (0.5rem)
md: 16px   (1rem)
lg: 24px   (1.5rem)
xl: 32px   (2rem)
2xl: 48px  (3rem)
```

## Responsive Breakpoints

### Desktop (1025px+)
- Sidebar: 240px
- Stats: 4 columns
- Navbar: Full width with all elements visible

### Tablet (769px - 1024px)
- Sidebar: 200px
- Stats: auto-fit columns
- Navbar: Space adjusted

### Mobile (<768px)
- Sidebar: 70px (icons only)
- Stats: 1 column
- Controls: Vertical stack
- Navbar: Compact user info (hidden on smallest)

## Interactive States

### Buttons
- **Default**: Secondary color with border
- **Hover**: Lighter background + border color change
- **Active**: Filled with accent color
- **Disabled**: Reduced opacity

### Table Rows
- **Default**: Dark background
- **Hover**: Slightly lighter background (#1F2937)
- **Flagged**: Subtle red tint overlay

### Navigation Items
- **Default**: Gray text, transparent background
- **Hover**: Lighter background, lighter text
- **Active**: Blue background + left border + blue text

## Animation Details

- **Page Load**: Fade in + slide down (300-500ms)
- **Stats Cards**: Staggered entrance (50ms delay between each)
- **Sidebar Items**: Subtle slide on hover
- **Table Rows**: Staggered entrance on load (20ms delay)
- **Buttons**: Scale transforms on hover/tap
- **Confidence Bar**: Animated fill width

All animations use cubic-bezier easing for smooth motion.

## Key Design Principles Applied

1. ✓ Dark theme with proper contrast
2. ✓ Fixed navigation for easy access
3. ✓ Clear visual hierarchy
4. ✓ Consistent spacing and alignment
5. ✓ Minimal use of accent color (only for highlights)
6. ✓ Professional enterprise styling
7. ✓ Responsive and mobile-friendly
8. ✓ Smooth animations and transitions
9. ✓ No clutter or unnecessary elements
10. ✓ Easy to scan and navigate
