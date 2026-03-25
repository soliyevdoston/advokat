import { defineConfig, loadEnv } from 'vite'
import { cwd } from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const normalizeProxyPrefix = (value = '/__api') => {
  const text = `/${String(value || '').replace(/^\/+|\/+$/g, '')}`
  return text === '/' ? '/__api' : text
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '')
  const proxyTarget = String(env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')
  const enableDevProxy = String(env.VITE_ENABLE_DEV_PROXY || 'true').toLowerCase() === 'true'
  const proxyPrefix = normalizeProxyPrefix(env.VITE_DEV_PROXY_PREFIX || '/__api')

  const proxy = enableDevProxy && proxyTarget
    ? {
        [proxyPrefix]: {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => {
            if (!path.startsWith(proxyPrefix)) return path
            const rewritten = path.slice(proxyPrefix.length)
            return rewritten || '/'
          },
        },
      }
    : undefined

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: false,
      hmr: {
        host: '127.0.0.1',
        protocol: 'ws',
      },
      ...(proxy ? { proxy } : {}),
    },
  }
})
