import type { Config } from "tailwindcss";

const config: Config = {
    // Add this line to enable class-based dark mode
    darkMode: "class",

    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // ... your existing theme config
        },
    },
    plugins: [],
};
export default config;