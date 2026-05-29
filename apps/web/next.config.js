/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://r2.thesportsdb.com",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "r2.thesportsdb.com",
        pathname: "/images/media/**",
      },
    ],
  },
};

export default nextConfig;
