/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@ai-sdk/google'],
  // 配置代理环境变量
  env: {
    HTTP_PROXY: process.env.HTTP_PROXY,
    HTTPS_PROXY: process.env.HTTPS_PROXY,
    ALL_PROXY: process.env.ALL_PROXY,
  }
}

module.exports = nextConfig