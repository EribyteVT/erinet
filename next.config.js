/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "" : "",
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || "",
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: "cdn.discordapp.com",
      },
    ],
    domains: ["eri.bot", "stage.eri.bot"],
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        "eri.bot",
        "stage.eri.bot",
        "192.168.49.2:8443",
        "localhost:3000",
      ],
    },
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    console.log("Webpack Build - Environment:", process.env.NODE_ENV);
    console.log(
      "Webpack Build - NEXT_PUBLIC_ASSET_PREFIX:",
      process.env.NEXT_PUBLIC_ASSET_PREFIX
    );

    // Add node-loader for .node files
    config.module.rules.push({
      test: /.node$/,
      use: {
        loader: "node-loader",
      },
    });
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

console.log("Environment:", process.env.NODE_ENV);
console.log("ASSET_PREFIX:", process.env.NEXT_PUBLIC_ASSET_PREFIX);
console.log(
  "Using assetPrefix:",
  process.env.NEXT_PUBLIC_ASSET_PREFIX || "(none)"
);

module.exports = nextConfig;
