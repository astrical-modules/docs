There are quite a few documentation builders that implement version selectors for referencing different versions of the code over time along with a changelog.  We definitely want the changelog but should we support versioned docs?

---------------------------------------------

To be brutally honest: **Do not implement "Integrated Versioning" in the module.**

Implementing a version dropdown (like Docusaurus or ReadTheDocs have) where `v1.0`, `v1.1`, and `v2.0` coexist in the same build is **Architectural Suicide** for an AI-First, YAML-driven system.

Here is the breakdown of why you should build the **Changelog** but reject **Versioned Docs**, and the alternative strategy for handling legacy versions.

### 1. The Trap of Versioned Docs

Building a "Time Machine" inside a single static site is a massive complexity multiplier that will break your core value propositions.

#### A. Search Pollution (The Pagefind Killer)

If you host `v1/install`, `v2/install`, and `v3/install` on the same site:

* **The User:** searches for "Installation."
* **The Result:** Pagefind returns 3 identical-looking results. The user clicks the top one (often the wrong version) and gets frustrated when the code doesn't work.
* **The Fix:** You have to implement complex scoping logic to force Pagefind to "Only search the active version directory." This is fragile custom code.

#### B. The "AI Drift" Problem

Your goal is AI-driven maintenance.

* **Scenario:** You ask the AI: *"Update the authentication endpoint to use Bearer tokens."*
* **The Problem:** The AI sees `content/pages/docs/v1/auth.yaml` and `content/pages/docs/v2/auth.yaml`.
* Does it update both?
* Does it know that `v1` is "Frozen" and shouldn't be touched?
* Does it accidentally introduce a v2 feature into the v1 docs?


* **Result:** You introduce massive context overhead and risk "documentation drift."

#### C. Build Time Explosion

Static Site Generators scale linearly. If your docs have 100 pages:

* 1 Version = 100 pages (10s build)
* 5 Versions = 500 pages (50s build)
* **Result:** Your feedback loop slows down significantly.

---

### 2. The Solution: "Deployment-Based Versioning"

Instead of handling versioning in the *Code* (the module), handle it in the *Infrastructure* (Cloudflare).

**The Strategy:**

1. **Main Branch = Latest:** The root domain (`docs.astrical.com`) always serves the current `main` branch.
2. **Snapshots = Subdomains:** When you release v1.0, you create a git tag or branch `release/v1.0`.
* Deploy this branch to `v1.docs.astrical.com`.


3. **The "Version Selector":** It’s just a "Link Switcher."
* The dropdown in the header is dumb. It doesn't switch folders; it switches domains (`v1.docs...` -> `v2.docs...`).



**Why this wins:**

* **Zero Search Pollution:** `v1` has its own Pagefind index. `v2` has its own. They never mix.
* **Zero AI Confusion:** When the AI works on `main`, it ignores `v1` because that code isn't even checked out (or is in a different repo state).
* **Instant Builds:** You are only ever building *one* version of the site at a time.

---

### 3. The Changelog: "Essential and Easy"

While versioning is a trap, a **Changelog** is mandatory for developer trust.

You should implement this not as a text file, but as a **Structured Data Stream**. This allows the AI to "Write a changelog entry" easily without needing to format a massive markdown file.

#### The Architecture: `content/changes/`

Instead of one big file, use **Atomic Entries** (one file per change).

**File:** `content/changes/2025-12-21-auth-update.yaml`

```yaml
date: 2025-12-21
version: 1.2.0
type: breaking # feature, fix, breaking, chore
title: "Authentication Header Update"
description: |
  We have moved from `X-API-KEY` to standard `Authorization: Bearer`.
components: # Optional: Link to the widgets that changed!
  - docs/auth/header

```

#### The Widget: `ChangelogFeed`

You create a widget that aggregates these files.

**Usage:** `content/pages/docs/changelog.yaml`

```yaml
sections:
  - layout: DocsLayout
    components:
      main:
        - type: Prose
          title: "Changelog"
          content: "Latest updates and improvements."
        
        - type: ChangelogFeed
          limit: 50

```

**Rendering:**
The widget renders a vertical timeline (like Twitter/X or Linear).

* **Badge:** Color-coded by `type` (Red for Breaking, Green for Feature).
* **Context:** Because you linked `components`, the changelog can say: *"Affected Component: [Auth Header]"* and link directly to the docs.

### Summary Verdict

1. **Versioning:** **Do NOT** build this into the module. Use Cloudflare subdomains (`v1.docs.com`) to manage versions. It keeps the codebase clean, search accurate, and the AI focused.
2. **Changelog:** **YES.** Build a `ChangelogFeed` widget backed by atomic YAML files in `content/changes/`. This turns your update history into a queryable dataset.

This approach respects your "Brutal Honesty" requirement: Integrated versioning is a feature that looks good on a sales sheet but ruins the actual maintainability of an AI-driven project.
