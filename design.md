# MediCare Design System — Single Source of Truth

> Every new page, component, or feature **must** follow this document exactly.
> If something is not specified here, match the closest existing pattern.

---

## 1. 🎨 Color Palette

### Primary: Teal

| Shade | Tailwind Class | Usage |
|-------|---------------|-------|
| 50 | `teal-50` / `teal-50/80` | Light backgrounds, badge fills |
| 100 | `teal-100` | Icon circle backgrounds, hover states, autocomplete hover |
| 200 | `teal-200` | Badge borders, button outline borders, avatar gradients |
| 300 | `teal-300` | Avatar fallback gradients, text on dark overlays |
| 400 | `teal-400` | Ping animation dot, autocomplete item icons |
| 500 | `teal-500` | Primary gradient start, icon text, focus ring |
| 600 | `teal-600` | Primary gradient end, nav link hover, section subtitles, icon text |
| 700 | `teal-700` | Badge text, button outline text, avatar text |

### Neutral: Slate

| Shade | Tailwind Class | Usage |
|-------|---------------|-------|
| 50 | `slate-50` | Card gradient ends, section backgrounds, hover backgrounds |
| 100 | `slate-100` | Borders, dividers, skeleton loaders, input borders |
| 200 | `slate-200` | Input borders, outline button borders, tag borders, shadow base |
| 300 | `slate-300` | Tag hover borders |
| 400 | `slate-400` | Input icons, muted icons, placeholder text, footer link text, chevron icons |
| 500 | `slate-500` | Caption text, secondary text, review count text |
| 600 | `slate-600` | Body text, nav links, label text, description text, feature text |
| 700 | `slate-700` | Subheading text, medium emphasis text, outline button text, list items |
| 800 | `slate-800` | Footer social icon backgrounds, footer contact icon backgrounds, footer borders |
| 900 | `slate-900` | Headings, strong text, footer background, card shadow base |

### Accent Colors

| Color | Tailwind Class | Usage |
|-------|---------------|-------|
| **Green** | `green-100` / `green-200` / `green-600` / `green-700` | Availability badge, verified checkmark |
| **Blue** | `blue-100` / `blue-600` | Clock/availability floating card |
| **Yellow** | `yellow-400` | Star ratings (fill + stroke) |
| **Red** | `red-500` | Heart icon in footer copyright only |
| **White** | `white` | Card backgrounds, text on dark, text on gradients |
| **Black** | `black/55` / `black/10` | Image overlay gradient |

### Gradient Definitions

```css
/* Primary button gradient */
bg-gradient-to-r from-teal-500 to-teal-600
hover:from-teal-600 hover:to-teal-700

/* Gradient text (headings) */
text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500

/* Icon container gradient */
bg-gradient-to-br from-teal-500 to-teal-600

/* Avatar fallback gradient */
bg-gradient-to-br from-teal-200 to-teal-300

/* Testimonial avatar gradient */
bg-gradient-to-br from-teal-100 to-teal-200

/* Hero background gradient */
bg-gradient-to-b from-teal-50/50 via-white to-white

/* Section background: light-to-white */
bg-gradient-to-b from-slate-50 to-white

/* Section background: white-to-light */
bg-gradient-to-b from-white to-slate-50

/* Stats card background */
bg-gradient-to-br from-white to-slate-50

/* Doctor card image area */
bg-gradient-to-br from-teal-50 to-slate-50

/* Image overlay (bottom fade) */
bg-gradient-to-t from-black/55 via-black/10 to-transparent

/* Card hover overlay */
bg-gradient-to-br from-teal-500/5 to-transparent  /* opacity-0 → group-hover:opacity-100 */

/* Navbar logo gradient */
bg-gradient-to-br from-teal-500 to-teal-600
```

---

## 2. 📝 Typography

### Font Family

- **Primary**: Inter (loaded via `next/font/google` in root layout)
- **CSS variable**: `--font-geist-sans` / `--font-sans` (globals.css)
- **Monospace**: `--font-geist-mono` / `--font-mono`

### Heading Sizes

| Level | Tailwind Classes | Example |
|-------|-----------------|---------|
| **H1** | `text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-tight` | Hero main heading |
| **H2** | `text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl` | Section headings |
| **H3** | `text-lg font-semibold text-slate-900` | Card titles, benefit titles |
| **H3 (stat)** | `text-3xl font-bold text-slate-900 mb-1` | Stat values |
| **H4** | `font-semibold text-slate-900` | FAQ questions, sub-sections |

### Body Text

| Type | Tailwind Classes | Usage |
|------|-----------------|-------|
| **Body** | `text-lg text-slate-600 leading-relaxed` | Section descriptions, paragraphs |
| **Body small** | `text-sm text-slate-600` | Card descriptions, feature items, form helper text |
| **Body compact** | `text-slate-700` | List items without explicit size (inherits) |
| **Caption** | `text-xs text-slate-500` | Floating card subtitles, testimonial roles |
| **Muted** | `text-sm text-slate-500` | Review counts, secondary info, quick tag labels |
| **Label** | `text-sm font-medium text-slate-700` | Form labels, icon+text labels |
| **Section subtitle** | `text-sm font-semibold uppercase tracking-widest text-teal-600 mb-3` | "Why Choose Us", "Our Specialists", etc. |
| **Footer heading** | `text-sm font-semibold uppercase tracking-wider text-white mb-4` | Footer column headings |
| **Footer link** | `text-sm text-slate-400` | Footer navigation links |
| **Footer text** | `text-sm text-slate-400` | Footer descriptions, copyright |

### Text on Dark Backgrounds

| Type | Tailwind Classes | Usage |
|------|-----------------|-------|
| **Heading** | `text-white font-semibold text-lg leading-tight` | Doctor name on image overlay |
| **Subtitle** | `text-teal-300 text-sm mt-0.5` | Doctor specialty on image overlay |
| **Footer heading** | `text-white` | Contact labels |

---

## 3. 📐 Spacing & Layout

### Container Widths

| Container | Tailwind Class | Max Width | Usage |
|-----------|---------------|-----------|-------|
| **Standard** | `max-w-7xl` | 1280px | All sections |
| **Narrow** | `max-w-5xl` | 1024px | Search section |
| **Text block** | `max-w-xl` | 576px | Hero description |
| **Centered text** | `max-w-2xl mx-auto` | 672px | Section sub-descriptions |

### Page Padding (Horizontal)

```css
px-4 sm:px-6 lg:px-8
```
Used on every section's inner `<div>`.

### Section Padding (Vertical)

| Section Type | Tailwind Classes |
|-------------|-----------------|
| **Hero** | `py-16 md:py-24 lg:py-32` |
| **Standard section** | `py-20 md:py-28` |
| **Footer main** | `py-16 md:py-20` |
| **Footer bottom** | `py-8` |

### Grid Systems

| Layout | Tailwind Classes | Usage |
|--------|-----------------|-------|
| **2-col split** | `grid lg:grid-cols-2 gap-12 lg:gap-16 items-center` | Hero, WhyChooseUs, FAQ |
| **3-col search** | `grid md:grid-cols-3 gap-4` | Search section inputs |
| **3-col cards** | `grid gap-6 sm:grid-cols-2 lg:grid-cols-3` | Doctors, Testimonials |
| **4-col stats** | `grid gap-8 sm:grid-cols-2 lg:grid-cols-4` | Stats section |
| **2-col benefits** | `grid gap-6 sm:grid-cols-2` | WhyChooseUs right side |
| **5-col footer** | `grid gap-12 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5` | Footer links |
| **3-col contact** | `grid gap-6 sm:grid-cols-3` | Footer contact row |

### Gap Values

| Gap | Tailwind Class | Usage |
|-----|---------------|-------|
| `0.5rem` | `gap-2` | Tags, badges, star ratings, icon+text inline |
| `0.75rem` | `gap-3` | Avatar+text, footer social icons, contact items |
| `1rem` | `gap-4` | CTA buttons, feature pills, form rows |
| `1.5rem` | `gap-6` | Card grids, FAQ items, benefits grid |
| `2rem` | `gap-8` | Stats grid, nav links, spacing stacks |
| `3rem` | `gap-12` | Footer columns, 2-col split on mobile |
| `4rem` | `gap-16` | 2-col split on desktop |

### Internal Card Spacing

| Type | Tailwind Classes |
|------|-----------------|
| **Card padding** | `p-6` |
| **Card padding (search)** | `p-6 md:p-8` |
| **Space between children** | `space-y-8` (content blocks), `space-y-4` (lists), `space-y-2` (form fields), `space-y-3` (footer links) |
| **Section header margin** | `mb-12 md:mb-16` |

---

## 4. 🔲 Border Radius

| Radius | Tailwind Class | Components |
|--------|---------------|------------|
| **3xl** (1.5rem+) | `rounded-3xl` | Hero image card, Search section card |
| **2xl** (1rem+) | `rounded-2xl` | All content cards (stats, benefits, testimonials, doctors, FAQ items), floating badge cards |
| **xl** (0.75rem+) | `rounded-xl` | Icon containers (12×12), navbar logo, autocomplete dropdown, skeleton placeholders |
| **lg** (0.5rem) | `rounded-lg` | Mobile menu button, footer social icons, footer contact icons |
| **full** | `rounded-full` | Badges, pills, avatars, ping dots, check circles, tag buttons |
| **md** (0.375rem) | `rounded-md` | shadcn Button default, shadcn Input default |

### Rule
- **Cards**: Always `rounded-2xl` minimum
- **Icon containers**: `rounded-xl` for 12×12, `rounded-full` for circles
- **Pills/tags**: Always `rounded-full`
- **Search card**: `rounded-3xl` (the elevated search bar)
- **Hero image**: `rounded-3xl`

---

## 5. 🪄 Shadows

### Shadow Classes Used

| Shadow | Tailwind Class | Usage |
|--------|---------------|-------|
| **Extra large (colored)** | `shadow-2xl shadow-slate-200/50` | Search section card |
| **Extra large (dark)** | `shadow-2xl shadow-slate-900/20` | Hero image card |
| **Large (primary tint)** | `shadow-lg shadow-teal-500/30` | Primary CTA buttons |
| **Large (primary tint light)** | `shadow-lg shadow-teal-500/20` | Icon containers (12×12), navbar logo |
| **Large (neutral)** | `shadow-lg shadow-slate-200/50` | Floating badge cards, autocomplete dropdown |
| **Large (hover)** | `shadow-lg` | Card hover state |
| **Extra large (hover)** | `shadow-xl` | Doctor card hover state |
| **Small (default)** | `shadow-sm` | Cards default state, FAQ items |
| **Medium (nav)** | `shadow-md shadow-teal-500/20` | Navbar CTA button |
| **Extra small** | `shadow-xs` | shadcn Input, shadcn outline button |

### Shadow Pattern
- **Default state**: `shadow-sm` on cards
- **Hover state**: `shadow-lg` or `shadow-xl` on cards
- **Primary buttons**: Always `shadow-lg shadow-teal-500/30`
- **Elevated components**: `shadow-2xl` with opacity modifier
- **Never** use bare `shadow-lg` without an opacity modifier on landing page cards

---

## 6. 🔘 Buttons

### Primary Button (Gradient)

```tsx
<Button
  size="lg"
  className="w-full gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30 text-base"
>
  Label
  <ArrowRight className="h-4 w-4" />
</Button>
```

- **Size lg**: `h-10 px-6` (shadcn) + `text-base` override on landing
- **Size sm** (navbar): `h-8 px-3` + same gradient classes
- **Full width on mobile**: `w-full sm:w-auto`

### Outline Button (Neutral)

```tsx
<Button
  size="lg"
  variant="outline"
  className="w-full gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-base"
>
  <Play className="h-4 w-4 fill-current" />
  Watch Demo
</Button>
```

### Outline Button (Teal — Doctor Cards)

```tsx
<Button
  variant="outline"
  size="sm"
  className="w-full gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300"
>
  Book Appointment
  <ArrowRight className="h-4 w-4" />
</Button>
```

### Ghost Button (Navbar)

```tsx
<Button variant="ghost" size="sm" className="text-slate-600">
  <LogIn className="mr-2 h-4 w-4" />
  Sign In
</Button>
```

### Icon Button (Footer Social)

```tsx
<Link className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-teal-600 hover:text-white">
  <Facebook className="h-4 w-4" />
</Link>
```

### Forbidden Styles

- ❌ **Never** use `bg-teal-500` solid — always use the gradient `bg-gradient-to-r from-teal-500 to-teal-600`
- ❌ **Never** use `bg-blue-*` or `bg-indigo-*` for primary actions
- ❌ **Never** use `text-white` on outline buttons (use `text-slate-700` or `text-teal-700`)
- ❌ **Never** omit `shadow-lg shadow-teal-500/30` on primary CTA buttons
- ❌ **Never** use `rounded-full` on buttons (use default `rounded-md` from shadcn)
- ❌ **Never** use icon size other than `h-4 w-4` inside buttons

---

## 7. 🃏 Cards

### Standard Content Card

```tsx
<div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-100">
  {/* Hover overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
  <div className="relative">
    {/* Content */}
  </div>
</div>
```

- **Background**: `bg-white`
- **Border**: `border border-slate-100`
- **Radius**: `rounded-2xl`
- **Shadow**: `shadow-sm` → `shadow-lg` on hover
- **Hover border**: `hover:border-teal-100`
- **Padding**: `p-6`
- **Hover overlay**: `bg-gradient-to-br from-teal-500/5 to-transparent` with `opacity-0 group-hover:opacity-100`
- **Wrap in**: `<motion.div className="group">` for hover overlay to work

### Stat Card (Gradient Background)

```tsx
<div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-100">
```

- Same as standard but `bg-gradient-to-br from-white to-slate-50`

### Doctor Card

```tsx
<div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl hover:border-teal-100">
  {/* Image area */}
  <div className="relative h-48 bg-gradient-to-br from-teal-50 to-slate-50 overflow-hidden">
    ...
  </div>
  {/* Content area */}
  <div className="p-6 space-y-4">
    ...
  </div>
</div>
```

- **Hover**: `shadow-xl` (stronger than standard `shadow-lg`)
- **Image height**: `h-48`
- **Image fallback bg**: `bg-gradient-to-br from-teal-50 to-slate-50`

### Search Card (Elevated)

```tsx
<div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
```

- **Radius**: `rounded-3xl`
- **Shadow**: `shadow-2xl shadow-slate-200/50`
- **Padding**: `p-6 md:p-8`

### Testimonial Card

```tsx
<div className="relative h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-100">
```

- **Always** add `h-full` for equal-height grid cards

### FAQ Accordion Item

```tsx
<div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
  <button className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors">
    ...
  </button>
  <div className="px-6 pb-5 pt-0">
    ...
  </div>
</div>
```

- **No hover shadow** — uses `hover:bg-slate-50` on the button instead
- **Button padding**: `px-6 py-5`
- **Content padding**: `px-6 pb-5 pt-0`

---

## 8. 📋 Form Elements

### Input Field (Landing Page Style)

```tsx
<Input
  placeholder="Rechercher une spécialité..."
  value={value}
  onChange={(e) => handleChange(e.target.value)}
  className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
/>
```

- **Height**: `h-12` (taller than shadcn default `h-9`)
- **Left padding**: `pl-10` (space for icon)
- **Border**: `border-slate-200`
- **Focus**: `focus:border-teal-500 focus:ring-teal-500`
- **Icon position**: `absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`

### Label

```tsx
<label className="text-sm font-medium text-slate-700 flex items-center gap-2">
  <Stethoscope className="h-4 w-4 text-teal-600" />
  Spécialité
</label>
```

- **Text**: `text-sm font-medium text-slate-700`
- **Layout**: `flex items-center gap-2`
- **Icon**: `h-4 w-4 text-teal-600`

### Autocomplete Dropdown

```tsx
<div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2">
    <Stethoscope className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
    {suggestion}
  </button>
</div>
```

- **Position**: `absolute z-50 top-full mt-1`
- **Container**: `bg-white border border-slate-200 rounded-xl shadow-lg`
- **Scroll**: `max-h-64 overflow-y-auto`
- **Item hover**: `hover:bg-teal-50 hover:text-teal-700`
- **Item icon**: `h-3.5 w-3.5 text-teal-400 flex-shrink-0`

### Tag / Quick Search Pill

```tsx
<button className="text-sm px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50 transition-all">
  {tag}
</button>
```

---

## 9. ✨ Animations & Motion

### Library: Framer Motion

### Standard Entrance Animations

| Direction | Code | Usage |
|-----------|------|-------|
| **From left** | `initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}` | Left column of 2-col layouts |
| **From right** | `initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}` | Right column of 2-col layouts |
| **From bottom** | `initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}` | Section headers, full-width blocks |
| **From top** | `initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}` | Hero badge |

**Always** add `viewport={{ once: true }}` on `whileInView` animations.

### Stagger Pattern (Card Grids)

```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
```

- **Base delay increment**: `0.1` per item
- **Duration**: `0.5`
- **Direction**: Always `y: 20 → 0`

### Hero Stagger Delays

| Element | Delay |
|---------|-------|
| Badge | `0.1` |
| H1 | `0.2` |
| Description | `0.3` |
| Feature pills | `0.4` |
| CTA buttons | `0.5` |
| Rating | `0.6` |
| Right image | `0.2` |
| Image overlay text | `0.8` |

### Floating Animation (Hero Image)

```tsx
animate={{ y: [0, -12, 0] }}
transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
```

### Floating Badge Cards

```tsx
const floatingElements = [
  { delay: 0,   duration: 3,   y: [-10, 10, -10] },
  { delay: 0.5, duration: 3.5, y: [10, -10, 10] },
  { delay: 1,   duration: 4,   y: [-8, 8, -8] },
];

animate={{ y: elem.y }}
transition={{ duration: elem.duration, repeat: Infinity, delay: elem.delay, ease: "easeInOut" }}
```

### Hover Animations

| Type | Code | Usage |
|------|------|-------|
| **Lift** | `whileHover={{ y: -8 }}` | Doctor cards |
| **Slight lift** | `whileHover={{ y: -4 }}` | Testimonial cards |
| **Scale** | `whileHover={{ scale: 1.02 }}` | Benefit cards |

### Ping Animation (Live Indicator)

```tsx
<span className="relative flex h-2.5 w-2.5">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
</span>
```

### Navbar Slide In

```tsx
initial={{ y: -100 }}
animate={{ y: 0 }}
transition={{ duration: 0.5 }}
```

### FAQ / Mobile Menu Expand

```tsx
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: "auto" }}
exit={{ opacity: 0, height: 0 }}
transition={{ duration: 0.3 }}
```

### CSS Transitions (Non-Framer)

- **Color transitions**: `transition-colors` (nav links, buttons, footer links)
- **All transitions**: `transition-all` (cards, tags, borders)
- **Opacity transitions**: `transition-opacity` (hover overlays)

---

## 10. 🧩 Component Patterns

### Badge / Pill (Inline Status)

```tsx
<div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-2 text-sm font-medium text-teal-700">
  <span className="relative flex h-2.5 w-2.5">
    {/* ping dot */}
  </span>
  Label Text
</div>
```

### Section Header (Centered)

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
  className="text-center mb-12 md:mb-16"
>
  <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-3">
    Section Label
  </p>
  <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
    Main Title
    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
      Gradient Line
    </span>
  </h2>
  <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
    Section description text goes here.
  </p>
</motion.div>
```

### Section Header (Left-aligned, in 2-col)

```tsx
<div>
  <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-3">
    Section Label
  </p>
  <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
    Main Title
    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
      Gradient Line
    </span>
  </h2>
</div>
```

### Icon Container (Feature — 12×12 Rounded Square)

```tsx
<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20">
  <IconName className="h-6 w-6" />
</div>
```

### Icon Container (Small — 10×10 Circle)

```tsx
<div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
  <IconName className="h-5 w-5" />
</div>
```

Color variants: `bg-green-100 text-green-600`, `bg-blue-100 text-blue-600`, `bg-teal-100 text-teal-600`

### Icon Container (Check Circle — 5×5)

```tsx
<div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-600 flex-shrink-0">
  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
</div>
```

### Floating Stat Card

```tsx
<motion.div
  animate={{ y: elem.y }}
  transition={{ duration: elem.duration, repeat: Infinity, delay: elem.delay, ease: "easeInOut" }}
  className="absolute bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-4"
  style={{ top: "10%", right: "-10%" }}
>
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
      <CheckCircle className="h-5 w-5 text-green-600" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-900">Verified</p>
      <p className="text-xs text-slate-500">Certified Doctor</p>
    </div>
  </div>
</motion.div>
```

### Gradient Text

```tsx
<span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
  Gradient Text Here
</span>
```

### Avatar Fallback (Initials)

```tsx
<div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-200 to-teal-300 flex items-center justify-center text-teal-700 font-bold text-2xl">
  JM
</div>
```

### Avatar Small (Testimonials)

```tsx
<div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-semibold text-sm">
  JM
</div>
```

### Star Rating

```tsx
<div className="flex items-center gap-0.5">
  {[...Array(5)].map((_, i) => (
    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
  ))}
</div>
```

### Availability Badge (Doctor Card)

```tsx
<Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
  <Clock className="mr-1 h-3 w-3" />
  Available
</Badge>
```

### Education Tag (Doctor Card)

```tsx
<Badge variant="outline" className="text-xs border-slate-200 text-slate-600">
  {education}
</Badge>
```

---

## 11. 📱 Responsive Breakpoints

### Tailwind Breakpoints (default)

| Prefix | Min Width | Target |
|--------|-----------|--------|
| `sm:` | 640px | Small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktops |
| `xl:` | 1280px | Large desktops |

### Mobile Layout Changes

| Component | Mobile | Desktop |
|-----------|--------|---------|
| **Navbar links** | `md:hidden` (hamburger menu) | `hidden md:flex` |
| **Mobile menu** | `md:hidden` | Hidden |
| **CTA buttons** | `flex-col` | `sm:flex-row` |
| **Primary button width** | `w-full` | `sm:w-auto` |

### Grid Column Changes

| Layout | Mobile | `sm:` | `md:` | `lg:` |
|--------|--------|-------|-------|-------|
| **Hero / 2-col** | 1 col | — | — | `lg:grid-cols-2` |
| **Search inputs** | 1 col | — | `md:grid-cols-3` | — |
| **Card grids** | 1 col | `sm:grid-cols-2` | — | `lg:grid-cols-3` |
| **Stats** | 1 col | `sm:grid-cols-2` | — | `lg:grid-cols-4` |
| **Footer** | 1 col | `sm:grid-cols-2` | `lg:grid-cols-4` | `xl:grid-cols-5` |

### Typography Size Changes

| Element | Mobile | `sm:` | `lg:` |
|---------|--------|-------|-------|
| **H1** | `text-4xl` | `sm:text-5xl` | `lg:text-6xl` |
| **H2** | `text-3xl` | `sm:text-4xl` | `lg:text-5xl` |

### Padding Changes

| Type | Mobile | `sm:` | `md:` | `lg:` |
|------|--------|-------|-------|-------|
| **Horizontal** | `px-4` | `sm:px-6` | — | `lg:px-8` |
| **Hero vertical** | `py-16` | — | `md:py-24` | `lg:py-32` |
| **Section vertical** | `py-20` | — | `md:py-28` | — |
| **Search card padding** | `p-6` | — | `md:p-8` | — |
| **Section header margin** | `mb-12` | — | `md:mb-16` | — |
| **2-col gap** | `gap-12` | — | — | `lg:gap-16` |

---

## 12. 🚫 Design Rules (DO and DON'T)

### ✅ DO

- **Always** use `teal` as the primary color for all interactive elements
- **Always** use `bg-gradient-to-r from-teal-500 to-teal-600` for primary buttons (never solid teal)
- **Always** use `hover:from-teal-600 hover:to-teal-700` for primary button hover
- **Always** add `shadow-lg shadow-teal-500/30` to primary CTA buttons
- **Always** use `slate` for text and neutral colors (never `gray` or `zinc`)
- **Always** use `rounded-2xl` or larger on cards
- **Always** use `border-slate-100` for card borders
- **Always** use `hover:border-teal-100` for card hover borders
- **Always** add `viewport={{ once: true }}` on `whileInView` animations
- **Always** use `lucide-react` for icons
- **Always** wrap animated card groups in `<motion.div className="group">`
- **Always** use `overflow-hidden` on cards with hover overlays
- **Always** add `scroll-mt-16` to sections targeted by navbar scroll
- **Always** use `transition-all` or `transition-colors` on interactive elements

### ❌ DON'T

- **Never** use `bg-blue-*`, `bg-indigo-*`, `bg-purple-*` as primary colors on the landing page
- **Never** use solid `bg-teal-500` for buttons — always use the gradient
- **Never** use `rounded-none` or `rounded-sm` on cards
- **Never** use `shadow` without an opacity modifier on landing page components
- **Never** use `text-gray-*` — always use `text-slate-*`
- **Never** use `h1`–`h6` HTML tags directly for sizing — use Tailwind classes on semantic elements
- **Never** hard-code hex colors in components — use Tailwind classes
- **Never** use `animate-pulse` for anything other than loading skeletons
- **Never** forget the gradient text pattern for section heading accent lines
- **Never** use icon sizes other than `h-3 w-3`, `h-3.5 w-3.5`, `h-4 w-4`, `h-5 w-5`, `h-6 w-6`

### Icon Library & Size Conventions

| Size | Tailwind Class | Usage |
|------|---------------|-------|
| **3×3** | `h-3 w-3` | Badge icons inside small badges |
| **3.5×3.5** | `h-3.5 w-3.5` | Autocomplete dropdown item icons |
| **4×4** | `h-4 w-4` | Button icons, inline icons, nav icons, star ratings, input icons |
| **5×5** | `h-5 w-5` | Floating card icons, small icon containers, feature check icons, navbar logo |
| **6×6** | `h-6 w-6` | Feature icon containers (12×12), stat icons |

---

## 13. 📄 Page Structure Template

Every new landing-style page **must** follow this skeleton:

```tsx
"use client";

import { motion } from "framer-motion";
// Import lucide-react icons as needed
// Import shadcn/ui components as needed

export default function NewSection() {
  return (
    <section className="py-20 md:py-28 bg-white scroll-mt-16">
      {/* OR alternate bg: bg-gradient-to-b from-slate-50 to-white / bg-gradient-to-b from-white to-slate-50 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Section Header (centered) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-3">
            Section Label
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Main Title
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
              Gradient Accent Line
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Section description goes here.
          </p>
        </motion.div>

        {/* ── Content Grid ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-100">
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  {/* Icon */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20">
                    <ItemIcon className="h-6 w-6" />
                  </div>
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
```

### Section Background Rotation Pattern

Alternate section backgrounds for visual rhythm:

1. **Hero**: `bg-gradient-to-b from-teal-50/50 via-white to-white`
2. **Stats**: `bg-white`
3. **WhyChooseUs**: `bg-gradient-to-b from-slate-50 to-white`
4. **Doctors**: `bg-white`
5. **Testimonials**: `bg-gradient-to-b from-white to-slate-50`
6. **FAQ**: `bg-white`
7. **Footer**: `bg-slate-900`

**Pattern**: white → white → slate-50→white → white → white→slate-50 → white → slate-900

### Complete Landing Page Composition

```tsx
// src/app/page.tsx
export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <SearchSection />   {/* -mt-16 overlaps hero */}
      <StatsSection />
      <WhyChooseUs />
      <FeaturedDoctors />
      <Testimonials />
      <FaqSection />
      <Footer />
    </main>
  );
}
```
