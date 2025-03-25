# Tailwind CSS v4 Migration Guide

This document outlines how we migrated from older versions of Tailwind CSS to v4 in our AI Audio Story Generator application, including key changes, issues encountered, and solutions implemented.

## Key Changes in Tailwind CSS v4

### 1. PostCSS Plugin Structure Change

In Tailwind CSS v4, the PostCSS plugin has been moved to a separate package. This is one of the most significant changes that affects the setup process.

- **Old approach (v3):** `tailwindcss` was used directly as a PostCSS plugin
- **New approach (v4):** The plugin has been moved to `@tailwindcss/postcss` package

### 2. Import Syntax Change

The way Tailwind CSS is imported in your CSS files has changed:

- **Old approach (v3):** 
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

- **New approach (v4):** 
  ```css
  @import "tailwindcss";
  ```

### 3. Configuration Changes

The configuration format has evolved to be more streamlined.

## Installation & Setup

### 1. Install Required Packages

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

### 2. Create/Update PostCSS Config

Create a `postcss.config.js` file with the following content:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

### 3. Create/Update Tailwind Config

Basic `tailwind.config.js` file:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 4. Update CSS Import

In your main CSS file (e.g., `globals.css`):

```css
@import "tailwindcss";

/* Additional custom styles below */
```

### 5. Package.json Updates

Ensure your `package.json` includes:

```json
{
  "type": "module"
}
```

## Issues Encountered & Solutions

### 1. PostCSS Plugin Error

**Issue:**
```
Error: It looks like you're trying to use 'tailwindcss' directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install '@tailwindcss/postcss' and update your PostCSS configuration.
```

**Solution:**
- Installed `@tailwindcss/postcss` package
- Updated the PostCSS configuration to use `@tailwindcss/postcss` instead of `tailwindcss` directly

### 2. Unknown Utility Classes

**Issue:**
```
Error: Cannot apply unknown utility class: text-foreground
```

**Solution:**
- Replaced custom utility classes with standard Tailwind CSS classes
- For example, replaced `text-foreground` with `text-zinc-800 dark:text-zinc-200`
- Used standard color utilities (gray, zinc, blue, etc.) instead of custom theme colors

### 3. ES Module Format

**Issue:**
Warnings about ES modules vs CommonJS format.

**Solution:**
- Added `"type": "module"` to package.json
- Updated import/export syntax to use ES modules format

## CSS Styling Approach in v4

Our approach to styling with Tailwind CSS v4:

1. Use standard color utilities instead of custom theme-based colors:
   ```jsx
   // Instead of:
   <div className="text-foreground bg-background">...</div>
   
   // Use:
   <div className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900">...</div>
   ```

2. Define dark mode with `dark:` variant prefix:
   ```jsx
   <div className="bg-white dark:bg-zinc-800">...</div>
   ```

3. For reusable styling, consider adding CSS base styles in your globals.css file:
   ```css
   @import "tailwindcss";

   /* Base styles */
   html, body {
     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
   }
   ```

## Summary of Changes Made

1. Updated PostCSS configuration to use the new `@tailwindcss/postcss` package
2. Replaced the Tailwind directives with the new import syntax
3. Simplified the Tailwind configuration
4. Added ES module support in package.json
5. Updated all component styling to use standard Tailwind utility classes
6. Replaced custom SVG icons with Heroicons components

## Additional Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com)
- [Next.js CSS Support](https://nextjs.org/docs/app/getting-started/css)
- [PostCSS Documentation](https://postcss.org/) 