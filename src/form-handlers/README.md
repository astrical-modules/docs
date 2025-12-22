# Form Handlers: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src/form-handlers` (and module equivalents).

This document details the architecture of **Form Handlers**, which provide pluggable submission processing logic (e.g., sending emails, saving to database) for the `submit-form` API.

---

## 1. Core Concept: Server-Side Plugin Architecture

Unlike frontend components, Form Handlers are **pure TypeScript classes** that run on the server. They are responsible for taking the processed form data and doing something useful with it.

### The Lifecycle
1.  **Submission**: User submits form.
2.  **API Endpoint**: `/api/submit-form` receives the POST request.
3.  **Processing**: `src/utils/forms.ts` validates the data.
4.  **Routing**: The processor looks for a handler matching the form's configuration or system defaults.
5.  **Execution**: The specific `FormHandler` class is instantiated and its `handle()` method is called.

---

## 2. Implementation Pattern

Every handler must implement the `FormHandler` interface.

### The Interface
```typescript
interface FormHandler {
  name: string;        // Unique ID (e.g., 'mailgun', 'zapier')
  description: string; // Human readable description
  handle(
    formName: string,
    data: Record<string, string | string[]>,
    attachments: { filename: string; data: Uint8Array }[],
    config?: Record<string, any>
  ): Promise<void>;
}
```

### Boilerplate Template
```typescript
// src/form-handlers/MyHandler.ts
import type { FormHandler } from '~/types';

export class MyCustomHandler implements FormHandler {
  name = 'my-custom-handler';
  description = 'Sends data to an external CRM';

  async handle(
    formName: string, 
    data: Record<string, string | string[]>, 
    attachments: unknown[], 
    config?: { apiKey?: string }
  ): Promise<void> {
    
    // 1. Validate Configuration
    if (!config?.apiKey) {
      console.warn(`MyCustomHandler: Missing API key for form ${formName}`);
      return;
    }

    // 2. Process Data
    console.log(`Processing form ${formName} with data:`, data);

    // 3. Perform Async Operation (e.g., fetch)
    // await fetch('https://api.my-crm.com', ...);
  }
}
```

---

## 3. Module Integration

Modules can add new backend processing capabilities.

**Location:** `src/modules/[module-name]/src/form-handlers/`

### Auto-Discovery
The `FormHandlerRegistry` (`src/form-registry.ts`) uses `import.meta.glob` to automatically load any `.ts` file in the `form-handlers` directories of modules.

1.  **Create File**: `src/modules/my-module/src/form-handlers/slack.ts`
2.  **Export Class**: Ensure the file exports a class implementing `FormHandler`.
3.  **Registration**: The system detects the file, instantiates the class, and registers it under its `name` property.

> [!WARNING]
> Handler names must be global unique. If two handlers claim the name `email`, the registry will warn and likely keep the first one loaded. Use namespacing (e.g., `module-name-email`) if conflicts are possible.

---

## 4. Reference Material

*   **`src/form-registry.ts`**: The discovery and registration logic.
*   **`src/form-handlers/mailgun.ts`**: Reference implementation sending emails via Mailgun.
*   **`src/pages/api/submit-form.ts`**: The entry point for all form submissions.

---

*This file is machine-readable context for AI agents building backend form processors.*
