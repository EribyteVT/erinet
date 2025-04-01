module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Modify the `config` object here
    config.module.rules.push({
      test: /.node$/,
      use: {
        loader: "node-loader",
      },
    });

    return config;
  },
};

const nextConfig = {
  output: "standalone",
};

module.exports = {
  images: {
    remotePatterns: [
      {
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};
