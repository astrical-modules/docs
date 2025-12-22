# UI Components: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src/components/ui` (and module equivalents).

This document details the architecture of **UI Components**, the "atomic" building blocks of the Astrical platform.

---

## 1. Core Concept: "Atoms" vs "Molecules"

To understand where to place a new component, you must distinguish between a **UI Component** and a **Widget**.

| Feature | UI Component (`components/ui`) | Widget (`components/widgets`) |
| :--- | :--- | :--- |
| **Role** | Small, reusable building block (Atom). | Self-contained, functional section (Molecule). |
| **CMS Visibility** | **Invisible**. Not directly used in pages. | **Visible**. Added to `sections` in YAML. |
| **Schema** | **None** (No `.spec.yaml`). | **Required** (Has `.spec.yaml`). |
| **Props** | Typed TS Interface (`Props`). | Extends `Widget` interface. |
| **Examples** | Button, Card, Image, Headline. | Hero, Pricing, Testimonials. |

---

## 2. Implementation Pattern

UI components are "pure" Astro components. They focus on receiving data/props and rendering semantic HTML with theme support.

### The "Themeable Atom" Pattern

Even strictly internal components must be themeable.

1.  **Define Props**: Use a clear TypeScript interface.
2.  **Get Classes**: Use `getClasses('Component+[Name]')` to allow the theme to control styling.
3.  **Render**: Output semantic HTML.

### Boilerplate Template

```astro
---
// src/components/ui/Badge.astro
import { getClasses } from '~/utils/theme';

export interface Props {
  text: string;
}

const { text } = Astro.props;
const classes = getClasses('Component+Badge');
---

<span class={classes.badge}>
  {text}
</span>
```

---

## 3. Module Integration

Modules can provide reusable UI components for use within their own Widgets or to be shared with the wider system.

**Location:** `src/modules/[module-name]/components/ui/`

### Usage Strategy
Since UI components are not automatically discovered by the CMS, you must **import them explicitly**.

1.  **Internal Use**: Import relative to your module structure.
    `import Badge from '../ui/Badge.astro';`
2.  **Cross-Module Use**: If a module exports a useful UI component, other modules can import it if they know the path.
    `import Badge from '~/modules/my-module/components/ui/Badge.astro';`

---

## 4. Reference Material

*   **`src/components/ui/Button.astro`**: The "Gold Standard" example. Study how it handles polymorphism (rendering as `<button>` or `<a>`) and extensive prop configurations.
*   **`src/components/ui/WidgetWrapper.astro`**: A critical UI component used by *every* Widget.

---

*This file is machine-readable context for AI agents building atomic design elements.*
