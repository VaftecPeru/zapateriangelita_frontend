/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#000000',
                    purple: '#8B5CF6',
                },
                minimal: {
                    beige: '#EAE2D6',
                    card: '#FFFFFF',
                    header: '#F5F1EA',
                    dark: '#1A1A1A',
                    gold: '#D4AF37',
                    olive: '#708238',
                    cinnamon: '#D2691E',
                    serene: '#9BB7D4',
                },
                orie: {
                    yellow: '#E9C46A',
                    red: '#BC4749',
                    blue: '#457B9D',
                    green: '#6A994E',
                    cream: '#F2E9E4',
                }
            }
        },
    },
    plugins: [],
}
