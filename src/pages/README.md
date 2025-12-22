# Page Routes: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src/pages` (and module equivalents).

This document details the **Hybrid Routing Architecture** of Astrical, which allows both high-performance static pages and secure, dynamic server-side pages to coexist seamlessly.

---

## 1. Core Concept: The "Universal Page" Pattern

Instead of creating 100 separate `.astro` files for 100 CMS pages, the system uses two "Universal Catch-All" routes that render content based on `content/pages/*.yaml`.

### A. The Static Route (`[...build].astro`)
*   **Purpose**: Public informational pages (Home, About, Contact).
*   **Behavior**: `export const prerender = true`.
*   **Build Time**: Generates static HTML for every page config found in `content/pages` that is NOT protected.
*   **Performance**: Maximum (CDNs serve static HTML).

### B. The Server Route (`[...server].astro`)
*   **Purpose**: User dashboards, Protected content, Dynamic logic.
*   **Behavior**: `export const prerender = false`.
*   **Run Time**: Intercepts any request that was *not* statically generated.
*   **Security**: Performs real-time checks against `Astro.locals.auth`.

---

## 2. Module Integration

Modules can inject **Custom Pages** that override or supplement the universal routes.

**Location:** `src/modules/[module-name]/src/pages/`

### The Injection Mechanism
The `module-integration` plugin scans module `src/pages` and uses `injectRoute` to map them to the root.

**Example**:
*   File: `src/modules/store/src/pages/cart.astro`
*   Resulting URL: `/cart`

> [!TIP]
> **Precedence Rule**: Explicit routes (like `/cart` defined in a module) always take precedence over the catch-all `[...server]` route.

---

## 3. Pure Markdown Pages

For static content documents (e.g., Privacy Policy, Terms) that don't need the "Universal" YAML engine, you can add standard Markdown files.

### Configuration
*   **Routing**: Automatic based on filename (e.g., `privacy.md` -> `/privacy`).
*   **Layout**: You **MUST** specify a layout in the frontmatter (typically `~/layouts/MarkdownLayout.astro`).

### Example
```markdown
---
title: 'Privacy Policy'
layout: '~/layouts/MarkdownLayout.astro'
---

# Privacy Policy
Your content here...
```

---

## 4. Implementing a Custom Page

When a basic CMS page isn't enough (e.g., complex logic, external API calls), create a custom `.astro` page.

### Boilerplate Template
```astro
---
// src/modules/my-module/src/pages/dashboard.astro
import PageLayout from '~/layouts/PageLayout.astro';

// 1. Force Server-Side Rendering (optional, but typical for functional pages)
export const prerender = false;

// 2. Auth Check (if needed)
if (!Astro.locals.auth?.user) {
  return Astro.redirect('/login');
}

// 3. Data Fetching
const data = await fetch('https://api.internal/stats').then(r => r.json());
---

<PageLayout title="My Dashboard">
  <div class="p-8">
    <h1>Welcome, {Astro.locals.auth.user.name}</h1>
    <p>Stats: {data.visits}</p>
  </div>
</PageLayout>
```

---

## 5. Authentication Integration

The system uses global middleware (`src/middleware.ts`) to populate `Astro.locals.auth` before your page runs.

*   **`Astro.locals.auth.user`**: The current user object (or null).
*   **`Astro.locals.auth.hasRole(roles)`**: Helper to check permissions.
*   **Access Control**: The `[...server].astro` route automatically checks the `access` property in page YAML. Custom pages must implement their own checks (as shown above).

---

## 6. Reference Material

*   **`src/pages/[...build].astro`**: The static generator.
*   **`src/pages/[...server].astro`**: The dynamic fallback.
*   **`src/middleware.ts`**: The auto-wiring authentication engine.

---

*This file is machine-readable context for AI agents building frontend routes.*
