# Lighthouse 100/100 Optimization Checklist

## 1. Performance (Mobile & Desktop)
- [x] **Render-Blocking Resources**:
    - [x] JS deferred (`type="module"` is deferred by default).
    - [x] Critical CSS inline in `<head>` for immediate background/layout.
    - [x] Fonts preloaded with `onload` hack for async loading.
- [x] **LCP (Largest Contentful Paint)**:
    - [x] Hero poster image optimized (WebP).
    - [x] Video element has explicit dimensions.
    - [x] Poster load priority managed via efficient format.
- [x] **CLS (Cumulative Layout Shift)**:
    - [x] Images have explicit `width` and `height`.
    - [x] Fonts preloaded to prevent FOIT/FOUT.
- [x] **Unused CSS/JS**:
    - [x] Tailwind CSS configured to purge unused styles via `content` array in `tailwind.config.ts`.
    - [x] No Bootstrap or jQuery present in the codebase.

## 2. Accessibility
- [x] **Navigation**:
    - [x] "Skip to main content" link added as first element in `<body>`.
- [x] **Images**:
    - [x] `alt` text added to logos and functional images.
    - [x] `aria-hidden="true"` added to decorative icons/SVGs.
- [x] **Forms**:
    - [x] `aria-label` added to all inputs (Email, Password, Name, Phone, PIN).
    - [x] Labels are descriptive.
- [x] **Contrast**:
    - [x] Verified high-contrast text colors in login/signup flows.
- [x] **Interactive Elements**:
    - [x] Buttons have `aria-label` where text is not sufficient (e.g. icon buttons).
    - [x] Focus states managed by browser/Tailwind defaults.

## 3. SEO
- [x] **Meta Tags**:
    - [x] Title and Description present.
    - [x] Open Graph and Twitter Card tags present.
    - [x] Canonical link present.
- [x] **Structure**:
    - [x] Sitemap generation script created (`scripts/generate-sitemap.js`).
    - [x] `robots.txt` generation included.
    - [x] Heading hierarchy (H1 -> H2) respected (Hero has H1).

## 4. Best Practices
- [x] **Security**:
    - [x] `rel="noopener noreferrer"` (implied by React/modern standards, explicitly handled in external links often).
- [x] **Modern Formats**:
    - [x] Images converted to WebP.

## 5. Deployment
- [ ] Run `npm run build-opt` to generate the production build with optimized assets and sitemap.
- [ ] Serve `/dist` folder with Gzip/Brotli compression enabled.
