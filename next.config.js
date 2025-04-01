/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "" : "",
  assetPrefix: "stage.eri.bot",
  output: "standalone",
  images: {
    remotePatterns: [
      {
        hostname: "cdn.discordapp.com",
      },
    ],
    domains: ["erinet-stage.eribyte.net", "erinet.eribyte.net"],
  },
  

  experimental: {
    serverActions: {
      allowedOrigins: [
        "erinet.eribyte.net",
        "stage.eri.bot",
        "192.168.49.2:8443",
        "localhost:3000",
      ],
    },
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add node-loader for .node files
    config.module.rules.push({
      test: /.node$/,
      use: {
        loader: "node-loader",
      },
    });
    return config;
  },
};

module.exports = nextConfig;
