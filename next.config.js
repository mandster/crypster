/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React's Strict Mode for highlighting potential problems in an application.
  // This is recommended for new projects and during development.
  reactStrictMode: true,

  // Use SWC (Speedy Web Compiler) for minification instead of Terser.
  // This can significantly speed up your production builds.
  swcMinify: true,

  // You can add other Next.js configurations here if needed.
  // For example:

  // To allow Next.js Image component to load images from external domains:
  // images: {
  //   domains: ['example.com', 'another-domain.com'],
  // },

  // To set up redirects:
  // async redirects() {
  //   return [
  //     {
  //       source: '/old-path',
  //       destination: '/new-path',
  //       permanent: true, // true for 308, false for 307
  //     },
  //   ]
  // },

  // If you were using the experimental App Directory (now stable in Next.js 13+),
  // this would typically be configured or inferred, but you might see 'appDir: true'
  // in older examples. For your current setup, it's generally not needed here directly.
};

module.exports = nextConfig;
