# Section Components: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src/components/sections` (and module equivalents).

This document details the architecture of **Section Components** (Layouts), which act as the structural containers for pages.

---

## 1. Core Concept: "The Organism"

Sections are the top-level blocks defined in a page's `sections` array.
*   **Role**: Container. They strictly handle layout (columns, background, width) and render child Widgets.
*   **Logic**: Minimal. They iterate over configuration and use `generateSection` to instantiate children.

---

## 2. Implementation Pattern

Every section must use the `SectionWrapper` to ensure consistent IDs, backgrounds, and vertical rhythm.

### Boilerplate Template
```astro
---
// src/components/sections/MyLayout.astro
import SectionWrapper from '~/components/ui/SectionWrapper.astro';
import { generateSection } from '~/utils/generator';
import { getClasses } from '~/utils/theme';

const { id, components, classes: rawClasses = {}, bg = '' } = Astro.props;
const classes = getClasses('Section+MyLayout', rawClasses);
---

<SectionWrapper type="my-layout" id={id} classes={classes.wrapper} bg={bg}>
  <div class={classes.container}>
    {/* Iterate over the 'main' region defined in YAML */}
    {
      generateSection(components?.main).map(({ component: Component, props }) => (
        <Component {...props} />
      ))
    }
  </div>
</SectionWrapper>
```

---

## 3. The Schema (`.spec.yaml`)

> [!CRITICAL]
> **Sections use `layout` instead of `type`.**
> While widgets identify themselves with `type: Hero`, sections identify themselves with `layout: MyLayout` in the spec and `type: MyLayout` in the page config (handled by the CMS mapping).

### Example Schema
```yaml
# src/components/sections/MyLayout.spec.yaml
sections:
  MyLayout:
    type: object
    properties:
      layout:
        type: string
        enum: [MyLayout] # Identifies this as a section
        required: true
      components:
        type: object
        properties:
          main:
            type: array
            items:
              $ref: '#/definitions/EmbeddableComponent' # Accepts any Widget
```

---

## 4. Module Integration

Modules can add new layouts to the system (e.g., a "SidebarLeft" layout).

**Location:** `src/modules/[module-name]/src/components/sections/`

### Auto-Discovery
The system (`src/components.ts`) scans specifically for sections and adds them to `supportedLayouts`.
*   **Discovery**: `import.meta.glob('.../components/sections/**/*.astro')`.
*   **Usage**: In a page YAML:
    ```yaml
    sections:
      - layout: MyModuleLayout # <--- Corresponds to MyModuleLayout.astro
        components:
          main:
            - type: Hero
    ```

---

## 5. Reference Material

*   **`src/components/sections/SingleColumn.astro`**: The reference implementation for a standard layout.
*   **`src/components/ui/SectionWrapper.astro`**: The mandatory wrapper component.
*   **`src/utils/generator.ts`**: Contains `generateSection`.

---

*This file is machine-readable context for AI agents building page layouts.*
