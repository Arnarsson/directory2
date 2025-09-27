/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    ppr: "incremental",
  },
  images: {
    remotePatterns: [
      // {
      //   protocol: "https",
      //   hostname: "**",
      //   port: "",
      //   pathname: "**",
      // },
      // {
      //   protocol: "http",
      //   hostname: "**",
      //   port: "",
      //   pathname: "**",
      // },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/product-logos/**/**",
      },
    ],
  },
}

module.exports = nextConfig
