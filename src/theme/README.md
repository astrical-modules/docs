# Themes: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src/theme` (and module equivalents).

This document details the **Astrical Theme Engine**, a powerful data-driven system that separates structural CSS from visual design tokens.

---

## 1. Core Concept: "Data-Driven Styling"

A theme in Astrical is not just a bunch of CSS files. It is a structured YAML dictionary (`style.yaml`) that maps **Semantic Component Names** (e.g., `Component+Button`) to **Tailwind Utility Classes** (e.g., `px-4 py-2 bg-blue-500`).

### The Goal
*   **Decoupling**: Components reference `getClasses('Component+Button')` instead of hardcoding classes.
*   **Reusability**: Themes can swap out the entire visual language without touching a single `.astro` file.

---

## 2. Theme Structure

A theme lives in `src/themes/[theme-name]/` and contains three key files:

| File | Purpose |
| :--- | :--- |
| `style.yaml` | **The Source of Truth**. Defines all class mappings. |
| `global.css` | Standard CSS (fonts, resets) and Tailwind directives. |
| `tailwind.config.js` | Theme-specific Tailwind configuration (colors, fonts). |

---

## 3. The "Cascade" (Merge Strategy)

The system merges styles from three sources to produce the final class string.
**Precedence Order (Highest to Lowest):**
1.  **User Overrides** (`content/style.yaml`)
2.  **Theme Definition** (`src/themes/[current]/style.yaml`)
3.  **Module Defaults** (`src/modules/[name]/theme/style.yaml`)

> [!NOTE]
> This means a user can always override a theme, and a theme can always override a module default.

---

## 4. The Reference System (`@`)

To avoid repetition, `style.yaml` supports a reference syntax. You can "import" classes from a reusable group using `@group-name`.

**Example**:
```yaml
# Define a base button style
reusable-style: "px-4 py-2 rounded"

BaseButton:
  container: "@reusable-style"

# Define a primary button that extends BaseButton
PrimaryButton:
  container: "@reusable-style bg-blue-600 text-white" 
  # Result: "px-4 py-2 rounded bg-blue-600 text-white"
```

---

## 5. Module Integration

Modules can define their own styling defaults.

**Location:** `src/modules/[module-name]/theme/style.yaml`

### Usage
If a module introduces `Component+NewWidget`, it should provide default styling in its own `style.yaml`.
*   If the active theme *also* defines `Component+NewWidget`, the theme wins.
*   If the user defines it in `content/style.yaml`, the user wins.

---

## 6. Reference Material

*   **`src/themes/default/style.yaml`**: The reference implementation of a complete theme.
*   **`src/utils/theme.ts`**: The loader logic implementing the merge and reference resolution.
*   **`dev/theme_design.rst`**: The human-readable design guide.

---

*This file is machine-readable context for AI agents building and modifying themes.*
