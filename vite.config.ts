import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, ManifestV3Export } from '@crxjs/vite-plugin'

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'Network Clarity',
  version: '1.0.0',
  description: 'Understand website network activity in plain English',
  permissions: [
    'webRequest',
    'activeTab',
    'tabs'
  ],
  host_permissions: ['<all_urls>'],
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module'
  },
  action: {
    default_popup: 'src/popup/index.html'
  },
  devtools_page: 'src/devtools/devtools.html'
}

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
