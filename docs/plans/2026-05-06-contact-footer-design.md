# Design: Contact Page Footer Addition

## Context

The `/contact` page lacks a footer, unlike the homepage (`/`) and about page (`/about`) which both include the `<Footer />` component. The footer provides important platform entry points and contact information.

## Summary

Add the existing `<Footer />` component from `@/components/home/Footer` to the `/contact` page. No new components needed — pure component reuse.

## What Needs to Change

**`apps/web/src/app/[locale]/contact/page.tsx`:**
1. Add import: `import { Footer } from "@/components/home/Footer";`
2. Add `<Footer />` as the last child inside `<main>`, outside the content div

## Current Contact Page Structure

```tsx
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <ContactHeroHeader />
      <div className="max-w-[1320px] mx-auto px-4 py-8 space-y-8">
        <ContactInfoCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ContactForm /></div>
          <div><QuickInfoPanel /></div>
        </div>
      </div>
    </div>
  );
}
```

## Target Structure

```tsx
import { Footer } from "@/components/home/Footer";

export default function ContactPage() {
  return (
    <main>
      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <ContactHeroHeader />
        <div className="max-w-[1320px] mx-auto px-4 py-8 space-y-8">
          <ContactInfoCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><ContactForm /></div>
            <div><QuickInfoPanel /></div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
```

## Key Decisions

- **Match homepage style**: Footer uses `bg-background text-foreground` (dark/light theme aware)
- **Pure reuse**: No modifications to Footer component needed
- **Consistent pattern**: Same approach used on `/about` page

## Verification

- Run dev server and visually confirm footer renders on contact page
- Test locale switching (EN ↔ 中文) for footer content
- Confirm no layout breakages on mobile viewports