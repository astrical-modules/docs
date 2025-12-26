Makes sense.  Lets move on to the DefinitionTable.  Describe in detail how that works.

---------------------------------------------

The `DefinitionTable` is the workhorse of technical documentation. In a standard Markdown ecosystem, tables are fragile text grids that are painful to maintain and impossible to query.

In Astrical’s `@astrical/docs` module, the `DefinitionTable` transforms this chaos into a **Structured Dataset**. It is not just a visual grid; it is a semantic list of properties, arguments, or configurations.

Here is the detailed breakdown of how this widget works, its schema, and its specific rendering logic.

### 1. The Core Philosophy: "Objects, Not Arrays"

Most Markdown tables are defined as arrays of strings (Row 1, Row 2). This is bad for AI and validation because position matters (e.g., "Is the 3rd column the description or the default value?").

The `DefinitionTable` uses an **Array of Objects** strategy.

* **Safety:** The AI defines `{ name: "limit", type: "integer" }`. The order of keys doesn't matter.
* **Flexibility:** You can add extra metadata (like an internal ID or deprecation notice) to a row without breaking the visual table if that column isn't displayed.

### 2. The Schema (YAML)

This is what the AI generates in your content file.

```yaml
- type: DefinitionTable
  title: "Configuration Options"
  id: "config-options" # For deep linking
  
  # 1. Define the Columns (Visual Order)
  # 'key' matches the data object property. 'label' is the header text.
  columns:
    - key: name
      label: Variable
      format: code      # Options: text, code, badge, markdown
    - key: type
      label: Type
      format: badge     # Renders as a colored pill
    - key: required
      label: Required
      format: boolean   # Renders a Check or Dash
    - key: description
      label: Description
      format: markdown  # Allows links/bold inside the cell
  
  # 2. The Data (The Content)
  rows:
    - name: API_KEY
      type: string
      required: true
      description: "Your **private** API key."
    - name: TIMEOUT_MS
      type: integer
      required: false
      description: "Request timeout in milliseconds. Default: `5000`."

```

### 3. Rendering Logic (`DefinitionTable.astro`)

The component needs to be smarter than a simple loop. It needs **Cell Formatters**.

**A. The "Badge" Formatter**
Technical docs often show types (`string`, `boolean`, `int`). The table should automatically detect these known keywords and apply color-coding.

* `string`: Green
* `boolean`: Blue
* `integer`: Orange
* `object`: Purple

**B. The "Code" Formatter**
Any column marked as `format: code` (like the variable name) should automatically be wrapped in `<code>` tags with a copy-to-clipboard button on hover.

**C. The "Boolean" Formatter**
Instead of printing "true/false", it renders semantic icons:

* `true` -> ✅ (or a solid dot)
* `false` -> Optional (or a hollow ring)

### 4. The Mobile Strategy (Critical)

Tables are the #1 cause of broken layouts on mobile devices. You cannot just "squish" a 5-column table.

**The Strategy: "Table-to-Card" Transformation**
When the viewport shrinks (CSS Media Query):

1. Hide the `<thead>`.
2. Turn every `<tr>` into a Block (Card).
3. Turn every `<td>` into a Flex row.
4. Inject the **Column Header** as a pseudo-element before the cell content so the user knows what the data is.

**Result:**
Instead of a horizontal scroll (which users hate), they get a vertical list of definition cards.

### 5. AI Operations & Indexing

Because this is structured data, you unlock powerful capabilities for the AI Agent managing the site:

1. **Validation:** You can define a JSON Schema that says: *"If the table title includes 'Parameters', the 'Type' column is mandatory."* The AI cannot forget to document the type.
2. **Aggregation:** Your `exporter.ts` script can scan all `DefinitionTable` widgets across the entire documentation site to build a global **"Configuration Reference"** page automatically. It just concatenates all rows where `columns` includes `Variable`.

### 6. Code Blueprint

Here is the logic for the component:

```astro
---
// modules/docs/src/components/widgets/DefinitionTable.astro
import { Icon } from 'astro-icon/components';
import { parseMarkdown } from '~/utils/markdown';

const { title, id, columns, rows } = Astro.props;
---

<div class="definition-table-wrapper my-8" id={id}>
  {title && <h3 class="text-lg font-bold mb-4">{title}</h3>}
  
  <div class="overflow-hidden border rounded-lg dark:border-gray-700">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      
      {/* Header */}
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          {columns.map(col => (
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>

      {/* Body */}
      <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
        {rows.map(row => (
          <tr>
            {columns.map(col => {
              const value = row[col.key];
              
              return (
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-900 dark:text-gray-100">
                  
                  {/* Logic for Formats */}
                  {col.format === 'code' && (
                    <code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-red-500 font-mono">
                      {value}
                    </code>
                  )}
                  
                  {col.format === 'badge' && (
                    <span class={`badge badge-${value.toLowerCase()}`}>
                      {value}
                    </span>
                  )}
                  
                  {col.format === 'markdown' && (
                    <div class="prose-sm" set:html={parseMarkdown(value)} />
                  )}
                  
                  {/* Default Text */}
                  {!['code', 'badge', 'markdown'].includes(col.format) && value}
                  
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

```

This widget ensures that your "Reference" documentation is consistent, mobile-friendly, and machine-readable, solving the major pain points of standard Markdown tables.
