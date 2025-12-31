# Component Widgets: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src/components/widgets` (and module equivalents).

This document details the architecture of **Widgets**, the atomic units of display in the Astrical platform.

---

## 1. Core Concept: "The Holy Trinity" of Component Definition

To create a functional, discoverable, and themeable widget, you typically need **three** files working in unison.

| File Type | Extension | Purpose | Example |
| :--- | :--- | :--- | :--- |
| **Logic** | `.astro` | The HTML structure and TypeScript logic. | `Hero.astro` |
| **Schema** | `.spec.yaml` | The data contract. Tells the CMS/AI what props are allowed. | `Hero.spec.yaml` |
| **Style** | `style.yaml` | The visual definition (Tailwind classes). *Located in the theme.* | `themes/default/style.yaml` |

> [!CRITICAL]
> **A Widget is NOT complete without its `.spec.yaml` file.** The system uses this spec to register the widget for use in content pages.

---

## 2. Anatomy of a Widget (`.astro`)

Every widget must adhere to strict architectural standards to function within the `WidgetWrapper` system.

### Mandatory Requirements
1.  **Extend `Widget` Interface**: Props must extend the base `Widget` type (which includes `id`, `bg`, `classes`).
2.  **Use `WidgetWrapper`**: The outer HTML element **must** be `<WidgetWrapper>` or a descendent like `<TitledWidgetWrapper>`. This handles background images, section spacing, and ID injection automatically.
3.  **Use `getClasses`**: Never hardcode tailwind classes for the main structure. Use the theme utility.

### Boilerplate Template
```astro
---
// src/components/widgets/MyWidget.astro
import type { Widget } from '~/types';
import WidgetWrapper from '~/components/ui/WidgetWrapper.astro';
import { getClasses } from '~/utils/theme';

export interface Props extends Widget {
  title: string;
  // ... specific props
}

const { id, title, classes: rawClasses = {}, bg = '' } = Astro.props;

// "Component+MyWidget" matches the key in style.yaml
const classes = getClasses('Component+MyWidget', rawClasses);
---

<WidgetWrapper id={id} classes={classes.wrapper} bg={bg}>
  <div class={classes.container}>
    <h2 class={classes.title}>{title}</h2>
  </div>
</WidgetWrapper>
```

---

## 3. The Schema (`.spec.yaml`)

You **MUST** create this file next to the `.astro` file. It defines the props for the content system.

### Key Rules
*   **Root Key**: `components > [WidgetName]`.
*   **Type Property**: Must include a `properties > type > enum: [WidgetName]` to identify itself.
*   **Discovery**: Run `npm run generate-spec` after creating this file to register it.

### Example Schema
```yaml
# src/components/widgets/MyWidget.spec.yaml
components:
  MyWidget:
    type: object
    properties:
      type:
        type: string
        enum: [MyWidget] # Critical for polymorphism
        required: true
      title:
        type: string
        required: true
      classes:
        type: object # Allows per-instance overrides
```

---

## 4. Module Integration

Modules can introduce new Widgets to the system.

**Location:** `src/modules/[module-name]/components/widgets/`

### The Integration Flow
1.  **Create Files**: AI creates `MyModuleWidget.astro` and `MyModuleWidget.spec.yaml` in the module directory.
2.  **Register Spec**: The `generate-spec` script scans all module directories for `.spec.yaml` files and merges them into the master `dev/03_content_ops/content.spec.yaml`.
3.  **Register Styles**: The module should document (or provide) the necessary `Component+MyModuleWidget` entries for `style.yaml`.

---

## 5. Reference Material

*   **`dev/component_dev.rst`**: The comprehensive guide on component development patterns, props, and best practices. **Read this before writing code.**
*   **`src/components/widgets/Hero.astro`**: The canonical example of a complex, well-structured widget.

---

*This file is machine-readable context for AI agents building new UI components.*
