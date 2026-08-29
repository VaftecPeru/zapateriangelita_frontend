/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // ===== COLORES DE STORE (para el AdminDashboard) =====
                store: {
                    red: '#e30613',
                    redDark: '#bd0711',
                    ink: '#121212',
                    surface: '#f7f7f7',
                    line: '#e9e9e9',
                },

                // ===== OTROS COLORES DE LA ZAPATERÍA =====
                ink: '#121212',
                muted: '#6e6e6e',
                line: '#e9e9e9',
                surface: '#f7f7f7',
                gold: '#b8955a',
                beige: {
                    DEFAULT: '#EAE2D6',
                    light: '#F5F1EA',
                },

                // ===== MINIMAL (para compatibilidad) =====
                minimal: {
                    beige: '#EAE2D6',
                    card: '#FFFFFF',
                    header: '#F5F1EA',
                    dark: '#1A1A1A',
                    gold: '#D4AF37',
                },

                // ===== ORIE (para compatibilidad) =====
                orie: {
                    yellow: '#E9C46A',
                    red: '#BC4749',
                    blue: '#457B9D',
                    green: '#6A994E',
                    cream: '#F2E9E4',
                },

                // ===== BRAND =====
                brand: {
                    dark: '#000000',
                    purple: '#8B5CF6',
                },
            },

            fontFamily: {
                inter: ['Inter', 'system-ui', 'sans-serif'],
                playfair: ['"Playfair Display"', 'Georgia', 'serif'],
            },

            maxWidth: {
                shell: '1240px',
            },
        },
    },
    plugins: [],
}