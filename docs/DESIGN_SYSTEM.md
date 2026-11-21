# DESIGN SYSTEM SPECIFICATION — AcxiomCRM

## 1. Color Palette

```
Primary Brand:         #1E3A8A (Deep Navy / Executive Blue)
Secondary / Accent:    #0D9488 (Teal / Modern Professional)
Success / Converted:   #16A34A (Emerald Green)
Warning / Attention:   #D97706 (Amber / Warm Gold)
Danger / Overdue:      #DC2626 (Crimson Red)
Neutral Light (Bg):    #F8FAFC (Slate Light 50)
Neutral Dark (Text):   #0F172A (Slate 900)
Card / Surface:        #FFFFFF (Pure White)
Border / Divider:      #E2E8F0 (Slate 200)
```

---

## 2. Typography
- **Primary Typeface**: `Inter`, `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Monospace Typeface**: `"Fira Code", SFMono-Regular, Menlo, Monaco, Consolas, monospace` (for Codes, IDs, and Audit JSON snapshots).
- **Scale**:
  - Page Titles (`h1`): `1.75rem` (28px), Semi-bold (600), Line-height 1.3
  - Section Headings (`h2`): `1.375rem` (22px), Semi-bold (600), Line-height 1.35
  - Card Titles (`h3`): `1.125rem` (18px), Medium (500), Line-height 1.4
  - Body Text: `0.9375rem` (15px), Regular (400), Line-height 1.5
  - Captions & Badges: `0.75rem` (12px), Medium (500), Uppercase letter-spacing `0.05em`

---

## 3. Spacing & Elevation System
- **Spacing Units**: 4px base multiplier (4px, 8px, 12px, 16px, 24px, 32px, 48px).
- **Elevation / Shadows**:
  - `card-shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
  - `card-shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
  - `modal-shadow-lg`: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

---

## 4. Reusable UI Components
1. **MetricCard**: Reusable dashboard summary widget rendering title, numeric value, percentage change, and colored icon.
2. **StatusBadge**: Centralized component mapping entity status to semantic badge styles.
3. **FilterBar**: Collapsible search bar supporting text search, dropdown select filters, date picker ranges, and Reset buttons.
4. **AuditHistoryViewer**: Collapsible timeline widget presenting historical audits with formatted diff highlighting.
