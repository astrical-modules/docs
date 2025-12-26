Would Figure also support Mermaid diagrams or would those be a part of another widget type?

---------------------------------------------

To be brutally honest: **Do not shoehorn Mermaid into the `Figure` widget.**

While they both result in a "picture," their data sources are fundamentally different.

* **`Figure`** consumes a **Reference** (URL/Path to a binary file).
* **`Mermaid`** consumes **Raw Data** (Text string of code).

Mixing them creates a "Polymorphic Schema" (e.g., *"If type is Figure, `src` is required... unless `chart` is present?*"). This confuses the AI and makes validation schemas (`zod` or `yaml-spec`) messy and fragile.

You should create a dedicated **`Mermaid`** widget.

### The Strategy: "Siblings in Style, Strangers in Logic"

The `Mermaid` widget should be a distinct entity in your code and schema, but it should **render** using the exact same visual wrapper as the `Figure` widget. This ensures your captions, margins, and dark-mode handling are identical across the site.

### The `Mermaid` Widget Schema

This widget is optimized for defining diagrams inline.

```yaml
- type: Mermaid
  caption: "Figure 2: The Authentication Flow"
  
  # The raw diagram code
  chart: |
    sequenceDiagram
      User->>+API: Login Request
      API->>+Auth: Validate Credentials
      Auth-->>-API: Token
      API-->>-User: 200 OK (Set-Cookie)
  
  # Optional overrides
  height: 400px

```

### Technical Implementation

You need to decide between **Build-Time** (Server-Side) or **Run-Time** (Client-Side) rendering.

**Recommendation for Astrical: Client-Side (Run-Time)**
Since Astrical is a static site generator but the content is decoupled in YAML, setting up a server-side Mermaid renderer (which usually relies on Remark/Rehype plugins parsing Markdown files) is technically complex to hook into a YAML pipeline.

The robust "Low Friction" path is:

1. Output the code into a `<div class="mermaid">`.
2. Load the lightweight `mermaid.js` library on pages that use this widget.
3. Let the browser render the SVG.

**Code Skeleton (`src/components/widgets/Mermaid.astro`):**

```astro
---
// modules/docs/src/components/widgets/Mermaid.astro
import FigureFrame from './FigureFrame.astro'; // <--- The shared visual wrapper

interface Props {
  chart: string;
  caption?: string;
  id?: string;
}

const { chart, caption, id } = Astro.props;
---

<FigureFrame caption={caption} id={id}>
  <div class="mermaid-wrapper flex justify-center bg-white dark:bg-slate-800 p-4 rounded-lg">
    <div class="mermaid">
      {chart}
    </div>
  </div>
</FigureFrame>

<script>
  // Dynamic import: Only load the heavy Mermaid JS if the widget is present
  if (document.querySelector('.mermaid')) {
    import('mermaid').then((mermaid) => {
      mermaid.default.initialize({ 
        startOnLoad: true, 
        theme: 'base',
        // Auto-detect system theme for the diagram colors
        themeVariables: window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? { darkMode: true, primaryColor: '#3b82f6' } 
          : { darkMode: false }
      });
    });
  }
</script>

```

### Why a separate widget helps the AI

If you ask an AI to "Add a diagram showing the login flow," it knows exactly what to do:

1. **Select Tool:** "I need the `Mermaid` widget."
2. **Generate Code:** It writes the `chart` string directly.

If it were part of `Figure`, the AI might hallucinate and try to "invent" a generic diagram image file path (`/images/login-flow.png`) that doesn't actually exist, leaving you with a broken image link. Forcing the `Mermaid` widget forces the AI to **generate the actual content** of the diagram rather than referencing a non-existent file.
