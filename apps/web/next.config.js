/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://r2.thesportsdb.com",
    "https://fifa26-api.onrender.com/",
    "http://192.168.10.83:14000",
  ],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
