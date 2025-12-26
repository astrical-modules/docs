I like it.  Anything else we need to take into account as we build out this widget architecture?

---------------------------------------------

We have covered the "Big Rocks" (Layouts, Widgets, Search, Versioning). However, there are **three invisible failures** that plague documentation sites, specifically those maintained by AI or strictly defined in data.

To wrap up this architecture, you must account for **Referential Integrity**, **Canonical SEO**, and **User Feedback**.

### 1. The AI Safety Net: Build-Time Link Validation

This is the most critical operational risk.

* **The Risk:** An AI agent writes a Prose widget: `See the [Billing Guide](/docs/billing)`. Later, another agent renames `billing.yaml` to `payments.yaml`.
* **The Result:** The build succeeds (it's just a string), but the user gets a 404.

**The Fix:** You need a strict "Referential Integrity" script.
Since you are avoiding MDX (which often has link checking built-in), you must implement a custom validator in your module.

**`modules/docs/scripts/validate-links.ts`**

1. **Scan:** Regex parse all `Prose` content and `href` fields in all YAML files.
2. **Collect:** Build a set of all valid routes (`/docs/intro`, `/api/auth`) generated from the file system.
3. **Compare:** If a link points to an internal route that is not in the Set, **Fail the Build.**

**Why this matters:** It gives the AI immediate feedback. If it hallucinates a link, the build fails, the error log says "Link /docs/billing not found," and the AI can self-correct.

### 2. The SEO Patch: Canonical URLs

Since we agreed on **Subdomain Versioning** (`v1.docs.com` vs. `docs.com`), you have created a potential SEO disaster: **Duplicate Content.**

* Google will see `v1.docs.com/install` and `docs.com/install` as duplicate pages and punish your ranking.

**The Fix:** The "Canonical" Meta Tag.
Your `PageLayout` (or `DocsLayout`) must accept a `canonical` override, but importantly, it should default intelligently.

* **Logic:** The `v1`, `v2`, and `v3` sites should generally point their canonical tag to the **Main (Latest)** site.
* **Implementation:** In `content/config.yaml` of the `v1` branch, you set a base canonical URL.
```yaml
site:
  canonicalBase: "https://docs.astrical.com" # Points to the main site

```



### 3. The "Feedback" Loop

Documentation is never finished. You need to know when it fails the user.

* **The Widget:** `PageFeedback`
* **Placement:** Bottom of the `DocsLayout` center column.
* **Behavior:** Simple "Thumbs Up / Thumbs Down".
* **Backend:** Since you are on Cloudflare Pages (Static), you can't save to a database directly.
* **Option A:** Use a simple service like Formspree.
* **Option B:** Use Cloudflare Functions (if you want to stay in the ecosystem) to write to KV or D1.



### Final Architectural Summary (`@astrical/docs`)

You now have a complete blueprint.

* **Structure:** `modules/docs/` (Isolated).
* **Manifest:** `DocsLayout` (The "Brain" using `sidebar_*.yaml`).
* **Content:**
* **Narrative:** `Prose` (Markdown/YAML), `Figure` (Media), `CodeWindow` (Snippets).
* **Data:** `DefinitionTable` (Config), `Endpoint` (API), `ChangelogFeed` (Updates).


* **Operations:**
* **Search:** Pagefind (Static).
* **Versioning:** Subdomains (Infrastructure).
* **Safety:** Build-time Link Validator.



This architecture is robust, AI-friendly, and respects your requirement for brutal efficiency over marketing fluff. You are ready to build.
