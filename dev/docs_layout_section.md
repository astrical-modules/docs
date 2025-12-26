Can you describe more about the DocsLayout section component?  How exactly does that work?

---------------------------------------------

This is the most critical component in your new module. In the core marketing module, a "Section" (`SingleColumn`, `Hero`) is just a **Layout Container**—it strictly handles CSS grid placement.

In `@astrical/docs`, the `DocsLayout` is a **Logic Controller**. It doesn't just display its children; it inspects them, indexes them, and orchestrates the navigation state for the entire page.

Here is the architectural breakdown of how `DocsLayout` works.

### 1. The Core Concept: "Introspective Rendering"

Standard components render blindly: "I have a list of widgets, I will loop through and print them."

`DocsLayout` performs a **Pre-Flight Analysis** on the data before rendering the HTML. Because you are using YAML, the entire page structure is available as a raw JSON object (`Astro.props.components`).

The layout reads this object to build the **Table of Contents (TOC)** dynamically. It extracts the `title` or `id` from every widget in the list to construct the "Right Sidebar" navigation automatically.

### 2. The Anatomy of `DocsLayout`

The layout creates a standard 3-column "Holy Grail" documentation structure:

1. **Left Column (Context Navigation):**
* **Source:** Loads a specific YAML file from `modules/docs/content/shared/menus/` (e.g., `api_sidebar.yaml`).
* **Logic:** It highlights the current page and handles the collapse/expand state of nested categories.


2. **Center Column (The Feed):**
* **Source:** The `components` array from your page YAML.
* **Logic:** It wraps every widget in a semantic `<section>` tag with an auto-generated HTML `id`. This allows "Deep Linking" (e.g., `docs/api#authentication`).


3. **Right Column (On-Page Navigation):**
* **Source:** Derived *computed data* from the Center Column.
* **Logic:** A sticky list of links that scrolls the user to specific widgets.



### 3. How the "Pre-Flight" Logic Works

This is the "Secret Sauce" that makes the YAML approach powerful.

**The Data Flow:**

1. **Input:** The layout receives `components: { main: [WidgetA, WidgetB, WidgetC] }`.
2. **Extraction:** It maps over this array to create a `tocItems` array.
* If Widget is `Endpoint`, use `props.title` or `props.path`.
* If Widget is `DefinitionTable`, use `props.title`.
* If Widget is `Prose`, use `props.title` (which serves as the H2).


3. **Anchor Generation:** It assigns a "slugified" ID to every widget if one wasn't manually provided (e.g., "Authentication" -> `#authentication`).
4. **Injection:** It passes this ID *down* into the widget so the widget knows its own anchor.

### 4. Implementation Blueprint

Here is the pseudo-code for `modules/docs/src/components/sections/DocsLayout.astro`:

```astro
---
// modules/docs/src/components/sections/DocsLayout.astro
import { fetchMenu } from '~/utils/menus';
import { slugify } from '~/utils/text';
import WidgetRenderer from '~/components/WidgetRenderer.astro';

// 1. Get Props
const { sidebar, components } = Astro.props;

// 2. Load Left Sidebar Data
const menuData = await fetchMenu(sidebar);

// 3. GENERATE TABLE OF CONTENTS (The "Introspection")
// We iterate over the widgets defined in the YAML to build the TOC.
const tocItems = components.main.map((widget, index) => {
  // Use the widget's manual ID, or fallback to slugifying the title
  const id = widget.id || slugify(widget.title || `section-${index}`);
  
  // Return metadata for the Right Sidebar
  return {
    id: id,
    label: widget.title || widget.name || 'Untitled Section',
    type: widget.type // We can style TOC items differently based on type!
  };
});

// 4. PREPARE WIDGETS
// We attach the calculated IDs back to the widgets so they render with the right anchor.
const enrichedWidgets = components.main.map((widget, index) => ({
  ...widget,
  id: tocItems[index].id // Inject the ID
}));
---

<div class="docs-grid-container">
  
  <aside class="docs-sidebar-left">
    <nav>
      {/* Recursive Menu Component */}
      <SidebarMenu data={menuData} activeSlug={Astro.url.pathname} />
    </nav>
  </aside>

  <main class="docs-content">
    
    {/* Page Title (H1) often lives in metadata, or passed as a prop */}
    <h1>{Astro.props.metadata?.title}</h1>

    {/* Render the Widgets sequentially */}
    {enrichedWidgets.map((widget) => (
      <section id={widget.id} class="docs-section-wrapper">
        
        {/* Render the actual widget (Prose, Endpoint, Table) */}
        <WidgetRenderer widget={widget} />
        
        {/* Optional: Add an "Edit this section" link for AI? */}
      </section>
    ))}
  </main>

  <aside class="docs-sidebar-right">
    <div class="sticky-toc">
      <p class="toc-header">On this page</p>
      <ul>
        {tocItems.map((item) => (
          <li>
            <a href={`#${item.id}`} class={`toc-link toc-type-${item.type.toLowerCase()}`}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </aside>

</div>

```

### 5. Why this is "Better" than MDX

In a standard MDX file, the TOC is generated by parsing the HTML headers (`<h2>`, `<h3>`). This is messy and fragile.

In your approach:

1. **Explicit Structure:** A TOC entry exists *only* if a Widget exists. You have 1:1 parity between your data model and your navigation.
2. **Type-Aware Navigation:** Notice `toc-type-${item.type}` in the code above? You can style your TOC so that `Endpoint` links look different from `Prose` links (e.g., put a small `GET` or `POST` badge *inside* the Table of Contents).
3. **Atomic Linking:** You solve the "Deep Linking" problem automatically. Every widget gets a unique URL hash (`#parameters`, `#response-example`) without the user (or AI) having to manually write `<a name="...">`.

### 6. The "Prose" Nuance

You might ask: *"What if I have sub-headers inside a `Prose` widget?"*

**Strategy:** Enforce **Atomic Widgets**.

* **Don't do this:** One giant `Prose` widget with H2s, H3s, and H4s inside.
* **Do this:** Break it up.
* Widget 1: `Prose` (Title: "Introduction")
* Widget 2: `Prose` (Title: "Key Concepts")
* Widget 3: `DefinitionTable` (Title: "Terminology")

This forces the AI to structure the document logically rather than dumping a text blob. This makes the documentation infinitely more maintainable and queryable.

---------------------------------------------

I like that a lot.  This is exactly the type of benefit I was hoping to get from this platform.  One question. Would it be better to use auto page scanning for the table of contents instead of loading a menu?  All of the content pages are loaded by the config plugin content scanner so they are available.  This would take some of the responsibility off of the AI but we do end up with a potential problem of ordering or showing hidden pages not relevant to the documentation.

---------------------------------------------

This is a classic "CMS Architecture" debate: **Implicit Structure (Filesystem)** vs. **Explicit Structure (Config).**

To be brutally honest: **Auto-scanning is a trap for documentation sites.**

While it feels easier at first ("Look, no hands!"), it shifts the burden from **"Updating one menu file"** to **"Managing metadata across 100 files."**

Here is why you should stick to the **Explicit Menu (YAML)** approach for `@astrical/docs`, specifically for an AI-driven workflow.

### 1. The "Ordering" Nightmare

Documentation is narrative. It must be read in a specific order: *Introduction -> Installation -> Hello World -> Advanced*.
The filesystem is alphabetical. `Advanced.yaml` comes before `Hello World.yaml`.

**If you use Auto-Scanning:**
You force the AI to manage a `weight` or `order` integer inside *every single page's metadata*.

* To insert a page between step 2 and 3, the AI has to find step 3, change it to 4, find step 4, change it to 5, etc.
* This is a massive amount of file I/O and potential for conflict.

**If you use Explicit YAML:**
The AI simply inserts a line in the array in `docs_sidebar.yaml`. The order of the array *is* the order of the site. It is O(1) complexity vs O(N).

### 2. The AI Context Window Advantage

You mentioned you like "Data Dumps" and aggregation.

* **Explicit Menu:** The AI reads **one file** (`docs_structure.yaml`) and instantly understands the entire topology of your documentation, the hierarchy, and the relationships.
* **Auto-Scan:** To understand the site structure, the AI (or your build script) must scan and parse **every single file** in the directory tree to read the titles and weights.

For an AI agent, having a "Master Map" is significantly more efficient than having to "Walk the Territory."

### 3. "Abstract" Containers

Documentation often needs grouping labels in the sidebar that are **not** pages themselves.

* **API Reference** (Label, not a link)
* **Endpoints** (Link)
* **Schemas** (Link)



Auto-scanning file systems struggle with this. You usually end up creating "Empty" pages just to create a folder structure. In a YAML menu, it's just an object: `{ label: "API Reference", items: [...] }`.

---

### The Recommended Hybrid Strategy: "Strict Mode"

Stick with the explicit menu loading in `DocsLayout`, but enforce a strict relationship to make it easier for the AI.

**The Strategy:**
The `DocsLayout` requires a prop called `sidebar` (which points to a shared YAML file).

**How it works in `src/components/sections/DocsLayout.astro`:**

1. **Load the Map:** It loads the definition file (e.g., `modules/docs/content/shared/sidebar_api.yaml`).
2. **Match the Active State:** It compares `Astro.url.pathname` against the links in that YAML file to figure out "Where am I?"
3. **Render:** It renders the Sidebar.

**The "Orphan" Check (The Safety Net):**
You mentioned the risk of "hidden pages." You can add a build-time script (`scripts/validate-docs.ts`) that:

1. Scans all files in `content/pages/docs/`.
2. Scans all links in `content/shared/sidebar_*.yaml`.
3. **Throws a Warning** if a page exists in the filesystem but is NOT referenced in any sidebar.

This gives you the best of both worlds: **Explicit Control** over the structure, with **Automated Safety** ensuring nothing gets lost.

### Updated `DocsLayout` Logic

Here is how `DocsLayout` handles the Left Sidebar (Menu) vs. the Right Sidebar (TOC).

```astro
---
// modules/docs/src/components/sections/DocsLayout.astro
import { fetchMenu } from '~/utils/menus';
import { generateTOC } from '~/utils/docs';

const { sidebar, components } = Astro.props;

// 1. LEFT COLUMN: Explicit Control (The "Master Map")
// We fetch the specific navigation tree assigned to this page.
// This allows you to have different sidebars for "User Guide" vs "API".
const sidebarData = await fetchMenu(sidebar); 

// 2. RIGHT COLUMN: Auto-Generated (The "Introspection")
// We scan the widgets ON THIS PAGE to build the table of contents.
// This is safe to auto-scan because order = render order.
const tocData = generateTOC(components.main); 
---

```

**Verdict:** Do not use auto-scanning for the site hierarchy. It makes re-ordering pages painful and dilutes the AI's understanding of the site structure. Stick to the "Master Manifest" file in `content/shared/`.

---------------------------------------------

That makes total sense.  The DocsLayout could also have back and next button navigation with this structure below the widget content area.

---------------------------------------------

This is precisely the payoff of the **Explicit Menu** strategy. Because `DocsLayout` holds the "Master Map" in memory, it possesses **Global Context Awareness**, something a filesystem scan struggles to provide efficiently.

By knowing the entire tree, the layout can calculate linear progression through the documentation, regardless of folder structure.

Here is how the "Next/Previous" logic fits into the `DocsLayout` architecture.

### 1. The Algorithm: "Flatten & Find"

The sidebar data is a nested tree (Sections -> Categories -> Pages). To generate linear navigation, the layout must:

1. **Flatten** the tree into a single array of linkable items.
2. **Find** the index of the current page in that array.
3. **Select** the items at `index - 1` and `index + 1`.

This handles complex edge cases automatically:

* **Crossing Categories:** If you are at the *end* of "Getting Started," the "Next" button correctly jumps to the *start* of "Configuration."
* **Skipping Labels:** It ignores non-clickable category headers and only links to actual content.

### 2. The Logic Implementation

You can implement this as a utility in your module.

```typescript
// modules/docs/src/utils/navigation.ts

export function getPagination(menuData, currentPath) {
  // 1. Flatten the recursive tree into a linear list of links
  const flatList = [];
  
  function traverse(items) {
    for (const item of items) {
      if (item.href) flatList.push(item); // Only add linkable items
      if (item.items) traverse(item.items); // Recursion
    }
  }
  traverse(menuData.items);

  // 2. Find current position
  const currentIndex = flatList.findIndex(item => item.href === currentPath);

  // 3. Return neighbors (handling nulls for first/last page)
  return {
    prev: currentIndex > 0 ? flatList[currentIndex - 1] : null,
    next: currentIndex < flatList.length - 1 ? flatList[currentIndex + 1] : null
  };
}

```

### 3. The Visual Placement

In your layout, these buttons sit inside the **Center Column**, immediately after the `enrichedWidgets` loop but before the comments or footer.

### 4. The Final Anatomy of `DocsLayout`

Your `DocsLayout` has evolved from a simple container into a sophisticated **Orchestration Engine**.

Here is the complete responsibility matrix for this component in `@astrical/docs`:

| Area | Feature | Source Data | Logic Responsibility |
| --- | --- | --- | --- |
| **Left Column** | **Context Sidebar** | `sidebar_*.yaml` | Highlights active page; expands active category. |
| **Center Column** | **Widget Feed** | `page.yaml` | Renders widgets; injects ID anchors for deep linking. |
| **Center Bottom** | **Pagination** | `sidebar_*.yaml` + `URL` | Calculates Prev/Next links across categories. |
| **Right Column** | **Table of Contents** | `page.yaml` (Widgets) | Scans widgets to build on-page navigation list. |
| **Meta** | **Breadcrumbs** | `sidebar_*.yaml` | Traces the path from Root -> Category -> Page. |

### 5. Mobile Considerations

One detail often missed in this architecture is the mobile view.

* **Desktop:** 3 Columns.
* **Mobile:** 1 Column. The **Left Sidebar** (Menu) usually collapses into a "Hamburger" drawer, and the **Right Sidebar** (TOC) often moves to the *top* of the content as a collapsible "On this page" dropdown.
* **Pagination:** The "Next" button is **critical** on mobile because clicking small sidebar links is difficult. It becomes the primary navigation method.

### Conclusion of Strategy

You have successfully defined a robust architecture for `@astrical/docs` that solves the friction points of the core marketing engine without breaking the "Pure YAML" philosophy.

**Your Module Manifest:**

1. **Layout:** `DocsLayout` (The Brains)
2. **Widgets:** `Prose`, `DefinitionTable`, `Endpoint`, `CodeWindow` (The Atoms)
3. **Data:** `sidebar_*.yaml` (The Map)

**Next Step:**
Would you like to move on to defining the **YAML Schema** (`dev/docs.spec.yaml`) for these new widgets? This is the "Contract" that will ensure the AI generates valid documentation data.