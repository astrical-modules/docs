# Utilities: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src/utils` (and module equivalents).

This document details the **Shared Utility Library**, a collection of reusable functionality used across the site. Use this folder for code that doesn't fit into a Component, Page, or Theme.

---

## 1. Architectural Patterns

Utilities typically fall into one of two patterns:

### A. Pure Helpers (Functional)
Stateless functions that perform data manipulation.
*   **Examples**: String formatting, Date calculation, URL generation (`permalinks.ts`).
*   **Best Practice**: Keep them side-effect free.

### B. Core Services (Stateful/Complex)
Classes or Modules that manage application state, caching, or complex interactions.
*   **Examples**:
    *   `loader.ts`: Centralized content loading and referencing.
    *   `cache.ts`: Inter-request caching for build performance.
    *   `forms.ts`: Form submission processing engine.

---

## 2. Module Integration

Modules can provide their own utility libraries, but unlike components, **there is No Auto-Discovery**.

### How to use Module Utils
If `module-a` provides an awesome date formatter in `src/modules/module-a/src/utils/date.ts`, other parts of the application must import it explicitly:

```typescript
// Correct Import Path using Alias
import { formatDate } from '@modules/module-a/utils/date';
```

> [!WARNING]
> Utilities in `src/core/src/utils` are considered "Core/Global" and are available via `~/utils/filename`.
> Utilities in modules are "Local/Shared" and must be accessed via their specific module path.

---

## 3. Key Core Utilities

*   **`loader.ts`**: The backbone of the "Content as Configuration" system. Handles YAML reading and merging.
*   **`theme.ts`**: The engine for the Data-Driven styling system.
*   **`generator.ts`**: Generates form fields and other dynamic HTML.
*   **`permalinks.ts`**: Centralized logic for URL structure (trailing slashes, base paths).

---

## 4. Best Practices

1.  **Isomorphic**: Assume your utility might run in both Node.js (Build/SSR) and the Browser, unless explicitly using Node-only APIs (`fs`, `path`).
2.  **Caching**: If your utility performs expensive IO or computation (like `loader.ts`), use `src/utils/cache.ts` to persist results across requests during the build process.

---

*This file is machine-readable context for AI agents building shared logic.*
