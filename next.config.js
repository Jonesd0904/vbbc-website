/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com', 
      'i.ytimg.com', 
      'www.facebook.com',
      'vjgxldrlflqqeztbbniw.supabase.co'
    ],
  },
  // Increase body size limit for API routes (needed for large audio file uploads)
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
    responseLimit: '100mb',
  },
  // Also set for experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
}

module.exports = nextConfig
