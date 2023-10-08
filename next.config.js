/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    dangerouslyAllowSVG: true,
    domains: [
      `${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`,
    ],
  },
  webpack: (config) => {
    const unusedSequelize = ["pg", "sqlite3", "tedious", "pg-hstore"];
    unusedSequelize.forEach((unused) => config.externals.push(unused));
    return config;
  },
};

module.exports = nextConfig;
