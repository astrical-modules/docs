Lets discuss the Figure or Media widget.  First which one of those should it be called?  How should this widget work actually and what features should it have?

---------------------------------------------

### Naming Verdict: **`Figure`**

You should call this widget **`Figure`**.

* **Semantic Accuracy:** In HTML, the `<figure>` element is specifically designed for "self-contained content" like illustrations, diagrams, or code snippets that are referenced in the main flow.
* **Documentation Standard:** Technical writing uses the term "Figure" (e.g., "See Figure 2.1").
* **Scope:** "Media" is too broad and often implies external embeds (YouTube, Tweet, Podcast). "Figure" implies an asset that is *part* of the documentation's hosted content.

---

### Feature Set & Behavior

The `Figure` widget in a documentation context needs to be smarter than a simple `<img>` tag. It needs to solve specific readability problems found in technical docs.

Here are the 5 critical features this widget must have:

#### 1. Native Lightbox (Zoom)

Technical diagrams and screenshots often have small text.

* **Feature:** If the image is larger than the container, clicking it should open a full-screen modal (Lightbox).
* **Default:** `true` for all images unless disabled.

#### 2. Dark Mode Intelligence

This is a huge pain point in docs. If you have a transparent PNG diagram with black text, it disappears on a dark background. If you have a blindingly white screenshot on a dark mode site, it hurts the user's eyes.

* **Feature:** A prop to control how the image behaves in dark mode.
* `invert`: Inverts colors (good for simple line charts).
* `dim`: Slightly reduces opacity/brightness to reduce glare.
* `background`: Forces a white background container behind a transparent image.



#### 3. Semantic Captions

* **Feature:** Renders a `<figcaption>` below the image.
* **Logic:** The caption should be smaller text, centered, and distinct from the prose. This text is searchable.

#### 4. Layout Constraints (CLS Protection)

* **Feature:** Accept an `aspectRatio` or strict dimensions to prevent "Cumulative Layout Shift" (the text jumping around while the image loads). Astro's native `<Image />` component handles this well, but the widget needs to expose these props.

#### 5. "Figure Numbering" (Advanced/Optional)

* **Feature:** If enabled in the module config, the `DocsLayout` could count the figures and auto-prepend "Figure 1:", "Figure 2:" to the captions.

---

### The Schema (YAML)

Here is how the AI (or developer) would define a Figure in `content/pages/docs/xyz.yaml`.

```yaml
- type: Figure
  # The Core Data
  src: /images/architecture/data-flow.png
  alt: Diagram showing data flowing from Client to API to Database
  caption: "Figure 1: High-level data architecture"
  
  # Layout & Behavior
  size: standard       # Options: small, standard, wide, full
  lightbox: true       # Default: true
  
  # Dark Mode Handling
  themeMode: adaptive  # Options: normal, dim, invert, white-bg

```

### The Implementation (`Figure.astro`)

This component wraps the Astro core `<Image />` for optimization but adds the logic for captions and layout.

```astro
---
// modules/docs/src/components/widgets/Figure.astro
import { Image } from 'astro:assets';
import { getClasses } from '~/utils/theme';

interface Props {
  src: string | object; // String for public/, Object for imported assets
  alt: string;
  caption?: string;
  size?: 'small' | 'standard' | 'wide' | 'full';
  themeMode?: 'normal' | 'dim' | 'invert' | 'white-bg';
  lightbox?: boolean;
  id?: string;
}

const { 
  src, 
  alt, 
  caption, 
  size = 'standard', 
  themeMode = 'normal', 
  lightbox = true,
  id 
} = Astro.props;

// Map sizes to Tailwind max-widths
const sizeClasses = {
  small: 'max-w-sm',
  standard: 'max-w-3xl',
  wide: 'max-w-5xl',
  full: 'w-full'
};

// Map theme modes to CSS filters/classes
const themeClasses = {
  normal: '',
  dim: 'dark:opacity-80 dark:brightness-90', // Reduce glare
  invert: 'dark:invert', // Flip colors for diagrams
  'white-bg': 'dark:bg-white dark:p-2 dark:rounded' // Force visibility
};

// Unique ID for lightbox target
const figureId = id || `fig-${Math.random().toString(36).substr(2, 9)}`;
---

<figure class={`mx-auto my-8 flex flex-col items-center ${sizeClasses[size]}`} id={figureId}>
  
  {/* Image Wrapper (Handles Lightbox Trigger) */}
  <div 
    class={`relative overflow-hidden rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 ${themeClasses[themeMode]} ${lightbox ? 'cursor-zoom-in' : ''}`}
    onclick={lightbox ? `window.openLightbox('${figureId}')` : undefined} // Simple trigger example
  >
    {/* Note: In a real module, you'd use a dynamic import or 
      pass the Image Metadata object to utilize Astro's optimization. 
      For 'public/' folder strings, standard <img> is often used, 
      but Astro <Image> is preferred if imports are possible.
    */}
    <img 
      src={src} 
      alt={alt} 
      class="h-auto w-full object-contain" 
      loading="lazy" 
      decoding="async"
    />
  </div>

  {/* Caption */}
  {caption && (
    <figcaption class="mt-3 text-sm text-center text-gray-500 dark:text-gray-400 font-medium">
      {caption}
    </figcaption>
  )}

</figure>

{/* Ideally, the Lightbox Modal HTML/JS resides in the Layout, 
  not repeated in every widget. The widget just triggers it.
*/}

```

### Strategic Note on "Video"

I recommend **excluding video** from the `Figure` widget.

If you try to make `Figure` handle `.mp4` or YouTube, the schema gets messy (`src` vs `videoId`, `poster`, `autoplay` props).

* Keep `Figure` for static visual assets (Screenshots, Diagrams).
* Use the existing `VideoPlayer` (from Marketing) or a new `Video` widget for moving media.

This separation keeps the `Figure` component pure and strictly focused on the "Technical Diagram/Screenshot" use case, which is 90% of documentation media.
