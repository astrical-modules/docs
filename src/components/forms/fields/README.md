# Form Fields: AI Operations Manual

**Target Audience:** AI Agents & Module Developers  
**Scope:** `src/components/forms/fields` (and module equivalents).

This document details the architecture of **Form Fields**, which are plug-and-play components injected into the central `Form` widget.

---

## 1. Core Concept: Auto-Discovery & Injection

Form fields operate on a "Plug-and-Play" architecture. You typically **never** use these components directly in a page or widget. Instead, they are dynamically instantiated by the `Form` component based on configuration.

### The Mechanism
1.  **YAML Config**: A user defines a field in `content/pages/contact.yaml`:
    ```yaml
   sections:
     - type: Form
       name: contact_form
       title: Contact Us
       fields:
         - type: ShortText
           name: name
           label: Name
           required: true
         - type: MyCustomField # <--- Your new field
           name: custom_data
           label: Enter Data
    ```
2.  **Auto-Discovery**: The system (`src/components.ts`) scans specifically for `MyCustomField.astro` in both core and module form directories.
3.  **Injection**: The `Form` component uses `getFormField` to match `type: MyCustomField` -> `MyCustomField.astro`.

---

## 2. Implementation Pattern

Every form field must adhere to the `BaseField` interface to ensure it receives data correctly from the parent Form.

### Mandatory Requirements
1.  **Extend `BaseField`**: Props must include `name`, `label`, `required`, `value`, `error`.
2.  **Use `FormLabel` & `FormError`**: You **must** delegate label rendering and error display to these standard components to maintain accessibility and consistency.
3.  **Naming Convention**: The filename **MUST** obtain PascalCase (e.g., `LongText.astro`) and match the `type` used in YAML.

### Boilerplate Template
```astro
---
// src/components/forms/fields/MyCustomField.astro
import type { BaseField } from '~/types';
import FormLabel from '~/components/forms/FormLabel.astro';
import FormError from '~/components/forms/FormError.astro';
import { getClasses } from '~/utils/theme';

export interface Props extends BaseField {
  // Add custom props here
  placeholder?: string;
}

const { 
  name, 
  label = '', 
  required = false, 
  value = undefined, 
  error = undefined, // CACHE: Error message passed from server state
  placeholder = '' 
} = Astro.props;

const classes = getClasses('Form+MyCustomField');
---

<div class={classes.container}>
  <FormLabel name={name} label={label} required={required} />
  
  <input
    type="text"
    name={name}
    id={name}
    value={value}
    placeholder={placeholder}
    class={classes.input}
    {...required ? { required: 'true' } : {}}
  />

  <FormError id={`${name}-error`} />
</div>
```

---

## 3. Module Integration

Modules can add new input types to the global Form system.

**Location:** `src/modules/[module-name]/src/components/forms/`

### How to Add a New Field
1.  **Create File**: Place `ReviewStars.astro` in your module's forms directory.
2.  **That's it**: The `import.meta.glob` pattern in `src/components.ts` will automatically detect it.
3.  **Usage**: Users can now use `type: ReviewStars` in any form configuration in the system.

> [!WARNING]
> Ensure your field name is unique. If a module defines `ShortText.astro`, it might conflict with the core `ShortText`. Prefixing (e.g., `ModuleShortText`) is recommended if collision is likely.

---

## 4. Reference Material

*   **`src/components/forms/Form.astro`**: The parent component that orchestrates validation and submission.
*   **`src/components/forms/fields/ShortText.astro`**: The reference implementation for a standard input.
*   **`src/utils/generator.ts`**: Contains the `getFormField` logic.

---

*This file is machine-readable context for AI agents building dynamic form inputs.*
