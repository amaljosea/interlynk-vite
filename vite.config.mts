import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig, loadEnv, transformWithEsbuild } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// known issue with vite in chrommium browsers, the network tab feels laggy
// https://issues.chromium.org/issues/40269094

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isProduction = env.NODE_ENV === 'production'

  return {
    plugins: [
      // vite does not support JSX in .js files by default
      // This plugin transforms .js files to treat them as JSX files
      // It is a workaround for the issue where vite does not recognize JSX in .js files.
      // https://github.com/vitejs/vite/discussions/3448#discussioncomment-5288419
      {
        name: 'treat-js-files-as-jsx',
        async transform(code, id) {
          if (!id.match(/src\/.*\.js$/)) return null
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic'
          })
        }
      },
      react(),
      svgrPlugin(),
      viteTsconfigPaths(),
      ...(isProduction
        ? sentryVitePlugin({
            org: 'interlynk',
            project: 'interlynk',
            authToken: env.VITE_SENTRY_AUTH_TOKEN
          })
        : [])
    ],
    resolve: {
      alias: {
        components: resolve(__dirname, 'src/components'),
        hooks: resolve(__dirname, 'src/hooks'),
        context: resolve(__dirname, 'src/context'),
        layouts: resolve(__dirname, 'src/layouts'),
        views: resolve(__dirname, 'src/views'),
        utils: resolve(__dirname, 'src/utils'),
        assets: resolve(__dirname, 'src/assets'),
        graphQL: resolve(__dirname, 'src/graphQL'),
        variables: resolve(__dirname, 'src/variables')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },

    server: {
      port: 3001
    },

    build: {
      outDir: 'build',
      sourcemap: isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: [
              '@chakra-ui/react',
              '@chakra-ui/icons',
              '@emotion/react',
              '@emotion/styled',
              'framer-motion'
            ],
            utils: ['lodash', 'date-fns', 'uuid', 'js-cookie'],
            charts: ['d3', 'recharts', 'react-d3-tree'],
            dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
            apollo: ['@apollo/client', 'graphql']
          }
        }
      },
      // required for vite to recognize JSX in .js files
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    // required for vite to recognize JSX in .js files
    optimizeDeps: {
      force: true,
      include: [
        // Core React ecosystem
        'react',
        'react-dom',
        'react-router-dom',

        // Chakra UI components (commonly used)
        '@chakra-ui/react',
        '@chakra-ui/icons',
        '@chakra-ui/system',
        '@chakra-ui/theme-tools',
        '@emotion/react',
        '@emotion/styled',
        'framer-motion',

        // Data fetching & GraphQL
        '@apollo/client',
        'graphql',
        'axios',

        // Utility libraries
        'lodash',
        'date-fns',
        'date-fns-tz',
        'js-cookie',
        'jwt-decode',
        'uuid',

        // UI components & interactions
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities',
        '@dnd-kit/modifiers',
        'react-select',
        'react-icons',
        'kbar',

        // Data visualization
        'd3',
        'recharts',
        'react-d3-tree',
        'react-data-table-component',

        // Document processing
        'react-markdown',
        'remark-gfm',
        'react-syntax-highlighter',
        'dompurify',

        // PDF & Excel
        'jspdf',
        'xlsx-js-style',
        '@react-pdf/renderer',
        'react-pdf-charts',

        // Other commonly used
        'react-datetime',
        'react-window',
        'packageurl-js',
        'next-themes',
        'react-ga4',
        '@reactour/tour',
        '@sentry/react'
      ],
      esbuildOptions: {
        loader: {
          '.js': 'jsx'
        }
      }
    }
  }
})
