import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages project sites are served from
 * `https://<user>.github.io/<REPO_NAME>/`, so in a production build every asset
 * URL must be prefixed with that sub-path. During local dev the app is served
 * from the domain root, so `base` stays `/`.
 *
 * `vite preview` reports `command: 'serve'` even though it serves BUILD output,
 * whose HTML already carries the `/<REPO_NAME>/` prefix — keying on `command`
 * alone made preview serve from `/` and 404 every asset. Hence `isPreview`.
 *
 * If you rename the repository, update REPO_NAME. For a user/organisation page
 * (`<user>.github.io`) or a custom domain, set REPO_NAME to an empty string so
 * `base` resolves to `/`.
 */
const REPO_NAME = 'stones'

export default defineConfig(({ command, isPreview }) => ({
  base: (command === 'build' || isPreview) && REPO_NAME ? `/${REPO_NAME}/` : '/',
  plugins: [react()],
  // Honour a PORT assigned by the host (falls back to Vite's default 5173,
  // auto-incrementing if that is taken). Dev-only; ignored in builds.
  server: { port: process.env.PORT ? Number(process.env.PORT) : undefined },
}))
