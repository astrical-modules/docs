# Module Content Management: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src/core/content-default` and any `modules/[name]/content` directory.

This document serves as the **authoritative guide** for managing content within Astrical modules. It details the architecture, file structures, and strict merge strategies that govern how module content is integrated into the final site.

---

## 1. Core Philosophy: "Content as Configuration"

Astrical decouples content from code.
*   **The Engine (`src/`)**: Stateless logic, components, and site utilities.
*   **The Content (`content/`)**: State, pages, styling, and configuration.

Modules are designed to package **default content** (starter pages, themes, shared components) that can be distributed and installed. When an AI agent is asked to "create a module," it must populate this directory to provide the module's turnkey value.

## 2. Directory Structure & Rules

The structure of this directory mirrors the main project's `content/` directory, with **critical exceptions**.

### Allowed Directories

| Directory | Purpose | AI Implication |
| :--- | :--- | :--- |
| **`/pages`** | Contains `.yaml` files defining web pages. | Create standard page archetypes (Standard, Pricing, Landing) here. |
| **`/shared`** | Reusable content components (CTAs, testimonials). | Extract any content block used in >1 page here to adhere to DRY principles. |
| **`/config.yaml`** | Default site configuration. | Provide sensible defaults for `site`, `metadata`, and `ui`. |

### 🚫 EXCLUDED: The "No Menus" Rule

> [!CAUTION]
> **Modules CANNOT contain a `/menus` directory.**

**Reasoning:** Navigation is a site-specific concern. Merging menu links from multiple modules blindly creates chaotic, broken navigation structures (e.g., duplicate "Home" links, inconsistent hierarchy).

**Behavior:** The Astrical core `src/utils/content-scanner.ts` explicitly deletes the `menus` key from any loaded module content:

```typescript
// src/core/src/utils/content-scanner.ts
if (content['menus']) {
  delete content['menus']; // Enforced exclusion
}
```

**AI Strategy:** If a module *needs* to expose its pages to the user, **instruct the user** (in the module's installation guide or via stdout) to manually add the links to their `content/menus/header.yaml`. Do not attempt to automate this via file placement.

---

## 3. The Merge Strategy (Deep Dive)

Understanding how module content interacts with user project content is critical for preventing data loss and unexpected behavior.

### The Merge Logic
The system uses **Recursive Deep Merging** (`lodash.merge`).
*   **Source A (Base)**: Module Content (loaded first).
*   **Source B (Override)**: Project Content `content/` (loaded second).

**Precedence Rule:** `Project Content > Module Content`

### Merge Behaviors by Type

#### 1. Configuration (`config.yaml`)
*   **Behavior**: Deep merge.
*   **Result**: If the module sets `site.name: "Starter"`, and the user's project `config.yaml` sets `site.name: "My Brand"`, the result is `"My Brand"`.
*   **AI Goal**: Provide comprehensive defaults in modules so the site works "out of the box," knowing the user can override specific keys without copying the whole file.

#### 2. Pages (`/pages`)
*   **Behavior**: File-level granularity + Content Merging.
*   **Scenario A (New Page)**: Module has `pages/features.yaml`. User has no `features.yaml`. result: **Page exists**.
*   **Scenario B (Override)**: Module has `pages/about.yaml`. User creates `pages/about.yaml`. result: **User's page takes precedence**.
    *   *Note:* The merge is deep. If the user only defines `metadata.title` in their `about.yaml`, they *might* inherit sections from the module's `about.yaml` depending on key overlap.
    *   **Best Practice**: Users usually fully replace pages. Treat module pages as "Starters" or "Templates".

#### 3. Shared Components (`/shared`)
*   **Behavior**: deeply merged.
*   **Power Feature**: A module can define a generic CTA in `shared/cta/default.yaml`. The user can create the same file `content/shared/cta/default.yaml` and define *only* the `title` property. The `sections`, `buttons`, and layout from the module will remain, whilst the title is updated.

---

## 4. AI Workflow for Module Creation

When tasked with "Creating content for Module X":

1.  **Check Constraints**: Ensure you are NOT creating `menus/`.
2.  **Scaffold Pages**: Create logical entry points (e.g., `pages/module-x-landing.yaml`).
3.  **Define Shared Assets**: If the module introduces a specific UI widget or repeated Call-to-Action, place it in `shared/`.
4.  **Reference Spec**:
    *   **Structure**: Follow the schemas in `dev/content_management.rst`.
    *   **Styling**: Verify component styles against `dev/theme_design.rst`.

### Reference Documentation
*   **`dev/content_management.rst`**: The "Bible" for YAML schemas (Pages, Sections, Components).
*   **`dev/theme_design.rst`**: Guide for theming and visual patterns.
*   **`src/core/src/utils/content-scanner.ts`**: The definitive code source for the loading and merging logic described above.

---

*This file is machine-readable context for AI agents operating within the Astrical ecosystem.*
