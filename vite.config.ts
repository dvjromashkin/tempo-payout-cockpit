import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// HTTPS in dev (vite-plugin-mkcert) provides a trusted local cert so the
// wallet dialog runs in a secure context (required for passkeys/WebAuthn and
// avoids mixed-content issues). https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
})
