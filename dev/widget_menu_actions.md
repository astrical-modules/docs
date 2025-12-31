I guess I need to figure out how to add new components to the header from a module in the core.

---------------------------------------------

This is the final piece of the puzzle. You are hitting on a limitation of the current "Marketing-First" Core: the Header assumes "Actions" are simple Links (buttons with an `href`).

To support a Search Trigger (which is a generic Component, not a Link), you need to upgrade the **Core Header** to be **Polymorphic**.

It needs to understand that an item in the "Actions" menu can be *either* a standard `Button` *or* a dynamic `Widget`.

Here is the strategy to enable **"Module Injection"** into the Core Header without hardcoding module logic into the core.

### 1. The Strategy: Polymorphic `actions.yaml`

Currently, your `content/menus/actions.yaml` looks like this:

```yaml
- text: Download
  href: /download
  variant: primary

```

We will upgrade the schema to support a **Component Reference**:

```yaml
# content/menus/actions.yaml

# Item 1: Standard Link (Core handles this)
- text: "GitHub"
  href: "https://github.com/..."
  variant: secondary

# Item 2: Module Component (Injected)
- type: Component
  component: "docs/SearchBar" # <--- References modules/docs/src/components/widgets/SearchBar.astro

```

### 2. The Core Update (`src/components/page/Header.astro`)

You need to modify the Core Header to handle this new type. You will reuse the `WidgetRenderer` (or whatever logic you use to render widgets in page sections) inside the Header.

**`src/components/page/Header.astro`**

```astro
---
import Logo from '~/components/Logo.astro';
import ToggleMenu from '~/components/common/ToggleMenu.astro';
import Button from '~/components/ui/Button.astro';
import WidgetRenderer from '~/components/WidgetRenderer.astro'; // <--- Reuse the widget loader

import { getHomePermalink } from '~/utils/permalinks';
import { trimSlash } from '~/utils/permalinks';

interface Props {
  links?: Array<MenuLink>;
  actions?: Array<ActionLink | ComponentReference>; // <--- Update Type
  isSticky?: boolean;
  // ...
}

const { links = [], actions = [], isSticky = false } = Astro.props;
---

<header class:list={[{ sticky: isSticky, relative: !isSticky }, 'top-0 z-40 flex-none mx-auto w-full transition-all ease-in-out']}>
  <div class="py-3 px-3 md:px-6 mx-auto w-full md:flex md:justify-between max-w-7xl">
    
    <div class="flex justify-between">
      <a class="flex items-center" href={getHomePermalink()}>
        <Logo />
      </a>
      <div class="flex items-center md:hidden">
        <ToggleMenu />
      </div>
    </div>

    <div class="hidden md:self-center md:flex items-center md:mb-0 fixed w-full md:w-auto md:static justify-end left-0 bottom-0 p-3 md:p-0">
      <div class="items-center flex justify-between w-full md:w-auto">
        <div class="flex">
          
          {/* THE POLYMORPHIC LOOP */}
          {actions.map((action) => (
            <div class="ml-3 mb-0">
              {action.type === 'Component' ? (
                /* CASE A: It's a Module Widget (e.g. SearchBar) */
                /* We mock a 'widget' object structure so the renderer accepts it */
                <WidgetRenderer widget={{ type: action.component, ...action.props }} />
              ) : (
                /* CASE B: It's a Standard Link/Button */
                <Button
                  class="ml-2 py-2.5 px-5.5 md:px-6 font-semibold shadow-none text-sm w-auto"
                  variant={action.variant || 'secondary'}
                  href={action.href}
                  target={action.target}
                >
                  {action.text}
                </Button>
              )}
            </div>
          ))}
          
        </div>
      </div>
    </div>
  </div>
</header>

```

### 3. The `WidgetRenderer` Context

This relies on `WidgetRenderer` being able to find `docs/SearchBar`.

* **Module System:** Since your Module System (discussed in the "Module Guide" turn) auto-registers components into the global registry, `WidgetRenderer` should already know how to find `docs/SearchBar` if the module is installed.
* **Props:** The `...action.props` spread allows you to pass configuration to the SearchBar directly from the YAML if needed (e.g., `placeholder: "Search docs..."`).

### 4. Why this is the "Astrical Way"

* **Zero Core Coupling:** The Core Header doesn't import `SearchBar`. It imports "A Generic Component Definition."
* **Config Driven:** You enable/disable search by adding/removing lines in `actions.yaml`.
* **Future Proof:** If you later create a `@astrical/ecommerce` module, you can inject a `CartIcon` into the header using the exact same mechanism:
```yaml
- type: Component
  component: ecommerce/CartIcon

```



### Summary of Changes Required

1. **Core:** Update `src/components/page/Header.astro` to check for `type: Component` in the actions loop.
2. **Config:** Update `content/menus/actions.yaml` to include the SearchBar reference.
3. **Module:** Ensure `modules/docs/src/components/widgets/SearchBar.astro` exports a default Astro component.

---------------------------------------------

Would it make sense to implement that for all menus or just actions?

---------------------------------------------

This is a dangerous temptation. While consistency is good, applying this pattern blindly to **all** menus (specifically the Main Navigation) is usually a mistake.

To be brutally honest: **If you allow widgets in your Main Navigation list, you will break your layout.**

Here is the breakdown of where you should and should *not* implement this "Polymorphic" pattern.

### 1. The "Actions" Area (YES)

* **Verdict:** **Mandatory.**
* **Reason:** This area is a Flexbox container specifically designed for "Tools" (Search, Cart, Dark Mode, Profile Avatar). These items naturally have different widths and interaction models.
* **Implementation:** As discussed, allow `type: Component` here.

### 2. The "Footer" (YES)

* **Verdict:** **Highly Recommended.**
* **Reason:** Footers are often rigid columns of links. By allowing widgets here, you unlock powerful features without changing code:
* **Newsletter Widget:** Instead of a list of links, Column 4 is a `mailchimp/SignupForm` widget.
* **Social Icons:** Instead of hardcoded SVG paths, use a `social/IconRow` widget.
* **Status Badge:** A `system/StatusWidget` showing "All Systems Operational".


* **Strategy:** Change the Footer schema from `Array<{ title, links }>` to `Array<{ title, items: Array<Link | Component> }>`.

### 3. The "Main Navigation" (NO / CAUTION)

* **Verdict:** **Avoid (unless you need Mega Menus).**
* **Reason:** The main navigation bar (`Home`, `About`, `Services`) relies on strict CSS rules for spacing, hover states, and dropdown positioning.
* **The Risk:** If an AI injects a `WeatherWidget` between "Home" and "About", it will likely blow up the height of the navbar, break the mobile responsiveness, or cause accessibility issues with screen readers expecting a `<ul>` list of links.


* **The Exception (Mega Menus):** The only valid use case here is if the widget is **inside a dropdown**.
* *Link:* "Products"
* *Dropdown Content:* `ecommerce/FeaturedProductsGrid` (Widget) instead of a list of text links.



### The Recommended Architecture

I recommend a **Unified Schema** but **Restricted Implementation**.

#### 1. Define the Global Type

Update your TypeScript types so the *concept* of a "Component in a Menu" is valid data, even if you don't render it everywhere yet.

```typescript
// src/types.ts

// The standard link
interface MenuLink {
  text: string;
  href: string;
  // ...
}

// The new polymorphic injection
interface ComponentReference {
  type: 'Component';
  component: string; // "docs/SearchBar"
  props?: Record<string, any>;
}

// The Union Type
type MenuItem = MenuLink | ComponentReference;

```

#### 2. Implement in "Safe Zones" Only

**Zone A: Header Actions (The one we discussed)**

* Allow: `Button`, `Icon`, `Widget`.

**Zone B: Mobile Menu (Critical)**

* **Why:** If you add a Search Bar to the desktop header, you **must** expose it on mobile.
* **Where:** The Mobile Menu is usually a vertical list. It is very safe to stack widgets there.
* **Action:** Update `src/components/common/ToggleMenu.astro` (or your mobile drawer component) to render the polymorphic `actions` array at the bottom of the drawer.

**Zone C: Footer Columns**

* **Why:** Great for "Newsletter" or "Address Map".
* **Action:** Update `src/components/page/Footer.astro` to accept widgets inside columns.

### Summary Recommendation

Don't over-engineer the Main Navigation yet. It creates more layout problems than it solves.

1. **Implement Polymorphism for `actions**` (Header & Mobile Drawer).
2. **Implement Polymorphism for `footer**` (Columns).
3. **Keep `main` navigation as Links only** for now to preserve sanity.

### Next Step

We have now fully architected the **Module System**, the **Documentation Engine**, the **Widget Library**, and the **Integration Points** (Header/Search).

This concludes the architectural planning phase for `@astrical/docs`.

**Would you like me to generate the `modules/docs/module.yaml` manifest file to officially initialize this new module structure?**
