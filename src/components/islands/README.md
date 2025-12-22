# Server Islands: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src/components/islands` and `src/components/widgets`.

This document explains the **Server Island** architecture, a critical pattern for introducing dynamic, server-side logic (SSR) into Astrical's predominantly static environment.

---

## 1. Core Concept: "Dynamic Islands in a Static Ocean"

Astrical pages are statically generated at build time. However, some features require runtime data (e.g., checking if a user is logged in, redirecting based on roles).

**Server Islands** allow you to defer the rendering of a specific component until the user requests the page. The rest of the page remains static and cached, while the "island" is rendered on the server for every request.

**Key Use Cases:**
*   Authentication barriers (Role guards).
*   User-specific data display (User profile widgets).
*   Dynamic redirects.

---

## 2. The "Widget Wrapper" Pattern (MANDATORY)

To ensure stability and type safety, we **NEVER** use Islands directly in content pages. We always use a **Widget Wrapper**.

### The Architecture
1.  **The Island (`.../components/islands/MyLogic.astro`)**:
    *   Contains the heavy logic.
    *   Accesses `Astro.locals` (auth state, etc.).
    *   **MUST** be called with `server:defer`.
2.  **The Widget (`.../components/widgets/MyLogic.astro`)**:
    *   A lightweight, static wrapper.
    *   Receives props from the YAML content system.
    *   Imports the Island and renders it with the `server:defer` directive.

### Why this pattern?
*   **Encapsulation**: Content creators (YAML) interact with the "Widget". They don't need to know it's dynamic.
*   **Safety**: The Widget ensures props are correctly passed and that `server:defer` is *always* applied. If you forget `server:defer` on a page, the build fails or static generation breaks. The Widget prevents this human/AI error.

---

## 3. Implementation Guide for AI

When asked to "create a dynamic feature," follow this verified path.

### Step A: Create the Island
**Location:** `src/components/islands/[Name].astro` (or module equivalent)

```astro
---
// src/components/islands/RoleRedirect.astro

const { auth } = Astro.locals; // Access runtime state here!
const user = auth.user;

// Perform logic...
if (!user) {
  return Astro.redirect('/login');
}
---
<div>Welcome, {user.name}</div>
```

### Step B: Create the Widget Wrapper
**Location:** `src/components/widgets/[Name].astro`

```astro
---
// src/components/widgets/RoleRedirect.astro

import type { Widget } from '~/types';
import RoleRedirectIsland from '~/components/islands/RoleRedirect.astro'; // Import the island

export interface Props extends Widget {
  // Define props that come from YAML
  allowedRoles: string[];
}
const props = Astro.props;
---
<!-- CRITICAL: Apply server:defer here -->
<RoleRedirectIsland server:defer {...props} />
```

### Step C: Register (if needed) & Usage
The Widget is now ready to be used in `content/pages/some-page.yaml`:

```yaml
- type: RoleRedirect
  allowedRoles: ['admin']
```

---

## 4. Module Integration

Modules can contribute both Islands and Widgets.

*   **Islands**: Place in `modules/[module-name]/components/islands/`.
*   **Widgets**: Place in `modules/[module-name]/components/widgets/`.

**Rules:**
1.  **Namespacing**: Use unique names to avoid colliding with Core components.
2.  **State Access**: Islands in modules can access `Astro.locals`, but ensure the necessary middleware (like Auth) is active.
3.  **Dependencies**: If your Island relies on other module components, ensure they are imported via absolute paths aliases (e.g., `~/modules/...`) if possible, or strict relative paths.

---

## 5. Reference Implementation

Analyze these files for the "Gold Standard" implementation:

1.  **The Widget (API Surface)**:
    *   `src/components/widgets/RoleRedirect.astro`
2.  **The Island (Logic Core)**:
    *   `src/components/islands/RoleRedirect.astro`

> [!TIP]
> Always check `src/components/common/AuthGuard.astro` for an example of how to handle "soft" protection (conditional rendering) vs "hard" protection (redirects).

---

*This file is machine-readable context for AI agents building dynamic features in Astrical.*
