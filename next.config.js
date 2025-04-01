/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        hostname: "cdn.discordapp.com",
      },
    ],
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
