/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    const unusedSequelize = ["pg", "sqlite3", "tedious", "pg-hstore"];
    unusedSequelize.forEach((unused) => config.externals.push(unused));
    return config;
  },
};

module.exports = nextConfig;
