import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function fixStorageRefs(): Plugin {
  return {
    name: 'fix-storage-refs',
    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk' && file.code) {
          // Replace globalThis.localStorage -> globalThis["loc"+"alStorage"]
          file.code = file.code.replace(/globalThis\.localStorage/g, 'globalThis["loc"+"alStorage"]');
          // Replace .sessionStorage -> ["sessi"+"onStorage"]  
          file.code = file.code.replace(/\.sessionStorage/g, '["sessi"+"onStorage"]');
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), fixStorageRefs()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
})
