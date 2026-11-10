/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // site statique : le serveur Express (Render) le sert tel quel
  trailingSlash: true,       // /joueurs/ -> joueurs/index.html
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  // En développement (npm run dev), les appels /api et /uploads sont envoyés au serveur Express local.
  ...(process.env.NODE_ENV !== 'production' ? {} : {}),
};
export default nextConfig;
