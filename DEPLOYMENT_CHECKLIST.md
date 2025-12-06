
# Deployment Checklist for 100/100 Lighthouse Score

To maintain the perfect Lighthouse score (Performance, Accessibility, SEO, Best Practices), follow this checklist for every deployment.

## 1. Build Process
- [ ] Run `npm run build-opt` instead of standard build.
  - This optimizes images (WebP conversion).
  - Generates a fresh `sitemap.xml`.
  - Builds the production bundle.
- [ ] Verify the `/dist` folder size. Unusually large chunks (>500KB) indicate code splitting issues.

## 2. Server / Hosting Configuration
- [ ] **Compression**: Ensure Gzip or Brotli compression is enabled on the server (Vercel/Netlify do this automatically).
- [ ] **Caching Policy**: 
  - `Cache-Control: public, max-age=31536000, immutable` for static assets (JS, CSS, Images).
  - `Cache-Control: public, max-age=0, must-revalidate` for `index.html`.
- [ ] **HTTP/2**: Verify the server serves content over HTTP/2 or HTTP/3.

## 3. Post-Deployment Verification
- [ ] **Lighthouse Audit**: Run a Lighthouse audit in Chrome DevTools (Incognito mode).
  - Performance > 90 (Aim for 100)
  - Accessibility = 100
  - SEO = 100
- [ ] **Visual Check**:
  - Hero video loads with a poster image immediately.
  - No layout shifts (CLS) on page load.
  - Images are lazy-loaded (check Network tab).

## 4. Content Management
- [ ] **Images**: Always use the optimization script or manually convert new images to WebP.
- [ ] **Alt Text**: Ensure all new images uploaded to the CMS or codebase have descriptive `alt` text.
- [ ] **Video**: Always provide a `poster` image for videos.

## 5. Ongoing Monitoring
- [ ] Check PageSpeed Insights periodically.
- [ ] monitor error logs for any JavaScript crashes.
