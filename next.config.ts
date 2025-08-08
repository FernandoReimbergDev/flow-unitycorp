/** @type {import('next').NextConfig} */
if (
  !process.env.JWT_SECRET ||
  !process.env.JWT_REFRESH_SECRET ||
  !process.env.BADGE_ENCRYPT_SECRET ||
  !process.env.BADGE_ENCRYPT_IV
) {
  throw new Error("Faltando variáveis de ambiente essenciais");
}
const nextConfig = {
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev", "172.28.32.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "unitybrindes.com.br",
      },
      {
        protocol: "https",
        hostname: "api.unitycorp.com.br",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    formats: ["image/webp"],
  },
};

export default nextConfig;
