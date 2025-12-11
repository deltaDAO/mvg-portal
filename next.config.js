import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import withTM from 'next-transpile-modules'

const nextConfig = () => {
  /**
   * @type {import('next').NextConfig}
   */
  const config = {
    output: 'standalone',
    experimental: {
      esmExternals: 'loose',
      serverComponentsExternalPackages: ['wagmi', 'viem', 'connectkit']
    },
    webpack: (config, options) => {
      const { isServer } = options

      if (!isServer) {
        config.resolve.fallback.fs = false
      }

      config.module.rules.push(
        {
          test: /\.svg$/,
          issuer: /\.(tsx|ts)$/,
          use: [{ loader: '@svgr/webpack', options: { icon: true } }]
        },
        {
          test: /\.gif$/,
          type: 'asset/resource'
        }
      )

      config.plugins.push(
        new options.webpack.IgnorePlugin({
          resourceRegExp: /^electron$/
        })
      )

      const fallback = config.resolve.fallback || {}
      Object.assign(fallback, {
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        'react-native-async-storage': false,
        '@react-native-async-storage/async-storage': false,
        fs: false,
        crypto: false,
        os: false,
        stream: false,
        assert: false,
        tls: false,
        net: false
      })
      config.resolve.fallback = fallback

      config.plugins = (config.plugins || []).concat([
        new options.webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer']
        })
      ])

      return config
    },
    async redirects() {
      return [
        {
          source: '/publish',
          destination: '/publish/1',
          permanent: true
        }
      ]
    },
    async rewrites() {
      const walletApiBase =
        process.env.NEXT_PUBLIC_SSI_WALLET_API || 'https://wallet.demo.walt.id'

      const providerUrl = process.env.NEXT_PUBLIC_PROVIDER_URL

      const routes = [
        {
          source: '/ssi/:path*',
          destination: `${walletApiBase}/:path*`
        },
        {
          source: '/provider/:path*',
          destination: `${providerUrl}/:path*`
        }
      ]

      return routes
    }
  }

  return withTM(['@oceanprotocol/lib'])(config)
}

export default nextConfig
