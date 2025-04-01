/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "" : "",
  assetPrefix: process.env.ASSET_PREFIX,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        hostname: "cdn.discordapp.com",
      },
    ],
    domains: ["erinet-stage.eribyte.net", "erinet.eribyte.net"],
  },
  env: {
    ASSET_PREFIX: process.env.ASSET_PREFIX || "",
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        "erinet.eribyte.net",
        "erinet-stage.eribyte.net",
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
