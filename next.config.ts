import type { NextConfig } from "next";

/**
 * Content Security Policy. Everything is served from this origin except project screenshots,
 * which come from the projects' own sites (any https image). Inline scripts are needed by the
 * Next.js runtime on prerendered pages, and inline styles by the banner scenes. React's dev
 * tooling needs eval, so that is only allowed in development.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Social preview images read their scene frames from disk at request time.
  outputFileTracingIncludes: {
    "/**/opengraph-image*": ["./assets/og-scenes/**/*"],
  },
  partialPrefetching: true,
  cacheLife: {
    // Project data from GitHub and Vercel: refresh about every 30 minutes, and keep serving
    // the last good version for up to a week if the providers cannot be reached.
    portfolio: {
      stale: 300,
      revalidate: 1800,
      expire: 60 * 60 * 24 * 7,
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
