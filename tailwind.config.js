/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                'grid-pattern': "radial-gradient(circle, #4f46e5 1px, transparent 1px)",
            },
        },
    },
    plugins: [],
}
