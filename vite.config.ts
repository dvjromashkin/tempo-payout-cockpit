import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import { readFileSync } from 'node:fs'

function packageVersion(): string {
  const raw = readFileSync(new URL('./package.json', import.meta.url), 'utf8')
  const parsed: unknown = JSON.parse(raw)
  if (parsed && typeof parsed === 'object') {
    const version = (parsed as Record<string, unknown>).version
    if (typeof version === 'string') return version
  }
  return '0.0.0'
}

function shortBuildIdentifier(value: string | undefined): string {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  return trimmed.length > 12 ? trimmed.slice(0, 7) : trimmed
}

// HTTPS in dev (vite-plugin-mkcert) provides a trusted local cert so the
// wallet dialog runs in a secure context (required for passkeys/WebAuthn and
// avoids mixed-content issues). Skipped for `vite preview` (headless/automated
// HTTP checks) and under Vitest (no dev server needed).
// https://vite.dev/config/
export default defineConfig(({ isPreview }) => ({
  plugins: [react(), ...(isPreview || process.env.VITEST ? [] : [mkcert()])],
  define: {
    __APP_VERSION__: JSON.stringify(packageVersion()),
    __VITE_BUILD_ID__: JSON.stringify(shortBuildIdentifier(process.env.VITE_BUILD_ID)),
    __VERCEL_GIT_COMMIT_SHA__: JSON.stringify(
      shortBuildIdentifier(process.env.VERCEL_GIT_COMMIT_SHA),
    ),
  },
}))
