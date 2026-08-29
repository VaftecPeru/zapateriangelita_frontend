import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '',

    plugins: [react()],

    build: {
        rollupOptions: {
            output: {
                manualChunks: (id: string) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                            return 'react-vendor';
                        }
                        if (id.includes('xlsx')) {
                            return 'excel';
                        }
                        if (id.includes('lucide-react')) {
                            return 'icons';
                        }
                    }
                    return undefined;
                }
            }
        }
    }
});
