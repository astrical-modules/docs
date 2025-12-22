# Astrical Module Starter

**Version:** 1.0.0  
**Focus:** AI Agent & Developer Reference

This directory (`src/module-starter`) allows you to build Astrical **Modules**. Modules are self-contained extensions that add capabilities (Pages, Components, API Routes, Utilities) to an Astrical site without modifying the core engine.

---

## 1. What is a Module?

A Module is a "mini-application" that lives in `src/modules/[name]/`.
It mirrors the structure of the core `src/` directory.

### Capabilities
*   **Add Pages**: `/my-module/dashboard`, `/api/webhooks/stripe`.
*   **Add Components**: Widgets, UI atoms, Sections.
*   **Extend Themes**: Add defaults for your new components.
*   **Add Content**: Default pages, shared blocks, and configuration.
*   **Add Utilities**: Shared logic (e.g., specific API clients).

---

## 2. Directory Structure

Your module **must** follow this structure to be auto-discovered.

```text
src/modules/[your-module-name]/
├── module.yaml             # Manifest (Name, Dependencies)
├── package.json            # NPM Config (Name, NPM Dependencies, Package exports)
├── content/                # Content Injection
│   ├── config.yaml         # Deep-merged into global site config
│   ├── pages/              # New YAML pages (e.g., 'dashboard.yaml')
│   └── shared/             # Reusable content blocks
├── src/
│   ├── components/         # Astro Components
│   │   ├── ui/             # "Atoms" (Buttons, Inputs)
│   │   ├── widgets/        # "Molecules" (Hero, Pricing)
│   │   └── sections/       # "Organisms" (Layouts)
│   ├── pages/              # Astro Routes
│   │   ├── api/            # Server endpoints
│   │   └── [...route].astro # Custom UI routes
│   ├── theme/              # Styling
│   │   └── style.yaml      # Style definitions for your components
│   └── utils/              # Helper functions & Services
```

---

## 3. Integration Logic (The "Magic")

Astrical uses a **Validation & Discovery** engine to merge your module into the running app.

### A. Content Merging
*   **`content/pages/*`**: Added to the global page list. *Conflict Policy: User content overrides Module content.*
*   **`content/config.yaml`**: Deep-merged into the global `site:config`. use this to add safe defaults (e.g., `analytics.vendors.myPlugin`).
*   **`content/menus/`**: ❌ **FORBIDDEN**. Modules cannot define global menus to prevent navigation chaos.

### B. Component Discovery
Components in `src/components/widgets/` are automatically registered if they follow the **Schema-First** pattern:
1.  **Code**: `MyWidget.astro`
2.  **Schema**: `MyWidget.spec.yaml` (Next to the file)
3.  **Style**: Entry in `theme/style.yaml` under `Component+MyWidget`.

### C. Theme Cascading
Your module's `style.yaml` file provides **Library Defaults**.
*   **Merge Order (Low to High)**: `Module Defaults` < `Active Theme` < `User Overrides`.
*   **Syntax**: Use `Component+WidgetName` keys.

---

## 4. How to Create a Module

### Step 1: Initialize
Copy this `src/module-starter` directory to `src/modules/my-new-module`.
Update `module.yaml`:
```yaml
name: "my-new-module"
```

Or run:
```bash
astrical module init my-new-module  # This starter module is the default repository used by the CLI
```

### Step 2: Add Logic
Example: Adding a "Payment Form" widget.
1.  Create `src/components/widgets/PaymentForm.astro`.
2.  Create `src/components/widgets/PaymentForm.spec.yaml`.
3.  Add styles to `src/theme/style.yaml`:
    ```yaml
    Component+PaymentForm:
      container: 'p-4 border rounded'
    ```

### Step 4: Manage Dependencies (package.json)
Both `module.yaml` and `package.json` act as configuration files.
*   **`module.yaml`**: internal Astrical settings.
*   **`package.json`**: Standard NPM dependencies.

**Adding a Dependency:**
```bash
# From project root
npm install axios -w src/modules/my-new-module
```

**Cross-Module Importing (Workspaces):**
Because Astrical uses **NPM Workspaces**, the `name` field in your module's `package.json` allows it to be imported anywhere.

1.  In `src/modules/my-new-module/package.json`:
    ```json
    {
      "name": "@astrical/my-new-module"
    }
    ```
2.  In another module (e.g., `src/modules/other-module`):
    ```typescript
    import { SharedLogic } from '@astrical/my-new-module';
    ```

### Step 5: Add Backend (Optional)
Create `src/pages/api/payment/process.ts`.
*   This becomes accessible at `YOUR_SITE/api/payment/process`.
*   **Rule**: Always namespace your APIs (`/api/[module-name]/...`) to avoid collisions.

### Step 4: Add Default Content (Optional)
Create `content/pages/checkout.yaml`.
```yaml
metadata:
  title: Checkout
sections:
  - layout: SingleColumn
    components:
      main:
        - type: PaymentForm # This refers to your new widget!
```

---

## 5. Developer Rules

> [!IMPORTANT]
> **Strict Isolation**: Never import code from `src/core/src/components/*` directly if you can avoid it. Use the aliases `~/components/...`.

> [!WARNING]
> **Namespace**: Prefix your component IDs and API routes with your module name to prevent collisions with other modules.
> *   Good: `id="stripe-checkout-form"`
> *   Bad: `id="form"`

---

## 6. Guide References
*   `dev/architecture.rst`: Core system design.
*   `dev/component_dev.rst`: How to write valid Astro components.
*   `dev/content_management.rst`: YAML content rules.
*   `dev/theme_design.rst`: Styling logic.
