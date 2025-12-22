# Module Source: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src` (The Application Kernel and Module Extension Core)

This directory contains the central runtime logic for the Astrical application. It defines **HOW** the server handles requests, integrates modules, and manages types.

---

## 1. Middleware Architecture (Auto-Wiring)

The file `src/middleware.ts` is the **Middleware Engine**. It is responsible for assembling the global middleware chain from loose module parts.

### The Mechanism
1.  **Discovery**: It uses `import.meta.glob('../modules/*/middleware.ts')` to find all available middleware handlers.
2.  **Sort**: It accepts a `MIDDLEWARE` array from `site:config`. This array contains the names of modules in a topologically sorted order (calculated at build time based on module dependencies).
3.  **Execute**: It constructs an Astro `sequence()`, ensuring that base modules run before dependent modules.

### Module Integration
Modules can inject their own middleware by creating `src/modules/[name]/middleware.ts`.
This is useful for:
*   Authentication (populating `user` object).
*   Tenant resolution (subdomain logic).
*   Request logging or tracing.

---

## 2. Type Augmentation (`env.d.ts`)

Astrical uses TypeScript Declaration Merging to extend Astro's core types. This file (`env.d.ts`) is the **Schema for `Astro.locals`**.

### The `Astro.locals` Contract
Any data passed between middleware and page routes **must** be typed here.

#### 1. The `auth` Namespace
Reserved for the active Authentication Provider.
```typescript
Astro.locals.auth = {
  user: { id: '...', email: '...' },
  roles: ['admin'],
  hasRole: (roles) => boolean
}
```

#### 2. The `modules` Namespace
Reserved for general module data.
> [!IMPORTANT]
> **Namespace Rule**: Modules must store their data under a unique key in `locals.modules` to prevent collisions unless this module is providing authentication and user handling.

```typescript
// Correct
Astro.locals.modules['stripe'] = { customerId: '...' };

// Incorrect (Pollutes global namespace)
Astro.locals.customerId = '...'; 
```

---

## 3. Best Practices

1.  **Strict Isolation**: `src/*` (Core) should generally be immutable. Do not add "Feature Logic" here. Features belong in Modules.
2.  **Type Safety**: If you add a new global capability, you **must** update the core `env.d.ts`.
3.  **Performance**: Middleware runs on *every SSR request*. Keep it lightweight. Use `locals` to pass computed data to pages instead of re-fetching it in components.
