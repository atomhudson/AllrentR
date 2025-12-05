# Deployment Optimization Checklist

Use this checklist to ensure maximum performance in production.

## 1. Hosting & CDN
- [ ] **Recommendation**: Deploy to **Vercel** or **Cloudflare Pages** for edge caching. S3/EC2 is slower for static assets unless configured with CloudFront.
- [ ] **Edge Network**: Ensure your domain DNS is proxied through Cloudflare (orange cloud) for free global CDN, DDoS protection, and HTTP/3 support.

## 2. Server Configuration
- [ ] **Compression**: Enable Brotli (`br`) compression. Vercel/Cloudflare do this automatically. Nginx users: add `brotli on;`.
- [ ] **HTTP/3**: Ensure your server supports QUIC/HTTP3. (Cloudflare: Network > HTTP/3 (QUIC) -> On).
- [ ] **Caching Headers**: 
  - HTML: `Cache-Control: public, max-age=0, must-revalidate` (Always check for updates)
  - JS/CSS/Images: `Cache-Control: public, max-age=31536000, immutable` (Cache forever, file names are hashed)

### Nginx Config Snippet (If self-hosting)
```nginx
gzip on;
gzip_types text/css application/javascript image/svg+xml application/json;

location ~* \.(js|css|png|jpg|jpeg|webp|svg|woff2)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

## 3. Post-Deployment Verification
- [ ] **Lighthouse Score**: Run Lighthouse on the live URL. Target > 90 Performance on Mobile.
- [ ] **Console Errors**: Check DevTools Console for any 404s or hydration errors.
- [ ] **Network Tab**: Verify assets are being served with `content-encoding: br` (Brotli) and `cache-control` headers are present.

## 4. Maintenance
- [ ] **Purge Cache**: When deploying new code, ensure the CDN cache is cleared (Vercel does this automatically for new deployments).
- [ ] **Monitoring**: Set up a free uptime monitor (e.g., UptimeRobot) to track availability.

## 5. Image & Asset Workflow
- [ ] Always compress images before committing. Use the provided `npm run optimize-assets` script.
- [ ] Avoid importing huge libraries (like `moment.js` or full lodash). Use `date-fns` or specific lodash imports.
