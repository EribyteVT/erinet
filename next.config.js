/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "" : "",
  // local, stage, or prod
  assetPrefix:
    process.env.NODE_ENV === "prod"
      ? "https://erinet.eribyte.net"
      : process.env.DEPLOYMENT_ENV === "stage"
      ? "https://erinet-stage.eribyte.net"
      : "",
  output: "standalone",
  images: {
    remotePatterns: [
      {
        hostname: "cdn.discordapp.com",
      },
    ],
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
