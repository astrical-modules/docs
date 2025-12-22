# API Routes: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src/pages/api` (and module equivalents).

This document details the architecture of **Server-Side API Endpoints**, which provide backend logic for form processing, webhooks, and dynamic data fetching.

---

## 1. Core Concept: Server-Side Rendering (SSR)

API routes are treated as pages but do not return HTML. They return standard `Response` objects (usually JSON).
*   **Execution**: Runs on the server (Node.js/Cloudflare/etc.).
*   **Prerendering**: MUST be disabled (`export const prerender = false`) for practically all API routes, as they handle dynamic requests.

---

## 2. Implementation Pattern

Every API route is a standard `.ts` file that exports request handlers (GET, POST, etc.).

### Boilerplate Template
```typescript
// src/pages/api/my-endpoint.ts
import type { APIRoute } from 'astro';

// CRITICAL: Disable static generation for this dynamic endpoint
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Perform backend logic
    console.log('Received data:', data);

    return new Response(JSON.stringify({ success: true, message: 'Processed' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server Error' }), {
      status: 500
    });
  }
};
```

---

## 3. Module Integration

Modules can add API endpoints to the application.

**Location:** `src/modules/[module-name]/src/pages/api/`

### The Injection Mechanism
The `module-integration` plugin ( `plugins/modules/index.ts`) recursively scans the `src/pages` directory of every module and injects routes into the root.

**Example**:
*   File: `src/modules/shop/src/pages/api/cart.ts`
*   Resulting URL: `/api/cart`

> [!CAUTION]
> **Namespace Collisions are Possible!**
> The system blindly merges all routes. If `module-a` and `module-b` both define `src/pages/api/webhook.ts`, one will overwrite the other (or cause a build error).
> **Best Practice**: Always namespace your module API routes:
> *   `src/modules/stripe/src/pages/api/stripe/webhook.ts` -> URL: `/api/stripe/webhook`

---

## 4. Reference Material

*   **`src/pages/api/submit-form.ts`**: The core form submission endpoint.
*   **`plugins/modules/index.ts`**: The integration script that handles route injection.

---

*This file is machine-readable context for AI agents building backend endpoints.*
